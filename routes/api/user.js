var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../../models/User');
var crypto=require('crypto');

exports.postLogin = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.send(errors);
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return res.end(err);
        }
        if (!user) {
            return res.end('no user found');
        }
        req.logIn(user, function(err) {
            if (req.body.remember==true) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
            } else {
                req.session.cookie.expires = false; // Cookie expires at end of session
            }
            if (err) {
                return res.end(err);
            }
            res.end('logged in');
        });


    })(req, res, next);
};

exports.logout = function(req, res) {
    req.logout();
    res.send("logged out");
};

exports.postSignUp = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('City', 'City must not be not Empty').notEmpty();
    req.assert('PhoneNumber', 'Phone number must not be Empty').notEmpty();
    req.assert('UserType', 'user type must not be Empty').notEmpty();

    if(req.body.UserType === 'Driver'){
        req.assert('CarType', 'Car type must not be Empty').notEmpty();
        req.assert('CarYear', 'Car year must not be Empty').notEmpty();
        req.assert('CarLicensePlateNumber', 'License plate must not be Empty').notEmpty();
    }

    var errors = req.validationErrors();

    if (errors) {
        return res.send(errors);
    }

    // create user object
    var newUser = new User({
        email: req.body.email,
        password: req.body.password,
        City: req.body.City,
        PhoneNumber: req.body.PhoneNumber,
        UserType: req.body.UserType,
        CarType: req.body.CarType,
        CarYear: req.body.CarYear,
        CarLicensePlateNumber: req.body.CarLicensePlateNumber

    });

    User.findOne({
        email: req.body.email
    }, function(err, existsUser) {
        if (existsUser) {
           return res.end('user_exist');
        }
        newUser.save(function(err) {
            if (err) {
                return res.end(err);
            }
            res.end('done');
        });

    });
};

exports.getUserData = function(req, res, next) {
    var query = User.find();

    query.exec(function(err, users) {
        if (err) {
            return next(err);
        }
        if(!users){
            return res.send('There exists no users in the database');
        }
        res.send(users);
    });
};

//post route for updating password
exports.updateUserPassword = function(req,res,next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();
    
    if(errors){
        return res.send(errors);
    }
    User.findById(req.params.id, function(err,user){
        if(err){
            return next(err);
        }
        if(!user){
            return res.send('There is no user account by that id');
        }
        user.password = req.body.password;
        user.save(function(err){
            if(err){
                return next(err);
            }
            res.end('Password has been changed');
        });
    });
};


//post to reset password
exports.resetUserPassword = function(req,res,next) {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);

    var errors = req.validationErrors();

    if(errors){
        return res.send(errors);
    }

    async.waterfall([
        function(done){
            User
                .findOne({ passwordResetToken:req.params.token})
                .where('passwordResetExpires').gt(Date.now())
                .exec(function(err,user){
                    if(err){
                        return next(err);
                    }
                    if(!user){
                        return res.end('Token is invalid or has expired');
                    }
                    user.password = req.body.password;
                    user.passwordResetToken = '';
                    user.passwordResetExpires = '';
                    user.save(function(err){
                        if(err){
                            return next(err);
                        }
                        done(err,user);
                    });
                });
        },
        function(user,done) {
            var transporter = nodemailer.createTransport({
                service : 'Mailgun',
                auth : {
                    user: process.env.Mailgun_user,
                    pass: process.env.Mailgun_pass
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.website_email,
                subject: 'Your account password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            transporter.sendMail(mailOptions,function(err){
                res.end('Success! Your password has been changed.');
            });
        }
    ], function(err) {
        if(err){
            return next(err);
        }
    });
};
//post route send link to reset password
exports.sendUserPasswordResetLink = function(req,res,next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    
    var errors = req.validationErrors();
    
    if(errors){
        return res.send(errors);
    }

    async.waterfall([
        function(done){
            crypto.randomBytes(16, function(err,buf){
                var token = buf.toString('hex');
                done(err,token);
            });
        },
        function(token,done){
            User.findOne({email: req.body.email}, function(err,user){
                if(!user){
                    return res.end('There exists no account that is connected to this email');
                }

                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now()+ 3600000;
                user.save(function(err){
                    done(err,token,user);
                });
            });
        },
        function(token,user,done){
            var transporter = nodemailer.createTransport({
                service : 'Mailgun',
                auth : {
                    user: process.env.Mailgun_user,
                    pass: process.env.Mailgun_pass
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.website_email,
                subject: 'Reset your password on Travel Easy Canada',
                text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'https://' + req.headers.host + '/api/user/update/password/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions,function(err){
                res.end('An e-mail has been sent to ' + user.email + ' with further instructions.');
                //done(err, 'done');
            });
        }
    ], function(err){
       if(err){
           return next(err);
       }
    });
};
