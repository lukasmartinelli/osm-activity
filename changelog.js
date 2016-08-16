'use strict';

var _ = require('lodash');
var turf = require('turf');
var tilebelt = require('tilebelt');

// Create a new changelog object which contains years and quarters
// The changelog tracks how many updates a tile has received until
//
function TileDecadeChangelog(tile) {
    this.tile = tile;
    this.years = {};
    _.range(2000, 2017).forEach(year => {
        this.years[year] = _.range(0, 12).map(_ => 0);
    });
}

TileDecadeChangelog.prototype.track = function(ft) {
	var date = new Date(parseInt(ft.properties["@timestamp"]) * 1000);
    this.years[date.getFullYear()][date.getMonth()] += 1;
}

function quarters(months) {
    return [
        _.sum(months.slice(0, 2)),
        _.sum(months.slice(3, 5)),
        _.sum(months.slice(6, 8)),
        _.sum(months.slice(9, 11)),
    ];
}

TileDecadeChangelog.prototype.toGeoJSON = function() {
    var ft = tilebelt.tileToGeoJSON(this.tile);
    ft.properties = {
        years: _(this.years).toPairs().map(kvp => {
            var year = kvp[0];
            var months = kvp[1];
            return [year, {
                year: _.sum(months),
                quarters: quarters(months),
                months: months,
            }]
        }).fromPairs(),
        tile:{
            x: this.tile[0],
            y: this.tile[1],
            z: this.tile[2],
        },
    };
    ft.properties.total = _(ft.properties.years)
        .values(ft.properties.years)
        .map(y => y.year)
        .sum();
    return ft;
}

module.exports = TileDecadeChangelog;
