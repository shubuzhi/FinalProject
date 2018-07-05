var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema ({
    email: { type: String, lowercase: true, unique: true },
    password: String,
    City : String,
    PhoneNumber : String,
    UserType : String,
    CarType : String,
    CarYear : String,
    CarLicensePlateNumber : String,
    passwordResetToken: String,
    passwordResetExpires: Date
});

UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User',UserSchema);