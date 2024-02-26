const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');

const loadCart = async (req,res) =>
{
    try
    {
        const id = req.session.user
        const user = await User.findOne({_id:id})

        console.log("cart");
        const userId = req.session.user;
        const product = await Cart.find({user : userId} , {products : 1}).populate('products.productId');

        const products = product[0]?.products;
        console.log(products,'cart');
        res.render('cart',{products : products,user : user})
    }
    catch(error)
    {
        console.log(error);
    }
}

const addToCart = async (req,res) =>
{
    try
    {
        console.log("add to Cart Start");
        const  {productId , index , size , quantity} = req.body;
        const userId = req.session.user?._id;

        console.log(productId , index ,userId , size , quantity);

        // price of the variant 

        const product = await Product.findOne({_id : productId});
        const price = product.variant[index].previous_price;
        const offerPrice = product.variant[index].price;

        const qnt = quantity ? quantity : 1;

        if(userId)
        {
            const cart = await Cart.findOne({user : userId});

            if(cart)
            {
                const existing = cart.products.filter((product ,i) => product.productId.toString() === productId);
                console.log(existing, 'product');
                const exists = existing.find((pro) => pro.product === index && pro.size === size);

                console.log(exists,'index');
                console.log('real index', index);
                console.log(typeof index);

                if(!exists)
                {

                    await Cart.findOneAndUpdate({user : userId},
                        {
                            $push : 
                            {
                                products : 
                                {
                                    productId : productId,
                                    product : index,
                                    price : offerPrice,
                                    quantity : qnt,
                                    totalPrice : offerPrice * qnt,
                                    size : size
                                }
                            }
                        })
                        console.log('add');
                }
                else
                {
                    console.log("already in the cart");
                    req.flash('exists','Product is already in the cart!!');
                }
            }
            else
            {
                console.log("created");
                console.log(price);

                const product = 
                {
                    productId : productId,
                    product : index,
                    price : offerPrice,
                    quantity : qnt,
                    totalPrice : offerPrice * qnt,
                    size : size
                }
                console.log(product);

                const cart = new Cart(
                    {
                        user : userId,
                        products : product
                    }
                )

                if(cart)
                {
                    await cart.save();
                }
            }
            res.json({added : true});
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const removeFromCart = async (req,res) =>
{
    try
    {
        const userId = req.session.user?._id;
        const {productId,index} = req.body;

        if(userId)
        {
            await Cart.findOneAndUpdate(
                {'user' : userId, 'products.productId' : productId, 'products.product' : index},
                {$pull : {'products' : {'productId' : productId, 'product' : index}}}
            );
            res.json({removed : true});
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const proceedToCheckout = async (req,res) =>
{
    try
    {
        const userid = req.session.user?._id;

        const user = await User.findOne({_id : userid});
        const cart = await Cart.findOne({user : userid}).populate('products.productId');

        const userAddress = user.address;
        const products = cart.products

        

        console.log(cart);
        res.render('checkOut', {address : userAddress, products : products,user : user});
    }
    catch(error)
    {
        console.log(error);
    }
}


const updateQuantity = async (req,res ) =>
{
    try
    {
        const {productId,count,index,size}= req.body;
    console.log("The data's are : ",req.body);
    const userid = req.session.user?._id;

        const product = await Product.findOne({ _id: productId });
        const variant = product.variant[index];
        const stock = variant.quantity;
        const price = variant.price;
        console.log(price, 'price')
        const cart = await Cart.findOne({ user: userid, "products.productId": productId });
        console.log(cart, 'cart');
        const cartProduct = cart.products.find((pro) => pro.product === index);
        console.log(cartProduct);
        const quantity = cartProduct.quantity;
        console.log(quantity);

        console.log(variant, 'ghhghghghhghghghhghgh')

        if(count == -1){
            if(quantity <= 1){
             return res.json({min:true})
            }
          }
          if(count == 1){
            if(quantity >= stock){
             return res.json({max:true})
            }
          }
        
          const producPrice = price.toString();

          await Cart.findOneAndUpdate({user:userid,'products.productId':productId},
          {$inc:
            {
              'products.$.quantity':count,
              'products.$.totalPrice': count * producPrice
          }}
          )
            res.json({success:true})
    }
    catch(error)
    {
        console.log(error);
    }
}

module.exports = 
{
    loadCart,
    addToCart,
    removeFromCart,
    proceedToCheckout,
    updateQuantity,
    
}