'use strict';

const tileReduce = require('tile-reduce');
const path = require('path');
const fs = require('fs');
const geoJSONStream = require('geojson-stream');
const program = require('commander');
const ChangelogStats = require('./stats');

program
    .option('-o, --geojson-file <f>', 'GeoJSON target file')
    .option('-j, --history-file <f>', 'JSON file to store history')
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

    //TODO: tile history contains 2.5 mio entries and not really memory friendly
    //turn this into a stream
    let tileHistory = {tiles: {}};

    tileReduce({
      zoom: 12,
      map: path.join(__dirname, '/map.js'),
      mapOptions: {
          usePoint: program.point,
      },
      sources: [{
        name: 'osm',
        mbtiles: path.normalize(program.mbtilesFile),
      }],
      raw: true,
    })
    .on('reduce', (changelog, tile) => {
      changedFeatureCount += changelog.properties.total;
      stats.trackTile(changelog);
      featureStream.write(changelog);

      //NOTE: Probably as fast as a multidimensional dict since JavaScript turns integer keys
      //into strings anyway
      const tileIdx = tile.join('/')
      tileHistory.tiles[tileIdx] = changelog.properties.months;
    })
    .on('end', () => {
      featureStream.end();
      console.log('Total changed features: %d', changedFeatureCount);

      if(program.historyFile) {
          tileHistory.stats = stats.report();
          fs.writeFileSync(program.historyFile, JSON.stringify(tileHistory));
      }

      if(program.statsFile) {
          fs.writeFileSync(program.statsFile, JSON.stringify(stats.report(), null, 4));
      }
    });
} else {
    program.help();
}
