'use strict';

const tileReduce = require('tile-reduce');
const path = require('path');
const fs = require('fs');
const geoJSONStream = require('geojson-stream');
const program = require('commander');
const ChangelogStats = require('./stats');
const history = require('./history');

program
    .option('-o, --geojson-file <f>', 'GeoJSON target file')
    .option('-j, --history-tile-dir <d>', 'Directory to store JSON histories of the tiles')
    .option('-m, --mbtiles-file <f>', 'MBTiles source file')
    .option('-s, --stats-file <f>', 'Store gathered statistics')
    .option('--point', 'Use point not BBOX as GeoJSON geometry')
    .parse(process.argv);

if(program.mbtilesFile && program.geojsonFile) {
    const stats = new ChangelogStats();
    const outputStream = fs.createWriteStream(program.geojsonFile);
    const featureStream = geoJSONStream.stringify();
    featureStream.pipe(outputStream);

    let changedFeatureCount = 0;
    let tileHistory = new history.NullHistoryStore();
    if(program.historyTileDir) {
        tileHistory = new history.HistoryStore(program.historyTileDir, 5);
    }

    tileReduce({
      zoom: 12,
      map: path.join(__dirname, '/map.js'),
      mapOptions: {
          usePoint: program.point,
      },
      sources: [{
        name: 'osm',
        mbtiles: path.normalize(program.mbtilesFile),
        raw: true
      }]
    })
    .on('reduce', (feature, tile) => {
      changedFeatureCount += feature.properties.total;
      stats.trackTile(feature);
      featureStream.write(feature);
      tileHistory.store(feature);
    })
    .on('end', () => {
      featureStream.end();
      console.log('Total changed features: %d', changedFeatureCount);

      if(program.historyFile) {
          fs.writeFileSync(program.historyFile, JSON.stringify(tileHistory));
      }
      tileHistory.end();
    });
} else {
    program.help();
}
