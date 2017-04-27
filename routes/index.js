var express = require("express");
var router = express.Router();

var User                    = require("../models/user"),
    Property                = require("../models/property"),
    MineProperty            = require("../models/mine"),
    passport                = require("passport");


////////// INDEX / LOGIN / SIGNUP ROUTES \\\\\\\\\\\

router.get("/", function(req, res){
    res.render("index.ejs", {currentUser: req.user});
});

router.get("/signup", function(req, res){
    res.render("signup.ejs");
})

router.post("/signup", function(req, res){
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


router.get("/login", function(req, res){
    res.render("login.ejs");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedicrect: "/login"
    }), function(req, res){
    console.log("LOGIN: " + req.user);
});


router.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}



////////////USER ROUTES\\\\\\\\\\\\\\\

router.get("/dashboard", isLoggedIn, function(req, res){
    User.findOne({username: req.user.username}).populate("properties").exec(function(err,user){
        if(err){
            console.log(err);
        } else {
            res.render("dashboard.ejs", {currentUser: user});
        }
    })
});

router.post("/buy", isLoggedIn, function(req, res){
    MineProperty.create({}, function(err,mine_data){
        if(err){
            console.log(err);
        } else {
            req.user.properties.push(mine_data);
            req.user.save(function(err, data){
                if(err){
                    console.log(err);
                } else {
                    console.log(data);
                    res.redirect("/dashboard");
                }
            });
        }
    });
})

////////////////AJAX ROUTES\\\\\\\\\\\\\\\\\\
router.get("/ajax/:id", isLoggedIn, function(req, res){
    //assuming ID is a property (not user or other model in another collection)
    Property.findOne({_id: req.params.id}, function(err,property_data){
        if(err){
            //if nothing found will it err?
            console.log(err);
            //redirect?
        } else {
            //check that it belongs to req.user
            res.render("modal.ejs", {property: property_data});
        }
    });
})

//404 catch-all, MUST be after all other routes
router.get("*", function(req,res){
    res.send("404 page not found");
});


module.exports = router;