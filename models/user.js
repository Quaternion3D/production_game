var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    funds: {type: Number, default: 100},
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property"
        }  
    ],
    deals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deal"
        }  
    ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);