const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require("path");
const userModel = require('./models/user');
const postModel = require('./models/post');
const post = require('./models/post');
const upload = require("./config/multerconfig")

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.get('/home',isLoggedIn,async (req,res) =>{
    let users = await userModel.findOne({email:req.user.email}).populate("posts")
    res.render("index",{users})
})
app.get('/',function(req,res){
    res.render("create")
})
app.post('/create',  function (req, res) {
    let {name,email,password} = req.body;
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt, async (err,hash)=>{
            let user = await userModel.create({
                name,
                email,
                password:hash,
              })
              let token = jwt.sign({email:email,userid:user._id},"sh")
              res.cookie("token",token);
              res.redirect('/login');
        })
    })
});
app.get('/login',function(req,res){
  res.render("login")
})
app.post('/login',async function(req,res){
    let {email,password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("something went wrong");

     bcrypt.compare(password, user.password, function(err,result) {
        if(result){
            let token = jwt.sign({email:email},"sh")
            res.cookie("token",token);
            res.redirect('/home');
        } 
        else res.redirect('/login');
     }) 
})
app.get('/logout',function(req,res){
    res.cookie("token","");
    res.redirect("/login")
})
app.get('/new',isLoggedIn,function(req,res){
    res.render("new");
})
app.post("/createhisab",isLoggedIn,async(req,res)=>{
    let {title,details} = req.body;
    let user = await userModel.findOne({email:req.user.email});
    let post = await postModel.create({
        user:user._id,
        title,
        details
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect("/home")
})
app.get('/view/:id',isLoggedIn,async function(req,res){
  const users =await postModel.findOne({_id:req.params.id});
    res.render("view",{users});
})
app.get("/delete/:id",isLoggedIn,async function(req,res)
{
    const deleteuser=await postModel.findOneAndDelete({_id:req.params.id});
    res.redirect("/home")
})
app.get('/edit/:id',isLoggedIn, async function (req, res) {
    let users = await postModel.findOne({_id:req.params.id});
      res.render("edit",{users})
  })
app.post('/update/:id',isLoggedIn, async function (req, res) {
    let {title,details} = req.body;
    let users = await postModel.findOneAndUpdate({_id:req.params.id},{title,details},{new:true});
      res.redirect("/home");
  })
app.get('/profile/uplode',isLoggedIn,async (req,res) =>{
    res.render("profile")
})
app.post('/uplode',isLoggedIn, upload.single('image'),async (req,res) =>{
    let user = await userModel.findOne({email:req.user.email});
    user.profilepic = req.file.filename;
    await user.save()
    res.redirect('/home')
})
function isLoggedIn(req,res,next) {
    if(req.cookies.token === "")res.redirect("/login");
    else{
       let data = jwt.verify(req.cookies.token,"sh");
       req.user = data;
       next();
    }
}
app.listen(3000);