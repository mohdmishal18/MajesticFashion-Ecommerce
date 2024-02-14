const express = require('express');
const userRoute = express();
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController')
const User = require('../models/userModel')
// const userAuth = require('../middlewares/userAuth');
const session = require("express-session");
const config = require('../config/config');

userRoute.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false
}));

const auth = require('../middlewares/userAuth');

userRoute.use(express.json());

userRoute.use(express.static('public'));
userRoute.use(express.urlencoded({extended:true}));

userRoute.use(async (req, res , next) => {
    const id = req.session.user?._id;
    console.log(id, 'middleware')
    
        const user = await User.findOne({_id: id});

        if(user) {
            if(user.isBlocked) {
                

                fetch('http://localhost:3000/logout', {
                    method: 'POST'
                })
                .catch((err) => {
                    console.log(err)
                })
                
 
             } 
 

        }
            
            next();
})

userRoute.use((req, res, next) => {
    res.locals.user = req.session.user || null; 
    res.locals.logedIn = req.session.user ? true : false;
    next();
}); 


userRoute.set('view engine','ejs');
userRoute.set('views','./views/user');

userRoute
    .get('/',userController.loadHome)

    .get('/login',auth.isLogin,userController.loadLogin)

    .get('/signup',auth.isLogOut,userController.loadSignup)
    .post('/signup',userController.insertUser)

    .get('/otp',auth.isLogOut,userController.loadotp)
    .post('/otp',userController.verifyOtp)
    .post('/resend',userController.resentOTP)

    .post('/login',userController.verifyLogin)

    .get('/shop',userController.loadShop)

    .get('/singleproduct',userController.loadSingleProduct)

    .get('/logout',userController.userLogout)

    .get('/profile',userController.loadUserProfile)

    .get('/address',userController.loadAddressManagement)

    .post('/edit-profile',userController.editProfile)

    .post('/add-address',userController.addAddress)

    .delete('/deleteaddress',userController.deleteAddress)

    

    .get('/cart',cartController.loadCart)

    .post('/add-cart',cartController.addToCart)

    .post('/removeFromCart', cartController.removeFromCart)

    .post('/updateQuantity',cartController.updateQuantity)

    .post('/checkSession',userController.checkSession)

    .get('/check-out',cartController.proceedToCheckout)

    .post('/place-order',orderController.placeOrder)

    .post('/verifyPayment', orderController.verifyPayment)

    .get('/successpage',orderController.successPage)

    .get('/orders',orderController.loadMyOrder)

    .get('/order-details',orderController.loadOrderDetails)

    .get('/single-orderDetails',orderController.loadSingleOrderDetails)

    .post('/cancel-product',orderController.cancelOrder)
    
    .post('/change-password',userController.changePassword)

    
    
    

module.exports = userRoute;

