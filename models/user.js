const mongoose = require('mongoose');
const Scheema= mongoose.Schema;

const useSchema = new Scheema({
    email:{
        type: String,
        required:true
        
       },
       password:{
        type: String,
        required:true
       },
       name:{
        type: String,
        required:true
       },
       status:{
        type: String,
        required:true,
        default:'Im new user'
       },
       posts:[{
        type:Scheema.Types.ObjectId,
        ref:'Post'
       }]
 
 })
 
 module.exports=mongoose.model('User',useSchema);