const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const objectId = mongoose.Schema.Types.ObjectId;

const productModel = mongoose.Schema(
    {
        name : 
        {
            type : String,
            // required : true
        },

        description : 
        {
            type : String,
            required : true
        },

        categoriesid : 
        {
            type : objectId,
            ref : 'categories',
            // required : true,
        },

        is_Listed : 
        {
            type : Boolean,
            required : true
        },

        variant : 
        {
            type : Array,
            required : true,
            
            fields : 
            [
                {
                    name : 'price',
                    type : Number,
                    // required : true
                },

                {
                    name : 'previous_price',
                    type : Number,
                    // required : true
                },

                {
                    name : 'sizes',
                    type : [String],
                    // required : true
                },

                {
                    name: 'color',
                    type: String,
                    // required: true
                },

                {
                    name : 'images',
                    type : Array,
                    validate : [arrayLimit,'should be four images']
                },

                {
                    name : 'quantity',
                    type : Number,
                    default : 1
                },

                {
                    name : 'created_at',
                    type : Date,
                    default : Date.now
                }
            ]
        }

    }
)

function arrayLimit(val)
{
    return val.length <= 4;
}

module.exports = mongoose.model('Product',productModel);