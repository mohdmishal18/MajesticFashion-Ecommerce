
const isLogin=async(req,res,next)=>{
    try {
        console.log('in isLogin middleware', req.session.user);

        if(req.session.user){
            if (req.path === '/login') {
                res.redirect('/');
                return;
            }
            
           
            next();
           
        } else {
         
            if(req.path === '/login'){
                return next();
            }
        }
    } catch (error) {
        console.log(error.message);
        
    }

}


const isLogOut = async (req,res,next)=>{
    try {
        // console.log('user:',req.session.user_id);

        // check if the user is logged in
        if(req.session.user){
            // if the user is logged in ,redirect to home
            res.redirect('/')
            return
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

const userAuth = (req, res, next) => {
    try {
        if(req.session.user) {
            next();
        } else {
           res.redirect('/');
        }
    } catch (error) {
        console.log(error);
    }
}

const isLogined = (req, res, next) => {
    try {
        if(req.session.user) {
            res.redirect('/')
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
    }
}

const authlogg = async(req,res,next)=>{
    try{
            if(req.session.user){
                next();
            }else{
                res.redirect('/signin')
            }
    }catch(err){
        console.log(err.message)
    }
}
module.exports={
    isLogin,
    isLogOut,
    authlogg,
    userAuth,
    isLogined
}