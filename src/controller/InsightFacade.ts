/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {Body, Query, QueryOption} from "./Query";

import Log from "../Util";
import {isNullOrUndefined} from "util";




export default class InsightFacade implements IInsightFacade {




    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }


    //content  The base64 content of the dataset. This content should be in the* form of a serialized zip file.
    //id  The id of the dataset being added.



    addDataset(id: string, content: string): Promise<InsightResponse> {

        //console.log("addDataSet Start=================================");
        //console.log("the id is:  " + id);
        //console.log("the content is" + content);
        var JSZip = require('jszip');
        var zip = new JSZip();
        var fs = require('fs');
        var sections: any[] = [];

        var pArr: Promise<any>[] = [];


        //console.log("all the variable set");


        return new Promise((fulfill, reject) => {

            let insight: InsightResponse = {
                code: null,
                body: {},
            };

            if(id !== "courses"){
                insight.code = 400;
                insight.body = {"error":"not a course"};
                return reject(insight);
            }

            if(fs.existsSync(id)){
             insight.code = 201;
             insight.body = {"success":"exist"};
            }else{
                insight.code = 204;
                insight.body = {"success":"not exist"};
            }

           // console.log("in the promise la ~~");
            // loadAsync return a promise with the updated zip object. the promise can fail if the loaded data is not valid zip data
            zip.loadAsync(content, {'base64': true}).then(function (value: any) {
               // console.log("the value is" + value);
                //zip = value;

                // try to get the element inside zip

                value.forEach(function (relativePath: any, file: any) {
                    //console.log("in the forEach now");
                    //console.log("the file is: %s", file);
                    //console.log("the relative path is " + relativePath);
                    //console.log(file.async('string'));
                    pArr.push(file.async('string'));

                });

                // console.log("finish for each");
                // console.log("the pArr size is" + pArr.length);

                Promise.all(pArr).then((listofContent: any[]) => {
                   // console.log("in the promise.all now");
                    //console.log("the data of file is: " + listofContent);
                    // console.log("relativePath", relativePath);
                    // console.log("file is", file);

                    var theFileContent;

                    for (let oneFileContent of listofContent) {
                        // console.log("the content of the file is:" + oneFileContent);
                        try {
                            theFileContent = JSON.parse(oneFileContent);

                        } catch (err) {
                            theFileContent = oneFileContent;
                        }


                        if (typeof theFileContent === 'object') {
                            // console.log('theFileContent is a object now');

                            for (let section of theFileContent['result']) {

                                let processedSession: any = {};
                                processedSession[id + "_dept"] = section["Subject"];
                                processedSession[id + "_id"] = section["Course"];
                                processedSession[id + "_avg"] = section["Avg"];
                                processedSession[id + "_instructor"] = section["Professor"];
                                processedSession[id + "_title"] = section["Title"];
                                processedSession[id + "_pass"] = section["Pass"];
                                processedSession[id + "_fail"] = section["Fail"];
                                processedSession[id + "_audit"] = section["Audit"];
                                processedSession[id + "_uuid"] = section["id"];

                                //console.log( processedSession);
                                sections.push(processedSession);
                            }
                        }
                    }

                   // console.log("the sections size is :" + sections.length);

                    fs.writeFile(id, JSON.stringify(sections), function (err: any, data: any) {
                     //   console.log('the data for writeFile is ' + data);
                        if (err) {
                            insight.code = 400;
                            insight.body = {"error": "can't write the content to disk"}
                            reject(insight);
                        }

                        fulfill(insight);
                       // console.log('the file is written');
                        //console.log("addDataSet finished==============================");

                    });


                }).catch((err: any) => {
                        Log.error("ERROR 1: " + err);


                    insight.code = 400;
                    insight.body = {"error": "error in promise.all"}
                    reject(insight);

                    }
                );

            }).catch(function (err: any) {
                Log.error("ERROR 2: " + err);

                insight.code = 400;
                insight.body = {"error": "error in async loading the zip"}
                reject(insight);


            });

            // writefile writes data to a file, replacing the file if it already exist. data can be a string or a buffer
        })
    }


    removeDataset(id: string): Promise<InsightResponse> {
        let fs = require('fs');
        let insight: InsightResponse = {code: null, body: {}};

        return new Promise((fulfill, reject) => {

            if (id !== "courses") {
                insight.code = 404;
                reject(insight);

            }
            if (fs.existsSync(id)) {
                fs.unlinkSync(id);
                insight.code = 204;
                fulfill(insight);

            } else {
                insight.code = 404;
                reject(insight);

            }
        })
    }




    performQuery(query: any): Promise<InsightResponse> {

        // check if query is a Json object

       // console.log('performQuery started ============================= ');

        let fs = require('fs');

        var sections:any[]; // store all the sections from the file

        var matchedSections: any[]; // store all the matched section from the sections

        return new Promise((fulfill, reject) => {

            let that = this;


            sections = new Array();
            matchedSections = new Array();


           // console.log('in the performQuery promise now ');

            try {
                //check if query is an object
                // check whether query contain where, option key.
                if(this.queryCheckValid(query)){
                //    console.log('query is not valid: ');

                    let insight: InsightResponse = {
                        code: 424,
                        body: {"error":'reject'},
                    };

                     reject(insight);
                }

                // build a queryObject with all the information filled
               let queryObject = that.queryBuilder(query);

               // console.log('queryObject is successfully built')


                // read the files from disk, and store in sections
                // how to read the files from the disk and turn it to jason object?
                // can't read the file properly
                var inputFile = fs.readFileSync('./courses',{'encoding': 'utf8'});

                inputFile = JSON.parse(inputFile);


                // get the content for the input file; ** can't get the file in a correct format

                // for each section, check if the section match with the query conditions
                for(let section of inputFile){
                    if(this.sectionMatchWithQuery(queryObject,section)){
                        matchedSections.push(section);
                        // push the satisfied section into the list of the filfulled section
                    }
                }


                // use option to get neccessary information for the matched section
                var filteredMatchedSections: any[];
                filteredMatchedSections = new Array();




                for (let section of matchedSections) {
                    let simpleMatchedSectionObj = this.filterWithColumn(queryObject,section);
                    filteredMatchedSections.push(simpleMatchedSectionObj);
                }



                // sort the matchedSections in order according to the optionOrder

                if(!(isNullOrUndefined(queryObject.getQueryOption().getOrder()))) {
                    that.sortMatchedSection(filteredMatchedSections, queryObject.getQueryOption().getOrder());
                }

                console.log(filteredMatchedSections);

                // create insight with value that is the sorted Matched Section
                let insight: InsightResponse = {
                    code: 200,
                    body: this.toJSON(filteredMatchedSections),
                };

                fulfill(insight);

                console.log('insight is successfully returned')
                fulfill(insight);


            }catch(e){
               console.log('in the performQuery.catch: ' + e)
                let insight: InsightResponse = {
                    code: 400,
                    body: {"error":'reject'},
                };


                reject(insight);

            }
        });

    }

    toJSON(filteredMatchedSections: any[]):any {
        let filteredSortedMatchedSectionObj: any = {};
         filteredSortedMatchedSectionObj["result"] = filteredMatchedSections;
        return filteredSortedMatchedSectionObj
    }



    filterWithColumn(queryObject: Query, section: any): Object {

        let listOfColumns = queryObject.getQueryOption().getColumns();
        let simpleMatchedSectionObj: any = {};

        for(let i=0; i < listOfColumns.length; i++){
            simpleMatchedSectionObj[listOfColumns[i]] = section[listOfColumns[i]];
        }
        return simpleMatchedSectionObj;
    }


    // check if the current section match with the query , produce true if yes, false otherwise
    sectionMatchWithQuery(queryObject: Query, section: any):boolean {
        // the evaluate method return true if the condition is satisfied
        return queryObject.body.evaluate(section);

    }


    // check if the query is in correct format, should i check it?
    queryCheckValid(query: any):boolean {
        if (typeof  query !== 'object') {
            return false;
        }

    }


    // build a queryObject
    queryBuilder (query: any):any {

        var optionObject: QueryOption;
        var bodyObject:Body;
        var queryObject: Query;

        let fs = require('fs');

        let listOfQueryKeys = Object.keys(query);

        // check if body and option exist
        if (listOfQueryKeys[0] !== 'WHERE' || listOfQueryKeys[1]!=='OPTIONS'){
            throw new SyntaxError('there is no where and option key');
        }

        // if exist, produce body and option object
            //console.log('the query[WHERE] is:' + query['WHERE']);
            //console.log('the query[OPTIONS] is:' + query['OPTIONS']);

             bodyObject= new Body(query['WHERE']);
             optionObject = new QueryOption(query['OPTIONS']);


             queryObject = new Query(bodyObject, optionObject);
        // with the body and option object, it combine to make the queryObject
        return queryObject ;
    }

    // sort the matched section according to some orders
    sortMatchedSection(filterMatchedSections: any[], order: any):any {

       // filterMatchedSections.slice();



        filterMatchedSections.sort(((a, b):any => {


            if (typeof a[order] === 'number'){
            return ( a[order] - b[order] )
            } else if (typeof a[order] === 'string'){
                if (a[order] > b[order]){
                    return 1;
                }
                 if (b[order]>a[order]){
                    return -1;
                }
                return 0;

            }else {
                throw new SyntaxError('order type invalid, cant order');
            }

        }))



        return filterMatchedSections;
    }






}