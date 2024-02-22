const Coupon = require('../models/couponModal');
const User = require('../models/userModel');


const loadCoupon = async (req,res) =>
{
    try
    {
        res.render('coupon');
    }
    catch(error)
    {
        console.log(error);
    }
}

const addCoupon = async (req,res) =>
{
    try
    {

    }
    catch(error)
    {
        console.log(error);
    }
}

const editCoupon = async(req,res) =>
{
    try
    {

    }
    catch(error)
    {
        console.log(error);
    }
}

const deleteCoupon = async(req,res) =>
{
    try 
    {

    }
    catch(error)
    {
        console.log(error);
    }
}

module.exports = 
{
    loadCoupon,

}
