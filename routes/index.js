var express = require("express");
var router = express.Router();

var User                    = require("../models/user"),
    Property                = require("../models/property"),
    MineProperty            = require("../models/mine"),
    // Deal                    = require("../models/deal"),
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
    if (req.user.funds >= req.body.build_cost){
        MineProperty.create(
            {
                name:                   req.body.name,
                resource_type:          req.body.resource_type,
                build_cost:             req.body.build_cost,
                run_cost:               req.body.run_cost,
                production_rate:        req.body.production_rate,
                storage_capacity:       req.body.storage_capacity,
                inventory_count:        req.body.inventory_count,
            }, function(err,mine_data){
            if(err){
                console.log(err);
            } else {
                req.user.funds = req.user.funds - req.body.build_cost;
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
        //TODO: output this error to the user
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

router.get("/ajax/properties-table", isLoggedIn, function(req, res){
    User.findOne({username: req.user.username}).populate("properties").exec(function(err,user){
        if(err){
            console.log(err);
        } else {
            res.render("partials/property-table.ejs", {currentUser:user});
        }
    });
});

//TODO:check that it belongs to req.user
router.get("/ajax/:id", isLoggedIn, function(req, res){
    //assuming ID is a property (not user or other model in another collection)
    //is it bad if we're updating the DB on a get? is that a thing?
    Property.findOne({_id: req.params.id}, function(err,property_data){
        if(err){
            //if nothing found will it err?
            console.log(err);
            //redirect?
        } else {
            res.render("modal.ejs", {property: property_data}, function(err, html)
            {
                res.send(html);
            });
        }
    });
});

router.post("/ajax/:id/:cmd", isLoggedIn, function(req, res){
    console.log("here" + req.params.id + req.params.cmd)
    Property.findOne({_id: req.params.id}, function(err,property_data){
        if(err){
            console.log(err);
        } else {
            if (req.params.cmd == "hire"){
                property_data.num_employees += 1;
                //TODO: set a limit on how many employees you can have
                property_data.production_rate += 1;
                //TODO: maybe something more complex here, like a ratio of employees to production rate
                property_data.run_cost += 1;
            } else if (req.params.cmd == "fire"){
                if (property_data.num_employees > 0) {
                    property_data.num_employees -= 1;
                } else {
                    property_data.num_employees = 0;
                }
                if (property_data.production_rate > 0) {
                    property_data.production_rate -= 1;
                } else {
                    property_data.production_rate = 0;
                }
                if (property_data.run_cost > 0) {
                    property_data.run_cost -= 1;
                } else {
                    property_data.run_cost = 0;
                }
            }

            console.log("saving");

            //when we update, we probably lose some production here (since updatedAt is incremented)
            //but that kinda makes sense because you're in a staff transition period
            //also it's only losing < 5 units
            property_data.save(function(err, data){
                if(err){
                    console.log(err);
                } else {
                    res.send({property:property_data}); //send updated property back
                }
            });
        }
    });
})

// router.get("/ajax/new-deal", isLoggedIn, function(req, res){
//     res.render("partials/new_deal.ejs");
// });
//
// router.post("/ajax/new-deal", isLoggedIn, function(req, res){
//     //todo: specify what kind of property to buy
//     //also ask "are you sure?"
//     var new_deal =
//         {
//             user1_id:           req.user._id,
//             user1_name:         req.user.username,
//             resource_type1:     req.body.resource_type1,
//             quantity1:          req.body.quantity1,
//             user2_id:           0,
//             user2_name:         "gov",
//             resource_type2:     req.body.resource_type2,
//             quantity2:          req.body.quantity2,
//             next_shipment:      req.body.next_shipment,
//             num_left:           req.body.num_left,
//             interval:           req.body.interval
//         };
//
//     // Deal.create(new_deal, function(err,deal_data){
//     //     if(err){
//     //         console.log(err);
//     //     } else {
//     //         req.user.deals.push(deal_data);
//     //         //also push to user2 if they're a real user
//     //         req.user.save(function(err, data){
//     //             if(err){
//     //                 console.log(err);
//     //             } else {
//     //                 res.redirect("/dashboard");
//     //             }
//     //         });
//     //     }
//     // });
// })



//404 catch-all, MUST be after all other routes
router.get("*", function(req,res){
    res.send("404 page not found");
});


module.exports = router;
