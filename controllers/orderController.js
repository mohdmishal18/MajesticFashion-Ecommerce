
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel')
const Product = require('../models/productModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');



var instance = new Razorpay({
    key_id: 'rzp_test_EVAgzuOOSxsbao',
    key_secret: 'GbPWn8lPZ5PaFJZ3wPis9KW4',
  });

  
const placeOrder = async (req, res) => 
{
    try 
    {
        console.log(req.body);
        const userId = req.session.user?._id;
        const { index, payment_method, subtotal } = req.body
        
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

        const order = await Order.find({user : userid}).populate('user');
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

            console.log(order);

            res.render('orderDetails',{myOrder : order})
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
      const { orderId, productId ,index} = req.body;
      console.log("---", orderId, productId,index);
      const userId = req.session.user?._id;
      console.log("the data's are : ",req.body);

      if(userId)
      {
        return Order.findByIdAndUpdate({ _id : orderId, "products.productId" : productId},
        {
            $set : 
            {
                [`products.${index}.status`] : 'canceled',
            }
        })
        .then((data) =>
        {
            console.log(data, "this is the data");

            const quantity = data.products[index].quantity;
            // incrementing the product's quantity.
            return Product.findByIdAndUpdate({_id : productId},
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

module.exports =
{
    placeOrder,
    successPage,
    loadMyOrder,
    loadOrderDetails,
    loadSingleOrderDetails,
    cancelOrder,
    verifyPayment,
    
}
