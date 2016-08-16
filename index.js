'use strict';

const tileReduce = require('tile-reduce');
const path = require('path');
const fs = require('fs');
const geoJSONStream = require('geojson-stream');
const program = require('commander');
const ChangelogStats = require('./stats');
const toVectorTileCompatibleGeoJSON = require('./vt');

program
    .option('-o, --out-file <f>', 'GeoJSON target file')
    .option('-m, --mbtiles-file <f>', 'MBTiles source file')
    .option('-s, --stats-file <f>', 'Store gathered statistics')
    .option('--vt-compatible', 'Property names suited for vector tiles')
    .parse(process.argv);

let changedFeatureCount = 0;
if(program.mbtilesFile && program.outFile) {
    const outputStream = fs.createWriteStream(program.outFile);
    const featureStream = geoJSONStream.stringify();
    featureStream.pipe(outputStream);

    const stats = new ChangelogStats();
    tileReduce({
      zoom: 12,
      map: path.join(__dirname, '/map.js'),
      sources: [{
        name: 'osm',
        mbtiles: path.normalize(program.mbtilesFile),
      }],
      raw: true,
    })
    .on('reduce', changelog => {
      changedFeatureCount += changelog.properties.total;
      stats.trackTile(changelog);
      if(program.vtCompatible) {
          featureStream.write(toVectorTileCompatibleGeoJSON(changelog));
      } else {
          featureStream.write(changelog);
      }
    })
    .on('end', () => {
      featureStream.end();
      console.log('Total changed features: %d', changedFeatureCount);
      if(program.statsFile) {
          const report = JSON.stringify(stats.report(), null, 4);
          fs.writeFileSync(program.statsFile, report);
      }
    });
} else {
    program.help();
}
