'use strict';

//Optimize GeoJSON property structure for creating vector tiles
function toVectorTileCompatibleGeoJSON(ft) {
    const tile = ft.properties.tile;
    ft.properties = {
        total: ft.properties.total,
        tile_x: tile.x,
        tile_y: tile.y,
        tile_z: tile.z,
    }
    return ft;
}

module.exports = toVectorTileCompatibleGeoJSON;
