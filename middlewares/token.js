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
    return jwt.sign({username:username,password:password,_id:id},process.env.SECRET_RTOKEN,{expiresIn:'80000'})
}

const tokenVerify = (req,res,next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(JSON.parse(token),process.env.SECRET_TOKEN)
        req.decoded = decoded
        console.log(token,'ffff')
        next()
    } catch{
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
    const refreshList = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtoYW42OTkiLCJwYXNzd29yZCI6IiQyYiQxMCRNbFFDU3piQ3FsQktmYmFtdlZlcTVlbnJHNUFnb2pvUUNtV2gxRDFEVnV3TVhJVmYuUVE4eSIsImlhdCI6MTcwMTE0ODk4NCwiZXhwIjoxNzAxMTQ4OTk0fQ.drosUR71jRbd7oPbJv8RGoWihyVS9-rpXMAVbk4NyNY'];
    if(req.body.refreshToken){
        try{
            const tokenInDb = await refreshTokenDb.findOne({token:req.body.refreshToken})
            if(tokenInDb){
                console.log('token found in db',tokenInDb)
                const decoded = jwt.verify(req.body.refreshToken,process.env.SECRET_RTOKEN)
              
                  if(decoded){
                      console.log('verified :',decoded)
                      const token = generateAccessToken(decoded.username,decoded.password,decoded.id)
                      req.token = token
                      const refreshToken = generateRefreshToken(decoded.username,decoded.password,decoded.id)
                      req.refreshToken = refreshToken
                      return next()
                  }
                  else{
                    res.status(500).json({'error':'token not verified'})
                  }

            }
            else{
                res.status(404).json({'message':'token not found'})
            }
        } catch(err){
            res.status(400).json({'message':'token not recognized'})
        }



    }
    else{
        res.status(401).json({message:'yess'})
    }
}


module.exports = {userRegister , userLogin , tokenRefresh , tokenVerify}