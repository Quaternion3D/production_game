var mongoose = require("mongoose");

// set discriminator key, else default will be __t
//timestamps:true adds default values "updatedAt" and "createdAt" (ISODate)
var options = {discriminatorKey: 'type', timestamps: true};

var PropertySchema = new mongoose.Schema(
    {
        //will we need to know this property's owner?
        name:               {type: String, default:"Property"},
        build_cost:         {type: Number, default:0},
        run_cost:           {type: Number, default:0},
        production_rate:    {type: Number, default:1},
        storage_capacity:   {type: Number, default: 100},
        inventory_count:    {type: Number, default: 0},
        resource_type:      {type: String, default: "ore"}, //but types of ore?!
        num_employees:      {type: Number, default:1},
        max_employees:      {type: Number, default:10}
    }, options);


module.exports = mongoose.model("Property", PropertySchema);