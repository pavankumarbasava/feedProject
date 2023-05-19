const mongoose = require('mongoose');
const Scheema=mongoose.Schema;

const postSchema= new Scheema({
   title: {
    type:String,
    required:true
   },
   imageUrl:{
    type:String,
    required:true
   },
   content:{
    type:String,
    required:true
   },
   creator:{
    require:true,
    type:Scheema.Types.ObjectId,
    ref:'User'
   }
}, {timestamps: true})

module.exports=mongoose.model('Post',postSchema)
