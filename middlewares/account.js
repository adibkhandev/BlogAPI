const Course = require('../models/course')
const User = require('../models/user')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config()
const subscribeCourse = async(req,res,next) => {
    console.log('rwx')
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
        console.log(token)
        const userInstance = await User.findOne({_id:decoded._id})
        const courseInstance = await Course.findOne({_id:req.body.courseId})
        if(userInstance && courseInstance){
            try{
                userInstance.subscribedCourses.push(courseInstance._id)
                await userInstance.save()
                req.updatedUser = userInstance 
                next()
            } catch {
                res.status(405).json({err:"Couldn't update user"})
            }
        }
        else{
            res.status(500).json({err:"server error"})
        }
    } catch{
        res.status(400).json({err:"Unauthorized"})
    }

}

module.exports = {subscribeCourse}