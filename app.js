var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/game");

var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoos = require("passport-local-mongoose");
var User = require("./models/user");
var expressSession = require("express-session");

//tell express to serve public directory as well
app.use(express.static("public"));

// passport configuration
app.use(expressSession({
    secret: "random sentence for encoding",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware to add user parameter to every route
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
})




//////////////ROUTES\\\\\\\\\\\\\\\

app.get("/", function(req, res){
    console.log(req.user);
    res.render("index.ejs", {currentUser: req.user});
});

app.get("/signup", function(req, res){
    res.render("signup.ejs");
})

app.post("/signup", function(req, res){
    req.body.username
    req.body.password
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err){
            console.log(err);
            return res.render('signup.ejs');
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/dashboard");
        })
    });
})


app.get("/login", function(req, res){
    res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedicrect: "/login"
    }), function(req, res){
    console.log("LOGIN: " + req.user);
});


app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login.ejs");
}

app.get("/dashboard", function(req, res){
    console.log(req.user);
    res.render("dashboard.ejs", {currentUser: req.user});
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