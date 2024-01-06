const mongoose = require('mongoose')
const videoSchema = new mongoose.Schema({
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
    videoLink:{
        type:String,
        required:true,
    },
    uploadedBy:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('Video',videoSchema)