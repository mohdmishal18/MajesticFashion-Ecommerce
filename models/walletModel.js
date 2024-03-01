const mongoose = require('mongoose');

const walletSchema = mongoose.Schema(
    {
        user : 
        {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
        },

        amount : 
        {
            type : Number,
            default : 0,
        },

        walltetHistory : 
        {
            type : Array
        }
    }
)

const Wallet = mongoose.model('Wallet',walletSchema);

module.exports = Wallet;