const mongoose = require('mongoose')
const topicSchema = new mongoose.Schema({
    number:{
        type:Number,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    videos:[{
        type:mongoose.Schema.ObjectId,
        ref:'Video',
        required:true,
    }],
    
})

module.exports = mongoose.model('Topic',topicSchema)