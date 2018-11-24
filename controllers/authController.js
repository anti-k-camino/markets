'use strict';

const passport = require('passport');

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
