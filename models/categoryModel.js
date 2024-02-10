const mongoose = require('mongoose');

const categoriesSchema = mongoose.Schema(
    {
        name : 
        {
            type : String,
            required : true
        },

        description : 
        {
            type : String
        },

        is_listed : 
        {
            type : Boolean,
            default: true
        }
    }
)

module.exports = mongoose.model('categories',categoriesSchema);