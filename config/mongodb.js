const mongoose = require('mongoose');

module.exports = {
    connectDB : ()=>
    {
        mongoose.connect('mongodb://127.0.0.1:27017/Majestic')
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

