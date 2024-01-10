const User = require('../models/user')
const Video = require('../models/video')
const Course = require('../models/course')
const Topic = require('../models/topic')
const path = require('path')
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config()

const courseUpload = async(req,res,next) => {
    // console.log(req.files,'files',req.body,path.extname(req.files.coverPhoto[0].originalname))
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
    console.log(decoded,'decoded')
    if(decoded){
        try{
            const userInstance = await User.findOne({_id:decoded._id})
            try{
                const newVideo = new Video({
                    number:1.01,
                    title:req.body.title,
                    description:req.body.description,
                    videoLink:'/videos/' + req.files.videoFile[0].filename,
                    uploadedBy:decoded._id
                })
                try {
                    const videoSaved = await newVideo.save()
                    req.video = videoSaved
                    if(videoSaved){
                         try{
                             const newTopic = new Topic({
                                 title:req.body.topicTitle,
                                 number:1,
                                 videos:[videoSaved._id]
                                })
                            const topicSaved = await newTopic.save()
                            if(topicSaved){
                                try{
                                    const newCourse = new Course({
                                        title:req.body.courseTitle,
                                        description:req.body.courseDescription,
                                        coverPhotoLink:'/images/' + req.files.courseCoverPhoto[0].filename,
                                        topics:[topicSaved._id],
                                        uploadedBy:decoded._id,
                                        skills:req.body.skills? JSON.parse(req.body.skills):[]
                                    })
                                    const courseSaved = await newCourse.save()
                                    if(courseSaved){
                                        try{
                                            userInstance.uploadedCourses.push(courseSaved._id)
                                            await userInstance.save()
                                            req.user = userInstance
                                            try{
                                                const populatedCourse = await courseSaved.populate({
                                                    path:'topics',
                                                    populate:{
                                                        path:'videos',
                                                        model:'Video',
                                                    }
                                                })
                                                console.log(populatedCourse,'populate')
                                                req.course = populatedCourse
                                                next()
                                            }catch(err){
                                                res.status(500).json({err:"Coudn't populate field"})
                                            }
                                        }
                                        catch(err){
                                            res.status(402).json({err:"Couldn't update user"})
                                        }
                                      
                                        
                                       
                                        next()
                                    }else{
                                        res.status(402).json({err:"Couldn't save course"})
                                    }
                                }catch(err){
                                    res.status(400).json({err:"Couldn't save course"})
                                }
                            }
                            
                            
                         } catch(err){
                              res.status(400).json({err:"Couldn't save topic"})
                         }
                    }
                    else{
                        res.status(400).json({err:"Couldn't save video"})
                    }
                    
                } catch(err){
                    res.status(500).json({err:err})     
                   }
              } catch(err){
                    res.status(400).json({err:err})     
            }
        }catch(err){
           res.status(404).json({err:'Not authorized'})
        }
    }
    else{
        res.status(404).json({err:'Not authorized'})
    }
    
   
}
const addVideo = async(req,res,next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
    if(decoded){
       try{
          const course = await Course.findOne({_id:req.body.id,uploadedBy:decoded._id})
          if(course){
            try{
                // const topic = await Topic.find({_id:course.id}).sort({ _id: -1 }).limit(1)
                // const LastVideo = await Video.find({_id:topic.id}).sort({ _id: -1 }).limit(1)
                const lastVideoID = course.videos.slice(-1)
                const LastVideo = await Video.find({_id:lastVideoID})

                try{
                    const newVideo = new Video({
                        number:LastVideo.number + 0.01,
                        title:req.body.title,
                        description:req.body.description,
                        
                        videoLink:'/videos/' + req.files.videoFile[0].filename,
                        uploadedBy:decoded._id
                    })
                    const videoSaved = await newVideo.save()
                    if(videoSaved){
                        try{
                            topic.videos.push(videoSaved._id)
                            await topic.save()
                            const populatedCourse = courseSaved.populate({
                                path:'courses',
                                populate:{
                                    path:'videos',
                                    model:'Video',
                                }
                            })
                            req.course = populatedCourse
                            next()
                        }catch(err){
                            res.status(500).json({err:"Couldn't add video to course"})
                        }
                    }
                    else{
                        res.status(500).json({err:"Server error : Couldn't not save video"})
                    }
                }catch(err){
                    res.status(400).json({err:"Wrong video credentials"})
                }

            }catch(err){
                res.status(404).json({err:err})
            }
          }
          else{
            res.status(400).json({err:"Course not found"})
          }
       } catch(err){
         res.status(404).json()
       }
    }
    else{
        res.status(404).json({err:'Unauthorized'})
    }
}













module.exports = {courseUpload,addVideo}