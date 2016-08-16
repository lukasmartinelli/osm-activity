'use strict';

const _ = require('lodash');

//Optimize GeoJSON property structure for creating vector tiles
function toVectorTileCompatibleGeoJSON(ft) {
    const tile = ft.properties.tile;
    const props = {
        total: ft.properties.total,
        tile_x: tile.x,
        tile_y: tile.y,
        tile_z: tile.z,
    };

    const monthNames = ["january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"];
    _(ft.properties.years).toPairs().forEach(kvp => {
        const year = kvp[0];
        const yearInfo = kvp[1];

        props[year + "_year"] = yearInfo.year;
        yearInfo.quarters.forEach((q, i) => {
            props[year + "_q" + (i+1)] = q;
        });
        yearInfo.months.forEach((m, i) => {
            props[year + "_" + monthNames[i]] = m;
        });
    })

    ft.properties = props;
    return ft;
}

module.exports = toVectorTileCompatibleGeoJSON;
