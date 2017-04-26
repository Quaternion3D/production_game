var mongoose    = require("mongoose"),
    Property    = require("./property");
    
var options = {discriminatorKey: 'type'};

var MineProperty = Property.discriminator("Mine", new mongoose.Schema(
    {
        miners: {type: Number, default: 0}
    }, options));
    
module.exports = MineProperty