const express = require('express');

const userRoute = express();
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const wishlistController = require('../controllers/wishlistController');
const couponController = require('../controllers/couponController'); 
const productController = require('../controllers/productController');

const User = require('../models/userModel');
const session = require("express-session");
const config = require('../config/config');

userRoute.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}));

const auth = require('../middlewares/userAuth');

userRoute.use(express.json());

userRoute.use(express.static('public'));
userRoute.use(express.urlencoded({extended:true}));

userRoute.use((req, res, next) => {
    res.header("Cache-Control", "no-store, private, must-revalidate");
    next();
  });
  

userRoute.use(async (req, res , next) => {
    const id = req.session.user?._id;
    console.log(id, 'middleware')
    
        const user = await User.findOne({_id: id});
        console.log(user?.is_blocked === true);
        if(user) {
            if(user.is_blocked) {
                

                fetch(`http://localhost:3001/logout`, {
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
    .post('/signup',auth.isLogined,userController.insertUser)

    /////////////// otp ========================================

    .get('/otp',auth.isLogOut,userController.loadotp)
    .post('/otp',userController.verifyOtp)
    .post('/resend',userController.resentOTP)

    .post('/login',auth.isLogined,userController.verifyLogin)

    // forgot password=================================================

    .get('/forgotpassword',auth.isLogOut,userController.loadForgotPassword)

    .post('/forgotpassword',userController.sendResetPass)

    .get('/resetpassword/:userId/:token',auth.isLogOut,userController.resetPage)

    .post('/resetpassword',userController.resetPassword)
    
    // shop ==========================================================
    .get('/shop',userController.loadShop)

    .get('/singleproduct',userController.loadSingleProduct)

    .get('/logout',userController.userLogout)

    // user profile ==========================================

    .get('/profile',auth.userAuth,userController.loadUserProfile)

    .get('/address',auth.userAuth,userController.loadAddressManagement)

    .post('/edit-profile',auth.authlogg,userController.editProfile)

    .post('/add-address',auth.authlogg,userController.addAddress)

    .delete('/deleteaddress',auth.authlogg,userController.deleteAddress)

    .post('/edit-address',auth.authlogg,userController.editAddress)

    // cart management =========================================

    .get('/cart',cartController.loadCart)

    .post('/add-cart',auth.authlogg,cartController.addToCart)

    .post('/removeFromCart',auth.authlogg, cartController.removeFromCart)

    .post('/updateQuantity',auth.authlogg,cartController.updateQuantity)

    .post('/checkSession',userController.checkSession)

    .get('/check-out',auth.authlogg,cartController.proceedToCheckout)

    .post('/place-order',auth.authlogg,orderController.placeOrder)

    //payment verification.
    .post('/verifyPayment',auth.authlogg, orderController.verifyPayment)

    // In case the payment failed...
    .post('/retry-payment',auth.authlogg,orderController.retryPayment)
    .post('/continueRetryPayment',auth.authlogg,orderController.continueRetryPayment)

    .get('/successpage',auth.authlogg,orderController.successPage)

    // search filter pagination.
    
    .post('/search',productController.filter)

    // order section =============================================

    .get('/orders',auth.userAuth,orderController.loadMyOrder)

    .get('/order-details',auth.userAuth,orderController.loadOrderDetails)

    .get('/single-orderDetails',auth.userAuth,orderController.loadSingleOrderDetails)

    .post('/cancel-product',auth.authlogg,orderController.cancelOrder)

    .post('/return-product',auth.authlogg,orderController.returnProduct)

    // change password ========================================
    
    .post('/change-password',auth.authlogg,userController.changePassword)

    // wishlist section =======================================

    .get('/wishlist',wishlistController.loadWishlist)

    .post('/add-wish',wishlistController.addToWishlist)
    
    .post('/remWish',auth.authlogg,wishlistController.remWish)

    //checking coupon.
    .post('/coupon-check',couponController.couponCheck)

    // invoice download.
    .get('/invoice',auth.userAuth,orderController.invoice)

    // getting wallet page.
    .get('/mywallet',auth.userAuth,userController.loadWallet)

    //getting the myCoupons page
    .get('/mycoupons',auth.userAuth,userController.loadMyCoupon)


    


module.exports = userRoute;

