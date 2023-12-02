module.exports.isAuth() = function(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.status
    }
}

module.exports()