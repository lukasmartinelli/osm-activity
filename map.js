'use strict';

const Changelog = require('./changelog');
const turf = require('turf');

// Turn BBOX into point (for overview)
function generalizeAsPoint(ft, tile) {
    return turf.centroid(ft.toGeoJSON(tile[0], tile[1], tile[2]));
}

module.exports = function(tileLayers, tile, write, done) {
  const changelog = new Changelog(tile);
  for (var i = 0; i < tileLayers.osm.osm.length; i++) {
    changelog.track(tileLayers.osm.osm.feature(i));
  }

  const feature = changelog.toGeoJSON();
  if(global.mapOptions.usePoint) {
    const pointFeature = generalizeAsPoint(feature, tile);
    pointFeature.properties = feature.properties;
    done(null, pointFeature);
  } else {
    done(null, feature);
  }
};
