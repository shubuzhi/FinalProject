var mongoose = require("mongoose");


var PassengerRequestsSchema = new mongoose.Schema ({
    PassengerId : String,
    PassengerEmail:String,
    PassengerPhoneNumber:String,
    DepartureTime : String,
    RequestedSeats : Number,
    City : String,
    DepartureLocation : String,
    DestinationLocation : String,
    Comments : [{
        UserId: Number,
        Comment: String,
        DatePosted : Date
    }]
});


module.exports = mongoose.model('PassengerRequests',PassengerRequestsSchema);