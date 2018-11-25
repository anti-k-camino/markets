'use strict';

const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You Are Now Logged Out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You have to be logged in!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists.');
    return res.redirect('/login');
  }
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `A password reset link was emailed to you! <a href=${resetURL}>RESET ${resetURL}</a>`);
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired.');
    return res.redirect('/login');
  }
  res.render('resetPassword', { title: 'Reset Password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) return next();
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired.');
    return res.redirect('/login');
  }
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  req.login(updatedUser);
  req.flash('success', 'Your password has been reset. You are now logged in.');
  res.redirect('/');
};
