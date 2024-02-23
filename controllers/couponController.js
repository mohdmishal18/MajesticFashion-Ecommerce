const Coupon = require('../models/couponModal');
const User = require('../models/userModel');


const loadCoupon = async (req,res) =>
{
    try
    {
        const coupon = await Coupon.find({});
        res.render('couponManagement',{coupon : coupon});
    }
    catch(error)
    {
        console.log(error);
    }
}

const addCoupon = async (req,res) =>
{
    const {name,activate,expiry,limit,discount} = req.body;

    const firstname = name.split("").slice(0, 4).join("");
    const randomString = Math.random().toString(36).substring(2, 7);
    const randomNumber = `${Math.floor(1000 + Math.random() * 9000)}`;

    try
    {
        const coupon = new Coupon({
            name : name,
            code : `${firstname}${randomString}${randomNumber}`,
            activatedDate : activate,
            expiryDate : expiry,
            discount : discount,
            limit : limit
        })

        await coupon.save();

        res.redirect('/admin/coupon');
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
        console.log("in edit coupon");
        const {id, name , activated, expiry , discount ,limit} = req.body;

        console.log("the datas are ", req.body);

        await Coupon.updateOne({_id : id},
            {
                $set : 
                {
                    name : name,
                    activatedDate : activated,
                    expiryDate : expiry,
                    discount : discount,
                    limit : limit
                }
            })
            
            res.json({updated : true})
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
    addCoupon,
    editCoupon,

}
