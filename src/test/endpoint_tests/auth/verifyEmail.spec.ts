import "mocha";
import { assert, expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
import chaiHttp = require("chai-http");
import app from "@src/index";
import config from "@src/config";
import { User } from "@src/lib/models/user";
import * as bcrypt from "bcrypt";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

use(chaiHttp);

let userToken = "";
const userInfo = {
    password: "password123",
    activated: false,
    email: "CaraPlastronCoveter@gmail.com",
    firstName: "Caraplastron",
    lastName: "Coveter",
    accountType: "email"
};

describe("/auth/verifyEmail", function () {
    before("add user", async function() {
        const user = await new User({ ...userInfo, password: bcrypt.hashSync(userInfo.password, config.bcryptHashRounds) }).save();
        if (user) {
            try {
                const verificationPayload = { _id: user._id };
                userToken = jwt.sign(verificationPayload, config.verificationOptions.tokenSecret, { expiresIn: config.verificationOptions.tokenLifetime });
            } catch (err) {
                logger.error(err);
                assert.fail("couldn't create token");
            }
        } else {
            assert.fail("couldn't find user");
        }
    });

    it("should verify the email address associated with the token's id", function (done) {
        request(app)
            .get("/api/auth/verifyEmail")
            .query({ token: userToken })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                done();
            });
    });

    it("should fail because the account is already activated", function (done) {
        request(app)
            .get("/api/auth/verifyEmail")
            .query({ token: userToken })
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.be.a("object");
                done();
            });
    });

    it("should fail because of a bad id", function (done) {
        userToken = jwt.sign({ _id: Math.random().toString() }, config.verificationOptions.tokenSecret, { expiresIn: config.verificationOptions.tokenLifetime });
        request(app)
            .get("/api/auth/verifyEmail")
            .query({ token: userToken })
            .end(function (err, res) {
                expect(res).to.have.status(500);
                expect(res.body).to.be.a("object");
                done();
            });
    });
});