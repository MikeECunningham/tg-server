import "mocha";
import { expect, use, request } from "chai";
import chaiHttp = require("chai-http");
import app from "@src/index";

use(chaiHttp);


describe("/auth/emailSignUp", function() {

    let failText = "";
    const userInfo = {
        email: "TurtleLover@gmail.com",
        password: "pass12345",
        firstName: "Turtle",
        lastName: "Lover",
        referenceType: "email",
        acceptEmails: true,
        postalCode: "H0H0H0"
    };

    it("should succeed in signing up a valid request", function(done) {
        request(app)
            .post("/api/auth/emailSignUp")
            .send(userInfo)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                done();
            });
    });

    it("should fail with email already in use", function(done) {
        request(app)
            .post("/api/auth/emailSignUp")
            .send(userInfo)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                done();
            });
    });

    it("should fail with password must be at least 8 characters long", function(done) {
        request(app)
            .post("/api/auth/emailSignUp")
            .send({...userInfo, email: "TestudinesConnoisseur@gmail.com", password: "2short"})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                done();
            });
    });

    it("Should fail at the postal code not validating", (done) => {
        request(app)
        .post("api/auth/emailSignup")
        .send({...userInfo, postalCode: "4B9JEH"})
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body).to.have.property("failure");
            done();
        });
    });

    it("Should fail at the postal code not validating", (done) => {
        request(app)
        .post("api/auth/emailSignup")
        .send({...userInfo, postalCode: "4B9J3H"})
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body).to.have.property("failure");
            done();
        });
    });

    it("Should fail at the postal code not validating", (done) => {
        request(app)
        .post("api/auth/emailSignup")
        .send({...userInfo, postalCode: "4B9J3H9"})
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body).to.have.property("failure");
            done();
        });
    });

    it("should fail to invalid json schema for being passed nonsense", function(done) {
        request(app)
            .post("/api/auth/emailSignUp")
            .send({asdf: "asdf", grrrg: 0o744, waaargarbl: "bloobloobloo"})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                done();
            });
    });
});