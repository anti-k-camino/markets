'use strict';
const mongoose = require('mongoose');
const Store = mongoose.model('Store'); // singleton concept by mongoose(models are loaded only once)
const multer = require('multer'); // handling "multipart/form-data"
const jimp = require('jimp');
const uuid = require('uuid');
const multerOptions = {
  storage: multer.memoryStorage(), // uploads should be resized before saving to disk
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) next(null, true); // null stands for no errors, true - a value that should be passed next
    else next({ message: 'That type is not allowed!' }, false);
  }
};

exports.homePage = (req, res) => res.render('index');

exports.addStore = (req, res) => res.render('editStore', { title: 'Add Store' });

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no file to resize
  if (!req.file) return next(); // req.file property was set by multer middleware
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next(); 
};

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
  // when updating the address the 'Point' type should be set implicitly
  // if (req.body.location) {
    req.body.location.type = 'Point';
  // }
  // find && update
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns the new store instead of the old one
    runValidators: true // force model to run validators on updating not only creating
  }).exec(); // exec is called to awake all validators
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
