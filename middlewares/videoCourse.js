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
    console.log(req.body.skills,'skills')
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
                                        videoNumber:1,
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
    console.log(req.body)
    if(decoded){
       try{
          const course = await Course.findOne({_id:req.body.id},{topics:{$slice: -1}})
          if(course){
            console.log(course.topics[0])
            try{
                const topic = await Topic.findOne({_id:req.body.topicId},{videos:{$slice: -1}})
                const LastVideo = await Video.findOne({_id:topic.videos[0]})
                console.log(LastVideo,'last')
                const newNum = LastVideo.number + 0.01;
                console.log(newNum)
                try{
                    const newVideo = new Video({
                        number:newNum,
                        title:req.body.title,
                        description:req.body.description,
                        videoLink:'/videos/' + req.file.filename,
                        uploadedBy:decoded._id,
                    })
                    console.log(newVideo,'mew')
                    const videoSaved = await newVideo.save()
                    course.videoNumber += 1
                    if(videoSaved){
                        try{
                            console.log(topic,'topic to be added',videoSaved._id)
                            
                            const topicSaved = await Topic.updateOne(
                                {_id:topic._id},
                                {$push:{
                                    videos:videoSaved._id
                                }}
                            )
                            const updatedCourse = await Course.findOne({_id:req.body.id})
                            const populatedCourse = await updatedCourse.populate({
                                path:'topics',
                                model:'Topic',
                                populate:{
                                    path:'videos',
                                    model:'Video',
                                }
                            })
                            req.course = populatedCourse
                            req.videoAdded = videoSaved
                            next()
                        }catch(err){
                            res.status(500).json({err:"Couldn't add video to course due to " + err})
                        }

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





const addTopic = async(req,res,next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
    console.log(decoded,'deded')
    if(decoded){
       try{
          const course = await Course.findOne({_id:req.body.id},{topics:{$slice: -1}})
          const lastTopic = await Topic.findOne({_id:course.topics[0]})
          const lastTopicNum = lastTopic.number
          try{
            const newVideo = new Video({
                number:lastTopicNum + 1.01,
                title:req.body.title,
                description:req.body.description,
                videoLink:'/videos/' + req.file.filename,
                uploadedBy:decoded._id,
            })
            const videoSaved = await newVideo.save()
            course.videoNumber += 1
            try{
                const newTopic = new Topic({
                    title:req.body.topicTitle,
                    number:lastTopicNum+1,
                    videos:[videoSaved._id]
                })
               const topicSaved = await newTopic.save()
               try{
                  course.topics.push(topicSaved._id)
                  const updatedCourse = await course.save()
                  const populatedCourse = await updatedCourse.populate({
                    path:'topics',
                    model:'Topic',
                    populate:{
                        path:'videos',
                        model:'Video',
                    }
                 })
                   req.course = populatedCourse
                   req.newTopic = topicSaved
                   next()
               }catch(err){
                res.status(500).json({err:'could not add to course'})
               }
            }catch(err){
                res.status(400).json({err:'could not save topic'})
            }
          }catch(err){
            res.status(400).json({err:'could not save video'})
          }
       } catch(err){
         res.status(404).json()
       }
    }
    else{
        res.status(404).json({err:'Unauthorized'})
    }
}


const courseCompress = async(req,res,next) => {
    // const token = req.headers.authorization.split(' ')[1]
    // const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
    try{
        const courses = await Course.find({skills:req.body.skill})
        const compressedCourses =  await Promise.all(courses.map(async(course)=>{
            const author = await User.findOne({_id:course.uploadedBy})
            return {
                courseId:course._id,
                userId:author._id,
                courseName:course.title,
                cover:course.coverPhotoLink,
                videos:course.videoNumber,
                uploaderName:author.username,
                uploaderPicture:author.pfp,
            }
        }))
        console.log(compressedCourses,'com')
        req.courses = compressedCourses
        next()
    } catch(err){
        res.status(404).json({err:err})
    }
}




module.exports = {courseUpload,courseCompress,addVideo,addTopic}