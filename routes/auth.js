const express = require('express')
const router = express.Router()
const cors = require('cors');
const User = require('../models/user')
const refreshTokenDb = require('../models/refreshToken')
const { userRegister , userLogin , tokenRefresh}  = require('../middlewares/token');
router.use(cors()) 


router.post('/register',userRegister,(req,res)=>{
  console.log(req.refreshToken,'token')
    res
      .status(201)
      .json({
        accesstoken:req.token,
        refreshtoken:req.refreshToken,
      })
})
router.post('/login',userLogin,(req,res)=>{
  res
    .status(200)
    .json({
      accesstoken:req.token,
      refreshtoken:req.refreshToken,
    })
})

router.post('/refresh',tokenRefresh,(req,res)=>{
  res
    .status(200)
    .json({
      accesstoken:req.token,
      refreshtoken:req.refreshToken,
    })
})
router.get('/refresh/all',async(req,res)=>{
  try{
    const db = await refreshTokenDb.find({})
    res
      .status(200)
      .json({
        'tokenlist':db,
        'h1':'h1',
      })

  } catch(err){
      res.status(500).json({message:'error'})
  }
})

module.exports = router