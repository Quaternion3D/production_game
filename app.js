var express = require("express");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//tell express to serve public directory as well
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("index.ejs")
});

// app.get("/hello/:thing", function(req, res){
//     var thing = req.params.thing
//     res.render("page1.ejs", {thingVar: thing})
// })


// //need npm install body-parser plus code at the top
// app.post("/add", function(req,res){
//     console.log(req.body);
//     res.redirect("/hello/redirected")
// });


//404 catch-all, MUST be after all other routes
app.get("*", function(req,res){
    res.send("404 page not found");
});


//tell express to listen for requests (start server)
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});