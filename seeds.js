var mongoose = require("mongoose"),
    Post = require("./models/post");
    
var data = [
    {},
    {}
]

function seedDB(){
    //Remove all posts
    Post.remove({}, function(err){
        if(err){
            console.log("error removing posts")
        }
    });
}


module.exports = seedDB;