const express = require('express')
const router = express.Router()
var cors = require('cors');
const Course = require('../models/course')
const Video = require('../models/video')
const {tokenVerify} = require('../middlewares/token')
const {
  courseUpload,
  addVideo,
  addTopic,
  deleteVideo,
  deleteTopic,
  deleteCourse,
  updateVideo,
  updateTopic,
  updateCourse,
  courseCompressSingle,
  skillFinder,
  mostViewedFinder,
  recentFinder,
  }  = require('../middlewares/videoCourse');
const fs = require('fs')
const path = require('path')
var multer = require('multer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
router.use(cors()) 
const dotenv = require('dotenv');
dotenv.config()
var fileStorage = multer.diskStorage({
   destination: (req, file, cb) => {
       if(file.fieldname=="videoFile"){
           cb(null, path.join( __dirname,'uploads/videos'))
       }
       else{
           cb(null, path.join( __dirname,'uploads/images'))
       }
   },
   filename:(req,file,cb) => {
      cb(null, file.fieldname+"-"+uuidv4()+path.extname(file.originalname));
   }
});

var upload = multer(
   { 
     storage: fileStorage, 
     limits:
       { 
         fileSize:'10mb' 
       }
   }
 )


router.post('/add/video',upload.single('videoFile'),addVideo,(req,res)=>{
    res.status(201).json({
      data:{
        newVideo:req.videoAdded,
        updatedCourse:req.course,
      }
    })
})


router.post('/add/topic',upload.single('videoFile'),addTopic,(req,res)=>{
  res.status(201).json({
    data:{
      newTopic:req.newTopic,
      updatedCourse:req.course,
    }
  })
})


router.post('/upload',upload.fields(
   [
     { 
       name: 'coverPhoto', 
       maxCount: 1 
     }, 
     { 
       name: 'videoFile', 
       maxCount: 1 
     },
     {
      name: 'courseCoverPhoto', 
      maxCount: 1 
     }
   ]
 ),courseUpload,(req,res) => {
  console.log(req.headers['authorization'],'auth') 
  res
    .status(201)
    .json({
       data:{
          video: req.video,
          course:req.course,  
          user:req.user,    
       }

    })
})


//getters

router.get('/get/small/:id',async(req,res)=>{
  console.log(req.params.id,'param')
     try{
        const decoded = req.decoded
        const video = await Video.findOne({_id:req.params.id})
        const range = req.headers.range;
        if(range) console.log(range)
        res.status(200).json({video})  
     }
     catch{
        res.status(404).json({err:'Video not found'})
     }  
})


router.get('/get/:id',tokenVerify,async(req,res)=>{
  console.log('token',req.headers["authorization"])
  try{
    const decoded = req.decoded
    console.log('decoded=',req.decoded)
    try{
      const course =  await Course.findOne({_id:req.params.id})
      const populatedCourse = await course.populate({
        path:'topics',
        model:'Topic',
        populate:{
            path:'videos',
            model:'Video',
        }
      })
      console.log(populatedCourse.topics[0])
      res.status(200).json({populatedCourse})  
    } catch{
      res.status(404).json({err:'Course not found'})  
    }
  } catch(err){
    res.status(400).json({err:err})  
  }
})
//update

router.post('/update/:courseId/:topicId/:videoId/video',tokenVerify,upload.single('videoFile'),updateVideo,(req,res)=>{
   res.status(201).json({data:'Updated Successfully'})
})
router.post('/update/:courseId/:topicId/topic',tokenVerify,updateTopic,(req,res)=>{
  res.status(201).json({data:'Updated Successfully'})
})
router.post('/update/:courseId/course',tokenVerify,upload.single('courseImage'),updateCourse,(req,res)=>{
  res.status(201).json({data:'Updated Successfully'})
})





//delete
router.post('/delete/:courseId/:topicId',deleteVideo,(req,res)=>{
  console.log('passing next')  
  res.status(201).json({
      data:'deleted successfully'
    })
})
router.delete('/delete/:courseId/:topicId/topic',tokenVerify,deleteTopic,(req,res)=>{
  res.status(201).json({
    data:'deleted successfully'
  })
})
router.delete('/delete/:courseId/course',tokenVerify,deleteCourse,(req,res)=>{
  res.status(201).json({
    data:'deleted successfully'
  })
})


//compressed getters
// router.post('/get/explore',courseCompress,async(req,res)=>{
//    res.status(200).json({
//     data:{
//       skillCourses:req.courses,
//       mostViewedCourses:req.mostViewedCourses
//     }
//    })
// })




///limiters

router.get('/explore/:skill',skillFinder,async(req,res)=>{
    res.json({
        message:req.query.start,
        param:req.params,
        data:req.courses,
    })
})
router.get('/explore/course/popular',mostViewedFinder,async(req,res)=>{
  res.json({
      message:req.query,
      param:req.params,
      data:req.courses,
  })
})
router.get('/explore/course/new',recentFinder,async(req,res)=>{
   res.json({
      message:req.query,
      param:req.params,
      data:req.courses,
      re:'chod'
   })
})


/////




router.get('/get/:courseId/compress',courseCompressSingle,async(req,res)=>{
  res.status(200).json({
     data:req.course
  })
})


module.exports = router