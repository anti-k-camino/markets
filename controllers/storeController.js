'use strict';
const mongoose = require('mongoose');
const Store = mongoose.model('Store'); // that comes from using 'singleton' by mongoose
// while loading model (it has to be loaded just once, in start.js in our case)

exports.homePage = (req, res) => res.render('index');

exports.addStore = (req, res) => res.render('editStore', { title: 'Add Store' });

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Store ${store.name} added!`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', { title: `Edit ${store.name}`, store })
};

exports.updateStore = async (req, res) => {
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns the new store instead of the old one
    runValidators: true // force model to run validators on updating not only creating
  }).exec();
  req.flash('success', `${store.name} updated! <a href="/stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

///////////// Composition ////////////
// In order to handle errors on of the ways to avoid try-catch block
// is to wrap async function into another function
// (./handlers/errorHandler.js)
// const catchErrors = (fn) => {
//   return function(req, res, next) {
//     return fn(req, res, next).catch(next);
//   };
// };
// This should be used in a middleware chain(app.js)
// ( in index.js catchErrors wraps createStore ).
////////////////////////////////////////

// exports.createStore = (req, res) => {
  // const store = new Store(req.body);

    // res.json(req.body); we receive store object submited by a form 
    // than it goes through bodyParser (a middleware in app.js) to get POST's body

    // store.save((err, store) => { // that is the old way of handling asyc operations 
    //   if (err) throw err;        // by callbacks
    //   console.log('Saved!');
    //   res.redirect('/');
    // });

    // .save()
    // .then(async store => {
    //   const stores = await Store.find(); // to list all the stores
    //   res.json(stores);
    // })
    // .catch(err => { 
    //   throw Error(err);
    // });

    // console.log("It worked");

// };
