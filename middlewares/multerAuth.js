const e = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : function(req,file,cb)
    {
        cb(null,path.join(__dirname,'../public/assets/img/productImage/original'),function(err,success)
        {
            if(err)
            {   
                console.log(err);
                throw err;
            }
        });
    },
    filename : function (req,file,cb)
    {
        const name = Date.now() + '-' + file.originalname;

        cb(null, name);
    }
});

const upload = multer({storage : storage});
module.exports = upload;