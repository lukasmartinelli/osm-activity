'use strict';

const _ = require('lodash');
const tilebelt = require('tilebelt');
const path = require('path');
const JSONStream = require('JSONStream');
const fs = require('fs');

class NullHistoryStore {
    end() {}
    store() {}
}

// Stores history of tiles in files grouped by parent tile index
// this is used to generate JSON files that can be hosted
// on GitHub pages
class HistoryStore {
    constructor(directory, storeZoomLevel) {
        this.directory = path.normalize(directory);
        this.storeZoomLevel = storeZoomLevel;
        this.tileFiles = {};
        this.idxDimension = Math.pow(2, this.storeZoomLevel);
        this.zoomDirectory = path.join(this.directory, this.storeZoomLevel.toString());
        fs.mkdirSync(this.directory);
        fs.mkdirSync(this.zoomDirectory);

        // The size of the x and y dimensions
        _.range(0, this.idxDimension).forEach(x => {
           this.tileFiles[x] = {};
           fs.mkdirSync(path.join(this.zoomDirectory, x.toString()));
           _.range(0, this.idxDimension).forEach(y => {
             const fileStream = fs.createWriteStream(path.join(this.zoomDirectory, x.toString(), y.toString() + ".json"));
             const jsonStream = JSONStream.stringifyObject();
             jsonStream.pipe(fileStream);
             this.tileFiles[x][y] = jsonStream;
           });
        });

        JSONStream.stringify()
    }

    // Close all tile streams
    end() {
        _.range(0, this.idxDimension).forEach(x => {
           _.range(0, this.idxDimension).forEach(y => {
             this.tileFiles[x][y].end();
           });
        });
    }

    findAncestor(tile) {
        let parent = tilebelt.getParent(tile);
        if (parent[2] <= this.storeZoomLevel) {
            return parent;
        } else {
            return this.findAncestor(parent);
        }
    }

    // Store a feature history in the appropriate JSON file
    // of the parent
    store(feature) {
        const props = feature.properties;
        const parentTile = this.findAncestor(props.tile);
        const x = parentTile[0];
        const y = parentTile[1];
        const stream = this.tileFiles[x][y];

        //NOTE: Probably as fast as a multidimensional dict since JavaScript turns integer keys
        //into strings anyway
        const tileIdx = props.tile.join('/');
        stream.write([tileIdx, props.months]);
    }
}

module.exports = {
    HistoryStore: HistoryStore,
    NullHistoryStore, NullHistoryStore
}
