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
        }
    };
}

class ChangelogStats {
    constructor() {
        this.globalStats = new Stats();
        this.yearStats = _.fromPairs(_.range(2006, 2017).map(year => [year, new Stats()]));
    }

    trackTile(changelog) {
        const props = changelog.properties;
        this.globalStats.push(props.total);

        _(props.years).toPairs().forEach(kvp => {
            var year = kvp[0];
            var yearInfo = kvp[1];
            this.yearStats[year].push(yearInfo.year);
        });
    }

    report() {
        return {
            global: statisticsReport(this.globalStats),
            years: _(this.yearStats).toPairs().map(kvp => {
                return [kvp[0], statisticsReport(kvp[1])];
            }).fromPairs()
        };
    }
}

module.exports = ChangelogStats;
