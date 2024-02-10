const express = require('express');
const adminRoute = express();
const session = require('express-session');

const adminController = require('../controllers/adminController');

const config = require('../config/config');

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

adminRoute.use(session({
    secret : config.sessionSecret,
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
    .get('/orders',adminController.loadOrder)
    .get('/orderdetails',adminController.singleOrderDetails)
    .post('/change-orderStatus',adminController.changeOrderStatus)

    //sales Report.
    .get('/sales-report',adminController.salesReport)
    .post('/order-report',adminController.orderReport)



module.exports = adminRoute;