const mongoose = require('mongoose')
const videoSchema = new mongoose.Schema({
    number:{
        type:Number,
        required:true,
    },
    title:{
        type: String,
        required:true
    },
    description:{
        type:String,
        required:false
    },
    uploadedBy:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    videoLink:{
        type:String,
        required:true,
    },
    thumbnailLink:{
        type:String,
        required:true,
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('Video',videoSchema)