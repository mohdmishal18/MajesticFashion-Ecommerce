const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user : 
        {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
        },

        deliveryDetails : 
        {
            type : Object,
            required : true,
        },

        products : 
        [
            {
                productId : 
                {
                    type : mongoose.Schema.Types.ObjectId,
                    required : true,
                    ref : 'Product'
                },

                product:
                {
                    type: String,
                },

                price : 
                {
                    type : Number,
                    required : true
                },

                quantity : 
                {
                    type : Number,
                    default : 1,
                },

                totalPrice : 
                {
                    type : Number,
                    required : true
                },

                size : 
                {
                    type : String
                },

                status : 
                {
                    type : String,
                    enum : ['placed','out for delivery','shipped','delivered','canceled','returned'],
                    default : 'placed',
                },

                returnReason:
                {
                    type: String,
                },
            
                returnRequest:
                {
                    type: String,
                    enum: ["requested", "accepted", "denied"],
                },
                
                coupon : 
                {
                    type : Number,
                    default : 0
                }
            }
        ],

        cancelReason : 
        {
            type : String
        },

        returnReason : 
        {
            type : String
        },
        
        totalAmount : 
        {
            type : Number,
            required : true
        },

        date : 
        {
            type : Date,
            required : true
        },

        expected_delivery : 
        {
            type : String,
            required : true
        },

        status : 
        {
            type : String,
            required : true
        },

        paymentMethod : 
        {
            type : String,
            required : true
        },

        paymentId : 
        {
            type : String
        }
    }
)


module.exports = mongoose.model('Order',orderSchema);

