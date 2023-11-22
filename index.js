require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require('mongoose')

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
const exp = require('constants');
app.use('/demo',demoRoutes)

//API
app.listen(3000,()=>console.log('hi'))
