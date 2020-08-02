import "mocha";
import { assert, expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
import chaiHttp = require("chai-http");
import app from "@src/index";
import config from "@src/config";
import { User } from "@src/lib/models/user";
import * as bcrypt from "bcrypt";
import { Observation } from "@src/lib/models/observation";
import { Schema } from "mongoose";

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
    species: "STIN",
    behavior: "NEST",
    habitat: "FOREST",
    lat: "230489758938",
    long: "1209382098433",
    acc: "4",
    submittedBy: new Schema.Types.ObjectId("")
};

describe("/observation/getObservations", () => {
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
        obsSchema.submittedBy = user._id;
        for (let i = 0; i < 5; i++) await (new Observation(obsSchema).save());
    });

    it("should successfully get all observations of this user", function (done) {
        request(app)
            .post("/api/observation/getObservations")
            .set("x-access-token", authToken)
            .send()
            .attach("carapaceImage", "./src/test/images/testturtle.jpg", "testturtle.jpg")
            .end(async function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                expect(res.body.observations.length).to.be.greaterThan(0);
                done();
            });
    });
});
