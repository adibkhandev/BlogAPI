const express = require('express')
const router = express.Router()
var cors = require('cors');
const Course = require('../models/course')
const Video = require('../models/video')
const {courseUpload}  = require('../middlewares/videoCourse');
const fs = require('fs')
const path = require('path')
var multer = require('multer');
const { v4: uuidv4 } = require('uuid');
router.use(cors()) 

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
router.post('/upload',upload.fields(
   [
     { 
       name: 'coverPhoto', 
       maxCount: 1 
     }, 
     { 
       name: 'videoFile', 
       maxCount: 1 
     }
   ]
 ),courseUpload,(req,res) => {
  console.log(req.headers['authorization'],'auth') 
  res
    .status(201)
    .json({
       data:{
          video: req.video      
       }

    })
})

module.exports = router