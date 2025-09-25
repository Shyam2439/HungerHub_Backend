const express = require("express");
const dotEnv = require("dotenv");
const mongoose = require("mongoose");
const vendorRoutes = require('./routes/vendorRoutes');
const productRoutes = require('./routes/productRoutes');
const bodyparser = require('body-parser');
const firmRoutes = require('./routes/firmRoutes');
const path = require('path');
const cors = require('cors');


const app = express()


const PORT = process.env.PORT || 4000;



dotEnv.config();
app.use(cors());


mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log("MongoDb connected"))
.catch((error)=>console.log(error))

    app.use(bodyparser.json());
    app.use('/vendor',vendorRoutes);
    app.use('/firm',firmRoutes);
    app.use('/product',productRoutes);
    app.use('/uploads',express.static('uploads'))
app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
})

app.use('/',(req,res)=>{
    res.send("<h1> Welcome to HungerHub");
})
