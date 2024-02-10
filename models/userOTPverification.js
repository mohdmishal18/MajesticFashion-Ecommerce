const mongoose = require('mongoose');

const userOtpVerificationSchema = mongoose.Schema(
    {
        email : 
        {
            type : String,
        },

        otp : 
        {
            type : String,
        },

        createAt : 
        {
            type : Date,

            default : Date.now,
        },
    }
);


userOtpVerificationSchema.index({createAt : 1}, {expireAfterSeconds : 60});

const UserOtpVerification = mongoose.model('userOtpVerification',userOtpVerificationSchema);

module.exports = UserOtpVerification;