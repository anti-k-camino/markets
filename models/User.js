'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Check if there is still a bug with mongoose(was once stated in start.js)
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email'],
    required: 'Please Supply An Email Address'
  },
  name: {
    type: String,
    required: 'Please Supply A Name',
    trim: true
  }
});

userSchema.virtual('gravatar').get(function () {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler); // pretty error-messages(in case of unique: true etc.).

module.exports = mongoose.model('User', userSchema);
