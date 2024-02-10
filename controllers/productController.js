
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const sharp = require('sharp');
const path = require('path');

const productModel = require('../models/productModel');



const loadProduct = async (req,res) =>
{
    try
    {
        return Product.find().populate('categoriesid')
        .then((data) => {
            res.render('products', {products: data});
        })
    }
    catch(error)
    {
        console.log(error.message);
    }
}

const loadAddProduct = async (req,res) =>
{
    try
    {
        const categories = await Category.find({});
        res.render('addProduct',{categories : categories});
    }
    catch(error)
    {
        console.log(error.message);
    }
}

const addProduct = async (req,res) =>
{
    try
    {
        console.log("mishal");

        const sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];

        const category = await Category.findOne({ name : req.body.categoryID});

        console.log("Files:", req.files);

        const arrimages = [];

        for(let i = 0; i < req.files.length; i++)
        {
            arrimages.push(req.files[i].filename);

            const selectPath = path.resolve(__dirname, '..', 'public', 'assets', 'img' , 'productImage', 'sharp', `${req.files[i].filename}`  );

            await sharp(req.files[i].path).resize(500, 500).toFile(selectPath);
        }

        console.log("rgfafgasipo",arrimages);

        console.log(sizes);
        console.log(typeof req.body.quantity,req.body.quantity);
        console.log(req.body.categoryID);
        console.log("mmmmmmm");

        const quantity = parseInt(req.body.quantity)
        const previous_price = parseInt(req.body.previousPrice)
        const price = parseInt(req.body.price);

        const variant = 
        {
            price : price,
            previous_price : previous_price,
            sizes : sizes,
            images : arrimages,
            quantity : quantity,
            color : req.body.color,
            created_at : Date.now()
        }
        const product = new Product({
            name : req.body.name,
            description : req.body.description,
            categoriesid : category._id,
            variant : variant,
            is_Listed : true,
        })

        const isSave = await product.save();

        if(isSave)
        {
            res.redirect('/admin/product');
        }

    }
    catch(error)
    {
        console.log(error);
        res.status(500).send("internal server error");
    }
}

const listProduct = async (req,res) =>
{
    try
    {
        const id = req.body.id;
        return Product.findOne({_id : id})
        .then((product) =>
        {
            if(product.is_Listed)
            {
                return Product.updateOne({_id : id},
                    {
                        $set : 
                        {
                            is_Listed : false
                        }
                    })
            }
            else
            {
                return Product.updateOne({_id : id},
                    {
                        $set : 
                        {
                            is_Listed : true
                        }
                    })
            }
        })
        .then(() =>
        {
            res.json({listed : true})
        })
        .catch((err) =>
        {
            console.log(err);
        })
    }
    catch(error)
    {
        console.log(error);
    }
}


const loadVariant = async (req,res) =>
{
    try
    {
        const id = req.params.id;
        if(id)
        {
            const product = await Product.findOne({_id : id},{name : 1, variant : 1})
            console.log("in variant management");

            if(product)
            {
                res.render('variant',{product : product});
            }
            else
            {
                console.log('product not found');
            }
        }
        else
        {
            console.log('id not recieved');
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const addVariant = async (req,res) =>
{
    try
    {
        const id = req.body.id;
        const size = req.body.size;

        console.log(id);

        if(id)
        {
            const sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];
            const arrimages = [];

            for(let i = 0; i < req.files.length; i++)
            {
                arrimages.push(req.files[i].filename);

                const selectPath = path.resolve(__dirname, '..', 'public', 'assets', 'img' , 'productImage', 'sharp', `${req.files[i].filename}`  );

                await sharp(req.files[i].path).resize(500, 500).toFile(selectPath);

            }
            console.log(arrimages,sizes);

            const quantity = parseInt(req.body.quantity)
            const previous_price = parseInt(req.body.previousPrice)
            const price = parseInt(req.body.price);

            const variant = 
            {
                price : price,
                previous_price : previous_price,
                color : req.body.color,
                sizes : sizes,
                images : arrimages,
                quantity : quantity
            }

            return Product.updateOne({_id : id},
                {
                    $push : {variant : variant}
                })
                .then((data) =>
                {
                    if(data)
                    {
                        res.redirect(`/admin/variant/${id}`);
                    }
                })
        }
        else
        {
            console.log("id did not recieved");
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const loadEditVariant = async (req,res) =>
{
    try
    {
        const index = req.query.index;
        const id = req.query.id;

        console.log(id);
        console.log(index);

        if(id)
        {
            return Product.findOne({_id : id}, {variant : 1})
            .then((data) =>
            {
                console.log('data');
                const product = data.variant[index];
                const id = data._id;
                console.log(product);

                res.render('editVariant', {product : product, id : id, index : index});
            })
            .catch((err) =>
            {
                console.log(err);
            })
        }
        else
        {
            console.log("id did not recieved in load edit variant");
        }

    }
    catch(error)
    {
        console.log(error);
    }
}

const editVariant = async (req,res) =>
{
    try
    {
        console.log("in edit variant");
        const id = req.body.id;
        
        const index = req.body.index;

        console.log(id,index);

        console.log(req.body);

        const newSizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];
        const newImages = [];

        for(let i = 0; i < req.files.length; i++)
        {
            newImages.push(req.files[i].filename);

            const selectPath = path.resolve(__dirname, '..', 'public', 'assets', 'img' , 'productImage', 'sharp', `${req.files[i].filename}`  );

            await sharp(req.files[i].path).resize(500, 500).toFile(selectPath);

        }

        const quantity = parseInt(req.body.quantity)
        const previous_price = parseInt(req.body.previousPrice)
        const price = parseInt(req.body.price);

        return Product.findOne({_id : id},{variant : 1})
        .then(() =>
        {
            return Product.updateOne({_id : id},
                {
                    $set : 
                    {
                        [`variant.${index}.price`] : price,
                        [`variant${index}.previous_price`] : previous_price,
                        [`variant.${index}.color`] : req.body.color,
                        [`variant.${index}.sizes`] : newSizes,
                        [`variant.${index}.images`] : newImages,
                        [`variant.${index}.quantity`] : quantity,
                    }
                })
                .then(() =>
                {
                    res.redirect(`/admin/variant/${id}`);
                })
                .catch((error) =>
                {
                    console.log(error, "err");
                })
        })

    }
    catch(error)
    {
        console.log(error);
    }
}

module.exports = 
{
    loadProduct,
    loadAddProduct,
    addProduct, 
    loadVariant,
    addVariant,
    loadEditVariant,
    editVariant,
    listProduct,

}