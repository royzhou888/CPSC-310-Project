"use strict";
var Query_1 = require("./Query");
var Util_1 = require("../Util");
var util_1 = require("util");
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var JSZip = require('jszip');
        var zip = new JSZip();
        var fs = require('fs');
        var sections = [];
        var pArr = [];
        return new Promise(function (fulfill, reject) {
            var insight = {
                code: null,
                body: {},
            };
            if (id !== "courses") {
                insight.code = 400;
                insight.body = { "error": "not a course" };
                return reject(insight);
            }
            if (fs.existsSync(id)) {
                insight.code = 201;
                insight.body = { "success": "exist" };
            }
            else {
                insight.code = 204;
                insight.body = { "success": "not exist" };
            }
            zip.loadAsync(content, { 'base64': true }).then(function (value) {
                value.forEach(function (relativePath, file) {
                    pArr.push(file.async('string'));
                });
                Promise.all(pArr).then(function (listofContent) {
                    var theFileContent;
                    for (var _i = 0, listofContent_1 = listofContent; _i < listofContent_1.length; _i++) {
                        var oneFileContent = listofContent_1[_i];
                        try {
                            theFileContent = JSON.parse(oneFileContent);
                        }
                        catch (err) {
                            theFileContent = oneFileContent;
                        }
                        if (typeof theFileContent === 'object') {
                            for (var _a = 0, _b = theFileContent['result']; _a < _b.length; _a++) {
                                var section = _b[_a];
                                var processedSession = {};
                                processedSession[id + "_dept"] = section["Subject"];
                                processedSession[id + "_id"] = section["Course"];
                                processedSession[id + "_avg"] = section["Avg"];
                                processedSession[id + "_instructor"] = section["Professor"];
                                processedSession[id + "_title"] = section["Title"];
                                processedSession[id + "_pass"] = section["Pass"];
                                processedSession[id + "_fail"] = section["Fail"];
                                processedSession[id + "_audit"] = section["Audit"];
                                processedSession[id + "_uuid"] = section["id"];
                                sections.push(processedSession);
                            }
                        }
                    }
                    fs.writeFile(id, JSON.stringify(sections), function (err, data) {
                        if (err) {
                            insight.code = 400;
                            insight.body = { "error": "can't write the content to disk" };
                            reject(insight);
                        }
                        fulfill(insight);
                    });
                }).catch(function (err) {
                    Util_1.default.error("ERROR 1: " + err);
                    insight.code = 400;
                    insight.body = { "error": "error in promise.all" };
                    reject(insight);
                });
            }).catch(function (err) {
                Util_1.default.error("ERROR 2: " + err);
                insight.code = 400;
                insight.body = { "error": "error in async loading the zip" };
                reject(insight);
            });
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var fs = require('fs');
        var insight = { code: null, body: {} };
        return new Promise(function (fulfill, reject) {
            if (id !== "courses") {
                insight.code = 404;
                reject(insight);
            }
            if (fs.existsSync(id)) {
                fs.unlinkSync(id);
                insight.code = 204;
                fulfill(insight);
            }
            else {
                insight.code = 404;
                reject(insight);
            }
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var _this = this;
        var fs = require('fs');
        var sections;
        var matchedSections;
        return new Promise(function (fulfill, reject) {
            var that = _this;
            sections = new Array();
            matchedSections = new Array();
            try {
                if (_this.queryCheckValid(query)) {
                    var insight_1 = {
                        code: 424,
                        body: { "error": 'reject' },
                    };
                    reject(insight_1);
                }
                var queryObject = that.queryBuilder(query);
                var inputFile = fs.readFileSync('./courses', { 'encoding': 'utf8' });
                inputFile = JSON.parse(inputFile);
                for (var _i = 0, inputFile_1 = inputFile; _i < inputFile_1.length; _i++) {
                    var section = inputFile_1[_i];
                    if (_this.sectionMatchWithQuery(queryObject, section)) {
                        matchedSections.push(section);
                    }
                }
                var filteredMatchedSections;
                filteredMatchedSections = new Array();
                for (var _a = 0, matchedSections_1 = matchedSections; _a < matchedSections_1.length; _a++) {
                    var section = matchedSections_1[_a];
                    var simpleMatchedSectionObj = _this.filterWithColumn(queryObject, section);
                    filteredMatchedSections.push(simpleMatchedSectionObj);
                }
                if (!(util_1.isNullOrUndefined(queryObject.getQueryOption().getOrder()))) {
                    that.sortMatchedSection(filteredMatchedSections, queryObject.getQueryOption().getOrder());
                }
                console.log(filteredMatchedSections);
                var insight = {
                    code: 200,
                    body: _this.toJSON(filteredMatchedSections),
                };
                fulfill(insight);
                console.log('insight is successfully returned');
                fulfill(insight);
            }
            catch (e) {
                console.log('in the performQuery.catch: ' + e);
                var insight = {
                    code: 400,
                    body: { "error": 'reject' },
                };
                reject(insight);
            }
        });
    };
    InsightFacade.prototype.toJSON = function (filteredMatchedSections) {
        var filteredSortedMatchedSectionObj = {};
        filteredSortedMatchedSectionObj["result"] = filteredMatchedSections;
        return filteredSortedMatchedSectionObj;
    };
    InsightFacade.prototype.filterWithColumn = function (queryObject, section) {
        var listOfColumns = queryObject.getQueryOption().getColumns();
        var simpleMatchedSectionObj = {};
        for (var i = 0; i < listOfColumns.length; i++) {
            simpleMatchedSectionObj[listOfColumns[i]] = section[listOfColumns[i]];
        }
        return simpleMatchedSectionObj;
    };
    InsightFacade.prototype.sectionMatchWithQuery = function (queryObject, section) {
        return queryObject.body.evaluate(section);
    };
    InsightFacade.prototype.queryCheckValid = function (query) {
        if (typeof query !== 'object') {
            return false;
        }
    };
    InsightFacade.prototype.queryBuilder = function (query) {
        var optionObject;
        var bodyObject;
        var queryObject;
        var fs = require('fs');
        var listOfQueryKeys = Object.keys(query);
        if (listOfQueryKeys[0] !== 'WHERE' || listOfQueryKeys[1] !== 'OPTIONS') {
            throw new SyntaxError('there is no where and option key');
        }
        bodyObject = new Query_1.Body(query['WHERE']);
        optionObject = new Query_1.QueryOption(query['OPTIONS']);
        queryObject = new Query_1.Query(bodyObject, optionObject);
        return queryObject;
    };
    InsightFacade.prototype.sortMatchedSection = function (filterMatchedSections, order) {
        filterMatchedSections.sort((function (a, b) {
            if (typeof a[order] === 'number') {
                return (a[order] - b[order]);
            }
            else if (typeof a[order] === 'string') {
                if (a[order] > b[order]) {
                    return 1;
                }
                if (b[order] > a[order]) {
                    return -1;
                }
                return 0;
            }
            else {
                throw new SyntaxError('order type invalid, cant order');
            }
        }));
        return filterMatchedSections;
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map