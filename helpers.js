/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/
'use strict';

const fs = require('fs');

exports.moment = require('moment');

// Dump is a debugging function (sort of "console.log")
exports.dump = obj => JSON.stringify(obj, null, 2);

// Static map helper function
exports.staticMap = ([lng, lat]) => `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${process.env.MAP_KEY}&markers=${lat},${lng}&scale=2`;

exports.icon = name => fs.readFileSync(`./public/images/icons/${name}.svg`);

exports.siteName = 'Markets!';

exports.menu = [
  { slug: '/stores', title: 'Stores', icon: 'store', },
  { slug: '/tags', title: 'Tags', icon: 'tag', },
  { slug: '/top', title: 'Top', icon: 'top', },
  { slug: '/add', title: 'Add', icon: 'add', },
  { slug: '/map', title: 'Map', icon: 'map', },
];
