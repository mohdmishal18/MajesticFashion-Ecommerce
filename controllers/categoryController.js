const { ObjectId } = require('mongodb');
const Category = require('../models/categoryModel');

const loadCategory = async (req,res) =>
{
    try
    {
        const categories = await Category.find({});
        res.render('category',{categories : categories});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send(error);
    }
}

const loadAddCategory = async (req,res) =>
{
    try
    {
        res.render('addCategory');
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send(error);
    }
}

const addCategory = async (req,res) =>
{
    try
    {
        console.log(req.body);

        const {name} = req.body;

        const lowercaseName = name.toLowerCase();

        const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + lowercaseName + '$', 'i') } });


        if(existingCategory)
        {
            console.log("already exists");
            req.flash('error','this category  already exists');
            res.redirect('/admin/addcategory');
        }
        else
        {
            const category = new Category(
                {
                    name : name,
                    // description : description,
                    is_listed : 1
                }
            )

            await category.save();
            console.log("success");
            res.redirect('/admin/category');
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send(error);
    }
}

const listCategory = async (req,res) =>
{
    try
    {
        console.log("reached at list");
        const id = req.body.data;
        console.log(id);

        return Category.findOne({_id : id})
        .then((user) =>
        {
            if(user.is_listed)
            {
                return Category.updateOne({_id : id},
                    {
                        $set: 
                        {
                            is_listed : false
                        }
                    })
            }
            else
            {
                return Category.updateOne({_id : id},
                    {
                        $set : 
                        {
                            is_listed : true
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

const editCategory = async (req,res) =>
{
    try
    {
        const {id , name } = req.body;

        const lowercaseName = name.toLowerCase();


        const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + lowercaseName + '$', 'i') } });

        if(existingCategory)
        {
            console.log("already exists");
            
             return res.json({duplicate : true})
        }
        if(id)
        {
            const update = await Category.findByIdAndUpdate({_id : id},
                {
                    $set : 
                    {
                        name : name,
                    }
                })

                if(update)
                {
                    res.json({updated : true});
                }
                else
                {
                    console.log('not updated');
                }
        }
        else
        {
            console.log("id did not receive");
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send(error);
    }
}

const deleteCategory = async(req,res) =>
{
    try
    {
        const id = req.body.user;
        console.log("jfa;a",id);
        await Category.deleteOne({id : id});
        res.json({list : true});
    }
    catch(error)
    {
        console.log(error.message);
        res.status(500).send(error);
    }
}

module.exports =
{
    loadCategory,
    loadAddCategory,
    addCategory,
    editCategory,
    deleteCategory,
    listCategory,
}



