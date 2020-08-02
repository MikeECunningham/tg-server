import "mocha";
import { expect, use, request } from "chai";
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
    password: "pass12345",
    activated: true,
    email: "TortugaDevotee@gmail.com",
    firstName: "Tortoise",
    lastName: "Fan",
    accountType: "email"
};

it("should authenticate the user by token and update their password", function (done) {
    new User({ ...userInfo, password: bcrypt.hashSync(userInfo.password, config.bcryptHashRounds) }).save().then(async function () {
        try {
            const user = await User.findOne({ email: userInfo.email }).exec();
            if (user) {
                const verificationPayload = { _id: user._id };
                userToken = jwt.sign(verificationPayload, config.verificationOptions.tokenSecret, { expiresIn: config.verificationOptions.tokenLifetime });
                userInfo.password = "NewPassword";
            }
        } catch (err) {
            logger.error(err);
            done();
        }
        request(app)
            .post("/api/auth/resetPassword")
            .send({ token: userToken, password: userInfo.password })
            .end(async function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                try {
                    const user = await User.findOne({ email: userInfo.email }).exec();
                    if (user) {
                        expect(bcrypt.compareSync("NewPassword", user.password)).to.be.true;
                    }
                } catch (err) {
                    logger.error(err);
                    done();
                }
                done();
            });
    });

    it("should fail because the new password is too short", function (done) {
        request(app)
            .post("/api/auth/resetPassword")
            .send({ token: userToken, password: "ShrtPss" })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                done();
            });
    });

    // these next two tests probably don't need to exist
    it("should fail because the user doesn't exist", function (done) {
        request(app)
            .post("/api/auth/resetPassword")
            .send({ token: jwt.sign({ _id: "00000000000000000000000000000000" }, config.verificationOptions.tokenSecret, { expiresIn: config.verificationOptions.tokenLifetime }), password: userInfo.password })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                done();
            });
    });

    it("should fail because the token is expired", function (done) {
        request(app)
            .post("/api/auth/resetPassword")
            .send({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGRiNmRkN2M2Yzg0ODAwMWJlMmI3MDUiLCJpYXQiOjE1NzQ2NjE1OTEsImV4cCI6MTU3NzI1MzU5MX0.pEwlSYKnaiwTh9iFCPQ7z3qjO8x39u3upwUYn52ADCs", password: userInfo.password })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                done();
            });
    });
});