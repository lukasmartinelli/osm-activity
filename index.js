'use strict';

var tileReduce = require('tile-reduce');
var path = require('path');

var changelogs = [];

tileReduce({
  bbox: [5.86, 45.75, 10.61, 48.23],
  zoom: 12,
  map: path.join(__dirname, '/count.js'),
  sources: [{
	name: 'osm',
	mbtiles: path.join(__dirname, './switzerland.mbtiles'),
  }],
  raw: true,
})
.on('reduce', function(changelog) {
  changelogs.push(changelog);
})
.on('end', function() {
  console.log('Changelogs total: %d', changelogs.length);
});
