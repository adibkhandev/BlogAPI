require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require('mongoose')
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
ffmpeg.setFfmpegPath(ffmpegStatic);
//JSON
const bodyParser = require('body-parser')
app.use(bodyParser.json())
//database
mongoose.connect(process.env.URL)
const db = mongoose.connection
db.once('open',()=>console.log('time for mern'))
db.on('error',()=>console.log('choda'))

//Routing
const demoRoutes = require('./routes/demo');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const videoRoutes = require('./routes/videoRoute');
const exp = require('constants');
app.use('/demo',demoRoutes);
app.use('/auth',authRoutes)
app.use('/user',accountRoutes)
app.use('/video',videoRoutes)

//API
app.listen(3000,()=>console.log('hi'))
app.use('/images',express.static(__dirname + '/routes/uploads/images'))
// app.use('/videos',express.static(__dirname + '/routes/uploads/videos'))
app.get('/videos/:filename',(req,res)=>{
    const filename = req.params.filename
    try {
               
        const inputVid = './routes/uploads/videos/' + filename.replace('mp4','avi')
        const outputVid = './routes/uploads/videos/' + filename
        ffmpeg(inputVid)
           .format('mp4')
           .outputOptions(['-crf 16'])
           .on('error', (err) => console.error('Error:', err))
           .on('end', () =>{
               console.log('Conversion done!')
               res.sendFile(outputVid, { root: __dirname })
               res.on('finish', () => {
                // Delete the file after sending
                fs.unlink(outputVid, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                  } else {
                    console.log('File was deleted');
                  }
                });
              });
            })
           .save(outputVid, { end: true })
   } catch{
        console.log('error in ffmpeg')
   }
})