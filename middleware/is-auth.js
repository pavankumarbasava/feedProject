const jwt = require('jsonwebtoken');

module.exports=(req,res,next)=>{
    const authorization = req.get('Authorization');
    if(!authorization){
        const err= new Error("Authentication failed");
        err.statusCode= 401;
        throw err;
    }
    const token = authorization.split(' ')[1];
    let decodeToken;
    try{
      decodeToken = jwt.verify(token,'wiprosecuredtoken');
    }catch(err){
       err.statusCode=500;
       throw err;
    }
    if(!decodeToken){
        const err= new Error('Not authenticated');
        err.statusCode=500;
        throw err;
    }
    req.userId= decodeToken.userId;
    next();
}