'use strict';

var tileReduce = require('tile-reduce');
var turf = require('turf');
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
  console.log(changelog.properties.total);
  changelogs.push(changelog);
})
.on('end', function() {
  var geoJSON = turf.featureCollection(changelogs);
  console.log('Changelogs total: %d', changelogs.length);
});
