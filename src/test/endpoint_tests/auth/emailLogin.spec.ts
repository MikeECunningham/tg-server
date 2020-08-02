import "mocha";
import { expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
import chaiHttp = require("chai-http");
import app from "@src/index";
import config from "@src/config";
import { User } from "@src/lib/models/user";
import * as bcrypt from "bcrypt";

use(chaiHttp);

describe("/auth/emailLogin", function() {

    const failText = "";
    let token = "";
    const userInfo = {
        password: "pass123",
        activated: true,
        email: "TortoiseFan@gmail.com",
        firstName: "Tortoise",
        lastName: "Fan",
        accountType: "email"
    };

    it("should authenticate the user and return a token", function(done) {
        new User({ ...userInfo, password: bcrypt.hashSync(userInfo.password, config.bcryptHashRounds) }).save().then(function() {
            request(app)
                .post("/api/auth/emailLogin")
                .send({ email: userInfo.email, password: userInfo.password, grantType: "password" })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a("object");
                    expect(res.body).to.have.property("authenticationToken");
                    expect(res.body).to.not.have.property("failure");
                    expect(res.body).to.have.property("refreshToken");
                    token = res.body.refreshToken;
                    done();
                });
        });
    });

    it("should fail to authenticate the user because the password is incorrect", function(done) {
        request(app)
            .post("/api/auth/emailLogin")
            .send({ email: userInfo.email, password: "asdflkj", grantType: "password" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("authenticationToken");
                expect(res.body).to.have.property("failure");
                expect(res.body).to.not.have.property("refreshToken");
                done();
            });
    });

    it("should fail to authenticate the user because the grant type is token and a password is passed in", function(done) {
        request(app)
            .post("/api/auth/emailLogin")
            .send({ email: userInfo.email, password: userInfo.password, grantType: "token" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("authenticationToken");
                expect(res.body).to.have.property("failure");
                expect(res.body).to.not.have.property("refreshToken");
                done();
            });
    });

    it("should authenticate the user through a token", function(done) {
        request(app)
            .post("/api/auth/emailLogin")
            .send({ token: token, grantType: "token" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("authenticationToken");
                expect(res.body).to.not.have.property("failure");
                expect(res.body).to.not.have.property("refreshToken");
                done();
            });

    });

    it("should fail to authenticate the user through a token because of incorrect grant type", function(done) {
        request(app)
            .post("/api/auth/emailLogin")
            .send({ token: token, grantType: "password" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("authenticationToken");
                expect(res.body).to.have.property("failure");
                expect(res.body).to.not.have.property("refreshToken");
                done();
            });
    });

    it("should fail to authenticate the user due to incorrect send arguments", function(done) {
        request(app)
            .post("/api/auth/emailLogin")
            .send({ email: userInfo.email, token: token, grantType: "token" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("authenticationToken");
                expect(res.body).to.have.property("failure");
                expect(res.body).to.not.have.property("refreshToken");
                done();
            });
    });
});