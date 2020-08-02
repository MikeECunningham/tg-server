import "mocha";
import { assert, expect, use, request } from "chai";
import jwt = require("jsonwebtoken");
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
    email: "EggLaysForDays@gmail.com",
    firstName: "Bruv",
    lastName: "McHombre",
    accountType: "email",
    acceptEmails: true
};

describe("/profile/passTest", function () {
    before("add user", async function () {
        const user = await new User({ ...userInfo, password: bcrypt.hashSync(userInfo.password, config.bcryptHashRounds), passedTest: false }).save();
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

    it("should successfully register the user as passing the test", function (done) {
        request(app)
            .post("/api/profile/passTest")
            .set("x-access-token", userToken)
            .send()
            .end(async function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("object");
                expect(res.body).to.not.have.property("failure");
                try {
                    const user = await User.findOne({ email: userInfo.email }).exec();
                    if (user) {
                        expect(user.passedTest).to.be.true;
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