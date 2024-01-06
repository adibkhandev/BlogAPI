const User = require('../models/user')
const Video = require('../models/video')
const Course = require('../models/course')
const path = require('path')
const jwt = require('jsonwebtoken');
const { request } = require('http')
 
const dotenv = require('dotenv');
dotenv.config()

const courseUpload = async(req,res,next) => {
    console.log(req.files,'files',req.body,path.extname(req.files.coverPhoto[0].originalname))
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
    console.log(decoded,'decoded')
    try{
        const newVideo = new Video({
            title:req.body.title,
            description:req.body.description,
            coverPhotoLink:'/images/' + req.files.coverPhoto[0].filename,
            videoLink:'/videos/' + req.files.videoFile[0].filename
        })
        try {
            const videoSaved = await newVideo.save()
            req.video = videoSaved
            next()
            
        } catch(err){
            res.status(500).json({err:err})     
           }
      } catch(err){
            res.status(400).json({err:err})     
    }
}
const addVideo = (req,res,next) => {
    
}
const uploadVideo = async(file,courseId) => {

}













module.exports = {courseUpload,addVideo}