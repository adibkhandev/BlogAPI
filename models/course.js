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
        required:false,
    },
    topics:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Topic',
        required: true
    }],
    uploadedBy:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    skills:{
        type: Array,
        required:true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('Course',courseSchema)