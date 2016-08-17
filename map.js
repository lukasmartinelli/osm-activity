'use strict';

const TileDecadeChangelog = require('./changelog');
const turf = require('turf');

//Optimize GeoJSON property structure for creating vector tiles
function stripHistory(ft) {
    const tile = ft.properties.tile;
    ft.properties = {
        total: ft.properties.total,
        tile_x: tile.x,
        tile_y: tile.y,
        tile_z: tile.z,
    }
    return ft;
}

// Turn BBOX into point (for overview)
function generalizeAsPoint(ft) {
    return turf.centroid(ft);
}

module.exports = function(tileLayers, tile, write, done) {
  const changelog = new TileDecadeChangelog(tile);
  tileLayers.osm.osm.features.forEach(ft => changelog.track(ft));

  let feature = changelog.toGeoJSON();
  const originalProps = feature.properties;
  if(global.mapOptions.usePoint) {
    feature = generalizeAsPoint(feature);
    feature.properties = originalProps;
  }
  if(global.mapOptions.stripHistory) {
    feature = stripHistory(feature);
  }
  done(null, feature);
};
