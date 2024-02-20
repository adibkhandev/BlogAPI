const express = require('express')
const router = express.Router()
var cors = require('cors');
const Course = require('../models/course')
const Video = require('../models/video')
const {tokenVerify} = require('../middlewares/token')
const {courseUpload,courseCompress,addVideo,addTopic,deleteVideo}  = require('../middlewares/videoCourse');
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

router.post('/delete/:courseId/:topicId',deleteVideo,(req,res)=>{
  console.log('passing next')  
  res.status(200).json({
      data:'deleted successfully'
    })
})

router.post('/get/explore',courseCompress,async(req,res)=>{
   res.status(200).json({
      data:req.courses
   })
})


module.exports = router