const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true
    },
    userType:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    skills:{
         type: Array,
         default: undefined,
    },
    pfp:{
        type:String,
        required:false
    }
})
module.exports = mongoose.model('User',userSchema)