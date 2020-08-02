import "mocha";
import { expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
import chaiHttp = require("chai-http");
import app from "@src/index";
import config from "@src/config";
import { User } from "@src/lib/models/user";
import * as bcrypt from "bcrypt";

use(chaiHttp);


describe("/auth/requestPasswordReset", () => {

    afterEach(function() {
        // if (this.currentTest.state === 'failed') {
        //     console.log(failText);
        // }
        // console.log(failText + "\n");
        // failText = "";
    });

    it("should successfully find the user and validate the request", function(done) {
        new User({lastName: "Ever", firstName: "Greatest", email: "ChelonianAficionado@gmail.com", password: bcrypt.hashSync("abc123", config.bcryptHashRounds), accountType: "email" }).save().then(function() {
            request(app)
                .post("/api/auth/requestPasswordReset")
                .send({email: "ChelonianAficionado@gmail.com"})
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a("object");
                    expect(res.body).to.not.have.property("failure");
                    done();
                });
        });
    });

    it("should fail because user could not be found", function(done) {
        request(app)
            .post("/api/auth/requestPasswordReset")
            .send({email: "CryptodireAdmirer@gmail.com"})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                done();
            });
    });
});