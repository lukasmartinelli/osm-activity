# osm-tileupdates [![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](https://tldrlegal.com/license/mit-license)

A [Tile Reduce](https://github.com/mapbox/tile-reduce) processor to count
the changes within a tile over the years, quarters and months.

[**:globe_with_meridians: Check the web map to see OSM update statistics for your region**](http://naturalearthtiles.org)

## Download

You can download the resulting GeoJSON file from the [latest GitHub release](https://github.com/lukasmartinelli/osm-tileupdates/releases/latest). Please ping me if you require other data formats.

## Run yourself

First install the required dependencies. You need to new Node version (`> 5`).

```
npm install
```

Now download the [Mapbox QA Tiles](https://www.mapbox.com/blog/osm-qa-tiles/).

```bash
curl -o planet.mbtiles.gz https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz
gunzip planet.mbtiles.gz
```

Invoke the `index.js` file with the planet file and output parameters. Collecting statistics is optional but helps interpreting the data.

```bash
node index.js -m planet.mbtiles -o changes.geojson -s stats.json
```

Scanning through the 2.5 million tiles on 40 cores takes 20 minutes to do the entire analysis.

## Generate Vector Tiles

You can use the huge MBTiles to create vector tiles (used for the heatmap visualization).

```
tippecanoe world.geojson -o tile_updates.mbtiles -l 'tile_updates' -z 5 -Z 5 -B 5
```
