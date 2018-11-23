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
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // when updating the address the 'Point' type should be set implicitly
  req.body.location.type = 'Point';
  // find && update
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns the new store instead of the old one
    runValidators: true // force model to run validators on updating not only creating
  }).exec(); // exec is called to awake all validators
  req.flash('success', `${store.name} updated! <a href="/stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) return next(); // to show 404 if no store was found.
  res.render('store', { title: `${store.name}`, store });
};

exports.getStoresByTags = async (req, res) => {
  // const tags = await Store.getTagsList();
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true }; // a tag or any store that has a tag property
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  // this will accomplish both requests to db async-way
  // (it will take time a longest query will fullfil)
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tags', { tags, title: 'Tags', tag, stores });
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
