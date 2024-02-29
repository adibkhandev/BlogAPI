const express = require('express')
const router = express.Router()
const cors = require('cors');
const User = require('../models/user')
const {tokenVerify} = require('../middlewares/token')
const {subscribeCourse,unSubscribeCourse,getSubscribed} = require('../middlewares/account')
router.use(cors()) 

router.post('/subscribe',subscribeCourse,(req,res)=>{
    res.json({
        user:req.updatedUser
    })
})


router.get('/subscribed',tokenVerify,getSubscribed,(req,res)=>{
    res.status(200).json({
        subscribed:req.subscribed
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
        console.log('pop')
        const landingUserUploaded = populatedUser.uploadedCourses.length ? populatedUser.uploadedCourses.reverse() : null
        const landingUserSubscribed = populatedUser.subscribedCourses.length ? populatedUser.subscribedCourses.reverse() : null
      res
        .status(200)
        .json({
            id:populatedUser._id,
            username:populatedUser.username,
            skills:populatedUser.skills,
            pfp:populatedUser.pfp,
            userType:populatedUser.userType,
            uploadedCourses:landingUserUploaded,
            subscribedCourses:landingUserSubscribed,
            thumbnails:landingUserUploaded ? landingUserUploaded.map(courses=>courses.coverPhotoLink):null
        })
  
    } catch(err){
        res.status(500).json({message:'error'})
    }
})


  
  module.exports = router