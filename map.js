'use strict';

const Changelog = require('./changelog');
const turf = require('turf');

// Turn BBOX into point (for overview)
function generalizeAsPoint(ft) {
    return turf.centroid(ft);
}

module.exports = function(tileLayers, tile, write, done) {
  const changelog = new Changelog(tile);
  tileLayers.osm.osm.features.forEach(ft => changelog.track(ft));

  const feature = changelog.toGeoJSON();
  if(global.mapOptions.usePoint) {
    const pointFeature = generalizeAsPoint(feature);
    pointFeature.properties = feature.properties;
    done(null, pointFeature);
  } else {
    done(null, feature);
  }
};
