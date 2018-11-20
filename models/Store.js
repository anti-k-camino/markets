'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slugs = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a store name!'
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You have to supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You have to supply address!'
    }
  },
  photo: String
});

storeSchema.pre('save', function(next) {
	if (!this.isModified('name')) {
		next(); // skip it
		return; // stop this function from runnning. !!! this === return next() !!!
	}
	this.slug = slugs(this.name);
	next();
});

module.exports = mongoose.model('Store', storeSchema);
