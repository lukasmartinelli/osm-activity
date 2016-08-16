'use strict';

var _ = require('lodash');
var turf = require('turf');
var tilebelt = require('tilebelt');

// Create a new changelog object which contains years and quarters
// The changelog tracks how many updates a tile has received until
//
function TileDecadeChangelog(tile) {
    var years = {};
    _.range(2000, 2017).forEach(function(year) {
        years[year] = _.range(0, 12).map(function() { return 0; });
    });
    this.years = years;
    this.tile = tile;
}

TileDecadeChangelog.prototype.track = function(ft) {
	var date = new Date(parseInt(ft.properties["@timestamp"]) * 1000);
    this.years[date.getFullYear()][date.getMonth()] += 1;
}

TileDecadeChangelog.prototype.toGeoJSON = function() {
    var ft = tilebelt.tileToGeoJSON(this.tile);
    ft.properties = {
        years: this.years
    };
    return ft;
}

module.exports = TileDecadeChangelog;
