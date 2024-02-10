const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name:
        {
            type : String,
            reqruired : true
        },

        email:
        {
            type : String,
            required : true
        },

        mobile:
        {
            type : String,
            required : true
        },

        password:
        {
            type : String,
            required : true
        },

        address : 
        [
            {
                name : 
                {
                    type : String
                },

                addressline : 
                {
                    type : String
                },

                city : 
                {
                    type : String
                },

                state : 
                {
                    type : String
                },

                pincode : 
                {
                    type : Number
                },

                phone : 
                {
                    type : Number
                }
            }
        ],

        is_admin:
        {
            type : Boolean,
            required : true
        },
        
        is_blocked:
        {
            type : Boolean
        },

        verified:
        {
            type : Boolean
        },

        created_at:
        {
            type : Date,
            default : Date.now
        }
    }
);

module.exports = mongoose.model('User',userSchema);