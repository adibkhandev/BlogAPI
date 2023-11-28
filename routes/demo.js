const express = require('express')
const router = express.Router()
var cors = require('cors');
const Blog = require('../models/blog')


//middlewares

router.use(cors()) 
let getBlog = async(req,res,next) =>{
    let blog;
    try{
        blog = await Blog.findById(req.params.id)
        if(!blog){
            return res
            .status(404)
            .json({message:'No blogs found'})
        }
    } catch(err){
           return res
                   .status(500)
                   .json({message:err.messaage})
    }
    res.blog = blog
    next()
}


//CREATE

var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join( __dirname,'uploads'))
    },
    filename:(req,file,cb)=>{
         cb(null,file.fieldname + Date.now() + '.jpg')
    }

});
 
var upload = multer({ storage: storage });
const fs = require('fs')
const path = require('path')


router.post('/add', upload.single('img') ,async(req,res) => {
   
       const blog = new Blog({
          title:req.body.title,
          blog:req.body.blog,
          img:'/images/' + req.file.filename
      })  
   try{
       const newBlog = await blog.save() 
       res
          .status(201)
          .json(newBlog)

   } catch(err){
       res
         .status(400)
         .json({messaage:err.message})
   }
})




//READ

router.get('/blog/:id',getBlog,(req,res)=>{
    res.send(res.blog)
})
router.get('/all', async(req,res) => {
    try{
        let allBlogs = await Blog.find({})
        return res
                .status(200)
                .json(allBlogs)

    } catch(err) {
         return res
                .status(500)
                .json({message:err.messaage})
    }
})


//UPDATE
router.patch('/update/:id', getBlog , async(req,res)=>{
    if(req.body.title) res.blog.title = req.body.title
    if(req.body.blog) res.blog.blog = req.body.blog
    try{
        const updatedBlog = await res.blog.save()
        res
         .status(201)
         .json(updatedBlog)
    } catch(err){
        res.status(500).json({message:err})
    }
})



//DELETE

router.delete('/all',async(req,res)=>{
    console.log('called')
    try{
        await Blog.deleteMany({})
        res
         .status(201)
         .json({message:'deleted'})
    } catch(err){
        res.status(500).json({message:err})
    }
})
router.delete('/delete/:id',getBlog, async (req,res)=>{
        try{
            await res.blog.deleteOne()
            res
             .status(200)
             .json({messaage:'removed successfully'})
        } catch(err){
            res
             .status(500)
             .json({messaage:'in main func',error:err})
        }
})



module.exports = router