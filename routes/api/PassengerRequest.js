var PassengerRequest = require('../../models/PassengerRequests');
var nodemailer = require('nodemailer');
//get trip route
exports.getPassengerRequests = function(req, res, next) {

    var query = PassengerRequest.find();

    //execute query to get all the trips
    query.exec(function(err, passengerrequests) {
        if (err) {
            return next(err);
        }
        if(!passengerrequests){
            return res.send('No requests in database');
        }
        res.send(passengerrequests);
    });
};

//get trip by id route
exports.getPassengerRequestbyId = function(req, res, next) {

    PassengerRequest.findById(req.params.id, function(err, passengerrequest) {
        if (err) {
            return next(err);
        }
        if(!passengerrequest){
            return res.send('There exists no request with that id');
        }
        res.send(passengerrequest);
    });

};

// add trip route
exports.addPassengerRequests = function(req, res, next) {


    //might need to add form validation checks to make sure everything is good
    req.assert('PassengerEmail', 'Passenger email can not be blank').notEmpty();
    req.assert('PassengerPhoneNumber', 'Passenger phone number can not be blank').notEmpty();
    req.assert('PassengerId', 'Passenger can not be blank').notEmpty();
    req.assert('DepartureTime', 'DepartureTime can not be blank').notEmpty();
    req.assert('RequestedSeats', 'There needs to be requested seats').notEmpty();
    req.assert('City', 'The city cannot be blank').notEmpty();
    req.assert('DepartureLocation', 'Location of Departure can not be blank').notEmpty();
    req.assert('DestinationLocation', 'Destination can not be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.send(errors);
    }

    var passengerrequest = new PassengerRequest({
        PassengerEmail: req.body.PassengerEmail,
        PassengerPhoneNumber: req.body.PassengerPhoneNumber,
        PassengerId: req.body.PassengerId,
        DepartureTime: req.body.DepartureTime,
        RequestedSeats: req.body.RequestedSeats,
        City: req.body.City,
        DepartureLocation: req.body.DepartureLocation,
        DestinationLocation: req.body.DestinationLocation
    });

    PassengerRequest
        .findOne({
            PassengerId: req.body.PassengerId
        })
        .where({
            DepartureTime: req.body.DepartureTime
        })
        .exec(function(err, existingrequest) {
            if (existingrequest) {
                return res.end('Request already exists with that information');
            }
            passengerrequest.save(function(err) {
                if (err) {
                    return next(err);
                }
                res.end('Request added');
                //add a redirect
            });
        });
};

//delete trip route
exports.deletePassengerRequest = function(req, res, next) {

    PassengerRequest.remove({
        _id: req.body.id
    }, function(err) {
        if (err) {
            return next(err);
        }
        res.end('Request deleted');
        //res.redirect('/');
    });
};

exports.modifyPassengerRequest = function(req, res, next) {

    req.assert('DepartureTime', 'DepartureTime can not be blank').notEmpty();
    req.assert('RequestedSeats', 'There needs to be requested seats').notEmpty();
    req.assert('City', 'The city cannot be blank').notEmpty();
    req.assert('DepartureLocation', 'Location of Departure can not be blank').notEmpty();
    req.assert('DestinationLocation', 'Destination can not be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.send(errors);
    }


    PassengerRequest.findById(req.body.id, function(err, trip) {
        if (err) {
            return next(err);
        }
        if(!trip){
            return res.send('There exists no request with this id');
        }

        //update all information
        
        trip.DepartureTime = req.body.DepartureTime || '';
        trip.RequestedSeats = req.body.RequestedSeats || '';
        trip.City = req.body.City || '';
        trip.DepartureLocation = req.body.DepartureLocation || '';
        trip.DestinationLocation = req.body.DestinationLocation || '';

        //save it again
        trip.save(function(err) {
            if (err) {
                return next(err);
            }
            res.end('success');
            //res.redirect('/'); //add when front end is added
        });
    });
};
exports.sendcontactmessage = function (req,res,next) {
        req.assert('recieverEmail', 'Please enter a valid email address').isEmail();
        req.assert('senderEmail', 'Message must not be empty').notEmpty();
        req.assert('Subject', 'Subject must not be empty').notEmpty();
        req.assert('Message', 'Message must not be empty').notEmpty();
        
        var errors = req.validationErrors();
        
        if(errors){
            return res.send(errors);
        }
        var transporter = nodemailer.createTransport({
            service : 'Mailgun',
            auth : {
                    user: process.env.Mailgun_user,
                    pass: process.env.Mailgun_pass
                }
        });
        var mailOptions = {
            to : req.body.recieverEmail,
            from: req.body.senderEmail,
            subject: req.body.Subject,
            text: req.body.Message
        };
        transporter.sendMail(mailOptions,function(err){
            if(err){
                return next(err);
            }
            res.end('Success! Your message has been sent.');
        })
};
exports.getRequestsbyUserId = function(req,res,next){

    var query = PassengerRequest.find();
    query.where({PassengerId:req.params.id});
    //execute query to get all the trips
    query.exec(function(err,requests){
        if(err){
            return next(err);
        }
        if(!requests){
            return res.end('There exists no requests for this user');
        }
        res.send(requests);
    });
};