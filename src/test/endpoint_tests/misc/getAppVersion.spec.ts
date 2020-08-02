import "mocha";
import { expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
import chaiHttp = require("chai-http");
import app from "@src/index";
import config from "@src/config";

use(chaiHttp);


describe("/misc/getAppVersion", () => {
    it("should successfully retrieve the app version", function (done) {
        request(app)
            .post("/api/misc/getAppVersion")
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                expect(res.body).to.have.property("version");
                expect(res.body).to.eql({version: config.version});
                done();
            });
    });
});