var mongoose    = require("mongoose"),
    //User        = require("./models/user"),
    Property    = require("./models/property"),
    MineProperty = require("./models/mine");

mongoose.connect("mongodb://localhost/test");

var userSchema = new mongoose.Schema({
    name: String,
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property"
        }    
    ]
})
var User = mongoose.model("User", userSchema);

// User.create({
//     name: "henry"
// });


// set discriminator key, else default will be __t
// var options = {discriminatorKey: 'type'};

// var PropertySchema = new mongoose.Schema(
//     {
//         employees: {type: Number, default:1}
//     }, options);

// var Property = mongoose.model("Property", PropertySchema);


// var MineProperty = Property.discriminator("Mine", new mongoose.Schema(
//     {
//         miners: {type: Number, default: 0}
//     }, options));


// var genericProperty = new Property();
// Property.create({}, function(err,data){
//     console.log(data);
// });

// User.create({username:"test1"}, function(err,user){
//     console.log(user)
//     Property.create({}, function(err,property){
//         if(err){
//             console.log(err);
//         } else {
//             user.properties.push(property);
//         }
//     });
// });

//var mineProperty = new MineProperty();
// MineProperty.create({}, function(err,mine_data){
//     //console.log(data);
//     User.findOne({username: "test1"}, function(err, foundUser){
//         if(err){
//             console.log(err);
//         } else {
//             foundUser.properties.push();
//         }
//     });
// });

Property.findOne({}, function(err,property){
    if(err){
        console.log(err);
    } else {
        console.log(property)
        User.findOne({name: "henry"}, function(err, foundUser){
            if(err){
                console.log(err);
            } else {
                foundUser.properties.push(property);
                foundUser.save(function(err, data){
                    if(err){
                        console.log(err);
                    } else {
                        console.log(data);
                    }
                });
                console.log(foundUser);
            }
        });
    }
    
});



