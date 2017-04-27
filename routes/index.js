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

//user must be populated with properties
function sum_resources(user) {
    var resource_list = {}; //list of resource names, each one has quantity and rate
    user.properties.forEach(function(current_property){
        var current_resource = current_property.resource_type;
        if (current_resource in resource_list){
            resource_list[current_resource].quantity += current_property.inventory_count;
            resource_list[current_resource].rate += current_property.production_rate;
        } else {
            resource_list[current_resource] = {quantity:current_property.inventory_count, rate: current_property.production_rate};
        }
    });
    return resource_list;
}

router.get("/dashboard", isLoggedIn, function(req, res){
    //update resource list
    //update production rates
    //if these aren't part of user they must be passed in separately
    
    User.findOne({username: req.user.username}).populate("properties").exec(function(err,user){
        if(err){
            console.log(err);
        } else {
            console.log(user);
            var resource_list = sum_resources(user);
            res.render("dashboard.ejs", {currentUser: user, resource_list:resource_list});
        }
    })
});

router.get("/buy", isLoggedIn, function(req, res){
    res.render("partials/buy.ejs"); 
});

router.post("/buy", isLoggedIn, function(req, res){
    //todo: specify what kind of property to buy
    //also ask "are you sure?"
    if (req.user.funds >= req.body.cost){
        MineProperty.create({name: req.body.name, cost: req.body.cost, revenue: req.body.revenue}, function(err,mine_data){
            if(err){
                console.log(err);
            } else {
                req.user.funds = req.user.funds - req.body.cost;
                req.user.properties.push(mine_data);
                req.user.save(function(err, data){
                    if(err){
                        console.log(err);
                    } else {
                        res.redirect("/dashboard");
                    }
                });
            }
        });
    } else {
        console.log("insufficient funds");
        res.redirect("/dashboard");
    }
})

////////////////AJAX ROUTES\\\\\\\\\\\\\\\\\\
router.get("/ajax/resources-table", isLoggedIn, function(req, res){
    //sum up the resources again and render the table from ejs
    User.findOne({username: req.user.username}).populate("properties").exec(function(err,user){
        if(err){
            console.log(err);
        } else {
            var resource_list = sum_resources(user);
            res.render("partials/resource-table.ejs", {resource_list:resource_list});
        }
    });
});

router.get("/ajax/:id", isLoggedIn, function(req, res){
    //assuming ID is a property (not user or other model in another collection)
    //is it bad if we're updating the DB on a get? is that a thing?
    Property.findOne({_id: req.params.id}, function(err,property_data){
        if(err){
            //if nothing found will it err?
            console.log(err);
            //redirect?
        } else {
            //TODO:check that it belongs to req.user
            //find difference between updatedAt and now
            //multiply with revenue and add to funds
            //var now = new Date();
            //var diff = now - property_data.updatedAt; //in ms
            //for this property, increase inventory (up to capacity) by diff * production_rate
            // property_data.inventory_count += (diff / 1000) * property_data.production_rate;
            // property_data.save(function(err, data){
            //     if(err){
            //         console.log(err);
            //     } else {
            //         res.render("modal.ejs", {property: property_data});
            //     }
            // });
            res.render("modal.ejs", {property: property_data});
        }
    });
});

//update function
//goes through all properties, calculates time difference, and updates their inventory




//404 catch-all, MUST be after all other routes
router.get("*", function(req,res){
    res.send("404 page not found");
});


module.exports = router;