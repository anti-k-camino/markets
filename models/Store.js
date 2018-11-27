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
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes Defined
storeSchema.index({
  name: 'text',
  description: 'text'
});
// geolocation(GEOSPATIAL)
// storeSchema.index({ location: '2dsphere' });

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

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    { 
      $lookup: {
        from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'
      }
    },
    { 
      $match: {
       'reviews.1': { $exists: true }
      }
    },
    // {
    //   $addField: {
    //     averageRating: { $avg: '$reviews.rating' }
    //   }
    // },
    {
      $project: { // noe addField can be used
        photo: '$$ROOT.photo',
        slug: '$$ROOT.slug',
        name: '$$ROOT.name',
        reviews: '$$ROOT.reviews',
        averageRating: { $avg: '$reviews.rating' }
      }
    },
    {
      $sort: { averageRating: -1 }
    },
    { $limit: 10 }
  ]);
};

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
});

function autopopulate(next) {
  this.populate('reviews');
  next();
};

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
