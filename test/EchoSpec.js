"use strict";
var Server_1 = require("../src/rest/Server");
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var chai = require("chai");
var chaiHttp = require("chai-http");
describe("EchoSpec", function () {
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("Should be able to echo", function () {
        var out = Server_1.default.performEcho('echo');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: 'echo...echo' });
    });
    it("Should be able to echo silence", function () {
        var out = Server_1.default.performEcho('');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: '...' });
    });
    it("Should be able to handle a missing echo message sensibly", function () {
        var out = Server_1.default.performEcho(undefined);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
    it("Should be able to handle a null echo message sensibly", function () {
        var out = Server_1.default.performEcho(null);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.have.property('error');
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
    it("Test Server", function () {
        chai.use(chaiHttp);
        var server = new Server_1.default(4321);
        var URL = "http://127.0.0.1:4321";
        chai_1.expect(server).to.not.equal(undefined);
        try {
            Server_1.default.echo({}, null, null);
            chai_1.expect.fail();
        }
        catch (err) {
            chai_1.expect(err.message).to.equal("Cannot read property 'json' of null");
        }
        return server.start().then(function (success) {
            return chai.request(URL)
                .get("/");
        }).catch(function (err) {
            chai_1.expect.fail();
        }).then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            return chai.request(URL)
                .get("/echo/Hello");
        }).catch(function (err) {
            chai_1.expect.fail();
        }).then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            return server.start();
        }).then(function (success) {
            chai_1.expect.fail();
        }).catch(function (err) {
            chai_1.expect(err.code).to.equal('EADDRINUSE');
            return server.stop();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("test addDataSet WITHOUT prior dataset (204)", function () {
        this.timeout(8000);
        console.log("starting addDataSet test");
        var fs = require('fs');
        var insight = new InsightFacade_1.default();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';
        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");
        return insight.addDataset("courses", content).then(function (value) {
            console.log("in the addDataSet.then");
            console.log(value);
            chai_1.expect(value.code).to.equal(204);
        }).catch(function (err) {
            console.log(err);
            console.log("in addDataSet.catch the err is:" + err);
        });
    });
    it("test addDataSet WITH prior dataset (201)", function () {
        this.timeout(8000);
        console.log("starting addDataSet test");
        var fs = require('fs');
        var insight = new InsightFacade_1.default();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';
        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");
        return insight.addDataset("courses", content).then(function (value) {
            return insight.addDataset("courses", content).then(function (value) {
                console.log("in the addDataSet.then");
                console.log(value);
                chai_1.expect(value.code).to.equal(201);
            }).catch(function (err) {
                console.log(err);
                console.log("in addDataSet.catch the err is:" + err);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("test removeDataset", function () {
        this.timeout(8000);
        console.log("starting removeDataset test");
        var fs = require('fs');
        var insight = new InsightFacade_1.default();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");
        return insight.addDataset("courses", content).then(function (value) {
            return insight.removeDataset("courses").then(function (value) {
                console.log("in the removeDataset.then");
                chai_1.expect(value.code).to.equal(204);
            }).catch(function (err) {
                console.log("in removeDataset.catch the err is:" + err);
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("test removeDataset that haven't been added (404)", function () {
        this.timeout(8000);
        console.log("starting removeDataset test");
        var fs = require('fs');
        var insight = new InsightFacade_1.default();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';
        return insight.removeDataset("courses").then(function (value) {
            console.log("in the removeDataset.then");
            chai_1.expect.fail();
        }).catch(function (err) {
            console.log(err);
            console.log("in removeDataset.catch the err is:" + err);
            chai_1.expect(err.code).to.equal(404);
        });
    });
    it("test addDataSet with invalid fileName", function () {
        console.log("starting addDataSet test");
        var fs = require('fs');
        var insight = new InsightFacade_1.default();
        var fileName = 'C:/Users/royzh/Google Drive/Education/BCS/CPSC 310/CPSC Team Project/courses.zip';
        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");
        return insight.addDataset("corses", content).then(function (value) {
            chai_1.expect.fail();
        }).catch(function (err) {
            console.log(err);
            console.log("in addDataSet.catch the err is:" + err);
            chai_1.expect(err.code).to.equal(400);
        });
    });
    it("test simple performQuery", function () {
        this.timeout(8000);
        console.log("starting performQuery now test");
        var insight = new InsightFacade_1.default();
        var query1 = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg"
            }
        };
        var fs = require('fs');
        var insight = new InsightFacade_1.default();
        var fileName = 'courses.zip';
        console.log("got the file name!!");
        var content = fs.readFileSync(fileName);
        content = content.toString("base64");
        return insight.addDataset("courses", content).then(function (value) {
            console.log("in the addDataSet.then");
            console.log(value);
            return insight.performQuery(query1).then(function (value) {
                console.log("in the performQuery.then");
                chai_1.expect(value.code).to.equal(200);
            }).catch(function (err) {
                console.log("in performQuery.catch the err is:" + err);
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            console.log("addDataset in simple performquery test failed");
            chai_1.expect.fail();
        });
    });
    it("test complex 1 performQuery", function () {
        console.log("starting performQuery now test");
        var insight = new InsightFacade_1.default();
        var query3 = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 90
                                }
                            },
                            {
                                "IS": {
                                    "courses_dept": "adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ": {
                            "courses_avg": 95
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_instructor"
                ],
                "ORDER": "courses_instructor"
            }
        };
        return insight.performQuery(query3).then(function (value) {
            console.log("in the performQuery.then");
            chai_1.expect(value.code).to.equal(200);
        }).catch(function (err) {
            console.log("in performQuery.catch the err is:" + err);
        });
    });
    it("test complex performQuery with partial name", function () {
        this.timeout(8000);
        console.log("starting performQuery now test");
        var insight = new InsightFacade_1.default();
        var query4 = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 80
                                }
                            },
                            {
                                "IS": {
                                    "courses_instructor": "*th*"
                                }
                            }
                        ]
                    },
                    {
                        "IS": {
                            "courses_instructor": "*th*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_instructor"
                ]
            }
        };
        return insight.performQuery(query4).then(function (value) {
            console.log("in the performQuery.then");
            chai_1.expect(value.code).to.equal(200);
        }).catch(function (err) {
            console.log("in performQuery.catch the err is:" + err);
            chai_1.expect.fail();
        });
    });
    it("test feeding broken query to performquery", function () {
        console.log("starting performQuery now test");
        var insight = new InsightFacade_1.default();
        var query4 = {
            "WE": {
                "OR": [
                    {
                        "AND": {}
                    },
                    {
                        "IS": {
                            "courses_instructor": "*th*"
                        }
                    }
                ]
            },
            "OPTONS": {
                "COLUMNS": [
                    "courses_instructor"
                ]
            }
        };
        return insight.performQuery(query4).then(function (value) {
            console.log("in the performQuery.then");
            chai_1.expect.fail();
        }).catch(function (err) {
            console.log("in performQuery.catch the err is:" + err);
            chai_1.expect(err.code).to.equal(400);
        });
    });
    it("test complex performQuery with not condition", function () {
        this.timeout(8000);
        console.log("starting performQuery now test");
        var insight = new InsightFacade_1.default();
        var query4 = {
            "WHERE": {
                "AND": [
                    {
                        "NOT": {
                            "GT": {
                                "courses_avg": 40
                            }
                        }
                    },
                    {
                        "NOT": {
                            "IS": {
                                "courses_instructor": "*a*"
                            }
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_instructor",
                    "courses_avg",
                ],
                "ORDER": "courses_instructor"
            }
        };
        return insight.performQuery(query4).then(function (value) {
            console.log("in the performQuery.then");
            chai_1.expect(value.code).to.equal(200);
        }).catch(function (err) {
            console.log("in performQuery.catch the err is:" + err);
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=EchoSpec.js.map