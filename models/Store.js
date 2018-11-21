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

storeSchema.pre('save', async function(next) {
	if (!this.isModified('name')) return next();
	this.slug = slugs(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storeWithSlug = await this.constructor.find({ slug: slugRegEx }); // this.constructor - to address the model
	if (storeWithSlug.length) this.slug = `${this.slug}-${storeWithSlug.length + 1}`;  
  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum : 1 } }},
    { $sort: { count: -1 }}
  ]);
};

module.exports = mongoose.model('Store', storeSchema);
