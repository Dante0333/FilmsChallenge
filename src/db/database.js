const mongoose = require("mongoose");

const mongoURL = "mongodb+srv://Albano:C8LrE20Jpoov02wr@cluster0.prvxt.mongodb.net/Movies?retryWrites=true&w=majority" 

mongoose.connect(mongoURL, {useUnifiedTopology:true})
.then (db => console.log("DB conectada"))
.catch(err => console.log(err))

module.exports = mongoose