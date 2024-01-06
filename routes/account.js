const express = require('express')
const router = express.Router()
const cors = require('cors');
const User = require('../models/user')
router.use(cors()) 

router.get('/:username',async(req,res)=>{
    try{
      const user = await User.findOne({username:req.params.username})
      res
        .status(200)
        .json({
            username:user.username,
            skills:user.skills,
            pfp:user.pfp,
            userType:user.userType,
        })
  
    } catch(err){
        res.status(500).json({message:'error'})
    }
})


  
  module.exports = router