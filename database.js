const mongoose = require("mongoose");
const MongoLink="mongodb://127.0.0.1:27017//cookiesDB";
const connection = mongoose.connect(MongoLink , {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log('successfully connected');
}).catch((error)=>{
    console.log("error not connected: " , error);
});

const UserSchema = new mongoose.Schema({
    username:String,
    email:String,
    hash:String
});

const User = mongoose.model("User" , UserSchema);

module.exports.connection = connection;


