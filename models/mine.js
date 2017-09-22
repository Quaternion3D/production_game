var mongoose    = require("mongoose"),
    Property    = require("./property");
    
var options = {discriminatorKey: 'type'};

var MineProperty = Property.discriminator("Mine", new mongoose.Schema(
    {
        miners: {type: Number, default: 0}
        //storage_capacity: {type: Number, default: 100}
        //resource_type: {type: String, default: "ore"} //but types of ore?!
    }, options));
    
module.exports = MineProperty