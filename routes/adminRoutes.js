const express = require('express');
const adminRoute = express();
const session = require('express-session');

const config = require('../config/config');

const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const couponController = require('../controllers/couponController');

adminRoute.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}));

const multer = require('../middlewares/multerAuth');
const auth = require('../middlewares/adminAuth');




adminRoute.use(express.json());
adminRoute.use(express.urlencoded({extended : true}));

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

adminRoute
    //  Admin Login
    .get('/',auth.isLogout,adminController.loadLogin)
    .post('/',adminController.verifyLogin)

    // Get home.
    .get('/home',auth.isLogin,adminController.loadDashboard)

    // user Management.
    .get('/userlist',auth.isLogin,adminController.loadUserManagement)
    .post('/blockUser',adminController.blockUser)

    // Product Management.
    .get('/product',auth.isLogin,productController.loadProduct)
    .get('/addproduct',auth.isLogin,productController.loadAddProduct)
    .get('/logout', auth.isLogin, adminController.adminLogout)
    .post('/addproduct',multer.array('images'),productController.addProduct)  
    .get('/variant/:id', auth.isLogin,productController.loadVariant)
    .post('/addvariant', multer.array('images'),productController.addVariant)
    .get('/editvariant',auth.isLogin,productController.loadEditVariant)
    .post('/editvariant',multer.array('images'),productController.editVariant)
    .post('/listproduct',productController.listProduct)

    //Category Mangement.
    .get('/category',auth.isLogin,categoryController.loadCategory)
    .get('/addcategory',auth.isLogin,categoryController.loadAddCategory)
    .post('/addcategory',categoryController.addCategory)
    .post('/editcategory',categoryController.editCategory)
    .post('/list-unlist',categoryController.listCategory)

    //order management
    .get('/orders',auth.isLogin,adminController.loadOrder)
    .get('/orderdetails',auth.isLogin,adminController.singleOrderDetails)
    .post('/change-orderStatus',adminController.changeOrderStatus)

    //sales Report.
    .get('/sales-report',auth.isLogin,adminController.salesReport)
    .post('/order-report',adminController.orderReport)

    // coupon management .
    .get('/coupon',auth.isLogin, couponController.loadCoupon)
    .post('/createCoupon',couponController.addCoupon)
    .post('/editCoupon', couponController.editCoupon)
    .delete('/deleteCoupon',couponController.deleteCoupon)

    // return requests.
    .get('/return-req',adminController.loadReturnReq)
    .post('/return-req',adminController.returns)


module.exports = adminRoute;