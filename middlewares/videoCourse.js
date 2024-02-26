const User = require('../models/user')
const Video = require('../models/video')
const Course = require('../models/course')
const Topic = require('../models/topic')
const path = require('path')
const jwt = require('jsonwebtoken');
const fs = require('fs')

const dotenv = require('dotenv');
dotenv.config()
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const video = require('../models/video')

ffmpeg.setFfmpegPath(ffmpegStatic);

const deleteFiles = async(videos) => {
    await Promise.all(videos.map(async(video)=>{
        console.log(video,'mapping')
        const deletedVideo = await Video.findOneAndDelete({_id:video})
        if(deletedVideo){
            const inputVid = './routes/uploads/' +  deletedVideo.videoLink.replace('mp4','avi')
                fs.unlink(inputVid,(err)=>{
                    if(err) console.log(err,'im')
                    else {
                       console.log('deleted')
                    }
            })
        }
        else{
            console.log('error')
        }
    }))
}


const deleteVideo = async(req,res,next) => {
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
        const userInstance = await User.findOne({_id:decoded._id})
        try{
            const course = await Course.findOne({_id:req.params.courseId})
            if(course.topics.includes(req.params.topicId)){
                try{
                    console.log(req.body.videos,'dasdsadsadsa')
                    deleteFiles(req.body.videos)
            console.log('crossing promise')
            next()
                } catch{
                    res.status(400).json({err:'could not map'})
                }
            }
            else{
                res.status(500).json({err:'Topic not found'})
            }
        } catch{
            res.status(500).json({err:'course not found'})
        }
    } catch {
        res.status(400).json({err:'Unauthorized'})
    }
}

const courseUpload = async(req,res,next) => {
    // console.log(req.files,'files',req.body,path.extname(req.files.coverPhoto[0].originalname))
    
    
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
    // console.log(decoded,'decoded')
    // console.log(req.body.skills,'skills')
    if(decoded){
        try{
            const userInstance = await User.findOne({_id:decoded._id})
            try {
               
                 const inputVid = './routes/uploads/videos/' + req.files.videoFile[0].filename
                 const outputVid = './routes/uploads/videos/' + req.files.videoFile[0].filename.replace('mp4','avi')
                 ffmpeg(inputVid)
                    .format('avi')
                    .on('error', (err) => console.error('Error:', err))
                    .on('end', () =>{
                        console.log('Conversion done!')
                        fs.unlink(inputVid,(err)=>{
                            console.log(err)
                        })
                    })
                    .save(outputVid, { end: true })
            } catch{
                 console.log('error in ffmpeg')
            }
            
            try{
                const newVideo = new Video({
                    number:1.01,
                    title:req.body.title,
                    description:req.body.description,
                    videoLink:'/videos/' + req.files.videoFile[0].filename,
                    uploadedBy:decoded._id
                })
                const videoSaved = await newVideo.save()
                req.video = videoSaved
                try {
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
        console.log(course.topics[0])
        const topic = await Topic.findOne({_id:req.body.topicId},{videos:{$slice: -1}})
        const LastVideo = await Video.findOne({_id:topic.videos[0]})
        console.log(LastVideo,'last')
        const newNum =LastVideo ? LastVideo.number + 0.01: topic.number + 0.01;
        console.log(newNum)
        try {
            const inputVid = './routes/uploads/videos/' + req.file.filename
            const outputVid = './routes/uploads/videos/' + req.file.filename.replace('mp4','avi')
            ffmpeg(inputVid)
            .format('avi')
            .on('error', (err) => console.error('Error:', err))
            .on('end', () =>{
                console.log('Conversion done!')
                fs.unlink(inputVid,(err)=>{
                    console.log(err)
                })
            })
            .save(outputVid, { end: true })
        } catch{
                console.log('error in ffmpeg')
        }
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
       } catch(err){
         res.status(500).json()
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
            const newVideo = new Video({
                number:lastTopicNum + 1.01,
                title:req.body.title,
                description:req.body.description,
                videoLink:'/videos/' + req.file.filename,
                uploadedBy:decoded._id,
            })
            const videoSaved = await newVideo.save()
            try {
                const inputVid = './routes/uploads/videos/' + req.file.filename
                const outputVid = './routes/uploads/videos/' + req.file.filename.replace('mp4','avi')
                ffmpeg(inputVid)
                .format('avi')
                .on('error', (err) => console.error('Error:', err))
                .on('end', () =>{
                    console.log('Conversion done!')
                    fs.unlink(inputVid,(err)=>{
                        console.log(err)
                    })
                })
                .save(outputVid, { end: true })
            } catch{
                    console.log('error in ffmpeg')
            }
            course.videoNumber += 1
                const newTopic = new Topic({
                    title:req.body.topicTitle,
                    number:lastTopicNum+1,
                    videos:[videoSaved._id]
                })
               const topicSaved = await newTopic.save()
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


//update

const updateCourse = async(req,res,next)=>{
    try{
        const course = await Course.findOne({_id:req.params.courseId})
        const user = await User.findOne({_id:req.decoded._id})
        if(user.uploadedCourses.includes(course._id)){
            if(req.body.courseTitle || req.body.courseDescription || req.file.filename){
                if(req.body.courseTitle){
                    course.title = req.body.courseTitle
                }
                if(req.body.courseDescription){
                    course.description = req.body.courseDescription
                }
                if(req.file){
                    const lastCover = './routes/uploads' + course.coverPhotoLink
                    course.coverPhotoLink = '/images/' + req.file.filename
                    fs.unlink(lastCover,(err)=>{
                        if(err) console.log(err)
                        else{
                    }
            })
                }
                console.log('finifn')
                await course.save()
                next()
            }
            else{
              res.status(400).json({err:'Empty request'})
            }
        }
        else{
            res.status(400).json({err:'Unauthorized'})
        }
    } 
    catch{
       res.status(500).json({err:'Server failed'})
    }
}


const updateVideo = async(req,res,next) => {
    try{
        console.log(req.params.courseId,req.params.topicId,'sad')
        const course = await Course.findOne({_id:req.params.courseId})
        const topic = await Topic.findOne({_id:req.params.topicId})
        const user = await User.findOne({_id:req.decoded._id})
        const video = await Video.findOne({_id:req.params.videoId})
        if(user.uploadedCourses.includes(course._id) && course.topics.includes(topic._id) && topic.videos.includes(video._id)){
            if(req.body.videoTitle || req.body.videoDescription || req.file.filename){
                if(req.body.videoTitle){
                    video.title = req.body.videoTitle
                }
                if(req.body.videoDescription){
                    video.description = req.body.videoDescription
                }
                if(req.file){
                    try {
                        const lastVideo = video.videoLink
                        const inputVid = './routes/uploads/videos/' + req.file.filename
                        const outputVid = './routes/uploads/videos/' + req.file.filename.replace('mp4','avi')
                        const oldVid = './routes/uploads/' + lastVideo.replace('mp4','avi')
                        ffmpeg(inputVid)
                        .format('avi')
                        .on('error', (err) =>{
                            res.status(500).json({err:'Server failed in saving video'})
                        })
                        .on('end', () =>{
                            fs.unlink(inputVid,(err)=>{
                                if(err) console.log(err)
                                else console.log('deleted')
                            })
                            console.log('Conversion done!')
                            fs.unlink(oldVid,(err)=>{
                                if(err) console.log(err)
                                else{
                            console.log('deleted')
                        } 
                    })
                })
                .save(outputVid, { end: true })
                video.videoLink = '/videos/' + req.file.filename
                
            } catch{
                        console.log('error in ffmpeg')
                    }
                }
                console.log('finifn')
                await video.save()
                next()
            }
            else{
              res.status(400).json({err:'Empty request'})
            }
        }
        else{
            res.status(400).json({err:'Unauthorized'})
        }
    } 
    catch{
       res.status(500).json({err:'Server failed'})
    }
}


const updateTopic = async(req,res,next) => {
    // console.log(req.params,req.decoded)
    try{
        const course = await Course.findOne({_id:req.params.courseId})
        const topic = await Topic.findOne({_id:req.params.topicId})
        const user = await User.findOne({_id:req.decoded._id})
        console.log(course._id,topic._id,user._id)
        if(user.uploadedCourses.includes(course._id) && course.topics.includes(topic._id)){
            if(req.body.topicTitle){
                console.log('ashe')
                topic.title = req.body.topicTitle
                await topic.save()
                next()
            }
            else{
              res.status(400).json({err:'Empty request'})
            }
        }
        else{
            res.status(400).json({err:'Unauthorized'})
        }
    } 
    catch{
       res.status(500).json({err:'Server failed'})
    }
}


//delete


const deleteTopic = async(req,res,next) => {
    try{
        const user = await User.findOne({_id:req.decoded._id})
        try{
           const course = await Course.findOne({_id:req.params.courseId})
           const topic = await Topic.findOne({_id:req.params.topicId})
           if(!user.uploadedCourses.includes(course._id) || !course.topics.includes(topic._id)) res.status(400).json({message:'Unautorized'})
           deleteFiles(topic.videos)
           await Topic.deleteOne({_id:req.params.topicId})
           next()
        } catch{
            res.status(500).json({message:'Server failed'})
        }
        
    } catch{
        res.status(400).json({message:'Unautorized'})
    }
}
const deleteCourse = async(req,res,next) => {
    try{
        const user = await User.findOne({_id:req.decoded._id})
        try{
           const course = await Course.findOne({_id:req.params.courseId})
           if(!user.uploadedCourses.includes(course._id)) res.status(400).json({message:'Unautorized'})
           console.log(course.topics,'submit')
           const populatedCourse = await course.populate({
            path:'topics',
            model:'Topic',
            populate:{
                path:'videos',
                model:'Video',
              }
            })
            const nestedVideos = populatedCourse.topics.map(topic=>{
                return topic.videos.map(video=>{
                    return video._id
                })
            })
            const [videos] = nestedVideos
           deleteFiles(videos)
           fs.unlink(__dirname + './../routes/uploads' + course.coverPhotoLink, (err) => {
            if (err) {
                console.log("failed to delete local image:"+err);
            } else {
                console.log('successfully deleted local image');                                
            }
            });
           await Course.deleteOne({_id:req.params.courseId})
           next()
        } catch{
            res.status(500).json({message:'Server failed'})
        }
        
    } catch{
        res.status(400).json({message:'Unautorized'})
    }
}




module.exports = {courseUpload,courseCompress,addVideo,addTopic,deleteVideo,deleteTopic,deleteCourse,updateVideo,updateTopic,updateCourse}