const mongoose = require('mongoose');

const couponSchema = mongoose.Schema
({
    name : 
    {
        type : String,
        required : true
    },

    code : 
    {
        type : String,
        required : true
    },
    
    activatedDate : 
    {
        type : String,
        required : true
    },

    expiryDate : 
    {
        type : String,
        required : true
    },

    discount : 
    {
        type : Number
    },

    minAmountSpend : 
    {
        type : Number
    },

    usedUsers : 
    {
        type : Array,
        ref : 'User',
        default : []
    },

    limit : 
    {
        type : Number,
        default : -1,
    },

    isActive : 
    {
        type : Boolean,
        default : false
    }

})

module.exports = mongoose.model('Coupon',couponSchema);