const express=require("express");
const bcrypt = require("bcrypt");
const mongoose=require("mongoose");
const session=require("express-session");
const bodyParser = require("body-parser");
const MongoStore=require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash=require("connect-flash");


const app=express();
app.use(flash());
const MongoLink="mongodb://127.0.0.1:27017/cookiesDB";
 mongoose.connect(MongoLink).then(()=>{
    console.log('successfully connected');
}).catch((error)=>{
    console.log("error not connected: " , error);
});

const UserSchema = new mongoose.Schema({
    username:String,
    email:String,
    hash:String
});

const User = new mongoose.model("User" , UserSchema);

const mongoURL="mongodb://127.0.0.1:27017/SesssionDB";
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(session({
    secret:"this is my secret!!!", 
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
        mongoUrl:mongoURL,
        collectionName:'sessions'
    }),
    cookie:{
        maxAge:60000
    }
}));
  
async function VerifyStrat(EmailUser, password , done){
    console.log("function reached");
    try {
        const data = await User.findOne({email: EmailUser});
        if (!data) {
            console.log("User not found");
            return done(null, false);
        }
        
        const isValidPassword = await bcrypt.compare(password, data.hash);
        console.log(isValidPassword);
        if (isValidPassword) {
            console.log("User authenticated");
            return done(null, data);
        } else {
            console.log("Incorrect password");
            return done(null, false);
        }
    } catch (error) {
        console.error(error);
        return done(error);
    }
}

 
passport.use(new LocalStrategy("local",VerifyStrat));

passport.serializeUser(function(User, done) {
    done(null, User.id); 
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, User) {
        done(err, User);
    });
});

app.use(passport.initialize());
app.use(passport.session());
app.get("/",function(req,res){
    res.render("home");
})

app.get("/login" , function(req,res){
    res.render("login");
});

app.post('/login',passport.authenticate("local",{successRedirect:"/secret" , failureRedirect: "/login" ,failureFlash:true}));

app.get("/register",function(req,res){
    res.render("register");
});
const saltrounds=10;

app.post("/register" ,async  function(req,res){
    const un = req.body.username;
    const email = req.body.email;
    try {
        const hashedpsw = await bcrypt.hash(req.body.password , saltrounds);
        console.log(hashedpsw);
        const NewUser  = new User({
            username:un,
            email:email,
            hash:hashedpsw
        });
        NewUser.save();

    } catch (error) {
        res.status(500).send("error internal server");
    }


    
    res.redirect("/login");
});

function isAuth(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}

app.get("/secret" ,function(req,res){
        res.send("hello this is a secret page");

});

app.listen(3000,function(req,res){
    console.log("server successfully running on port 3000");
})