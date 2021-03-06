/**
 * Builds the HTML for each file in the given results
 * Created by Martin Koster on 3/2/15.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q');

var HtmlFormatter = require('./HtmlFormatter'),
    IndexHtmlBuilder = require('./IndexHtmlBuilder'),
    StatUtils = require('./StatUtils'),
    Templates = require('./Templates');


var DEFAULT_CONFIG = {
    successThreshold: 80
};

(function(module) {
    'use strict';

    var FileHtmlBuilder = function(config) {
        this._config = _.merge({}, DEFAULT_CONFIG, config);
    };

    /**
     * creates an HTML report for each file within the given results
     * @param {Array} fileResults mutation results for each file
     * @param {string} baseDir the base directory in which to write the reports
     */
    FileHtmlBuilder.prototype.createFileReports = function(fileResults, baseDir) {
        var promises = [];

        _.forEach(fileResults, function(fileResult) {
            promises.push(Q.Promise(function(resolve) {
                var self = this,
                    results = fileResult.mutationResults,
                    formatter = new HtmlFormatter(fileResult.src);

                formatter.formatSourceToHtml(results, function(formattedSource) {
                    writeReport(fileResult, formatter, formattedSource.split('\n'), baseDir, self._config);
                    resolve();
                });
            }));
        }, this);

        return Q.all(promises);
    };

    /**
     * write the report to file
     */
    function writeReport(fileResult, formatter, formattedSourceLines, baseDir, config) {
        var fileName = fileResult.fileName,
            stats = StatUtils.decorateStatPercentages(fileResult.stats),
            parentDir = path.normalize(baseDir + '/..'),
            mutations = formatter.formatMutations(fileResult.mutationResults),
            breadcrumb = new IndexHtmlBuilder(baseDir).linkPathItems({
                currentDir: parentDir,
                fileName: baseDir + '/' + fileName + '.html',
                separator: ' >> ',
                relativePath: getRelativeDistance(baseDir + '/' + fileName, baseDir ),
                linkDirectoryOnly: true
            });

        var file = Templates.fileTemplate({
            sourceLines: formattedSourceLines,
            mutations: mutations
        });

        fs.writeFileSync(
            path.join(baseDir, fileName + ".html"),
            Templates.baseTemplate({
                style: Templates.baseStyleTemplate({ additionalStyle: Templates.fileStyleCode }),
                script: Templates.baseScriptTemplate({ additionalScript: Templates.fileScriptCode }),
                fileName: path.basename(fileName),
                stats: stats,
                status: stats.successRate > config.successThreshold ? 'killed' : stats.all > 0 ? 'survived' : 'neutral',
                breadcrumb: breadcrumb,
                generatedAt: new Date().toLocaleString(),
                content: file
            })
        );
    }

    function getRelativeDistance(baseDir, currentDir) {
        var relativePath = path.relative(baseDir, currentDir),
            segments = relativePath.split(path.sep);

        return _.filter(segments, function(segment) {
            return segment === '.' || segment === '..';
        }).join('/');
    }

    module.exports = FileHtmlBuilder;
})(module);
