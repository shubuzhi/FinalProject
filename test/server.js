var app = require('../server.js');
var User = require('../models/User');
var Trip = require('../models/Trip');
var passRequests = require('../models/PassengerRequests');
var requestone = require('supertest')(app);
var request = require('supertest');
var agent = request.agent(app);
var agenttwo = request.agent(app);


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//creating a driver and passenger account 
					//so we can test all the routes effectively
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('POST /postregister', function() {
  it('should create driver account', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('done', done);
  });
});

describe('POST /postregister', function() {
  it('should create passenger account', function(done) {

    var user = {  email: 'traveleasycanada@gmail.com',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Pasenger',
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('done', done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//siging into both accounts
///////////////////////////////////////////////////////////////////////////////////////////////////////
var id = '';
var idpass = ''

describe('POST /api/user/login', function() {

  	var loginuser = {
          	  email: 'jnicho64@uwo.ca',
              password: 'hello'
        };

  it('should log in driver', function(done) {
    agent
      .post('/api/user/login')
      .send(loginuser)
      .expect('logged in')
      .end(function(err, res){
            if (err) return done(err);
       		User
                .findOne({email: 'jnicho64@uwo.ca'})
                .exec(function(err,user){
                    if(err){
                        return next(err);
                    }
                    if(!user){
                        console.log('no user');
                        //return res.redirect('back');
                    }
                    id = user._id;
        	});
            done()
        });
  });
});

describe('POST /api/user/login', function() {

  	var loginuser = {
          	  email: 'traveleasycanada@gmail.com',
              password: 'hello'
        };

  it('should log in passenger', function(done) {
    agenttwo
      .post('/api/user/login')
      .send(loginuser)
      .expect('logged in')
      .end(function(err, res){
            if (err) return done(err);
       		User
                .findOne({email: 'traveleasycanada@gamil.com'})
                .exec(function(err,user){
                    if(err){
                        return next(err);
                    }
                    if(!user){
                        console.log('no user');
                    }
                    idpass = user._id;
        	});
            done()
        });
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing both route (/) and (/main) since they are the same
					// the only difference is that /main will redirect to the login page
					//but route (/) will render different pages depending on the user
					//if they are logged in or not
///////////////////////////////////////////////////////////////////////////////////////////////////////


//testing without logging in

describe('GET /', function() {
  it('should return html for login page', function(done) {
    requestone
      .get('/')
      .expect(200, done);
  });
});

describe('GET /main', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/main')
      .expect('Found. Redirecting to /login', done);
  });
});

//now testing with a logged in account (both tests pass since both do the same thing but /main has a redirect if the user isnt logged in and (/) route just renders the log in if the user is not signed in)


describe('GET /', function() {
  it('should return html for dashboard', function(done) {
    agent
      .get('/')
      .expect(200, done);
  });
});

describe('GET /main', function() {
  it('should return html for dashboard', function(done) {
    agent
      .get('/main')
      .expect(200, done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing reset route (/404.html)
					//just testing if we can access it without logging in
					// in later tests people will be redirected to this page if they do not have the required role
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /404.html', function() {
  it('should return html for 404 page', function(done) {
    requestone
      .get('/404.html')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing reset route (/reset)
					//just testing if we can access it without logging in
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /reset', function() {
  it('should return html for reset password page', function(done) {
    requestone
      .get('/reset')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing post route (/post)
///////////////////////////////////////////////////////////////////////////////////////////////////////

//testing witout logged in user to show it redirects to log in 
describe('GET /post', function() {
  it('should return html for login page', function(done) {
    requestone
      .get('/post')
      .expect('Found. Redirecting to /login', done);
  });
});


//now testing with logged in user that is driver
//should allow the user to access page
describe('GET /post', function() {
  it('should return html for post trip page', function(done) {
    agent
      .get('/post')
      .expect(200, done);
  });
});

//now testing with logged in suser that is passenger
//should redirect the user to 404 page
describe('GET /post', function() {
  it('should redirect to 404 page since user is passenger', function(done) {
    agenttwo
      .get('/post')
      .expect('Found. Redirecting to https://127.0.0.1/404.html', done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing request route (/request)
///////////////////////////////////////////////////////////////////////////////////////////////////////

//should redirect since we are not logged in 
describe('GET /request', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/request')
      .expect('Found. Redirecting to /login', done);
  });
});


//should allow us to access page since we are logged in 

describe('GET /request', function() {
  it('should return html for request page', function(done) {
    agent
      .get('/request')
      .expect(200, done);
  });
});



///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing modify post route (/modifypost/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////


//this should redirect since we are not signed in 
describe('GET /modifypost/:id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/modifypost/:id')
      .expect('Found. Redirecting to /login', done);
  });
});


//this should allow us to access since we are logged in as driver
describe('GET /modifypost/:id', function() {
  it('should return html for modifypost page', function(done) {
    agent
      .get('/modifypost/:id')
      .expect(200, done);
  });
});

//this should redirect since we are logged in as passenger
describe('GET /modifypost/:id', function() {
  it('should redirect to 404 page since user is a passenger', function(done) {
    agenttwo
      .get('/modifypost/:id')
      .expect('Found. Redirecting to https://127.0.0.1/404.html', done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing modify request route (/modifyrequest/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////

//this should redirect since we are not signed in 
describe('GET /modifyrequest/:id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/modifyrequest/:id')
      .expect('Found. Redirecting to /login', done);
  });
});

//this should allow us to access since we are logged in
describe('GET /modifyrequest/:id', function() {
  it('should return html for modifyrequest page', function(done) {
    agent
      .get('/modifyrequest/:id')
      .expect(200, done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing modify request route (/api/user/password/:token)
///////////////////////////////////////////////////////////////////////////////////////////////////////

//this should allow us to access the page even if not signed in 
describe('GET /api/user/update/password/:token', function() {
  it('should return the html for the update password page', function(done) {
    requestone
      .get('/api/user/update/password/:token')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing modify request route (/api/user/password/:token)
///////////////////////////////////////////////////////////////////////////////////////////////////////

//this should redirect us since we are not signed in 
describe('GET /personal', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/personal')
      .expect('Found. Redirecting to /login', done);
  });
});


//this should let us access personal dashboard since we are logged in 
describe('GET /personal', function() {
  it('should return html for personal dashboard', function(done) {
    agent
      .get('/personal')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing trip detail route (/tripdetail/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////

describe('GET /tripdetail/id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/tripdetail/:id')
      .expect('Found. Redirecting to /login', done);
  });
});


describe('GET /tripdetail/id', function() {
  it('should return the trip detail page', function(done) {
    agent
      .get('/tripdetail/:id')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing request detail route (/requestedtripdetail/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /requestedtripdetail/id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/requestedtripdetail/:id')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /requestedtripdetail/id', function() {
  it('should return html for request trip detail page', function(done) {
    agent
      .get('/requestedtripdetail/:id')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing login route (/login)
///////////////////////////////////////////////////////////////////////////////////////////////////////

//should be able to access login page
describe('GET /login', function() {
  it('should return html for login page', function(done) {
    requestone
      .get('/login')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing current user id route (/getCurrentUserID)
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /getCurrentUserID', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/getCurrentUserID')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /getCurrentUserID', function() {
  it('should return current user id', function(done) {
    agent
      .get('/getCurrentUserID')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing current user email route (/getCurrentUserEmail)
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /getCurrentUserEmail', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/getCurrentUserEmail')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /getCurrentUserEmail', function() {
  it('should return current user email', function(done) {
    agent
      .get('/getCurrentUserEmail')
      .expect(200, done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing current user city route (/getCurrentUserCity)
///////////////////////////////////////////////////////////////////////////////////////////////////////

describe('GET /getCurrentUserCity', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/getCurrentUserCity')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /getCurrentUserCity', function() {
  it('should return current user city', function(done) {
    agent
      .get('/getCurrentUserCity')
      .expect(200, done);
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing current user car type route (/getCurrentUserCarType)
///////////////////////////////////////////////////////////////////////////////////////////////////////

describe('GET /getCurrentUserCarType', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/getCurrentUserCarType')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /getCurrentUserCarType', function() {
  it('should return current user CarType', function(done) {
    agent
      .get('/getCurrentUserCarType')
      .expect(200, done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing current user phone number route (/getCurrentUserPhoneNumber)
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /getCurrentUserPhoneNumber', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/getCurrentUserPhoneNumber')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /getCurrentUserPhoneNumber', function() {
  it('should return current user phone number', function(done) {
    agent
      .get('/getCurrentUserPhoneNumber')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing current user type route (/getCurrentUserType)
///////////////////////////////////////////////////////////////////////////////////////////////////////

describe('GET /getCurrentUserType', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/getCurrentUserType')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /getCurrentUserType', function() {
  it('should return current user type', function(done) {
    agent
      .get('/getCurrentUserType')
      .expect(200, done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing get all user data route (/api/users/getAll)
///////////////////////////////////////////////////////////////////////////////////////////////////////

describe('GET /api/users/getAll', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/api/users/getAll')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /api/users/getAll', function() {
  it('should redirect to 404 page', function(done) {
    agent
      .get('/api/users/getAll')
      .expect('Found. Redirecting to https://127.0.0.1/404.html', done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing get trips route (/api/trip/getTrips)
///////////////////////////////////////////////////////////////////////////////////////////////////////


describe('GET /api/trip/getTrips', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/api/trip/getTrips')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /api/trip/getTrips', function() {
  it('should return empty array', function(done) {
    agent
      .get('/api/trip/getTrips')
      .expect('[]', done);
  });
});

var tripId = '';
//add trip to test if there was trips in database
describe('POST /api/trip/addTrip', function() {
  it('should return trip added', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('trip added')
      .end(function(err,res){

      		var query = Trip.findOne();

    	
    		query.exec(function(err,trip){
        		if(err){
            		return next(err);
        		}
        		tripId = trip._id;

    		});
      		done()
      });
  });
}); 


describe('GET /api/trip/getTrips', function() {
  it('should return the one trip that is in the database', function(done) {
    agent
      .get('/api/trip/getTrips')
      .expect('[{"_id":"'+tripId+'","DriverId":"'+id+'","DriverEmail":"jnicho64@uwo.ca","DriverPhoneNumber":"54654654654","DriverCarType":"adasdasd","DepartureTime":"2016/03/12","AvailableSeats":4,"Price":15,"City":"London","DepartureLocation":"London","DestinationLocation":"London","__v":0,"Comments":[],"Passengers":[]}]', done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing get trip by id route (/api/trip/getTripbyId/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /api/trip/getTripbyId/:id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/api/trip/getTripbyId/:id')
      .expect('Found. Redirecting to /login', done);
  });
});


describe('GET /api/trip/getTripbyId/'+id, function() {
  it('should return that there exists no trip by that id', function(done) {
    agent
      .get('/api/trip/getTripbyId/'+id)
      .expect('There exists no trip by that id', done);
  });
});

describe('GET /api/trip/getTripbyId/'+tripId, function() {
  it('should return the details of the trip', function(done) {
    agent
      .get('/api/trip/getTripbyId/'+tripId)
      .expect('{"_id":"'+tripId+'","DriverId":"'+id+'","DriverEmail":"jnicho64@uwo.ca","DriverPhoneNumber":"54654654654","DriverCarType":"adasdasd","DepartureTime":"2016/03/12","AvailableSeats":4,"Price":15,"City":"London","DepartureLocation":"London","DestinationLocation":"London","__v":0,"Comments":[],"Passengers":[]}',done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing get passenger requests route (/api/request/getPassengerRequests)
///////////////////////////////////////////////////////////////////////////////////////////////////////


describe('GET /api/request/getPassengerRequests', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/api/request/getPassengerRequests')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /api/request/getPassengerRequests', function() {
  it('should return an empty array since no passenger requests', function(done) {
    agent
      .get('/api/request/getPassengerRequests')
      .expect('[]', done);
  });
});

var passId = '';

describe('POST /api/request/addPassengerRequests', function() {
  it('should return Request Added', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('Request added')
      .end(function(err,res){

      		var query = passRequests.findOne();

    	
    		query.exec(function(err,passreq){
        		if(err){
            		return next(err);
        		}
        		passId = passreq._id;

    		});
      		done()
      });
  });
});

describe('GET /api/request/getPassengerRequests', function() {
  it('should return an return passenger request', function(done) {
    agent
      .get('/api/request/getPassengerRequests')
      .expect('[{"_id":"'+passId+'","PassengerEmail":"jnicho64@uwo.ca","PassengerPhoneNumber":"5645465465","PassengerId":"'+id+'","DepartureTime":"2016/12/12","RequestedSeats":5,"City":"London","DepartureLocation":"London","DestinationLocation":"London","__v":0,"Comments":[]}]', done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing get passenger requests by id route (/api/request/getPassengerRequestbyId/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////


describe('GET /api/request/getPassengerRequestbyId/:id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/api/request/getPassengerRequestbyId/:id')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /api/request/getPassengerRequestbyId/'+id, function() {
  it('should return empty array', function(done) {
    agent
      .get('/api/request/getPassengerRequestbyId/'+id)
      .expect('There exists no request with that id', done);
  });
});

describe('GET /api/request/getPassengerRequestbyId/'+passId, function() {
  it('should return individual request', function(done) {
    agent
      .get('/api/request/getPassengerRequestbyId/'+passId)
      .expect( '{"_id":"'+passId+'","PassengerEmail":"jnicho64@uwo.ca","PassengerPhoneNumber":"5645465465","PassengerId":"'+id+'","DepartureTime":"2016/12/12","RequestedSeats":5,"City":"London","DepartureLocation":"London","DestinationLocation":"London","__v":0,"Comments":[]}', done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing get trips by specific user route (/api/trip/getTripsByUserId/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////
describe('GET /api/trip/getTripsByUserId/:id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/api/trip/getTripsByUserId/:id')
      .expect('Found. Redirecting to /login', done);
  });
});

describe('GET /api/trip/getTripsByUserId/'+tripId, function() {
  it('should return there exists not trips for this user', function(done) {
    agent
      .get('/api/trip/getTripsByUserId/'+tripId)
      .expect('[]', done);
  });
});

describe('GET /api/trip/getTripsByUserId/'+id, function() {
  it('should return trip for user', function(done) {
    agent
      .get('/api/trip/getTripsByUserId/'+id)
      .expect('[{"_id":"'+tripId+'","DriverId":"'+id+'","DriverEmail":"jnicho64@uwo.ca","DriverPhoneNumber":"54654654654","DriverCarType":"adasdasd","DepartureTime":"2016/03/12","AvailableSeats":4,"Price":15,"City":"London","DepartureLocation":"London","DestinationLocation":"London","__v":0,"Comments":[],"Passengers":[]}]', done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing get passenger requests by specific user route (api/request/getRequestsByUserId/:id)
///////////////////////////////////////////////////////////////////////////////////////////////////////

describe('GET /api/request/getRequestsByUserId/:id', function() {
  it('should redirect to login page', function(done) {
    requestone
      .get('/api/request/getRequestsByUserId/:id')
      .expect('Found. Redirecting to /login', done);
  });
});


describe('GET /api/request/getRequestsByUserId/'+tripId, function() {
  it('should return empty array', function(done) {
    agent
      .get('/api/request/getRequestsByUserId/'+tripId)
      .expect('[]', done);
  });
});


describe('GET /api/request/getRequestsByUserId/'+id, function() {
  it('should return request for user', function(done) {
    agent
      .get('/api/request/getRequestsByUserId/'+id)
      .expect('[{"_id":"'+passId+'","PassengerEmail":"jnicho64@uwo.ca","PassengerPhoneNumber":"5645465465","PassengerId":"'+id+'","DepartureTime":"2016/12/12","RequestedSeats":5,"City":"London","DepartureLocation":"London","DestinationLocation":"London","__v":0,"Comments":[]}]', done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing sign up route (/postregister)
///////////////////////////////////////////////////////////////////////////////////////////////////////

//this one should say user exists
describe('POST /postregister', function() {
  it('should return user_exist', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('user_exist', done);
  });
});

//this one should output an error since server side check fails for email
describe('POST /postregister', function() {
  it('should return the error that email is not valid', function(done) {

    var user = {  email: 'jnicho64',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('[{"param":"email","msg":"Email is not valid","value":"jnicho64"}]', done);
  });
});

describe('POST /postregister', function() {
  it('should return error about password length', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: '',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect( '[{"param":"password","msg":"Password must be at least 4 characters long","value":""}]', done);
  });
});

describe('POST /postregister', function() {
  it('should return error about City', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: '',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('[{"param":"City","msg":"City must not be not Empty","value":""}]', done);
  });
});

describe('POST /postregister', function() {
  it('should return error about phone number', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: 'London',
            PhoneNumber: '',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('[{"param":"PhoneNumber","msg":"Phone number must not be Empty","value":""}]', done);
  });
});

describe('POST /postregister', function() {
  it('should return error about user type', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: '',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('[{"param":"UserType","msg":"user type must not be Empty","value":""}]', done);
  });
});

describe('POST /postregister', function() {
  it('should return error about car type', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: '',
            CarYear: '1976',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('[{"param":"CarType","msg":"Car type must not be Empty","value":""}]', done);
  });
});

describe('POST /postregister', function() {
  it('should return error about car year', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '',
            CarLicensePlateNumber: 'hfdfhjdhfjdf'
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('[{"param":"CarYear","msg":"Car year must not be Empty","value":""}]', done);
  });
});

describe('POST /postregister', function() {
  it('should return error about License plate', function(done) {

    var user = {  email: 'jnicho64@uwo.ca',
            password: 'hello',
            City: 'London',
            PhoneNumber: '5196157788',
            UserType: 'Driver',
            CarType: 'Ford Mustang',
            CarYear: '1976',
            CarLicensePlateNumber: ''
          };

    requestone
      .post('/postregister')
      .send(user)
      .expect('[{"param":"CarLicensePlateNumber","msg":"License plate must not be Empty","value":""}]', done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing login route (/api/user/login)
///////////////////////////////////////////////////////////////////////////////////////////////////////


 describe('POST /api/user/login', function() {

  	var loginuser = {
          	  email: 'jiaqi@uwo.ca',
              password: 'hello'
        };

  it('should return no user found', function(done) {
    requestone
      .post('/api/user/login')
      .send(loginuser)
      .expect('no user found',done);
  });
});

describe('POST /api/user/login', function() {

  	var loginuser = {
          	  email: '',
              password: 'hello'
        };

  it('should return error about email', function(done) {
    requestone
      .post('/api/user/login')
      .send(loginuser)
      .expect('[{"param":"email","msg":"Email is not valid","value":""}]',done);
  });
});

describe('POST /api/user/login', function() {

  	var loginuser = {
          	  email: 'jiaqi@uwo.ca',
              password: ''
        };

  it('should return error about password', function(done) {
    requestone
      .post('/api/user/login')
      .send(loginuser)
      .expect('[{"param":"password","msg":"Password cannot be blank","value":""}]',done);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing reset email password route (/api/user/resetpassword)
///////////////////////////////////////////////////////////////////////////////////////////////////////

var resetUser = {email: 'jnicho64@uwo.ca'};
var token = '';

 describe('POST /api/user/resetpassword', function() {
  it('should return An e-mail has been sent to jnicho64@uwo.ca with further instructions.', function(done) {
    requestone
      .post('/api/user/resetpassword')
      .send(resetUser)
      .expect('An e-mail has been sent to jnicho64@uwo.ca with further instructions.')
      .end(function(err,res){
      		User
                .findOne({email: resetUser.email})
                .exec(function(err,user){
                    if(err){
                        return next(err);
                    }
                    if(!user){
                        res.end('Token is invalid or has expired');
                        //return res.redirect('back');
                    }
                    token = user.passwordResetToken;
        		});
      		done()
      });
  });
});

 var resetUsertwo = {email: 'jiaqi@uwo.ca'};

 describe('POST /api/user/resetpassword', function() {
  it('should return that there is no account in the database with that email.', function(done) {
    requestone
      .post('/api/user/resetpassword')
      .send(resetUsertwo)
      .expect('There exists no account that is connected to this email', done);
  });
});


 var resetUserthree = {email: ''};

 describe('POST /api/user/resetpassword', function() {
  it('should return that there is no account in the database with that email.', function(done) {
    requestone
      .post('/api/user/resetpassword')
      .send(resetUserthree)
      .expect('[{"param":"email","msg":"Please enter a valid email address.","value":""}]', done);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
					//testing reset email password route (/api/user/update/password/:token)
///////////////////////////////////////////////////////////////////////////////////////////////////////

var newpassword = {password:'hello'};

describe('POST /api/user/update/password/'+token, function() {
  it('should return password changed', function(done) {
    requestone
      .post('/api/user/update/password/'+token)
      .send(newpassword)
      .expect('Success! Your password has been changed.', done);
  });
});


var newpasswordtwo = {password:''};

describe('POST /api/user/update/password/'+token, function() {
  it('should return password changed', function(done) {
    requestone
      .post('/api/user/update/password/'+token)
      .send(newpasswordtwo)
      .expect('[{"param":"password","msg":"Password must be at least 4 characters long.","value":""}]', done);
  });
});


var newpasswordthree = {password:'hello'};

describe('POST /api/user/update/password/'+id, function() {
  it('should return password changed', function(done) {
    requestone
      .post('/api/user/update/password/'+id)
      .send(newpasswordthree)
      .expect('Token is invalid or has expired', done);
  });
});





/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing all the possible cases for add trip (/api/trip/addTrip)
///////////////////////////////////////////////////////////////////////////////////////////////////////// 

describe('POST /api/trip/addTrip', function() {
  it('should redirect to login page', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    requestone
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('Found. Redirecting to /login', done);
  });
}); 


describe('POST /api/trip/addTrip', function() {
  it('should redirect to 404 page', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agenttwo
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('Found. Redirecting to https://127.0.0.1/404.html', done);
  });
}); 


describe('POST /api/trip/addTrip', function() {
  it('should return trip exists', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('Trip already exists with that information', done);
  });
});        

     describe('POST /api/trip/addTrip', function() {
  it('should return error about driver id', function(done) {

  		var tripone = {

          DriverId : '',
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"DriverId","msg":"Driver can not be blank","value":""}]', done);
  });
});

      describe('POST /api/trip/addTrip', function() {
  it('should return error about driver email', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : '',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"DriverEmail","msg":"Driver email can not be blank","value":""}]', done);
  });
});

       describe('POST /api/trip/addTrip', function() {
  it('should return error about driver phone number', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"DriverPhoneNumber","msg":"Driver phone number can not be blank","value":""}]', done);
  });
});

        describe('POST /api/trip/addTrip', function() {
  it('should return error about driver car type', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: '',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"DriverCarType","msg":"Driver car type can not be blank","value":""}]', done);
  });
});

         describe('POST /api/trip/addTrip', function() {
  it('should return error about departure time', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"DepartureTime","msg":"DepartureTime can not be blank","value":""}]', done);
  });
});

          describe('POST /api/trip/addTrip', function() {
  it('should return error about available seats', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: null,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"AvailableSeats","msg":"There needs to be avaiable seats","value":null}]', done);
  });
});

           describe('POST /api/trip/addTrip', function() {
  it('should return error about price', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: null,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"Price","msg":"The Price cannot be blank","value":null}]', done);
  });
});

            describe('POST /api/trip/addTrip', function() {
  it('should return error about City', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'',
          DepartureLocation:'London',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"City","msg":"The city cannot be blank","value":""}]', done);
  });
});

             describe('POST /api/trip/addTrip', function() {
  it('should return error about departure city', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'',
          DestinationLocation:'London'
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"DepartureLocation","msg":"Location of Departure can not be blank","value":""}]', done);
  });
});

              describe('POST /api/trip/addTrip', function() {
  it('should return error about destination location', function(done) {

  		var tripone = {

          DriverId : id,
          DriverEmail : 'jnicho64@uwo.ca',
          DriverPhoneNumber: '54654654654',
          DriverCarType: 'adasdasd',
          DepartureTime: '2016/03/12',
          AvailableSeats: 4,
          Price: 15,
          City:'London',
          DepartureLocation:'London',
          DestinationLocation:''
          };
    agent
      .post('/api/trip/addTrip')
      .send(tripone)
      .expect('[{"param":"DestinationLocation","msg":"Destination can not be blank","value":""}]', done);
  });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing modify trip route (/api/trip/modifyTrip/:id)
/////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe('POST /api/trip/modifyTrip/'+tripId, function() {
  it('should redirect to login page', function(done) {


		var tripone = {
			id : tripId,
          	DepartureTime: '2016/03/99',
          	AvailableSeats: 4,
          	Price: 15,
          	City:'London',
          	DepartureLocation:'London',
          	DestinationLocation:'London'
          };

    requestone
      .post('/api/trip/modifyTrip/'+tripId)
      .send(tripone)
      .expect('Found. Redirecting to /login', done);
  });
});

   describe('POST /api/trip/modifyTrip/'+tripId, function() {
  it('should redirect to 404 page', function(done) {


		var tripone = {
			id : tripId,
          	DepartureTime: '2016/03/99',
          	AvailableSeats: 4,
          	Price: 15,
          	City:'London',
          	DepartureLocation:'London',
          	DestinationLocation:'London'
          };

    agenttwo
      .post('/api/trip/modifyTrip/'+tripId)
      .send(tripone)
      .expect('Found. Redirecting to https://127.0.0.1/404.html', done);
  });
});

      describe('POST /api/trip/modifyTrip/'+tripId, function() {
  it('should return that trip was changed', function(done) {


		var tripone = {
			id : tripId,
          	DepartureTime: '2016/03/99',
          	AvailableSeats: 4,
          	Price: 15,
          	City:'London',
          	DepartureLocation:'London',
          	DestinationLocation:'London'
          };

    agent
      .post('/api/trip/modifyTrip/'+tripId)
      .send(tripone)
      .expect('success', done);
  });
});


       describe('POST /api/trip/modifyTrip/'+id, function() {
  it('should return that there exists no trip with this id', function(done) {


		var tripone = {
			id : id,
          	DepartureTime: '2016/03/99',
          	AvailableSeats: 4,
          	Price: 15,
          	City:'London',
          	DepartureLocation:'London',
          	DestinationLocation:'London'
          };

    agent
      .post('/api/trip/modifyTrip/'+id)
      .send(tripone)
      .expect('There exists no trip with this id', done);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing delete trip route (/api/trip/deleteTrip/:id)
/////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('POST /api/trip/deleteTrip/'+tripId, function() {
  it('should redirect to login page', function(done) {
    requestone
      .post('/api/trip/deleteTrip/'+tripId)
      .send({id: tripId})
      .expect('Found. Redirecting to /login', done);
  });
});

describe('POST /api/trip/deleteTrip/'+tripId, function() {
  it('should redirect to 404 page', function(done) {
    agenttwo
      .post('/api/trip/deleteTrip/'+tripId)
      .send({id: tripId})
      .expect('Found. Redirecting to https://127.0.0.1/404.html', done);
  });
});

describe('POST /api/trip/deleteTrip/'+id, function() {
  it('should return that trip was deleted', function(done) {
    agent
      .post('/api/trip/deleteTrip/'+id)
      .send({id: tripId})
      .expect('Trip deleted', done);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing trip contact route (/api/trip/contact)
/////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('POST /api/trip/contact', function() {
  it('should redirect to login page', function(done) {

  	var message =
  	{
  		recieverEmail:'jnicho64@uwo.ca',
        senderEmail: 'jnicho64@uwo.ca',
        Subject: 'hello',
        Message: 'hello'
  	};
    requestone
      .post('/api/trip/contact')
      .send(message)
      .expect('Found. Redirecting to /login', done);
  });
});


describe('POST /api/trip/contact', function() {
  it('should return Success! Your message has been sent.', function(done) {

  	var message =
  	{
  		recieverEmail:'jnicho64@uwo.ca',
        senderEmail: 'jnicho64@uwo.ca',
        Subject: 'hello',
        Message: 'hello'
  	};
    agent
      .post('/api/trip/contact')
      .send(message)
      .expect('Success! Your message has been sent.', done);
  });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing all the possible cases for add request (/api/request/addPassengerRequests)
///////////////////////////////////////////////////////////////////////////////////////////////////////// 

describe('POST /api/request/addPassengerRequests', function() {
  it('should redirect to login page', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    requestone
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('Found. Redirecting to /login',done);
  });
});


describe('POST /api/request/addPassengerRequests', function() {
  it('should return that a request already exists with that information', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('Request already exists with that information',done);
  });
});


describe('POST /api/request/addPassengerRequests', function() {
  it('should return error about passenger email', function(done) {

  		var tripone = {
			PassengerEmail: '',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"PassengerEmail","msg":"Passenger email can not be blank","value":""}]',done)
     
  });
});

describe('POST /api/request/addPassengerRequests', function() {
  it('should return error about passenger phone number', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"PassengerPhoneNumber","msg":"Passenger phone number can not be blank","value":""}]',done)
     
  });
});

describe('POST /api/request/addPassengerRequests', function() {
  it('should return error about passenger id', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: '',
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"PassengerId","msg":"Passenger can not be blank","value":""}]',done)
     
  });
});

describe('POST /api/request/addPassengerRequests', function() {
  it('should return error about departure time', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"DepartureTime","msg":"DepartureTime can not be blank","value":""}]',done)
     
  });
});

describe('POST /api/request/addPassengerRequests', function() {
  it('should return error about requested seats', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: null,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"RequestedSeats","msg":"There needs to be requested seats","value":null}]',done)
     
  });
});

describe('POST /api/request/addPassengerRequests', function() {
  it('should return error on City', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: '',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"City","msg":"The city cannot be blank","value":""}]',done)
     
  });
});

describe('POST /api/request/addPassengerRequests', function() {
  it('should return error on departure location', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: '',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"DepartureLocation","msg":"Location of Departure can not be blank","value":""}]',done)
     
  });
});

describe('POST /api/request/addPassengerRequests', function() {
  it('should return error about destination location', function(done) {

  		var tripone = {
			PassengerEmail: 'jnicho64@uwo.ca',
        	PassengerPhoneNumber: '5645465465',
        	PassengerId: id,
        	DepartureTime: '2016/12/12',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: ''
          };
    agent
      .post('/api/request/addPassengerRequests')
      .send(tripone)
      .expect('[{"param":"DestinationLocation","msg":"Destination can not be blank","value":""}]',done)
     
  });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing modify request route (/api/request/modifyPassengerRequest/:id)
/////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('POST /api/request/modifyPassengerRequest/'+passId, function() {
  it('should redirect to login page', function(done) {

  	var tripone = {
  			id: passId,
        	DepartureTime: '2016/12/99',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    requestone
      .post('/api/request/modifyPassengerRequest/'+passId)
      .send(tripone)
      .expect('Found. Redirecting to /login', done);
  });
});


describe('POST /api/request/modifyPassengerRequest/'+passId, function() {
  it('should return that the modify was successful', function(done) {

  	var tripone = {
  			id: passId,
        	DepartureTime: '2016/12/99',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/modifyPassengerRequest/'+passId)
      .send(tripone)
      .expect('success', done);
  });
});


describe('POST /api/request/modifyPassengerRequest/'+tripId, function() {
  it('should return there exists no passenger request with this id', function(done) {

  	var tripone = {
  			id: tripId,
        	DepartureTime: '2016/12/99',
        	RequestedSeats: 5,
        	City: 'London',
        	DepartureLocation: 'London',
        	DestinationLocation: 'London'
          };
    agent
      .post('/api/request/modifyPassengerRequest/'+tripId)
      .send(tripone)
      .expect('There exists no request with this id', done);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing delete request route (/api/trip/deletePassengerRequest/:id)
/////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('POST /api/request/deletePassengerRequest/'+passId, function() {
  it('should redirect to login page', function(done) {
   	requestone
      .post('/api/request/deletePassengerRequest/'+passId)
      .send({id:passId})
      .expect('Found. Redirecting to /login', done);
  });
});


describe('POST /api/request/deletePassengerRequest/'+passId, function() {
  it('should return request deleted', function(done) {
   	agent
      .post('/api/request/deletePassengerRequest/'+passId)
      .send({id:passId})
      .expect('Request deleted', done);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
				//testing request contact route (/api/trip/contact)
/////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('POST /api/request/contact', function() {
  it('should redirect to login page', function(done) {

  	var message =
  	{
  		recieverEmail:'jnicho64@uwo.ca',
        senderEmail: 'jnicho64@uwo.ca',
        Subject: 'hello',
        Message: 'hello'
  	};

    requestone
      .post('/api/request/contact')
      .send(message)
      .expect('Found. Redirecting to /login', done);
  });
});

describe('POST /api/request/contact', function() {
  it('should return Success! Your message has been sent.', function(done) {

  	var message =
  	{
  		recieverEmail:'jnicho64@uwo.ca',
        senderEmail: 'jnicho64@uwo.ca',
        Subject: 'hello',
        Message: 'hello'
  	};

    agent
      .post('/api/request/contact')
      .send(message)
      .expect('Success! Your message has been sent.', done);
  });
});



