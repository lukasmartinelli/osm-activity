'use strict';

const _ = require('lodash');
const turf = require('turf');
const tilebelt = require('tilebelt');

function quarters(months) {
    return [
        _.sum(months.slice(0, 2)),
        _.sum(months.slice(3, 5)),
        _.sum(months.slice(6, 8)),
        _.sum(months.slice(9, 11)),
    ];
}

// Create a new changelog object which contains years and quarters
// The changelog tracks how many updates a tile has received until
class TileDecadeChangelog {
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

    toGeoJSON() {
        let ft = tilebelt.tileToGeoJSON(this.tile);
        ft.properties = {
            years: _(this.years).toPairs().map(kvp => {
                const year = kvp[0];
                const months = kvp[1];
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
}

module.exports = TileDecadeChangelog;
