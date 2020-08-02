import "mocha";
import { assert, expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
import chaiHttp = require("chai-http");
import app from "@src/index";
import config from "@src/config";
import { User } from "@src/lib/models/user";
import * as bcrypt from "bcrypt";
import { Observation, ObservationDocument } from "@src/lib/models/observation";

use(chaiHttp);

let authToken = "";

const userInfo = {
    email: Math.random().toString(),
    firstName: Math.random().toString(),
    lastName: Math.random().toString(),
    password: Math.random().toString(),
    accountType: "email"
};

const obsSchema = {
    species: "BNTU",
    behavior: "BASK",
    habitat: "RIVER",
    lat: "2304897102938",
    long: "1209382098433",
    acc: "4"
};

describe("/observation/submitObservation", () => {
    before("add a user", async function () {
        const user = await new User({ ...userInfo, password: bcrypt.hashSync(userInfo.password, config.bcryptHashRounds) }).save();
        const authPayload = {
            token_type: "authentication",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastname: user.lastName,
                activated: user.activated,
            },
        };
        authToken = jwt.sign(authPayload, config.secret, { expiresIn: config.authTokenLifetime });
    });

    it("should successfully submit an observation", function (done) {
        request(app)
            .post("/api/observation/submitObservation")
            .set("x-access-token", authToken)
            .field(obsSchema)
            .attach("carapaceImage", "./src/test/images/testturtle.jpg", "testturtle.jpg")
            .end(async function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                try {
                    const obs: ObservationDocument = await Observation.findById(res.body._id) as any;
                    expect(obs).to.not.be.null;
                    expect(obs.habitat).to.be.eql(obsSchema.habitat);
                    expect(obs.species).to.be.eql(obsSchema.species);
                    expect(obs.behavior).to.be.eql(obsSchema.behavior);
                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it("should fail because a png was provided instead of a jpg", function (done) {
        request(app)
            .post("/api/observation/submitObservation")
            .set("x-access-token", authToken)
            .field(obsSchema)
            .attach("carapaceImage", "./src/test/images/testturtlefail.png", "testturtlefail.png")
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                expect(res.text).to.be.eql("{\"failure\":\"Image must be a jpeg\"}");
                done();
            });
    });

    it("should fail because no image was sent", function (done) {
        request(app)
            .post("/api/observation/submitObservation")
            .set("x-access-token", authToken)
            .field(obsSchema)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.have.property("failure");
                expect(res.text).to.be.eql("{\"failure\":\"At least one image is required\"}");
                done();
            });
    });
});