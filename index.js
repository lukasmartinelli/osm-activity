'use strict';

const tileReduce = require('tile-reduce');
const path = require('path');
const fs = require('fs');
const geoJSONStream = require('geojson-stream');
let program = require('commander');

program
    .option('-o, --out-file <f>', 'GeoJSON target file')
    .option('-m, --mbtiles-file <f>', 'MBTiles source file')
    .parse(process.argv);

let changedFeatureCount = 0;
if(program.mbtilesFile && program.outFile) {
    let outputStream = fs.createWriteStream(program.outFile);
    let featureStream = geoJSONStream.stringify();
    featureStream.pipe(outputStream);

    tileReduce({
      bbox: [5.86, 45.75, 10.61, 48.23],
      zoom: 12,
      map: path.join(__dirname, '/count.js'),
      sources: [{
        name: 'osm',
        mbtiles: path.normalize(program.mbtilesFile),
      }],
      raw: true,
    })
    .on('reduce', changelog => {
      changedFeatureCount += changelog.properties.total;
      featureStream.write(changelog);
    })
    .on('end', () => {
      featureStream.end();
      console.log('Changed features: %d', changedFeatureCount);
    });
} else {
    program.help();
}
