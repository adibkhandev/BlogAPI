const Course = require('../models/course')
const User = require('../models/user')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config()
const subscribeCourse = async(req,res,next) => {
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
        console.log(token)
        const userInstance = await User.findOne({_id:decoded._id})
        const courseInstance = await Course.findOne({_id:req.body.courseId})
        if(userInstance && courseInstance && courseInstance.subscribedCount>=0){
            console.log('rwx')
            if(userInstance.subscribedCourses.includes(courseInstance._id)) res.status(400).json('Subscribed already')
            else{
                try{
                    courseInstance.subscribedCount = courseInstance.subscribedCount + 1
                    userInstance.subscribedCourses.push(courseInstance._id)
                    const savedUser = await userInstance.save()
                    await courseInstance.save()
                    const populatedUser = await savedUser.populate({
                        path:'uploadedCourses subscribedCourses',
                        model:'Course',
                        populate:{
                            path:'topics',
                            model:'Topic',
                            populate:{
                                path:'videos',
                                model:'Video',
                                }
                            }
                    }) 
                    console.log(populatedUser)
                    req.updatedUser = populatedUser 
                    next()
                } catch {
                    res.status(405).json({err:"Couldn't update user"})
                }
            } 
        }
        else{
            res.status(400).json({err:"server error"})
        }
    } catch{
        res.status(400).json({err:"Unauthorized"})
    }

}

const unSubscribeCourse = async(req,res,next) => {
    // console.log('rwx')
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
        // console.log(token)
        const userInstance = await User.findOne({_id:decoded._id})
        const courseInstance = await Course.findOne({_id:req.body.courseId})
        if(userInstance && courseInstance){
            // console.log(courseInstance.subscribedCount,'cpint')
            if(!userInstance.subscribedCourses.includes(courseInstance._id) || courseInstance.subscribedCount<1) res.status(400).json('Nai already')
            else{
                try{
                    courseInstance.subscribedCount = courseInstance.subscribedCount - 1
                    userInstance.subscribedCourses.pop(courseInstance._id)
                    await courseInstance.save()
                    const savedUser = await userInstance.save()
                    const populatedUser = await savedUser.populate({
                        path:'uploadedCourses subscribedCourses',
                        model:'Course',
                        populate:{
                            path:'topics',
                            model:'Topic',
                            populate:{
                                path:'videos',
                                model:'Video',
                                }
                            }
                    }) 
                    console.log(populatedUser)
                    req.updatedUser = populatedUser
                    console.log('unsub - ',courseInstance._id) 
                    next()
                } catch {
                    res.status(405).json({err:"Couldn't update user"})
                }
            }
        }
        else{
            res.status(500).json({err:"server error"})
        }
    } catch{
        res.status(400).json({err:"Unauthorized"})
    }

}

const getSubscribed = async(req,res,next) => {
    console.log(req.decoded._id)
    try{
        const userInstance = await User.findOne({_id:req.decoded._id})
        req.subscribed = userInstance.subscribedCourses.reverse()
        next()
    } catch{
        res.status(500).json('Server failed')
    }
}


module.exports = {subscribeCourse,unSubscribeCourse,getSubscribed}
