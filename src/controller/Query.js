"use strict";
var util_1 = require("util");
var Query = (function () {
    function Query(body, option) {
        this.body = body;
        this.options = option;
    }
    Query.prototype.getBody = function () {
        return this.body;
    };
    Query.prototype.getQueryOption = function () {
        return this.options;
    };
    return Query;
}());
exports.Query = Query;
var Body = (function () {
    function Body(body) {
        var that = this;
        var key = Object.keys(body)[0];
        if (key === 'AND' || key === 'OR') {
            var logicComparisonObj = new LogicComparison(body[key], key);
            that.logic = logicComparisonObj;
            return;
        }
        if (key === 'IS') {
            var sComparisonObj = new Scomparison(body[key], key);
            that.sCompare = sComparisonObj;
            return;
        }
        if (key === 'LT' || key === 'GT' || key === 'EQ') {
            var mComparisonObj = new Mcomparison(body[key], key);
            that.mCompare = mComparisonObj;
            return;
        }
        if (key === 'NOT') {
            var bodyKey = body[key];
            var listOfNotKey = Object.keys(body[key]);
            var negationObj = new Body(body[key]);
            that.negation = negationObj;
            return;
        }
        if (util_1.isNullOrUndefined(that.logic) && util_1.isNullOrUndefined(that.mCompare) &&
            util_1.isNullOrUndefined(that.sCompare) && util_1.isNullOrUndefined(that.negation)) {
            throw new SyntaxError('body error, the filter is invalid');
        }
    }
    Body.prototype.evaluate = function (section) {
        if (this.logic)
            return this.logic.evaluate(section);
        if (this.mCompare)
            return this.mCompare.evaluate(section);
        if (this.sCompare)
            return this.sCompare.evaluate(section);
        if (this.negation)
            return (!(this.negation.evaluate(section)));
    };
    return Body;
}());
exports.Body = Body;
var LogicComparison = (function () {
    function LogicComparison(logicComparison, condition) {
        var that = this;
        that.condition = condition;
        that.listOfFilters = new Array();
        logicComparison.forEach(function (filter) {
            that.listOfFilters.push(new Body(filter));
        });
        if (that.listOfFilters.length === 0)
            throw new SyntaxError('logic error 1');
        if (util_1.isNullOrUndefined(this.condition))
            throw new SyntaxError('logic error 2');
    }
    LogicComparison.prototype.evaluate = function (section) {
        var condition = 0;
        if (this.condition === 'AND') {
            this.listOfFilters.forEach(function (filter) {
                if (!(filter.evaluate(section))) {
                    condition = condition + 1;
                }
            });
            return (condition === 0);
        }
        else {
            this.listOfFilters.forEach(function (filter) {
                if (!(filter.evaluate(section))) {
                    condition = condition + 1;
                }
            });
            return !(condition === this.listOfFilters.length);
        }
    };
    return LogicComparison;
}());
exports.LogicComparison = LogicComparison;
var Mcomparison = (function () {
    function Mcomparison(obj, condition) {
        var that = this;
        that.mKey = Object.keys(obj)[0];
        that.queryCompareValue = obj[that.mKey];
        that.condition = condition;
        if (typeof (that.mKey) !== 'string' || typeof (that.queryCompareValue) !== 'number') {
            throw new SyntaxError('mComparison error');
        }
        if (util_1.isNullOrUndefined(that.mKey) || util_1.isNullOrUndefined(that.queryCompareValue)) {
            throw new SyntaxError('mComparison error');
        }
    }
    Mcomparison.prototype.evaluate = function (section) {
        if (this.condition == 'GT') {
            return (section[this.mKey] > this.queryCompareValue);
        }
        else if (this.condition === 'LT') {
            return (section[this.mKey] < this.queryCompareValue);
        }
        else {
            return (section[this.mKey] === this.queryCompareValue);
        }
    };
    return Mcomparison;
}());
exports.Mcomparison = Mcomparison;
var Scomparison = (function () {
    function Scomparison(obj, skey) {
        var that = this;
        that.sKey = Object.keys(obj)[0];
        that.inputstring = obj[this.sKey];
        if (typeof (that.sKey) !== 'string' || typeof (that.inputstring) !== 'string') {
            throw new SyntaxError();
        }
        if (util_1.isNullOrUndefined(that.sKey) || util_1.isNullOrUndefined(that.inputstring)) {
            throw new SyntaxError();
        }
    }
    Scomparison.prototype.evaluate = function (section) {
        var sectionString = section[this.sKey];
        if (!(this.inputstring.includes('*'))) {
            return (this.inputstring === sectionString);
        }
        else if (this.inputstring.charAt(0) === '*' && this.inputstring.endsWith("*")) {
            var str = this.inputstring.substring(1, this.inputstring.length - 1);
            return (sectionString.includes(str));
        }
        else if (this.inputstring.startsWith('*')) {
            var str = this.inputstring.substring(1);
            return (sectionString.endsWith(str));
        }
        else {
            var str = this.inputstring.substring(0, this.inputstring.length - 1);
            return (sectionString.startsWith(str));
        }
    };
    return Scomparison;
}());
exports.Scomparison = Scomparison;
var QueryOption = (function () {
    function QueryOption(queryOption) {
        var that = this;
        that.columns = new Array();
        that.checkValid(queryOption);
        that.order = queryOption['ORDER'];
        queryOption['COLUMNS'].forEach(function (column) {
            if (typeof (column) !== "string" && typeof (column) !== "number") {
                throw new SyntaxError();
            }
            that.columns.push(column);
        });
    }
    QueryOption.prototype.checkValid = function (queryOption) {
        var listOfKeys = Object.keys(queryOption);
        if (listOfKeys[0] !== 'COLUMNS') {
            console.log("first option key is not columns");
            throw new SyntaxError();
        }
        if (util_1.isNullOrUndefined(listOfKeys[0]) || listOfKeys[0].length === 0) {
            throw new SyntaxError();
        }
        if (typeof (listOfKeys[0]) !== 'string') {
            throw new SyntaxError();
        }
    };
    QueryOption.prototype.getOrder = function () {
        return this.order;
    };
    QueryOption.prototype.getColumns = function () {
        return this.columns;
    };
    return QueryOption;
}());
exports.QueryOption = QueryOption;
//# sourceMappingURL=Query.js.map