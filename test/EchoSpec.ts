/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import chai = require('chai');
import chaiHttp = require('chai-http');
import Response = ChaiHttp.Response;
import restify = require('restify');

describe("EchoSpec", function () {


    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("Should be able to echo", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Test Server", function() {

        // Init
        chai.use(chaiHttp);
        let server = new Server(4321);
        let URL = "http://127.0.0.1:4321";

        // Test
        expect(server).to.not.equal(undefined);
        try{
            Server.echo((<restify.Request>{}), null, null);
            expect.fail()
        } catch(err) {
            expect(err.message).to.equal("Cannot read property 'json' of null");
        }

        return server.start().then(function(success: boolean) {
            return chai.request(URL)
                .get("/")
        }).catch(function(err) {
            expect.fail()
        }).then(function(res: Response) {
            expect(res.status).to.be.equal(200);
            return chai.request(URL)
                .get("/echo/Hello")
        }).catch(function(err) {
            expect.fail()
        }).then(function(res: Response) {
            expect(res.status).to.be.equal(200);
            return server.start()
        }).then(function(success: boolean) {
            expect.fail();
        }).catch(function(err) {
            expect(err.code).to.equal('EADDRINUSE');
            return server.stop();
        }).catch(function(err) {
            expect.fail();
        });
    });

    // first delete file in folder, this should return 204 because there is no previously added dataset
    it("test addDataSet WITHOUT prior dataset (204)", function () {
        this.timeout(8000);
        console.log("starting addDataSet test");

        var fs = require('fs');

        var insight = new InsightFacade();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';

        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");

        return insight.addDataset("courses",content).then((value:any)=>{
            console.log("in the addDataSet.then");
            console.log(value);
            expect(value.code).to.equal(204);

        }).catch((err:any)=>{
            console.log(err);
            console.log("in addDataSet.catch the err is:" + err);

        })
    });



    it("test addDataSet WITH prior dataset (201)", function () {
        this.timeout(8000);
        console.log("starting addDataSet test");

        var fs = require('fs');

        var insight = new InsightFacade();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';

        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");

        return insight.addDataset("courses",content).then((value:any)=> {
            return insight.addDataset("courses",content).then((value:any)=>{
                console.log("in the addDataSet.then");
                console.log(value);
                expect(value.code).to.equal(201);

            }).catch((err:any)=>{
                console.log(err);
                console.log("in addDataSet.catch the err is:" + err);

            })
        }).catch((err:any)=>{
            expect.fail();
        })

    });

    it("test removeDataset", function () {
        this.timeout(8000);
        console.log("starting removeDataset test");

        var fs = require('fs');
        var insight = new InsightFacade();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';

        var content = fs.readFileSync(fileName);
        content = content.toString("base64");
        return insight.addDataset("courses",content).then((value:any)=> {
            return insight.removeDataset("courses").then((value:any)=>{
                console.log("in the removeDataset.then");
                expect(value.code).to.equal(204);

            }).catch((err:any)=>{
                console.log("in removeDataset.catch the err is:" + err);
                expect.fail(); // shouldn't be here
            })
        }).catch((err:any)=>{
            expect.fail();
        })

    });


    it("test removeDataset that haven't been added (404)", function () {
        this.timeout(8000);
        console.log("starting removeDataset test");

        var fs = require('fs');
        var insight = new InsightFacade();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';

        return insight.removeDataset("courses").then((value:any)=>{
            console.log("in the removeDataset.then");
            expect.fail(); // shouldn't be here

        }).catch((err:any)=>{
            console.log(err);
            console.log("in removeDataset.catch the err is:" + err);
            expect(err.code).to.equal(404);
        })
    });


    it("test addDataSet with invalid fileName", function () {
        console.log("starting addDataSet test");

        var fs = require('fs');
        var insight = new InsightFacade();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';

        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");

        //console.log("the content is:" + content);


        return insight.addDataset("corses",content).then((value:any)=>{
            expect.fail();

        }).catch((err:any)=>{
            console.log(err);

            console.log("in addDataSet.catch the err is:" + err);
            expect(err.code).to.equal(400);

        })
    });


    it("test simple performQuery", function () {
        this.timeout(8000);
        console.log("starting performQuery now test");

        var insight = new InsightFacade();

        var query1 = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg"
            }
        }

        var fs = require('fs');

        var insight = new InsightFacade();
        var fileName = 'courses.zip';

        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");

        return insight.addDataset("courses",content).then((value:any)=>{
            console.log("in the addDataSet.then");
            console.log(value);

            return insight.performQuery(query1).then((value:any)=>{
                console.log("in the performQuery.then");
                expect(value.code).to.equal(200);
            }).catch((err:any)=>{
                console.log("in performQuery.catch the err is:" + err);
                expect.fail(); // shouldn't be here

            });
        }).catch((err:any) => {
            console.log("addDataset in simple performquery test failed");
            expect.fail();
        })
    });




    it("test complex 1 performQuery", function () {
        console.log("starting performQuery now test");

        var insight = new InsightFacade();

        var query3 = {
            "WHERE":{
                "OR":[
                    {
                        "AND":[
                            {
                                "GT":{
                                    "courses_avg":90
                                }
                            },
                            {
                                "IS":{
                                    "courses_dept":"adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ":{
                            "courses_avg":95
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_instructor"
                ],
                "ORDER":"courses_instructor"
            }
        }

        return insight.performQuery(query3).then((value:any)=>{
            console.log("in the performQuery.then");
            expect(value.code).to.equal(200);


        }).catch((err:any)=>{
            console.log("in performQuery.catch the err is:" + err);
            //expect.fail();

        })
    });


    it("test complex performQuery with partial name", function () {
        this.timeout(8000);
        console.log("starting performQuery now test");

        var insight = new InsightFacade();


        var query4 = {
            "WHERE":{
                "OR":[
                    {
                        "AND":[
                            {
                                "GT":{
                                    "courses_avg":80
                                }
                            },
                            {
                                "IS":{
                                    "courses_instructor":"*th*"
                                }
                            }
                        ]
                    },
                    {
                        "IS":{
                            "courses_instructor":"*th*"
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_instructor"
                ]
            }
        }

        return insight.performQuery(query4).then((value:any)=>{
            console.log("in the performQuery.then");
            expect(value.code).to.equal(200);

        }).catch((err:any)=>{
            console.log("in performQuery.catch the err is:" + err);
            expect.fail();

        })
    });


    it("test feeding broken query to performquery", function () {
        console.log("starting performQuery now test");

        var insight = new InsightFacade();

        var query4 = {
            "WE":{
                "OR":[
                    {
                        "AND":{}
                    },
                    {
                        "IS":{
                            "courses_instructor":"*th*"
                        }
                    }
                ]
            },
            "OPTONS":{
                "COLUMNS":[
                    "courses_instructor"
                ]
            }
        }

        return insight.performQuery(query4).then((value:any)=>{
            console.log("in the performQuery.then");
            expect.fail();


        }).catch((err:any)=>{
            console.log("in performQuery.catch the err is:" + err);
            expect(err.code).to.equal(400);



        })
    });

    it("test complex performQuery with not condition", function () {
        this.timeout(8000);
        console.log("starting performQuery now test");

        var insight = new InsightFacade();

        var query4 = {
            "WHERE":{
                "AND":[
                    {
                        "NOT":
                            {
                                "GT":{
                                    "courses_avg":40
                                }
                            }

                    },
                    {
                        "NOT":
                            {
                                "IS":{
                                    "courses_instructor":"*a*"
                                }
                            }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_instructor",
                    "courses_avg",

                ],
                "ORDER":"courses_instructor"
            }
        }

        return insight.performQuery(query4).then((value:any)=>{
            console.log("in the performQuery.then");
            expect(value.code).to.equal(200);

        }).catch((err:any)=>{
            console.log("in performQuery.catch the err is:" + err);
            expect.fail(); // shouldn't be here


        })
    });
