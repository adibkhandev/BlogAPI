const express = require('express')
const router = express.Router()
const cors = require('cors');
const User = require('../models/user')
const {subscribeCourse,unSubscribeCourse} = require('../middlewares/account')
router.use(cors()) 

router.post('/subscribe',subscribeCourse,(req,res)=>{
    res.json({
        user:req.updatedUser
    })
})


router.post('/unsubscribe',unSubscribeCourse,(req,res)=>{
    res.json({
        user:req.updatedUser
    })
})


router.get('/:username',async(req,res)=>{
    try{
      const UserFound = await User.findOne({username:req.params.username})
      const populatedUser = await UserFound.populate({
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
      console.log(populatedUser,'pop')
      res
        .status(200)
        .json({
            id:populatedUser._id,
            username:populatedUser.username,
            skills:populatedUser.skills,
            pfp:populatedUser.pfp,
            userType:populatedUser.userType,
            uploadedCourses:populatedUser?populatedUser.uploadedCourses:null,
            subscribedCourses:populatedUser?populatedUser.subscribedCourses:null,
            thumbnails:populatedUser.uploadedCourses.map(courses=>courses.coverPhotoLink)

        })
  
    } catch(err){
        res.status(500).json({message:'error'})
    }
})


  
  module.exports = router