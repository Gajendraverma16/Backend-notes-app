const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

const userSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
    posts:[
        {type:mongoose.Schema.Types.ObjectId, ref:"post"}
    ],
    profilepic:{
        type:String,
        default:"default.png"
    }
})

module.exports = mongoose.model('user',userSchema);
