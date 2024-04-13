const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/user')
const refreshTokenDb = require('../models/refreshToken')
const saltRounds = 10
dotenv.config()
const addToDb = async(token) => {
    const newToken = new refreshTokenDb({
        token:token
    })
    await newToken.save()
    console.log('adding to db')
}
const checkDb = async(token) => {
    const tokenIsValid = await refreshTokenDb.findOne({token:token})
    return tokenIsValid ? true : false
}
const generateAccessToken = (username,password,id) => {
    return jwt.sign({username:username,password:password,_id:id},process.env.SECRET_TOKEN,{expiresIn:'2d'})
}
const generateRefreshToken = (username,password,id) => {
    return jwt.sign({username:username,password:password,_id:id},process.env.SECRET_RTOKEN,{expiresIn:'2d'})
}

const tokenVerify = (req,res,next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
        req.decoded = decoded
        // console.log(token,'ffff')
        next()
    } catch(err){
        res.status(400).json({data:'fck'})
    }
}

const userRegister = async(req,res,next) => {
    try{
      const user = await User.findOne({username:req.body.username})
      if(user){
          res.status(404).json({'message':'ase already'})
      }
      else{
        console.log(req.body,'username')
        bcrypt.hash(req.body.password,saltRounds,async(err,hash)=>{
            const newUser = new User({
                username:req.body.username,
                userType:req.body.userType,
                password:hash,
                pfp:req.file?'/images/' + req.file.filename:null,
                skills:req.body.skills? JSON.parse(req.body.skills):[]
            })
            const token = generateAccessToken(req.body.username,hash,newUser._id)
            req.token = token
            const refreshToken = generateRefreshToken(req.body.username,hash,newUser._id)
            req.refreshToken = refreshToken
            try{
                const user = await newUser.save()
                req.user = user
                return next()
                    
            } catch(err){
                res.json({'message':'database did not accept new model instance'})
            }
                
            
        })
      }
    } catch(err){
        res.status(500).json({message:err})
    }
}
const fs = require('fs')
const userUpdate = async(req,res,next) => {
    const token = req.headers.authorization.split(' ')[1]
    console.log(token,'tok')
    const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
    console.log(req.body.username,'dec')
    try {
      const user = await User.findOne({_id:decoded._id})
      console.log(user,'us')
      try{
        if (req.body.username) {
            user.username = req.body.username
        }
        if(req.body.skills){
            user.skills = JSON.parse(req.body.skills)
        }
        if(req.file){
                fs.unlink(__dirname + './../routes/uploads' + user.pfp, (err) => {
                    if (err) {
                        console.log("failed to delete local image:"+err);
                    } else {
                        console.log('successfully deleted local image');                                
                    }
                });
                user.pfp = '/images/' + req.file.filename
           
        } 
        if(req.body.removePfp){
            fs.unlink(__dirname + './../routes/uploads' + user.pfp, (err) => {
                if (err) {
                    console.log("failed to delete local image:"+err);
                } else {
                    console.log(user.pfp,'after updaye')
                    console.log('successfully deleted local image');                                
                }
            });
            user.pfp = null
        }
          if(req.file || req.body.skills || req.body.username || req.body.removePfp){
              try {
                 const updatedUser = await user.save()
                 req.user = updatedUser
                 const accessToken = generateAccessToken(updatedUser.username,updatedUser.password,updatedUser._id)
                 req.accessToken = accessToken
                 const refreshToken = generateRefreshToken(updatedUser.username,updatedUser.password,updatedUser._id)
                 req.refreshToken = refreshToken
                 next()
              } catch(err){
               res.status(400).json({data:'local'})
              }
          }
          else{
            res.status(400).json({message:'Data not found'})
          }

      }catch(err){
        res.status(505).json({message:'User not found'})
      }
    } catch(err){
        res.status(404).json({message:'User not found'})
    }
}


const userLogin = async(req,res,next) => {
    try{
        const user = await User.findOne({username:req.body.username})
        if(user){
            console.log(user.password,'pass')
            try{
                bcrypt.compare(req.body.password,user.password,(err,result)=>{
                    console.log(result,'result')
                    if(err){
                        res.status(500).json({'error':'server failed'})
                    }
                    if(result){
                        const token = generateAccessToken(req.body.username,user.password,user._id)
                        req.token = token
                        const refreshToken = generateRefreshToken(req.body.username,user.password,user._id)
                        req.refreshToken = refreshToken
                        req.user = user
                        return next()
                    }
                    if(!result){
                        res.status(400).json({'message':'invalid password'})
                    }

                })

            } catch(err){
                res.status(500).json({message:err})
            }
        }
        else{
            res.status(401).json({message:'User not found'})
        }
      } catch(err){
           res.status(500).json({message:err})
    }
}



const tokenRefresh = async(req,res,next) => {
    console.log(req.body.refreshToken,'token sent')
    if(req.body.refreshToken){
        try{
                const decoded = jwt.verify(req.body.refreshToken, process.env.SECRET_RTOKEN)
                console.log(decoded,'korse')
                console.log('verified :',decoded)
                const user = User.findOne({_id:decoded._id})
                const populatedUser = await user.populate({
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
                req.user = populatedUser
                const token = generateAccessToken(decoded.username,decoded.password,decoded._id)
                req.token = token
                const refreshToken = generateRefreshToken(decoded.username,decoded.password,decoded._id)
                req.refreshToken = refreshToken
                return next()
        } catch(err){
            res.status(400).json({'message':'token not recognized'})
        }
    }
    else{
        res.status(401).json({message:'yess'})
    }
}


module.exports = { userUpdate , userRegister , userLogin , tokenRefresh , tokenVerify}