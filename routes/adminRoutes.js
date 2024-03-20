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
    .post('/',auth.isLogout,adminController.verifyLogin)

    // Get home.
    .get('/home',auth.isLogin,adminController.loadDashboard)

    // user Management.
    .get('/userlist',auth.isLogin,adminController.loadUserManagement)
    .post('/blockUser',auth.isLogin,adminController.blockUser)

    // Product Management.
    .get('/product',auth.isLogin,productController.loadProduct)
    .get('/addproduct',auth.isLogin,productController.loadAddProduct)
    .get('/editProduct',auth.isLogin,productController.loadEditProduct)
    .post('/editProduct',auth.isLogin,productController.editProduct)
    .get('/logout', auth.isLogin, adminController.adminLogout)
    .post('/addproduct',multer.array('images'),productController.addProduct)  
    .get('/variant/:id', auth.isLogin,productController.loadVariant)
    .post('/addvariant', multer.array('images'),productController.addVariant)
    .get('/editvariant',auth.isLogin,productController.loadEditVariant)
    .post('/editvariant',multer.array('images'),productController.editVariant)
    .post('/delimg',auth.isLogin,productController.delImg)
    .post('/listproduct',auth.isLogin,productController.listProduct)

    //Category Mangement.
    .get('/category',auth.isLogin,categoryController.loadCategory)
    .get('/addcategory',auth.isLogin,categoryController.loadAddCategory)
    .post('/addcategory',auth.isLogin,categoryController.addCategory)
    .post('/editcategory',auth.isLogin,categoryController.editCategory)
    .post('/list-unlist',auth.isLogin,categoryController.listCategory)

    //order management
    .get('/orders',auth.isLogin,adminController.loadOrder)
    .get('/orderdetails',auth.isLogin,adminController.singleOrderDetails)
    .post('/change-orderStatus',auth.isLogin,adminController.changeOrderStatus)

    //sales Report.
    .get('/sales-report',auth.isLogin,adminController.salesReport)
    .post('/order-report',auth.isLogin,adminController.orderReport)

    // coupon management .
    .get('/coupon',auth.isLogin, couponController.loadCoupon)
    .post('/createCoupon',auth.isLogin,couponController.addCoupon)
    .post('/editCoupon',auth.isLogin,couponController.editCoupon)
    .delete('/deleteCoupon',auth.isLogin,couponController.deleteCoupon)

    // return requests.
    .get('/return-req',auth.isLogin,adminController.loadReturnReq)
    .post('/return-req',auth.isLogin,adminController.returns)

    //monthly chart
    .post('/order-filter',auth.isLogin,adminController.filterDashboard)


module.exports = adminRoute;