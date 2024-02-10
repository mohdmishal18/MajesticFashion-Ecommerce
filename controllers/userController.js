const User = require('../models/userModel');
const userOtpVerification = require('../models/userOTPverification');


const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

const Cart = require('../models/cartModel')

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

    console.log("in add address");
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
const updateaddress = async (req, res) => {
    try {
      const { name, addressline, city, state, pincode, phone, addressId } = req.body;
      console.log("req body :", req.body);
  
      const find = {
        'address._id': addressId
      }
  
      const update = {
        'addresses.$.name': name,
        'addresses.$.addressline': addressline,
        'addresses.$.city': city,
        'addresses.$.state': state,
        'addresses.$.pincode': pincode,
        'addresses.$.phone': phone
  
      }
  
      await User.updateOne(find, update)
      res.json({ success: true })
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
    updateaddress
}