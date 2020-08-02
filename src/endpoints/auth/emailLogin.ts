/**
 * This servlet should authenticate a user and return the needed credentials
 */
import * as bcrypt from "bcrypt";
import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import * as jwt from "jsonwebtoken";
import config from "@src/config";
import { User } from "@src/lib/models/user";
import { Servlet } from "@src/lib/ts/servlet";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const passwordSchema: Schema = {
    type: "object",
    properties: {
        email: { type: "string" },
        password: { type: "string" },
        grantType: { type: "string" },
        token: { type: "string" }
    },
    required: ["email", "password", "grantType"],
    additionalProperties: false
};

const tokenSchema: Schema = {
    type: "object",
    properties: {
        grantType: { type: "string", enum: ["token"] },
        token: { type: "string" },
    },
    required: ["grantType", "token"],
    additionalProperties: false
};

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<any> {
    const validator = new Validator();
    const result1 = validator.validate(req.body, passwordSchema);
    const result2 = validator.validate(req.body, tokenSchema);
    if (result1.valid || result2.valid) {
        return next();
    } else {
        logger.warn(`Invalid json schema in email auth: ${(result2 ? result2 : result1).errors.toString()}`);
        return res.json({ failure: "Error: " + result1.errors.toString() });
    }
};

servlet.post = async function (req: CustomRequest, res: Response, next: NextFunction): Promise<Response> {
    try {
        req.body.email = req.body.email.toLowerCase().trim();
        if (req.body.grantType === "password") {
            const doc = await User.findOne({ email: req.body.email, accountType: "email" }).exec();
            if (!doc) { return res.json({ failure: "Incorrect username/password" }); }
            if (await bcrypt.compare(req.body.password, doc.password)) {
                const authenticationPayload = {
                    token_type: "authentication",
                    user: {
                        _id: doc._id,
                        email: doc.email,
                        firstName: doc.firstName,
                        lastName: doc.lastName,
                        activated: doc.activated,
                        passedTest: doc.passedTest,
                        acceptEmails: doc.acceptEmails,
                        postalCode: doc.postalCode,
                        admin: doc.admin
                    },
                };
                const refreshPayload = authenticationPayload;
                refreshPayload.token_type = "bearer";
                const refreshToken = jwt.sign(refreshPayload, config.secret, { expiresIn: config.refreshTokenLifetime });
                const authenticationToken = jwt.sign(authenticationPayload, config.secret, { expiresIn: config.authTokenLifetime });
                return res.json({ refreshToken, authenticationToken });
            } else {
                return res.json({ failure: "Incorrect username/password" });
            }
        } else if (req.body.grantType === "token") {
            const decoded: Payload = jwt.verify(req.body.token, config.secret) as Payload;
            if (decoded.token_type !== "bearer") {
                return res.json({ failure: "Invalid bearer token" });
            } else {
                const doc = await User.findById(decoded.user._id).exec();
                if (!doc) {
                    logger.info("Warning: user not found in decoded token");
                    return res.json({ failure: "Internal server error" });
                }

                const authenticationPayload = {
                    token_type: "authentication",
                    user: {
                        _id: doc._id,
                        email: doc.email,
                        firstName: doc.firstName,
                        lastName: doc.lastName,
                        passedTest: doc.passedTest,
                        activated: doc.activated,
                        acceptEmails: doc.acceptEmails,
                        postalCode: doc.postalCode,
                    },
                };
                const authenticationToken = jwt.sign(authenticationPayload, config.secret, { expiresIn: config.authTokenLifetime });
                return res.json({ authenticationToken });

            }
        } else {
            return res.json({ failure: "Invalid grant type" });
        }

    } catch (err) {
        logger.error(err);
        return res.json({ failure: "Internal server error" });
    }
};

interface CustomRequest extends Request {
    body: {
        email: string,
        password: string,
        grantType: string,
        token: string,
    };
}

class Payload extends Object {
    public user: {
        _id: string,
        email: string,
        firstName: string,
        lastName: string,
    };
    public token_type: string;
}

export default servlet;
