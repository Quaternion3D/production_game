var mongoose = require("mongoose");

// set discriminator key, else default will be __t
var options = {discriminatorKey: 'type'};

var PropertySchema = new mongoose.Schema(
    {
        employees: {type: Number, default:1}
    }, options);


module.exports = mongoose.model("Property", PropertySchema);