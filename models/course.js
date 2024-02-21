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
    videoNumber:{
        type:Number,
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
    subscribedCount:{
        type:Number,
        default:0,
    },
    skills:{
        type: Array,
        required:true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('Course',courseSchema)