# osm-tileupdates [![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](https://tldrlegal.com/license/mit-license)

A [Tile Reduce](https://github.com/mapbox/tile-reduce) processor to count
the changes within a tile over the years, quarters and months.

## Installation

```
npm install
```

## Downloading OSM QA tiles

```bash
curl -o planet.mbtiles.gz https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz
gunzip planet.mbtiles.gz
```

## Run

```bash
node index -m planet.mbtiles -o changes.geojson -s stats.json
```
