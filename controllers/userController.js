const User = require('../models/userModel');
const userOtpVerification = require('../models/userOTPverification');


const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require("crypto");

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel')
const Token = require('../models/tokenModel');

//
//Load home page,
//

const loadHome = async (req,res) =>
{
    try
    {
        const id = req.session.user
        const user = await User.findOne({_id:id})
        console.log("userrrrrrrrrr" +user);
        const cetagory = await Category.find({is_Listed: true});
        const product = await Product.find({ is_Listed : true}).populate('categoriesid')

        if(product)
        {
            res.render('homepage',{product : product,user:user});
        }
    }
    catch(error)
    {
        console.log(error.message);
    }
}

//
//Load Login page
//

const loadLogin = async (req,res) =>
{
    try
    {
        res.render('login');
    }
    catch(error)
    {
        console.log(error.message);
    }
}

//
// Load signup page
//

const loadSignup = async (req,res) =>
{
    try
    {
        res.render('signup');
    }
    catch(error)
    {
        console.log(error.message);
    }
}

//
// registration page
//

const insertUser = async (req,res) =>
{
    try
    {
        const email = req.body.email;
        const namee = req.body.name;
        const findUser = await User.findOne({email:email});
        const findUserByName = await User.findOne({name:namee});
        if(findUser)
        {
            req.flash('exist',"User already exists with this email !");
            res.redirect('/signup');
        }
        else if(findUserByName)
        {
            req.flash('email',"Sorry , username already taken");
            res.redirect('/signup');
        }
        else
        {
            const hashPassword = await bcrypt.hash(req.body.password,10);
            const user = new User(
                {
                    name : req.body.name,
                    email : req.body.email,
                    mobile : req.body.mobile,
                    password : hashPassword,
                    is_admin : false,
                    is_blocked : false,
                    verified : false
                }
            );

            await user.save();

            sendOTPverificationEmail(user,res);
        }
    }
    catch(error)
    {
        console.log(error.message);
    }
}

//
// Sending OTP
//

const sendOTPverificationEmail = async({email},res) =>
{
    try
    {
        let transporter = nodemailer.createTransport({
            service : 'gmail',
            host : 'smtp.gmail.com',
            port : 465,
            secure : true,
            auth : 
            {
                user : 'mohdmishal18@gmail.com',
                pass : 'wktf vfcl xbyu fvii'
            } 
        });
        
        otp = `${
            Math.floor(1000 + Math.random() * 9000)
        }`;

        //mail options
        const mailOptions = 
        {
            from : 'mohdmishal18@gmail.com',
            to : email,
            subject : "Verify your email",
            html : `Your OTP is ${otp}`
        };

        // hash the otp 
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp,saltRounds);
        const newOtpVerification = await new userOtpVerification({email : email, otp : hashedOTP});
        console.log(newOtpVerification);

        // save otp record
        await newOtpVerification.save();
        await transporter.sendMail(mailOptions);

        res.redirect(`/otp?email=${email}`);
    }
    catch(error)
    {
        console.log(error.message);
    }
}

//
// OTP page load.
//

const loadotp = async (req,res) =>
{
    try
    {
        const email = req.query.email;


        console.log(email)
        res.render('otp',{email : email});
    }
    catch(error)
    {
        console.log(error.message);
    }
}

//
//Verify OTP
//

const verifyOtp = async (req,res) =>
{
    try
    {
        const email = req.body.email;

        console.log('email',req.body.email);
        const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;

        const userVerification = await userOtpVerification.findOne({email : email});
        console.log('userVerification : ', userVerification);

        if(! userVerification)
        {
            console.log("otp expired,please try again");
            req.flash('error','otp expired,please try again');
            res.redirect('/signup');

            return;
        }

        const {otp : hashedOTP} = userVerification;

        const validOtp = await bcrypt.compare(otp,hashedOTP);
        console.log(validOtp);

        if(validOtp)
        {
            const userData = await User.findOne({email : email});

            if(userData)
            {
                await User.findByIdAndUpdate
                (
                    {
                        _id : userData._id
                    },
                    {
                        $set : 
                        {
                            verified : true
                        }
                    }
                );
            }

            // delete the OTP record.
            const user = await User.findOne({email : email});
            await userOtpVerification.deleteOne({email : email});
            
            if(user.verified)
            {
                if(! user.is_blocked)
                {
                    req.session.user = 
                    {
                        _id : user._id,
                        email : user.email,
                        name : user.name
                    };
                    console.log(user.name);
                    console.log("success");

                    res.redirect('/');
                }
                else
                {
                    console.log("user blocked form this site");
                    req.flash('error','You are blocked by the admin !,please contact admin.')
                    res.redirect('/login');
                }
            }
        }
        else
        {
            console.log("incorrect otp");
            req.flash('error','OTP is incorrect,please signup again')
            res.redirect('/signup');
        }
    }
    catch(error)    
    {
        console.log(error.message);
    }
}

//
// //// resend OTP 
//

const resentOTP = async (req,res) =>
{
    try
    {
        const userEmail = req.query.email;
        await userOtpVerification.deleteMany({email : userEmail});
        console.log(userOtpVerification);
        console.log("User Email : " ,userEmail);

        if(userEmail)
        {
            sendOTPverificationEmail({
                email : userEmail
            },res);
        }
        else
        {
            console.log("User email not provided in the query");
        }
    }
    catch(error)
    {
        console.log(error.message);
    }
}

// after verify
// Login into Home 
//
const verifyLogin = async (req,res) =>
{
    try
    {
        const {email,password} = req.body
        console.log(email);
        const user = await User.findOne({email : email})
        console.log('user : ',user);

        if(user) 
        {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if(passwordMatch)
            {
                if(user.verified)
                {
                    if(! user.is_blocked)
                    {
                        req.session.user = 
                        {
                            _id : user._id,
                            email : user.email,
                            name : user.name,
                            mobile : user.mobile
                        };
                        console.log(user.name);
                        console.log(user.mobile);
                        res.redirect('/');
                    }
                    else
                    {
                        console.log("user blocked form this site");
                        req.flash('error','You are blocked by admin !,please contact admin.');
                        res.redirect('/login')
                    }
                }
                else
                {
                    console.log("verify");
                    sendOTPverificationEmail(user, res);
                }
            }
            else
            {
                console.log("incorrect password");
                req.flash('error','Incorrect password');
                res.redirect('/login');
            }
        }
        else
        {
            console.log("no user");
            req.flash('error','user no exist');
            res.redirect('/login');
        }
    }
    catch(error)
    {
        console.log(error.message);
    }
}

//
//Load main shop ,the contains all the products and other things
//

const loadShop = async (req,res) =>
{
    try
    {
        const id = req.session.user
        const user = await User.findOne({_id:id})
        const cetagory = await Category.find({is_listed: true});
        const product = await Product.find({is_Listed: true, }).populate('categoriesid');
        
        // console.log(product[2].variant[0].images[0])
        console.log("product loaded")
        res.render('shop', {category: cetagory, product: product,user : user});
 
    }
    catch(error)
    {
        console.log(error);
    }
}

//
// To show the details of each product.
//
const loadSingleProduct = async (req, res) => {
    try {
        const { id, index } = req.query;
        console.log(id, index);

        const product = await Product.findOne({ _id: id });
        const userId = req.session.user?._id;

        if (userId) {
            const cart = await Cart.findOne({ user: userId });

            if (cart) {
                const existing = cart.products.filter((product, i) => product.productId.toString() === id);
                const exists = existing.find((pro) => pro.product === index);

                if (exists) {
                    // The product is in the cart
                    if (req.xhr) {
                        // For AJAX requests, send JSON response
                        res.json({ product: product, index: index, isInCart: true });
                    } else {
                        // For regular requests, render the EJS template
                        res.render('productsDetails', { product: product, index: index, isInCart: true });
                    }
                    return;
                }
            }
        }

        // The product is not in the cart
        if (req.xhr) {
            // For AJAX requests, send JSON response
            res.json({ product: product, index: index, isInCart: false });
        } else {
            // For regular requests, render the EJS template
            res.render('productsDetails', { product: product, index: index, isInCart: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


// ============================ USER PROFILE ============================

//
// Load User profiel
//

const loadUserProfile = async (req,res) =>
{
    try
    {
        const id = req.session.user
        const user = await User.findOne({_id:id})

        res.render('userProfile',{user : user});
    }
    catch(error)
    {
        console.log(error);
    }
}

const editProfile = async (req,res) =>
{
    try
    {
        const email = req.body.userEmail;
        const newUserName = req.body.updatedName;
        const newMobile = req.body.updatedMobile;

        const findUsernameExist = await User.find({name : newUserName});

        if(findUsernameExist.length > 0)
        {
            res.json({edited : false});
        }
        else
        {
            const user = await User.findOneAndUpdate(
                {
                    email : email
                },
                {
                    $set : 
                    {
                        name : newUserName,
                        mobile : newMobile
                    }
                },
                {new : true}
            );
            res.json({edited : true, user : user});
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

//
// Load address Management
//

const loadAddressManagement = async (req,res) =>
{
    try
    {
        const id = req.session.user
        const user = await User.findOne({_id:id})
        const userID = req.session.user._id;
        const userid = await User.findById(userID);
        const address = userid.address;
        
        res.render('addressManagement', { user : user, address : address});
    }
    catch(error)
    {
        console.log(error);
    }
}

const addAddress = async (req,res) =>
{
    try
    {
        const 
        {
            fullName,
            addressLine,
            city,
            state,
            postcode,
            phone,
           
        } = req.body;

        console.log(fullName);
        console.log(addressLine);
        console.log(city);
        console.log(state);
        console.log(postcode);
        console.log(phone);
        
       const userId = req.session.user?._id;
       console.log(userId)

        await User.findOneAndUpdate(
            {
                _id: userId
            },
            {
                $push : 
                {
                    address : 
                    {
                        name : fullName,
                        addressline : addressLine,
                        city : city,
                        state : state,
                        pincode : postcode,
                        phone : phone
                    }
                }
            });

        res.json({add : true})
    }
    catch(error)
    {
        console.log(error);
    }
}

const deleteAddress = async(req,res) =>
{
    try
    {
        const {userId, addressId} = req.body;
        console.log("helooo",req.body);
        if(!userId)
        {
            console.log("no userid");
        }
        else
        {
            await User.findByIdAndUpdate({ _id : userId, "address._id": addressId},{$pull : { address : { _id : addressId}}})
        }
        res.json({success : true})
    }
    catch(error)
    {
        res.status(400).send('request failed');
        console.log(error);
    }
}

// Edit Address
const editAddress = async (req, res) => {
    try {
        const userid = req.session.user;
      const { id,name, addressLine, city, state, pincode, phone } = req.body;
      console.log("req body :", req.body);
  
      const find = {
        _id : userid,
        'address._id': id
      }
  
      const update = {
        'address.$.name': name,
        'address.$.addressline': addressLine,
        'address.$.city': city,
        'address.$.state': state,
        'address.$.pincode': pincode,
        'address.$.phone': phone
  
      }
  
      await User.updateOne(find, update)

      res.json({ updated : true })
      console.log("updated");
    } catch (error) {
      res.status(400).send('edit request is failed')
      console.log(error);
    }
  }

const changePassword = async (req,res) =>
{
    try
    {
        const { userEmail, oldPass, confirmPass } = req.body;
        const user = await User.findOne({email : userEmail});

        console.log("user =", user);

        const matchPassword = await bcrypt.compare(oldPass, user.password)
        if(!matchPassword)
        {
            res.json({reseted : false})
        }
        else
        {
            const passwordSame = await bcrypt.compare(oldPass , confirmPass)
            if(passwordSame || confirmPass === oldPass)
            {
                res.json({reset : true})
            }
            else
            {
                const securepass = await bcrypt.hash(confirmPass,10);
                await User.updateOne({email : userEmail},
                    {
                        $set : 
                        {
                            password : securepass
                        }
                    })
                    res.json({reseted : true});
                    console.log("working");
            }
        }
        
    }
    catch(error)
    {
        console.log(error);
    }
}

///////////////// FORGOT PASSWORD SECTION ////////////////////////

const loadForgotPassword = async (req,res) =>
{
    try
    {
        res.render('forgotPassword');
    }
    catch(error)
    {
        console.log(error);
    }
}

const sendResetPassLink = async(email , res) =>
{
    try
    {
        email = email
        const user = await User.findOne({email : email});
        console.log("got the user : " ,user);

        if(! user)
        return res.status(400).send("User with this email does not exist !!");

        let token = await Token.findOne({userId : user._id});
        if(! token)
        {
            token = await new Token({userId : user._id, token : crypto.randomBytes(32).toString("hex")}).save();
        }

        let transporter = nodemailer.createTransport({
            service : 'gmail',
            host : 'smtp.gmail.com',
            port : 465,
            secure : true,
            auth : 
            {
                user : 'mohdmishal18@gmail.com',
                pass : 'sakt ggiw xepm nyym'
            }
        })

        const resetPage = `http://localhost:3001/resetpassword/${user._id}/${token.token}`;

        const mailOptions = 
        {
            from : 'mohdmishal18@gmail.com',
            to : email,
            subject : "Please verify your email",
            html : `Your link here to reset your password is : ${resetPage}`
        } 
        
        await transporter.sendMail(mailOptions);
    }
    catch(error)
    {
        console.log(error.message);
    }
}

const sendResetPass = async (req,res) =>
{
    try
    {
        const email = req.body.mail;

        await sendResetPassLink(email,res);
        req.flash('success',"we send a reset password link to your email");
        res.redirect('/login');
    }
    catch(error)
    {
        console.log(error.message);
    }
}

// reset password page's link

const resetPage = async (req,res) =>
{
    try
    {
        const userId = req.params.userId;
        const token = req.params.token;
        console.log("i got it :", userId, token);

        res.render('resetPassword',{userId,token});
    }
    catch(error)
    {
        console.log(error.message);
    }
}

const resetPassword = async (req,res) =>
{
    try
    {
        const user = req.body.userId;
        console.log("The user is : ",user);

        const userId = await User.findById(req.body.userId);

        const {email} = userId;

        const token = req.body.token;

        console.log(userId);

        if(! userId)
        {
            return res.status(400).send("invalid link or expired");
        }

        const tokenDoc = await Token.findOne(
            {
                userId : userId._id,
                token : token
            }
        )

        if(! tokenDoc)
        {
            return res.status(400).send("invalid link or expired");
        }

        let password = req.body.confirmpassword;

        const securePass = await bcrypt.hash(password,10);

        await User.updateOne(
            {email : email},
            {$set : {password : securePass}}
        )

        req.flash('success','successfully setted new password');
        res.redirect('/login');
        
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

///////////////// FORGOT PASSWORD SECTION ////////////////////////


// for search filter and sort 

const filter = async (req, res) => {
    try {
         const search = req.body.search ? req.body.search : "";
         const sort = req.body.sort === 'increacing' ? 1 : -1;
         const cetagory = req.body.cetagory ? req.body.cetagory : false;
         const brand = req.body.brand ? req.body.brand : false;
         const price = req.body.price ? req.body.price.split('-') : false;
         const page = req.body.page;
         
         console.log(page)
         
         const productCount = await Product.find({
            name: {$regex: search, $options: 'i'},
        }).sort({"variant.0.price": sort}).populate('categoriesid')
        const totalPage = productCount.length / 6;
         const products = await Product.find({
            name: {$regex: search, $options: 'i'},
        }).sort({"variant.0.price": sort}).populate('categoriesid').skip(page * 6).limit(6)
        console.log(products);
        if(products) {
            if( cetagory || brand || price ) {

            let product = [];

              if(cetagory) {

                const result = products.filter((el, i) =>  el.cetagory.name == cetagory);
                product.push(...result);
              }

              if(brand) {
                const array = cetagory ? product : products
                const result = array.filter((el, i) => el.brand == brand);
                res.status(200).json({pass: true, product: result});
              } 

              if(price){
                const array = cetagory ? product : products
                const result = array.filter((el, i) => ( el.variant[0].price >= parseInt(previous_price[0]) && el.variant[0].price <= parseInt(previous_price[1])));
                res.status(200).json({pass: true, product: result});
              }
                res.status(200).json({pass: true, product: product});
            } else {
                res.status(200).json({pass: true, product: products, page, totalPage})

            }
        }
    } catch (error) {
        console.log(error);
    }
}

//
// logout user
//
const userLogout = async (req,res) =>
{
    try
    {
        req.session.user = null
        res.redirect('/');
    }
    catch(error)
    {
        console.log(error.message);
    }
}


const checkSession = (req, res) => {
    try {
        if(req.session) {
            res.json({session: true});
        } else {
            res.json({session: false});
        }
        
    } catch (error) {
        console.log(error);
    }
}


module.exports = 
{
    loadHome,
    loadLogin,
    loadSignup,
    verifyLogin,
    insertUser,
    loadotp,
    sendOTPverificationEmail,
    verifyOtp,
    resentOTP,
    userLogout,
    loadShop,
    loadSingleProduct,
    loadUserProfile,
    loadAddressManagement,
    editProfile,
    addAddress,
    checkSession,
    changePassword,
    deleteAddress,
    editAddress,
    loadForgotPassword,
    sendResetPassLink,
    sendResetPass,
    resetPage,
    resetPassword,
    filter,
}