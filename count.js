'use strict';

var _ = require('lodash');

// Create a new changelog object which contains years and quarters
// The changelog tracks how many updates a tile has received until
//
function TileDecadeChangelog(x, y, z) {
    this.tile = {
        "x": x,
        "y": y,
        "z": z,
    };
    var years = {};
    _.range(2000, 2017).forEach(function(year) {
        years[year] = {
            "Q1": 0,
            "Q2": 0,
            "Q3": 0,
            "Q4": 0,
        };
    });
    this.years = years;
}

TileDecadeChangelog.prototype.track = function(ft) {
	var date = new Date(parseInt(ft.properties["@timestamp"]) * 1000);
    var year = date.getFullYear();
    var quarter = Math.round((date.getMonth() + 1) / 4);
    this.years[String(year)]["Q" + quarter] += 1;
}

module.exports = function(tileLayers, tile, write, done) {
  var changelog = new TileDecadeChangelog(tile[0], tile[1], tile[2]);
  tileLayers.osm.osm.features.forEach(function(ft) {
    changelog.track(ft);
  });

  done(null, changelog);
};
