const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema(
    {
        user : 
        {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
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

                index : 
                {
                    type : String,
                    required : true
                },

            }
        ]
    }
)

const Wishlist = mongoose.model('Wishlist',wishlistSchema);

module.exports = Wishlist;