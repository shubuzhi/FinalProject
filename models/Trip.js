var mongoose = require("mongoose");


var TripSchema = new mongoose.Schema ({
    DriverId : String,
    DriverEmail : String,
    DriverCarType : String,
    DriverPhoneNumber:String,
    Passengers : [{
        passengerId : String
    }],
    DepartureTime : String,
    AvailableSeats : Number,
    Price : Number,
    City : String,
    DepartureLocation : String,
    DestinationLocation : String,
    Comments : [{
        UserId: Number,
        Comment: String,
        DatePosted : Date
    }]
});


module.exports = mongoose.model('Trip',TripSchema);