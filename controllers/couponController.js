const Coupon = require('../models/couponModal');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');


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
    
    try
    {
        const {name,activate,expiry,limit,discount,minAmountSpend} = req.body;

        const firstname = name.split("").slice(0, 4).join("");
        const randomString = Math.random().toString(36).substring(2, 7);
        const randomNumber = `${Math.floor(1000 + Math.random() * 9000)}`;


        const coupon = new Coupon({
            name : name,
            code : `${firstname}${randomString}${randomNumber}`,
            activatedDate : activate,
            expiryDate : expiry,
            discount : discount,
            minAmountSpend : minAmountSpend,
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
        const {id, name , activated, expiry , discount ,limit,minimum} = req.body;

        console.log("the datas are ", req.body);

        await Coupon.updateOne({_id : id},
            {
                $set : 
                {
                    name : name,
                    activatedDate : activated,
                    expiryDate : expiry,
                    discount : discount,
                    minAmountSpend : minimum,
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
       const {id} = req.body

       await Coupon.deleteOne({_id : id})
       res.json({deleted : true});
    }
    catch(error)
    {
        console.log(error);
    }
}

const couponCheck = async (req,res) =>
{
    try
    {
        const {couponCode,total} = req.body;
        console.log("this is the coupon code", couponCode);

        const userId = req.session.user?._id;
        const coupon = await Coupon.findOne({code : couponCode});
        if(coupon)
        {
            const alreadyUsed = coupon.usedUsers.find((user) => user.userId === userId)

            const count = coupon.limit < coupon.usedUsers;
            const limitOfCoupon = coupon.limit === -1 ? false : count;

            let dateStrings = [coupon.activatedDate,coupon.expiryDate];

            let isoDateStrings = dateStrings.map(dateString => {
                let date = new Date(dateString);
                return isNaN(date) ? null : date.toISOString();
            });
            
            let convertedDates = isoDateStrings.map(
                (dateString) => new Date(dateString)
              );
            
            console.log(convertedDates);
            
            const today = new Date();
            console.log(today);
            const active = new Date(coupon.activatedDate);
            console.log(active, "active");
            const expire = new Date(coupon.expiryDate);
            console.log(expire, "hello");

            if(alreadyUsed)
            {
                res.json({ used: true, message: "This coupon is already used" });
            }
            else if(limitOfCoupon)
            {
                res.json({ limit: true, message: "Coupon is expried" });
            }
            else if(!(today >= convertedDates[0] && today <= convertedDates[1]))
            {
                res.json({ expired: true, message: "Coupon expired" });
            }
            else
            {
                console.log("reached ");

                const cart = await Cart.findOne({user : userId});

                let discount = 0;
                let cartAmount = 0;
                console.log("coupon discount", coupon.discount);

                if(coupon.percentage)
                {

                }
                else if(coupon.discount)
                {
                    const div = coupon.discount / cart.products.length;
                    discount = Math.round(div);
                    console.log(discount + "discount", "div: " + div);
                }
                    
                    cartAmount = cart.products.reduce((acc,curr) =>
                    {
                        console.log(coupon.minAmountSpend);
                        // console.log(total);
                        if(curr.totalPrice >= discount)
                        {
                            return (acc += curr.totalPrice - discount);
                        }
                        else
                        {
                            return (acc += curr.totalPrice);
                        }
                    },0);

                    if(total <= coupon.minAmountSpend)
                    {
                        res.json({min : true, message : `Minimum ${coupon.minAmountSpend} spend`});
                    }
                    else
                    {
                        res.json({success : true, subtotal : cartAmount});
                    }
            }
      
        }
        else
        {
            res.json({ notAvailable: true, message: "No coupon  available" });
        }
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
    deleteCoupon,
    couponCheck
}
