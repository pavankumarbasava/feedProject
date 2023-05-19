const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt=require('jsonwebtoken');
const user = require("../models/user");
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Sign up validation failed");
    error.statuscode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password,12)
    .then(bcryptpass=>{
       const user= new User({
        email:email,
        name:name,
        password:bcryptpass
       });
       return user.save();
    }).then(result=>{
        res.status(201).json({message:'user careated succesfully',userId:result._id})
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.login= (req,res,next)=>{
   const email = req.body.email;
   const password= req.body.password;
   let userData;
   User.findOne({email:email}).then(user=>{
      if(!user){
        const error= new Error('There is no user with this email.');
        error.statusCode=404;
        throw error;
      }
      userData=user;
     return bcrypt.compare(password, user.password);

   }).then(isPasswordCorrect=>{
    if(!isPasswordCorrect){
        const error= new Error('Authentication failed');
        error.statusCode=401;
        throw error;
    }
    const token = jwt.sign(
        {email:userData.email, userId : userData._id.toString()},
        'wiprosecuredtoken',
        {expiresIn:'1hr'}
        );
        res.status(200).json({token:token,userId:userData._id.toString()})
   }).catch(err=>{
    if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
   });
}