var express                 = require("express"),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    User                    = require("./models/user"),
    Property                = require("./models/property"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    expressSession          = require("express-session"),
    seedDB                  = require("./seeds");
    
var app = express();

//socket.io setup
var server = require("http").Server(app);
var io = require("socket.io")(server);

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


io.on('connection', function (socket) {
    console.log("user connected");
    socket.emit('news', { hello: 'world' });
    socket.on('join', function(data) {
        console.log(data);
        socket.emit('messages','Hello from server');
    });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    var intervalID = setInterval(function(){
        socket.emit('update')
    }, 5000);
});

//also need to subtract all running properties' run costs from our funds
function update_all_properties(){
    //only reason it's update instead of find is to update the updatedAt value
    Property.find({},function(err,all_properties){
        if(err){
            console.log(err);
        } else {
            all_properties.forEach(function(property_data) {
                var now = new Date();
                var diff = (now - property_data.updatedAt) / 1000; //in s
                property_data.inventory_count = Math.min(property_data.storage_capacity, Math.round(property_data.inventory_count + diff * property_data.production_rate));
                //future things here: once inventory is full change status of property to "inactive", send notification
                property_data.save(function(err, data){
                    if(err){
                        console.log(err);
                    } else {
                        
                    }
                });
            });
        }
    });
}

var intervalID = setInterval(update_all_properties,5000)




//tell express to listen for requests (start server)
server.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});