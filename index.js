require('dotenv').config()
const cors = require('cors');
const express = require("express");
const app = express();
const mongoose = require('mongoose')
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const rangeParser = require('range-parser')
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
app.use(cors())

//API
app.listen(3000,()=>console.log('hi'))
app.use('/images',express.static(__dirname + '/routes/uploads/images'))
// app.use('/videos',express.static(__dirname + '/routes/uploads/videos'))
app.get('/videos/:filename',(req,res,next)=>{
    console.log('gets',req.params.filename)
    const filename = req.params.filename
    try {
      const inputVid = './routes/uploads/videos/' + filename.replace('mp4','avi')
      const outputVid = './routes/uploads/videos/' + filename
      ffmpeg(inputVid)
      .format('mp4')
      .outputOptions(['-crf 16'])
      .on('error', (err) => console.error('Error:', err,'ffmprg'))
      .on('end', () =>{
              const range = req.headers.range;
              if(range) console.log(range)
              const videoSize = fs.statSync(outputVid).size;
              const parsedRange = rangeParser(videoSize, range);
              const start = parsedRange[0].start;
              const end = parsedRange[0].end;
              console.log('end->' , end)
              const contentLength = end - start + 1; //end - start
              const headers = {
                  "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                  "Accept-Ranges": "bytes",
                  "Content-Length": contentLength,
                  "Content-Type": "video/mp4",
              };
              res.writeHead(206, headers);
              const videoStream = fs.createReadStream(outputVid, { start, end });
              videoStream.pipe(res);
              
              //  res.sendFile(outputVid, { root: __dirname },(err)=>{
              //      if (err) res.status(500)
              //      fs.unlink(outputVid, (unlinkErr) => {
              //        if (unlinkErr) {
              //          console.error('Error deleting file:', unlinkErr);
              //        } else {
              //          console.log('File was deleted');
              //        }

              //  })
              // })
            })
      .save(outputVid, { end: true })
   } catch{
        console.log('error in ffmpeg')
   }
},(req,res)=>{
   console.log('next')
})