'use strict';

const tileReduce = require('tile-reduce');
const path = require('path');
const fs = require('fs');
const geoJSONStream = require('geojson-stream');
const program = require('commander');
const ChangelogStats = require('./stats');

program
    .option('-o, --out-file <f>', 'GeoJSON target file')
    .option('-m, --mbtiles-file <f>', 'MBTiles source file')
    .option('-s, --stats-file <f>', 'Store gathered statistics')
    .option('--no-history', 'Only keep total and tile coords as GeoJSON properties')
    .option('--point', 'Use point not BBOX as GeoJSON geometry')
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
      mapOptions: {
          noHistory: program.noHistory,
          usePoint: program.point,
      },
      sources: [{
        name: 'osm',
        mbtiles: path.normalize(program.mbtilesFile),
      }],
      raw: true,
    })
    .on('reduce', changelog => {
      changedFeatureCount += changelog.properties.total;
      stats.trackTile(changelog);
      featureStream.write(changelog);
    })
    .on('end', () => {
      featureStream.end();
      console.log('Total changed features: %d', changedFeatureCount);
      if(program.statsFile) {
          let report = stats.report();
          if(program.noHistory) {
            delete report.years;
          }
          fs.writeFileSync(program.statsFile, JSON.stringify(report, null, 4));
      }
    });
} else {
    program.help();
}
