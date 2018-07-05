/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');
var dotenv = require('dotenv');
var MongoStore = require('connect-mongo/es5')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var fs = require("fs");
var https = require('https');
var http = require('http');
var HTTP_PORT = 3102;
var HTTPS_PORT = 3101;

/**
*  route handlers
*/
var Trip = require('./routes/api/trip');
var PassengerRequests = require('./routes/api/PassengerRequest');
var User = require('./routes/api/user');
/**
*	page render routes
*/
var pageRenders = require('./routes/rendering/rendering');

/**
 * Create Express server.
 */
var app = express();


/**
* api keys and passport configuration
*/
var passportConfiguration = require('./config/passport');

/**
* load env file
*/
dotenv.load({path:'.env.test'});

/**
* connect to mongodb
*/
mongoose.connect(process.env.MONGODB_TEST || process.env.MONGOLAB_URL_TEST);
mongoose.connection.on('error', function(){
	console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  	process.exit(1);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.set('port', process.env.PORT || 3000);
//app.set('port_https', 3443);
app.use(compress());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
  	secret: process.env.SESSION_SECRET_TEST,
  	store: new MongoStore({
    url: process.env.MONGODB_TEST || process.env.MONGOLAB_URI_TEST,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use(function(req, res, next) {
//   if (req.path === '/api/request/addPassengerRequests') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
//app.use(lusca.xframe('SAMEORIGIN'));
//app.use(lusca.xssProtection(true));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use("/",express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use("/controllers", express.static(__dirname + '/controllers')),{ maxAge: 31557600000 };


//function to restrict the permissions of the route to a certain role
function requireRole(role){
    return function(req,res,next){
      if( req.user.UserType === role){
          next();
      }
      else {
          res.redirect('https://'+req.hostname+'/404.html');
      }
    };
};

app.get('/',pageRenders.getMain);
app.get('/404.html',pageRenders.get404);
app.get('/reset',pageRenders.getReset);
app.get('/main',passportConfiguration.isAuthenticated,pageRenders.getMain);
app.get('/post',passportConfiguration.isAuthenticated,requireRole('Driver'),pageRenders.getPost);
app.get('/modifypost/:id',passportConfiguration.isAuthenticated,requireRole('Driver'),pageRenders.getModifyPost);
app.get('/modifyrequest/:id',passportConfiguration.isAuthenticated,pageRenders.getModifyRequest);
app.get('/api/user/update/password/:token',pageRenders.getReset);
app.get('/personal',passportConfiguration.isAuthenticated,pageRenders.getPersonal);
app.get('/request',passportConfiguration.isAuthenticated,pageRenders.getRequest);
app.get('/tripdetail/:id',passportConfiguration.isAuthenticated,pageRenders.getTripDetail);
app.get('/requestedtripdetail/:id',passportConfiguration.isAuthenticated,pageRenders.getRequestedTripDetail);
app.get('/login',pageRenders.getLogin);

app.get('/getCurrentUserID',passportConfiguration.isAuthenticated,function(req,res){
  
    res.end(req.user.id);

});
app.get('/getCurrentUserEmail',passportConfiguration.isAuthenticated,function(req,res){
  
    res.end(req.user.email);

});
app.get('/getCurrentUserCity',passportConfiguration.isAuthenticated,function(req,res){
  
    res.end(req.user.City);

});
app.get('/getCurrentUserCarType',passportConfiguration.isAuthenticated,function(req,res){
  
    res.end(req.user.CarType);

});

app.get('/getCurrentUserPhoneNumber',passportConfiguration.isAuthenticated,function(req,res){
  
    res.end(req.user.PhoneNumber);

});
app.get('/getCurrentUserType',passportConfiguration.isAuthenticated,function(req,res){
  
    res.end(req.user.UserType);

});


app.get('/api/users/getAll',passportConfiguration.isAuthenticated,requireRole('Admin'),User.getUserData);
app.get('/api/trip/getTrips',passportConfiguration.isAuthenticated,Trip.getTrips);
app.get('/api/trip/getTripbyId/:id',passportConfiguration.isAuthenticated,Trip.getTripbyId);
app.get('/api/request/getPassengerRequests',passportConfiguration.isAuthenticated,PassengerRequests.getPassengerRequests);
app.get('/api/request/getPassengerRequestbyId/:id',passportConfiguration.isAuthenticated,PassengerRequests.getPassengerRequestbyId);
app.get('/api/request/getRequestsByUserId/:id',passportConfiguration.isAuthenticated,PassengerRequests.getRequestsbyUserId);
app.get('/api/trip/getTripsByUserId/:id',passportConfiguration.isAuthenticated,Trip.getTripsbyUserId);


app.post('/api/user/login',User.postLogin);
app.post('/api/user/logout',passportConfiguration.isAuthenticated,User.logout);
app.post('/postregister',User.postSignUp);
app.post('/api/user/resetpassword',User.sendUserPasswordResetLink);
app.post('/api/user/update/password/:token',User.resetUserPassword);
app.post('/api/trip/addTrip',passportConfiguration.isAuthenticated,requireRole('Driver'),Trip.addTrip);
app.post('/api/trip/modifyTrip/:id',passportConfiguration.isAuthenticated,requireRole('Driver'),Trip.modifyTrip);
app.post('/api/trip/deleteTrip/:id',passportConfiguration.isAuthenticated,requireRole('Driver'),Trip.deleteTrip);
app.post('/api/request/addPassengerRequests',passportConfiguration.isAuthenticated,PassengerRequests.addPassengerRequests);
app.post('/api/request/modifyPassengerRequest/:id',passportConfiguration.isAuthenticated,PassengerRequests.modifyPassengerRequest);
app.post('/api/request/deletePassengerRequest/:id',passportConfiguration.isAuthenticated,PassengerRequests.deletePassengerRequest);
app.post('/api/trip/contact',passportConfiguration.isAuthenticated,Trip.sendcontactmessage);
app.post('/api/request/contact',passportConfiguration.isAuthenticated,PassengerRequests.sendcontactmessage);


var insecureServer = http.createServer(app).listen(HTTP_PORT, function() {
  console.log('Insecure Server listening on port ' + HTTP_PORT);
})

module.exports = app;