

import filter = require("core-js/fn/array/filter");
import {isNullOrUndefined} from "util";

export interface Filter {

    //negation:boolean;
    evaluate (section: any): any ;

    // there are four kinds of filters,
    // what do you mean?
}


export class Query  {
    body : Body;
    options : QueryOption;

    constructor (body: Body, option: QueryOption){
        this.body = body;
        this.options = option;
    }

    getBody():Body {
        return this.body;
    }

    getQueryOption():QueryOption {
        return this.options;
    }

}

// Body start here ===========================================================================

export class Body {

    logic: LogicComparison;
    mCompare: Mcomparison;
    sCompare: Scomparison;
    negation: Body;

    constructor(body: any) {

        // console.log("start to build body object now ========");


        let that = this;
        // that.filters = new Array();

        let key: string = Object.keys(body)[0];


        // if (listOfBodyKey.length === 0) {
        //     throw new SyntaxError('body doesnt have key');
        // }

        if (key === 'AND' || key === 'OR') {
            var logicComparisonObj = new LogicComparison(body[key], key);

            //that.filters.push(logicComparisonObj);
            that.logic = logicComparisonObj;
            return;
        }

        if (key === 'IS') {
            var sComparisonObj = new Scomparison(body[key], key);
            //that.filters.push(sComparisonObj);
            that.sCompare = sComparisonObj;
            return;
        }

        if (key === 'LT' || key === 'GT' || key === 'EQ') {

            var mComparisonObj = new Mcomparison(body[key], key);
            //that.filters.push(mComparisonObj);
            that.mCompare = mComparisonObj;
            return;
        }

        if (key === 'NOT') {

            var bodyKey = body[key];
            let listOfNotKey = Object.keys(body[key]);

            var negationObj = new Body(body[key]);
            //negationObj.negation = true;
            //that.filters.push(negationObj);
            that.negation = negationObj;

            //that.negation = new (body[key]);
            // var negationObj = new Negation(body[key]);
            return;
        }

        if (isNullOrUndefined(that.logic) && isNullOrUndefined(that.mCompare) &&
            isNullOrUndefined(that.sCompare) && isNullOrUndefined(that.negation)) {
            throw new SyntaxError('body error, the filter is invalid');
        }

    }


    evaluate(section:any):boolean{
        // for(let filter of this.filters){
        //         if(filter.negation){
        //         return !(filter.evaluate(section));
        //         }
        //
        //     return filter.evaluate(section);
        // }

        if (this.logic)return this.logic.evaluate(section);
        if(this.mCompare) return this.mCompare.evaluate(section);
        if(this.sCompare) return this.sCompare.evaluate(section);
        if(this.negation)return (!(this.negation.evaluate(section)));



    }

}


export class LogicComparison implements Filter{
    condition: string;
    listOfFilters: Filter[];
    //negation:boolean


    constructor(logicComparison:any, condition: string){
        let that = this;
        //that.negation;
        that.condition = condition
        that.listOfFilters = new Array();



    logicComparison.forEach(function(filter:Filter){
            that.listOfFilters.push(new Body(filter));
        })
        if(that.listOfFilters.length===0) throw new SyntaxError('logic error 1');
        if(isNullOrUndefined(this.condition))throw new SyntaxError('logic error 2');
    }

    evaluate(section: any): boolean {

        let condition = 0;

        if (this.condition === 'AND'){
            this.listOfFilters.forEach(function (filter: any) {
                if(!(filter.evaluate(section))){
                    condition = condition+1;
                }
            });
            return (condition === 0)
        }else{ // the condition is or
            this.listOfFilters.forEach(function (filter: any) {
                if(!(filter.evaluate(section))){

                    condition = condition + 1;
                }
            });
            return !(condition === this.listOfFilters.length);
        }
        // check if the flag in the end is still 1; was not being set to 0 anywhere.
    }
}

export class Mcomparison implements  Filter{
    condition: string;
    mKey: string;
    queryCompareValue: any;
    //negation:boolean


    constructor(obj:any, condition: any){
        let that = this;
       // that.negation = false;
        that.mKey = Object.keys(obj)[0]; //ex., courses_avg
        that.queryCompareValue= obj[that.mKey]; // ex., 98
        that.condition = condition; // GT , LT, EQ

        // checking if the key is there
        if(typeof(that.mKey)!=='string' || typeof (that.queryCompareValue)!=='number'){
            throw new SyntaxError('mComparison error');
        }

        if (isNullOrUndefined(that.mKey) || isNullOrUndefined(that.queryCompareValue)) {
            throw new SyntaxError('mComparison error');
        }



    }



    evaluate(section: any): any {

        if(this.condition=='GT') {
            return (section[this.mKey] > this.queryCompareValue);
        }else if(this.condition === 'LT'){
            return (section[this.mKey] < this.queryCompareValue);
        }else {
            return (section[this.mKey] === this.queryCompareValue);

        }
    }
}

export class Scomparison implements Filter{

    //negation: boolean;
    sKey: string;
    inputstring: string;

    constructor(obj:any, skey: any){
        let that = this;
        //that.negation = false;
        that.sKey = Object.keys(obj)[0]; // courses_dept, courses_id, courses_instructor
        that.inputstring = obj[this.sKey]; // the inputted value

        if(typeof(that.sKey)!=='string' || typeof (that.inputstring)!=='string'){
            throw new SyntaxError();
        }

        if (isNullOrUndefined(that.sKey) || isNullOrUndefined(that.inputstring)) {
            throw new SyntaxError();
        }


    }


    evaluate(section: any): boolean {
        let sectionString = section[this.sKey]; // ex., aanb

        if(!(this.inputstring.includes('*'))){
            return (this.inputstring === sectionString)
        }else if(this.inputstring.charAt(0)==='*' && this.inputstring.endsWith("*")){
            var str = this.inputstring.substring(1,this.inputstring.length-1);
            return (sectionString.includes(str));

        }else if(this.inputstring.startsWith('*')){
            var str = this.inputstring.substring(1);
            return(sectionString.endsWith(str))
        }else{
            var str = this.inputstring.substring(0,this.inputstring.length-1);
            return(sectionString.startsWith(str))
        }

    }


}

// didn't use
/*
export class Negation implements Filter{
    //negation:boolean;

    filters: Filter[];


    constructor(obj:any) {
        let that = this;
        that.filters = new Array();

       for (let i=0; i < obj.length ; i++ ){
           var obj_ = obj[i];

                that.filters.push(new Body(obj[i]));
        }

        }


    evaluate(section: any): any {
        for (let i = 0; i < this.filters.length; i++) {
            return (!(this.filters[i].evaluate(section)));
        }
    }

}
*/



// Query Option ===============================================================================
export class QueryOption {

    columns: any[];
    order: string;

    constructor (queryOption: any){
        let that = this;
      //  console.log("building QueryOptionObject now ============================")
        that.columns = new Array();
        // check if where and options exists

       // let listOfKeys = Object.keys(queryOption);
        that.checkValid(queryOption);


        that.order = queryOption['ORDER'];

        queryOption['COLUMNS'].forEach(function(column:any){
            if(typeof (column)!=="string" && typeof (column)!=="number"){
                throw new SyntaxError();
            }

            that.columns.push(column);

        });

        }



    // check whether option is in correct order, and option and column and order are there
    checkValid(queryOption: any){

        let listOfKeys = Object.keys(queryOption);


        if (listOfKeys[0] !== 'COLUMNS'){
            console.log("first option key is not columns");
            throw new SyntaxError();
        }

        if (isNullOrUndefined(listOfKeys[0]) || listOfKeys[0].length===0){
            throw new SyntaxError();
        }

        if(typeof(listOfKeys[0])!== 'string'){
            throw new SyntaxError();
        }
}

    getOrder():any{
        return this.order;
    }

    getColumns():any{
        return this.columns;

    }

}










