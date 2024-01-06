const mongoose = require('mongoose')
const courseSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    description:{
        type:String,
        required:false
    },
    coverPhotoLink:{
        type:String,
        required:true,
    },
    videos:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Video',
        required: true
    }]
})
module.exports = mongoose.model('Course',courseSchema)