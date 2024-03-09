
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel')
const Product = require('../models/productModel');
const Coupon = require('../models/couponModal');
const Wallet = require('../models/walletModel');

const dotenv = require('dotenv');
dotenv.config();

const Razorpay = require('razorpay');
const crypto = require('crypto');

const key_id = process.env.KEY_ID;
const key_secret = process.env.KEY_SECRET;

var instance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret
  });

  
const placeOrder = async (req, res) => 
{
    try 
    {
        console.log(req.body);
        const userId = req.session.user?._id;
        const { index, payment_method, subtotal ,isCoupon} = req.body
        
        const cart = await Cart.findOne({ user: userId }).populate( 'products.productId' );
        const products = cart.products;
        const userAddress = await User.findOne({ _id: userId });
        const status = payment_method === 'COD' ? 'placed' : 'pending';
       
        const selectedAddress = userAddress?.address[index];
        console.log("Selected address : ",selectedAddress);
        const date = new Date();
        const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
        const deliveryDate = delivery.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }).replace(/\//g, '-');
    
        const order = new Order({
            user: userId,
            deliveryDetails: selectedAddress,
            products: products,
            totalAmount: subtotal,
            date: date,
            expected_delivery: deliveryDate,
            status: status,
            paymentMethod: payment_method,
        })
       
          const order_details =  await order.save()
          const oderId = order_details._id;
        const coupon = await Coupon.findOne({ code: isCoupon });
        if (coupon) {
            if (coupon.limit >= coupon.usedUsers.length) {
                const cart = await Cart.findOne({ user: userId });

                let discount = 0;
                console.log(coupon.discount, "discount amount");

                if (coupon.percentage) {
                } else if (coupon.discount) {
                console.log(coupon.discount, cart.products.length);

                const div = coupon.discount / cart.products.length;
                discount = Math.round(div);
                console.log(discount + "discount", "div: " + div);
                }

                cartAmount = cart.products.forEach(async (el, i) => {
                  console.log(el);

                    await Order.findByIdAndUpdate(
                        { _id: oderId },
                        {
                        $set: {
                            [`products.${i}.coupon`]:
                            el.totalPrice >= discount
                                ? el.totalPrice - discount
                                : el.totalPrice,
                        },
                        }
                    );
                });

                coupon.usedUsers.push({userId : userId});
                await coupon.save();

            } else {
                res.json({ fail: true, massage: "Coupon limit exceeds" });
            }
        }

        // Cash on delivery.
        if(order_details.status === 'placed') 
        {
            await Cart.deleteOne({user: userId});

            // decrementing the quantity
            for(let i = 0; i < cart.products.length; i++) 
            {
                    const productId = products[i].productId;
                    const index = products[i].product;
                    const productQuantity = products[i].quantity;
                    console.log(typeof productQuantity, productQuantity)
                    await Product.updateOne({_id: productId}, {
                        $inc: {
                            [`variant.${index}.quantity`]: - productQuantity
                        }
                    })
            }

                res.json({success: true});
        }
        //Wallet
        else if(payment_method ===  "Wallet")
        {
            console.log("wallet payment entered");

            const wallet = await Wallet.findOne({user : userId});

            console.log("the wallet is : ",wallet);
            
            if(subtotal <= wallet.amount)
            {
                console.log('there is money in wallet');
                const data = 
                {
                    orderId : oderId,
                    amount : subtotal,
                    date : new Date(),
                    type : "debit",
                    reason : "purchase"
                }

                await Wallet.findOneAndUpdate(
                    { user: userId },
                    {
                        $inc: { amount: -subtotal },
                        $push: { walletHistory: data }
                    }
                );
                
                await Order.findOneAndUpdate(
                    {_id : oderId},
                    {$set : {status : "placed"}}
                )

                // decrementing the quantity
                for(let i = 0; i < cart.products.length; i++) 
                {
                    const productId = products[i].productId;
                    const index = products[i].product;
                    const productQuantity = products[i].quantity;
                    console.log(typeof productQuantity, productQuantity)
                        await Product.updateOne({_id: productId}, {
                            $inc: {
                                [`variant.${index}.quantity`]: - productQuantity
                            }
                        })
                }

                await Cart.deleteOne({user : userId})
                console.log("wallet success");
                res.json({wallet : true});
            }
            else
            {
                res.json({money : true})
            }
        }
        //Razor Pay.
        else if(order_details.status === 'pending')
        {
            console.log("Entered to pending ..................");
            const options =
            {
                amount : subtotal * 100, // i multiplied by hundred because the the default unit of the amount is "paise".
                currency : "INR",
                receipt : "" + order_details._id,
            }

            instance.orders.create(options, function( err , order )
            {
                if(err)
                {
                    console.log(err);
                }
                console.log("this is the order : ",order);
                res.json({ order });
            });
        }
    } 
    catch (error) 
    {
        console.log(error)
    }
}

const verifyPayment = async (req,res) =>
{
    try
    {
        const { payment, order} = req.body;

        const userId = req.session.user?._id;
        console.log(req.body);

        const hmac = crypto.createHmac('sha256', 'GbPWn8lPZ5PaFJZ3wPis9KW4');
        hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
        const hmacValue = hmac.digest("hex");
        console.log(hmacValue);

        if(hmacValue === payment.razorpay_signature)
        {
            const cart = await Cart.findOne({user : userId}).populate('products.productId');
            
            const products = cart.products;

            console.log("payment verification success full",products[0].productId._id);
            
            // Decreasing the quaintity of products
            for(let i = 0; i < cart.products.length; i++)
            {
                const productId = products[i].productId._id;

                const index = products[i].product;
                const productQuantity = products[i].quantity;

                console.log(typeof productQuantity, productQuantity);

                await Product.findOneAndUpdate({_id : productId},
                    {
                        $inc : 
                        {
                            [`variant.${index}.quantity`] : - productQuantity
                        }
                    })
            }
            // updating order status.
            await Order.findOneAndUpdate({_id : order.receipt},
                {
                    $set : 
                    {
                        status : 'placed',
                        paymentId : payment.razorpay_payment_id
                    }
                });

                //deleting the user's cart after placing the order.
                await Cart.deleteOne({user : userId});
                // sending success response.
                res.json({payment_successful : true});
        }

    }
    catch(error)
    {
        console.log(error);
    }
}

//for failed payments.
const retryPayment = async (req,res) =>
{
    try 
    {
        const {orderId} = req.body;

        const order = await Order.findOne({_id : orderId}).populate('user');

        const options = 
        {
            amount : order.totalAmount * 100, // i multiplied by hundred because the the default unit of the amount is "paise".
            currency : "INR",
            receipt : "" + order._id,
        }

            instance.orders.create(options, function( err , order )
            {
                if(err)
                {
                    console.log(err);
                }
                console.log("this is the order : ",order);
                 res.json({ order });
            });
    }
    catch(error)
    {
        res.status(400).send('your countine payment request is failed')
        console.log(error);
    }
}

const continueRetryPayment = async (req,res) =>
{
    try
    {
        const userId = req.session.user._id;
        const {payment, order} = req.body;

        const hmac = crypto.createHmac('sha256', 'GbPWn8lPZ5PaFJZ3wPis9KW4');
        hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
        const hmacValue = hmac.digest("hex");
        console.log(hmacValue);

        if(hmacValue === payment.razorpay_signature)
        {
            const cart = await Cart.findOne({user : userId}).populate('products.productId');
            
            const products = cart.products;

            console.log("payment verification success full",products[0].productId._id);
            
            // Decreasing the quaintity of products
            for(let i = 0; i < cart.products.length; i++)
            {
                const productId = products[i].productId._id;

                const index = products[i].product;
                const productQuantity = products[i].quantity;

                console.log(typeof productQuantity, productQuantity);

                await Product.findOneAndUpdate({_id : productId},
                    {
                        $inc : 
                        {
                            [`variant.${index}.quantity`] : - productQuantity
                        }
                    })
            }
            // updating order status.
            await Order.findOneAndUpdate({_id : order.receipt},
                {
                    $set : 
                    {
                        status : 'placed',
                        paymentId : payment.razorpay_payment_id
                    }
                });

                //deleting the user's cart after placing the order.
                await Cart.deleteOne({user : userId});
                // sending success response.
                res.json({payment_successful : true});
        }
        else
        {
            const changedOrder = await Order.findByIdAndUpdate(
                { _id: order.receipt },
                { $set: { status: " pending" } } 
            );
        
            console.log("changedOrder",changedOrder);
            res.status(400).json({ error: "Invalid payment signature", PaymentSuccess: false });
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const successPage = async (req,res) =>
{
    try
    {
        res.render('orderSuccess');
    }
    catch(error)
    {
        console.log(error);
    }
}

const loadMyOrder = async (req,res) =>
{
    try
    {
        const userid = req.session.user?._id;
        console.log(typeof userid, userid);

        const order = await Order.find({user : userid}).populate('user').sort({date : -1})
        console.log(order);

        res.render('myOrders',{order : order});
    }
    catch(error)
    {
        console.log(error);
    }
}

const loadOrderDetails = async (req,res) =>
{
    try
    {
        const userId = req.session.user?._id;
        if(userId)
        {
            const {orderId} = req.query;
            const order = await Order.findById({_id : orderId}).populate('user').populate('products.productId');
            let totalAmount = 0;

            order.products.forEach((el) => {
                if (el.status != 'canceled' && el.status != 'returned') {
                    totalAmount += el.totalPrice;
                }
            });

            const invoiceProducts = (order) => {
                return order.products.filter((product) => product.status === 'delivered');
            };

            // Call the function to get the array of delivered products
            const deliveredProducts = invoiceProducts(order);

            const invoiceTotal = deliveredProducts.reduce((acc, product) => acc + product.totalPrice, 0);

            

            console.log(order);

            res.render('orderDetails',{myOrder : order,totalAmount,invoiceProducts,invoiceTotal,orderId})
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const loadSingleOrderDetails = async (req,res) =>
{
    try
    {
        console.log("the data's are : ",req.query);
        const userId = req.session.user?._id;
            const { productId, index, size, orderId } = req.query;
            const details = await Order.findOne({ _id: orderId, user: userId }).populate('user').populate('products.productId');
            const product = details.products.find((pro, i) => i === parseInt(index));
           

        res.render('singleOrderDetails',{ product : product, address: details.deliveryDetails,orderId: orderId, index: index, order: details });
    }
    catch(error)
    {
        console.log(error);
    }
}

const cancelOrder = async (req, res) => {
    try {
      const { orderId, productId ,index, Pindex,Pid} = req.body;
      console.log("---", orderId, productId,index, Pindex);
      const userId = req.session.user?._id;
      console.log("the data's are : ",req.body);

      if(userId)
      {
        return Order.findByIdAndUpdate({ _id : orderId, "products.productId" : productId},
        {
            $set : 
            {
                [`products.${Pindex}.status`] : 'canceled',
            }
        })
        .then(async (data) =>
        {
            console.log(data, "this is the data");
            const quantity = data.products[Pindex].quantity;
            const amount = data.products[Pindex].coupon > 0 ? 
            data.products[Pindex].coupon : data.products[Pindex].totalPrice;

            if(data.paymentMethod === 'Razorpay' || 'Wallet')
            {
                
                const datas = 
                {
                    orderId : orderId,
                    amount : amount,
                    date : new Date(),
                    type : "credit",
                    reason : "cancel product"
                }
                await Wallet.updateOne(
                    {user : userId},
                    {$inc : {amount : amount},$push : {walletHistory : datas}}
                );
            }

            // incrementing the product's quantity.
            return Product.findByIdAndUpdate({_id : Pid},
                {
                    $inc : 
                    {
                        [`variant.${index}.quantity`] : quantity,
                    }
                })
        })
        .then((data) =>
        {
            res.json({ success: true });
        })
      }
      
    } catch (error) {
      res.status(404).send('Cancel order Product request failed');
      console.error(error);
    }
  };

  // Retry payment.

  

  const returnProduct = async (req,res) =>
  {
    try
    {
        const {orderId, productId, index, Pindex, Pid ,returnReason} = req.body;

        const userId = req.session.user?._id

        if(userId)
        {
            return Order.findOneAndUpdate(
                {_id : orderId, "products.productId" : Pid},
                {
                    $set : 
                    {
                        [`products.${index}.returnRequest`]: "requested",
                        [`products.${index}.returnReason`]: returnReason,
                    }
                }
            )
            .then(() =>
            {
                res.json({return : true})
            });
        }
    }
    catch(error)
    {
        console.log(error);
    }
  }

  const invoice = async(req,res) =>
  {
    try
    {
        const {orderId,index} = req.query;
        const order = await Order.findOne({_id : orderId})
        .populate('user')
        .populate('products.productId');

        const invoiceProducts = (order) => {
            return order.products.filter((product) => product.status === 'delivered');
        };

        // Call the function to get the array of delivered products
        const deliveredProducts = invoiceProducts(order);

        const invoiceTotal = deliveredProducts.reduce((acc, product) => acc + product.totalPrice, 0);

        res.render('invoice',{
            orders : order,
            deliveryAddress : order.deliveryDetails,
            invoiceTotal,
            invoiceProducts
        });
    }
    catch(error)
    {
        console.log(error);
    }
  }

module.exports =
{
    placeOrder,
    successPage,
    loadMyOrder,
    loadOrderDetails,
    loadSingleOrderDetails,
    cancelOrder,
    verifyPayment,
    retryPayment,
    continueRetryPayment,
    invoice,
    returnProduct
}
