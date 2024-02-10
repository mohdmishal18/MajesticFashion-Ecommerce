
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const Order = require('../models/orderModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// load login page.
const loadLogin = async (req,res) =>
{
    try
    {
        res.render('adminLogin');
    }
    catch(error)
    {
        console.log((error));
    }
}


///Verigy Login 
const verifyLogin = async (req,res) =>
{
    try
    {
       const {email,password} = req.body;
       console.log(email);

       const admin = await User.findOne({email : email});
       if(admin)
       {
            if(admin.is_admin != false)
            {
                const passwordMatch = await bcrypt.compare(password, admin.password);
                if(passwordMatch)
                {
                    req.session.admin =
                    {
                        _id : admin._id,
                        email : admin.email,
                        name : admin.name
                    }
                    console.log(admin.name);

                    res.redirect('/admin/home');
                }
                else
                {
                    req.flash('error',"incorrect password");
                    res.redirect('/admin/');
                }
            }
            else
            {
                req.flash('error','you are not admin');
                res.redirect('/admin/')
            }
       }
       else
       {
        req.flash('error',"user not registered")
        res.redirect('/admin/');
       }
    }
    catch(error)
    {
        console.log(error.message);
    }
}

// load admin panel/dashboard
const loadDashboard = async (req,res) =>
{
    try
    {
        //Total numver of Products.
        const products = await Product.aggregate([
            {
                $group : 
                {
                    _id : null,
                    total : {$sum : 1}
                }
            }
        ])

        const totalProducts = products[0].total || 0;

        const categoryCount = await Category.find({}).count()

        //number of orders.
        const orderCount = await Order.aggregate([
            {
                $group : 
                {
                    _id : null,
                    count : {$sum : 1}
                }
            },
        ])
        const orders = orderCount[0].count || 0;

        //total customers
        const users = await User.aggregate([
            {
                $match : 
                {
                    verified : true
                }
            },
            {
                $group :
                {
                    _id : null,
                    total : 
                    {
                        $sum : 1
                    }
                }
            }
        ])
        const totalUsers = users[0].total || 0;

        // Count of COD and RazorPay
        const paymentCount = await Order.aggregate([
            {
                $group : 
                {
                    _id : null,
                    codCount : 
                    {
                        $sum : 
                        {
                            $cond : 
                            [
                                {
                                    $eq : 
                                    [
                                        "$paymentMethod","COD"
                                    ]
                                },1,0
                            ]
                        }
                    },

                    razorCount : 
                    {
                        $sum : 
                        {
                            $cond : 
                            [
                                {
                                    $eq : 
                                    [
                                        "$paymentMethod","Razorpay"
                                    ]
                                },1,0
                            ]
                        }
                    }
                }
            }
        ])
        const codCount = paymentCount[0].codCount || 0;
        const razorPayCount = paymentCount[0].razorCount || 0;
        const walletPayment = paymentCount[0].walletCount || 0;

        // to find the total revenue (only taking the delivered orders).
        const totalPrice = await Order.aggregate([

            {
                $unwind : "$products"
            },
            {
                $match : 
                {
                    "products.status" : "delivered"
                },
            },
            {
                $group : 
                {
                    _id : null,
                    totalMoney : 
                    {
                        $sum : "$products.totalPrice"
                    }
                }
            }

        ])
        const totalRevenue = totalPrice[0].totalMoney || 0;

        let allOrders = await Order.find({});

        let delivered = 0;
        let placed = 0;
        let cancelled  = 0;
        let returns = 0;
        
        allOrders.map((order) =>
        {
            order.products.map((product) =>
            {
                if(product.status === 'delivered')
                {
                    delivered++;
                }
                else if(product.status === 'placed')
                {
                    placed++;
                }
                else if(product.status === 'canceled')
                {
                    cancelled++;
                }
                else if(product.status === 'returned')
                {
                    returns++;
                }
            })
        })

        // For pagination.

        let page = 1;
        if(req.query.page)
        {
            page = req.query.page
        }
        
        const limit = 5;
        const previous = page > 1 ? page - 1 : 1;
        let next = page + 1;

        const count = await Order.find({}).count()

        const totalPages = Math.ceil(count / limit)
        if(next > totalPages)
        {
            next = totalPages
        }

        //details for the table in the dashboard.
        const latestOrders = await Order.aggregate([
            {$sort : { date : -1}},
            {
                $lookup : 
                {
                    from : "users",
                    localField : "user",
                    foreignField : "_id",
                    as : "user"
                }
            },
            {
                $unwind : "$user"
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ])
        //const latestOrders = await Order.find({}).sort({ date: -1 }).populate('user').limit(limit).skip((page - 1) * limit).exec()

        res.render('adminDashboard',
        {
            orders,
            delivered,
            placed,
            cancelled,
            returns,
            totalRevenue,
            totalProducts,
            totalUsers,
            codCount,
            razorPayCount,
            walletPayment,
            categoryCount,
            latestOrders,
            next,
            previous,
            totalPages
        });
    }
    catch(error)
    {
        console.log(error);
    }
}

// Display users list
const loadUserManagement = async (req,res) =>
{
    try
    { 
        console.log("start");
        
       let search = '';
       if(req.query.search)
       {
        search = req.query.search;
        console.log(search);

       }

       //pagination
       let page = 1;
       if(req.query.page)
       {
        page = req.query.page;
        console.log(page);
       }

       let limit = 4;
       let previous = (page > 1) ? page - 1 : 1;
       let next = page + 1;

       const userData = await User.find({
        is_admin : 0,
        $or : [{
            name: 
            {
                $regex : '.*' + search + '.*'
            }
        }]
       })
       .limit(limit)
       .skip((page - 1) * limit)
       .exec()

       const count = await User.find({
        is_admin : 0
       }).countDocuments();

       totalpages = Math.ceil(count/limit);
       if(next > totalpages)
       {
        next = totalpages;
        console.log(next);
       }
       
       res.render('userList',{
        users : userData,
        totalpages : totalpages,
        currentPage : page,
        previous : previous,
        next : next
       });
    }
    catch(error)
    {
        console.log(error.message);
    }
}

// To block user.

const blockUser = async (req,res) =>
{
    try
    {
        const user_id = req.body.userId;
        console.log(user_id);
        const userData = await User.findOne({_id : user_id})

        if(userData.is_blocked)
        {
            await User.findByIdAndUpdate(
                {_id : user_id},
                {$set : 
                {
                    is_blocked : false
                }}
            )
        }
        else
        {
            await User.findByIdAndUpdate(
                {_id : user_id},
                {$set : 
                {
                    is_blocked : true
                }}
            )
        }

        res.json({block : true})
    }
    catch(error)
    {
        console.log(error.message);
    }
}

const loadOrder = async (req,res) =>
{
    try
    {
        const order = await Order
        .find()
        .populate('user')
        .populate('products.productId')
        .sort({date : -1});

        console.log(order);

        res.render('orders',{order : order});
    }
    catch(error)
    {
        console.log(error);
    }
}

const singleOrderDetails = async (req,res) =>
{
    try
    {
        const {orderId} = req.query;
        console.log("orderId is : ", orderId);
        const orderdetails = await Order.findById({_id : orderId}).populate('user').populate('products.productId');
        console.log("Order detials are  :", orderdetails);
        res.render('orderDetails',{myOrder : orderdetails});  
         
    }
    catch(error)
    {
        console.log(error);
    }
}

const changeOrderStatus = async (req,res) =>
{
    console.log("hello");
    try
    {
        const { orderId, productId , index, status, userId } = req.body;

        console.log("data's are : " , req.body);

        return Order.updateOne({_id : orderId, user : userId, "products.productId": productId},
        {
            $set : 
            {
                [`products.${index}.status`] : status,
            }
        })
        .then(() =>
        {
            res.json({success : true, status : status});
        })
        .catch((error) =>
        {
            console.log(error);
        })
    }
    catch(error)
    {
        console.log(error);
    }
}

const salesReport = async(req,res) =>
{
    try
    {
        res.render('salesReport');
    }
    catch(error)
    {
        console.log(error);
    }
}

const orderReport = async (req,res) =>
{
    try
    {
        const start = req.body. startDate;
        const end = req.body.endDate;

        const orders = await Order.find({date : {$gte : start, $lte : end}}).populate('user').populate('products.productId');

        if(orders.length > 0)
        {
            res.render('orderReport',{orders : orders});
        }
        else
        {
            req.flash('error','No datas found between the given date');
            res.redirect('/admin/sales-report');
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.destroy();

        res.redirect('/admin')

    } catch (err) {
        console.log(err.message)
    }
}


module.exports = 
{
    loadLogin,
    loadDashboard,
    loadUserManagement,
    verifyLogin,
    blockUser,
    adminLogout,
    loadOrder,
    singleOrderDetails,
    changeOrderStatus,
    salesReport,
    orderReport
}