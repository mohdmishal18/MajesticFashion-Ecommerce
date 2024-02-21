const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModal');
const User = require('../models/userModel');

const addToWishlist = async (req, res) =>
{
    try
    {
        const {productId , index} = req.body;
        const userId = req.session.user?._id;

        console.log("the datas for wishlist are  : ",productId, index);

        const wishlist = await Wishlist.findOne({user : userId})

        if(wishlist)
        {
            const exists = await Wishlist.findOne({user : userId, 'products.productId' : productId, index : index});
            if(! exists)
            {
                const data = 
                {
                    productId : productId,
                    index : index
                }
                await wishlist.updateOne(
                    {user : userId},
                    {
                        $push : 
                        {
                            products : data
                        }
                    }
                )
            }
            // else
            // {
            //     res.json({already : true});
            // }
        }
        else
        {
            const data = 
            {
                productId : productId,
                index : index
            }

            const  newWishlist = new Wishlist({
                user : userId,
                products : data,
            })
            await newWishlist.save();
        }
        res.json({wishlist : true})
    }
    catch(error)
    {
        console.log(error);
    }
}


module.exports = 
{
    addToWishlist
}