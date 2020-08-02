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

let userToken = "";
const userInfo = {
    password: "password123",
    activated: false,
    email: "ReptilesForMiles@gmail.com",
    firstName: "Reptiles",
    lastName: "ForMiles",
    accountType: "email",
    acceptEmails: true
};

describe("/profile/editProfile", function () {
    before("add user", async function () {
        const user = await new User({ ...userInfo, password: bcrypt.hashSync(userInfo.password, config.bcryptHashRounds) }).save();
        if (user) {
            try {
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
                userToken = jwt.sign(authPayload, config.secret, { expiresIn: config.authTokenLifetime });
            } catch (err) {
                logger.error(err);
                assert.fail("couldn't create token");
            }
        } else {
            assert.fail("couldn't find user");
        }
    });

    it("should successfully insert the new settings to the profile", function (done) {
        request(app)
            .post("/api/profile/editProfile")
            .set("x-access-token", userToken)
            .send({ firstName: "Hisnameis", lastName: "Hank", acceptEmails: false })
            .end(async function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                try {
                    const user = await User.findOne({ email: userInfo.email }).exec();
                    if (user) {
                        expect(user.firstName).to.be.eql("Hisnameis");
                        expect(user.lastName).to.be.eql("Hank");
                        expect(user.acceptEmails).to.be.false;
                        done();
                    } else {
                        assert.fail("Couldn't find user");
                    }
                } catch (err) {
                    done(err);
                }
            });
    });
});