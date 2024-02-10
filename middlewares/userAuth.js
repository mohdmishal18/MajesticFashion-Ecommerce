
const isLogin=async(req,res,next)=>{
    try {
        console.log('howrrruuuu', req.session.user);

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
    authlogg
}