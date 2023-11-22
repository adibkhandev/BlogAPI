const express = require('express')
const router = express.Router()
const Blog = require('../models/blog')
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
router.get('/blog/:id',getBlog,(req,res)=>{
    res.send(res.blog)
})

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

router.post('/add', async(req,res) => {
   const blog = new Blog({
       title:req.body.title,
       blog:req.body.blog
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


module.exports = router