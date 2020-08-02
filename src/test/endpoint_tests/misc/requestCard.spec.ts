import "mocha";
import { expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
import chaiHttp = require("chai-http");
import app from "@src/index";
import config from "@src/config";
import { User } from "@src/lib/models/user";
import * as bcrypt from "bcrypt";

use(chaiHttp);

let authToken = "";
const userInfo = {
    password: "pass12345",
    activated: true,
    email: "NapoleonBonaTort@gmail.com",
    firstName: "Big",
    lastName: "Lad",
    accountType: "email"
};

describe("/auth/requestCard", () => {

    before("make a user and then log in as that user", async function() {
        const user = await new User({...userInfo, password: bcrypt.hashSync(userInfo.password, config.bcryptHashRounds)}).save();
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
        authToken = jwt.sign(authPayload, config.secret, {expiresIn: config.authTokenLifetime});
    });

    it("should successfully pass verification to send an email", function (done) {
        request(app)
            .post("/api/misc/requestCard")
            .set("x-access-token", authToken)
            .send()
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                done();
            });
    });
});