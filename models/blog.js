const mongoose = require('mongoose')
const blogSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    blog:{
        type: String,
        required:true
    },
    postTime:{
        type: Date,
        required:true,
        default: Date.now
    },
    img:{
        type:String,
        required:false
    }
})
module.exports = mongoose.model('Blog',blogSchema)