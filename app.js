const express = require('express');
const app =express();
app.use(express.json());   //----->>>  it's middlewares for parsing json.
const mongoose = require('mongoose');
const dotenv = require('dotenv');  //  importing the dotenv package in node js.
dotenv.config(); //  loads the .env file 
const userRoutes = require('./routes/userRoutes');





//======== Routes======///

app.use('/api',userRoutes);


 //-------Mongodb Connection---------//
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB is connected successfully.'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server running on port' ${PORT}`)});


