const mongoose = require('mongoose');


const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModal');
const User = require('../models/userModel');

const loadWishlist = async (req,res) =>
{
    try
    {
        const userId = req.session.user?._id;
        const products = await Wishlist.find({ user: userId }).populate("products.productId");

        const product = products[0]?.products;

        res.render('wishlist',{product : product});
    }
    catch(error)
    {
        console.log(error);
    }
}

const addToWishlist = async (req, res) =>
{
    try
    {
        const {productId , index} = req.body;
        const userId = req.session.user?._id;
        const wishlist = await Wishlist.findOne({user : userId})

        if(wishlist)
        {
            const exists = await Wishlist.findOne({user : userId, 'products.productId' : productId, 'products.index' : index});
            console.log("the duplicate : ", exists);
            if(!exists)
            {
                const data = 
                {
                    productId : productId,
                    index : index
                }
                console.log("The data", data);
                await Wishlist.updateOne(
                    {user : userId},
                    {
                        $push : 
                        {
                            products : data
                        }
                    }
                )

            }
            else
            {
                return res.json({already : true});
            }
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

            if(newWishlist)
            {
              await newWishlist.save();
            }
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
    addToWishlist,
    loadWishlist
}