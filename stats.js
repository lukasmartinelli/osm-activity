'use strict';

const _ = require('lodash');
const Stats = require('fast-stats').Stats;

function statisticsReport(stats) {
    return {
        mean: stats.amean(),
        percentile: {
            "10": stats.percentile(10),
            "20": stats.percentile(20),
            "30": stats.percentile(30),
            "40": stats.percentile(40),
            "50": stats.percentile(50),
            "60": stats.percentile(60),
            "70": stats.percentile(70),
            "80": stats.percentile(80),
            "90": stats.percentile(90),
            "95": stats.percentile(95),
            "99": stats.percentile(99),
        }
    };
}

class ChangelogStats {
    constructor() {
        //All values lower than lowThreshold are discarded
        //like a bandpass filter
        this.lowThreshold = 5;
        this.globalStats = new Stats();
    }

    trackTile(changelog) {
        const props = changelog.properties;
        if (props.total > this.lowThreshold) {
            this.globalStats.push(props.total);
        }
    }

    report() {
        return {
            global: statisticsReport(this.globalStats),
        };
    }
}

module.exports = ChangelogStats;
