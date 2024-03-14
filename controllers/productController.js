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
        // return Product.find().populate('categoriesid')
        // .then((data) => {
        //     res.render('products', {products: data});
        // })
        const category = await Category.find({});
        const product = await Product.find().populate('categoriesid')

        res.render('products',{products : product,category : category});
    }
    catch(error)
    {
        console.log(error.message);
        res.status(500).send(error);
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
        res.status(500).send(error);
    }
}

const addProduct = async (req,res) =>
{
    try
    {
        console.log("mishal");

        let description = req.body.description

        const sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];

        const category = await Category.findOne({ name : req.body.categoryID});

        console.log("Files:", req.files);

        const arrimages = [];

        for(let i = 0; i < req.files.length; i++)
        {
            arrimages.push(req.files[i].filename);

            // const selectPath = path.resolve(__dirname, '..', 'public', 'assets', 'img' , 'productImage', 'sharp', `${req.files[i].filename}`  );
            const selectPath = path.resolve(__dirname,'../public/assets/img/productImage/sharp', `${req.files[i].filename}`  );
            console.log(selectPath);

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
            description : description,
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
        console.log("Error while adding product",error);
        res.status(500).send(error);
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
        res.status(500).send(error);
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
        res.status(500).send(error);
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
        res.status(500).send(error);
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
        res.status(500).send(error);
    }
}

const editVariant = async (req, res) => {
    try {
        console.log("in edit variant");
        const id = req.body.id;
        const index = req.body.index;

        console.log(id, index);

        console.log(req.body);

        const newSizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];
        const newImages = [];

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                newImages.push(req.files[i].filename);

                const selectPath = path.resolve(__dirname, '..', 'public', 'assets', 'img', 'productImage', 'sharp', `${req.files[i].filename}`);

                await sharp(req.files[i].path).resize(500, 500).toFile(selectPath);
            }
        } else {
            // Use existing images if available
            const existingImages = req.body.images || [];
            newImages.push(...existingImages);
        }

        const quantity = parseInt(req.body.quantity);
        const previous_price = parseInt(req.body.previousPrice);
        const price = parseInt(req.body.price);

        return Product.findOne({ _id: id }, { variant: 1 })
            .then((product) => {
                // Use product.variant[index].images if available
                const existingImages = product.variant[index].images || [];
                newImages.push(...existingImages);

                return Product.updateOne({ _id: id },
                    {
                        $set:
                        {
                            [`variant.${index}.price`]: price,
                            [`variant${index}.previous_price`]: previous_price,
                            [`variant.${index}.color`]: req.body.color,
                            [`variant.${index}.sizes`]: newSizes,
                            [`variant.${index}.images`]: newImages,
                            [`variant.${index}.quantity`]: quantity,
                        }
                    })
                    .then(() => {
                        res.redirect(`/admin/variant/${id}`);
                    })
                    .catch((error) => {
                        console.log(error, "err");
                    });
            });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};
 
const loadEditProduct = async(req,res) =>
{
    try
    {
        const id = req.query.id;

        const categories = await Category.find();

        const product = await Product.findOne({_id : id});
        res.render('editProduct',{product : product, id : id ,categories : categories});

    }
    catch(error)
    {
        console.log(error);
        res.status(500).send(error);
    }
}

const editProduct = async(req,res) =>
{
    try
    {
        const {productId, name , categoryID, description} = req.body;
        const categories = await Category.findOne({name : categoryID});
        const update = await Product.findByIdAndUpdate({_id : productId},
            {
                $set :
                {
                    name : name,
                    description : description,
                    categoriesid : categories._id
                } 
            })

            if(update)
            {
                res.redirect('/admin/product')
                console.log("success");
            }
            else
            {
                console.log('edit failed');
            }

    }
    catch(error)
    {
        console.log(error);
        res.status(500).send(error);
    }
}

// search product
const filter = async (req,res) =>
{
    try {
        
        const search = req.body.search ? req.body.search : "";
        const sort = req.body.sort === "increacing" ? 1 : -1;
        const cetagory = req.body.cetagory ? req.body.cetagory : false;
        const brand = req.body.brand ? req.body.brand : false;
        const price = req.body.price ? req.body.price.split("-") : false;
        const page = req.body.page && !isNaN(req.body.page) ? parseInt(req.body.page) : 1;
        const limit = 6;
        console.log(page);
    
        const productCountResult = await Product.aggregate([
            {
                $lookup: {
                    from: "categories", // Assuming the collection name for categories is "categories"
                    localField: "categoriesid",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $match: {
                    "category.is_listed": true,
                    is_Listed: true
                }
            },
            {
                $count: "total"
            }
        ]);

        // Check if productCountResult is not empty before accessing its total property
        const totalPage = productCountResult.length > 0 ? Math.ceil(productCountResult[0].total / limit) : 0;

         // Adjusted query to include the is_listed condition for categories
         const products = await Product.aggregate([
            {
                $lookup: {
                    from: "categories", // Assuming the collection name for categories is "categories"
                    localField: "categoriesid",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $match: {
                    "category.is_listed": true,
                    is_Listed: true,
                    name: { $regex: search, $options: "i" }
                }
            },
            {
                $sort: { "variant.0.price": sort }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ]);

        // const totalPage = Math.ceil(await Product.countDocuments({ is_Listed: true, name: { $regex: search, $options: "i" } }) / limit);

        console.log(products);

        if (products)
        {
          if (cetagory || brand || price)
          {
            let product = [];
    
            if (cetagory)
            {
              const result = products.filter(
                (el, i) => el.category[0].name == cetagory
              );
              product.push(...result);
            //   console.log("the category is :",product );
            }

    
            if (price)
            {
              const array = cetagory ? product : products;
              const result = array.filter(
                (el, i) =>
                  el.variant[0].price >= parseInt(price[0]) &&
                  el.variant[0].price <= parseInt(price[1])
              );
              res.status(200).json({ pass: true, product: result });
            }
            res.status(200).json({ pass: true, product: product });
            }else{
               // Check if there are any products before sending the response
            if (productCountResult.length > 0) {
                res.status(200).json({ pass: true, product: products, page, totalPage });
            } else {
                // If there are no products, send a response indicating no products
                res.status(200).json({ pass: true, product: [], page: 0, totalPage: 0 });
            }
          }
        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
}

module.exports = 
{
    loadProduct,
    loadAddProduct,
    addProduct, 
    loadVariant,
    addVariant,
    loadEditProduct,
    editProduct,
    loadEditVariant,
    editVariant,
    listProduct,
    filter,
}