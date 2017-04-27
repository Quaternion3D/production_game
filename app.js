var express                 = require("express"),
    app                     = express(),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    User                    = require("./models/user"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose    = require("passport-local-mongoose"),
    expressSession          = require("express-session"),
    seedDB                  = require("./seeds");
    
var allRoutes = require("./routes/index");
    
//seedDB();

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost/game");

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


app.use(allRoutes);






//tell express to listen for requests (start server)
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});