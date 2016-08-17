'use strict';

const _ = require('lodash');
const turf = require('turf');
const tilebelt = require('tilebelt');

// The changelog tracks how many updates/modifications
// a tile has received over the years and months
class Changelog {
    constructor(tile) {
        this.tile = tile;
        this.years = _.fromPairs(_.range(2006, 2017).map(year => {
            return [year, _.range(0, 12).map(_ => 0)];
        }));
    }

    track(ft) {
        const date = new Date(parseInt(ft.properties["@timestamp"]) * 1000);
        this.years[date.getFullYear()][date.getMonth()] += 1;
    }

    // Create array that contains the modification count
    // across all months ranging from 2006 until todaya
    // The index is the month so
    // 0 -> January 2006
    // 13 -> February 2007
    monthHistory() {
        let months = [];
        _.range(2006, 2017).forEach(year => {
            months.push(...this.years[year])
        });
        return months;
    }

    toGeoJSON() {
        let geometry = tilebelt.tileToGeoJSON(this.tile);
        let properties = {
            months: this.monthHistory(),
            tile: this.tile,
        };
        properties.total = _.sum(properties.months);
        return turf.feature(geometry, properties);
    }
}

module.exports = Changelog;
