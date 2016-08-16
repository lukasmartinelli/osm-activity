'use strict';

var TileDecadeChangelog = require('./changelog');

module.exports = function(tileLayers, tile, write, done) {
  var changelog = new TileDecadeChangelog(tile);
  tileLayers.osm.osm.features.forEach(function(ft) {
    changelog.track(ft);
  });

  done(null, changelog.toGeoJSON());
};
