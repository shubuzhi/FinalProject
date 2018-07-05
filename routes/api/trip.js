var Trip = require('../../models/Trip');
var nodemailer = require('nodemailer');
//get trip route
exports.getTrips = function(req,res,next) {

    var query = Trip.find();

    //execute query to get all the trips
    query.exec(function(err,trips){
        if(err){
            return next(err);
        }
        if(!trips){
            return res.send('there is no trips in the database');
        }
        res.send(trips);
    });
};

//get trip by id route
exports.getTripbyId = function(req,res,next) {

    Trip.findById(req.params.id, function(err,trip){
        if(err){
            return next(err);
        }
        if(!trip){
            return res.send('There exists no trip by that id');
        }
        res.send(trip);
    });

};

// add trip route
exports.addTrip = function(req,res,next) {


    //might need to add form validation checks to make sure everything is good
    req.assert('DriverId', 'Driver can not be blank').notEmpty();
    req.assert('DriverEmail', 'Driver email can not be blank').notEmpty();
    req.assert('DriverPhoneNumber', 'Driver phone number can not be blank').notEmpty();
    req.assert('DriverCarType', 'Driver car type can not be blank').notEmpty();
    req.assert('DepartureTime', 'DepartureTime can not be blank').notEmpty();
    req.assert('AvailableSeats', 'There needs to be avaiable seats').notEmpty()
    req.assert('Price', 'The Price cannot be blank').notEmpty();
    req.assert('City', 'The city cannot be blank').notEmpty();
    req.assert('DepartureLocation', 'Location of Departure can not be blank').notEmpty();
    req.assert('DestinationLocation', 'Destination can not be blank').notEmpty();
    
    var errors = req.validationErrors();

    if(errors){
        return res.send(errors);
    }

    var trip = new Trip ({
        DriverId : req.body.DriverId,
        DriverEmail : req.body.DriverEmail,
        DriverPhoneNumber: req.body.DriverPhoneNumber,
        DriverCarType:req.body.DriverCarType,
        DepartureTime : req.body.DepartureTime,
        AvailableSeats : req.body.AvailableSeats,
        Price:req.body.Price,
        City : req.body.City,
        DepartureLocation : req.body.DepartureLocation,
        DestinationLocation : req.body.DestinationLocation
    });

    Trip
        .findOne({DriverId:req.body.DriverId})
        .where({DepartureTime:req.body.DepartureTime})
        .exec(function(err,existingtrip){
            if(existingtrip) {
               return res.end('Trip already exists with that information');
            }
            trip.save(function(err){
                if(err){
                    return next(err);
                }
                res.end('trip added');
                //add a redirect
            });
        });
};

//delete trip route
exports.deleteTrip = function(req,res,next) {

	Trip.remove({ _id: req.body.id }, function(err){
		if(err){
			return next(err);
		}
		res.end('Trip deleted');
        //res.redirect('/');
	});
};

exports.modifyTrip = function(req,res,next) {

    req.assert('DepartureTime', 'Departure Time can not be blank').notEmpty();
    req.assert('AvailableSeats', 'There needs to be avaiable seats').notEmpty()
    req.assert('Price', 'The Price cannot be blank').notEmpty();
    req.assert('City', 'The city cannot be blank').notEmpty();
    req.assert('DepartureLocation', 'Location of Departure can not be blank').notEmpty();
    req.assert('DestinationLocation', 'Destination can not be blank').notEmpty();

    var errors = req.validationErrors();
    
    if(errors){
        return res.send(errors);
    }

	Trip.findById(req.body.id,function(err,trip){
		if(err){
			return next(err);
		}
        if(!trip){
            return res.send('There exists no trip with this id');
        }

		//update all information
    	trip.DepartureTime = req.body.DepartureTime || '';
    	trip.AvailableSeats = req.body.AvailableSeats || '';
        trip.Price= req.body.Price || '';
        trip.City = req.body.City || '';
    	trip.DepartureLocation = req.body.DepartureLocation || '';
    	trip.DestinationLocation = req.body.DestinationLocation || '';

		//save it again
		trip.save(function(err){
			if(err){
				return next(err);
			}
			res.end('success');
            //res.redirect('/personal'); //add when front end is added
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
exports.getTripsbyUserId = function(req,res,next){
 
    var query = Trip.find();
    query.where({DriverId:req.params.id});
    //execute query to get all the trips
    query.exec(function(err,trips){
        if(err){
            return next(err);
        }
        if(!trips){
            return res.end('There exists no trips for this user');
        }
        res.send(trips);
    });
};