const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DB = process.env.DATABASE;

module.exports = {
    connectDB : ()=>
    {
        mongoose.connect(DB)
        .then(() =>
        {
            console.log("Database connected");
        })
        .catch((err) =>
        {
            console.log(err);
        })
    }
}

