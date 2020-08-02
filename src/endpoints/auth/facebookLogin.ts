/**
 * This servlet takes a token provided by a facebook endpoint and provides a token for the server
 */
import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { Servlet } from "@src/lib/ts/servlet";
import * as request from "request";
import * as jwt from "jsonwebtoken";
import { User } from "@src/lib/models/user";
import config from "@src/config";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        token: { type: "string" }
    },
    required: ["token"],
    additionalProperties: false
};

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<any> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (result.valid) {
        return next();
    } else {
        logger.warn(`Invalid json schema in email auth: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
};

servlet.post = async function (req: CustomRequest, res: Response, next: NextFunction): Promise<Response> {
    return new Promise((resolve) => {
        try {
            request.get(`https://graph.facebook.com/v3.3/me?access_token=${encodeURI(req.body.token)}&debug=all&fields=id%2Cname&format=json&method=get&pretty=0&suppress_http_code=1&transport=cors`, { json: true }, async (err, r, body) => {
                if (err) {
                    logger.error(err);
                    return resolve(res.json({ failure: "Error with facebook response" }));
                }
                if (body.error || !body.id || !body.name) {
                    return resolve(res.json({ failure: "Error occured while verifying facebook information" }));
                } else {
                    let user = await User.findOne({ accountType: "facebook", facebookId: body.id }).exec();
                    if (!user) {
                        // Start logic to create a new user with type facebook
                        user = new User({ accountType: "facebook", facebookId: body.id, firstName: body.name, lastName: "", activated: true });
                        user = await user.save();
                    }
                    const authenticationPayload = {
                        token_type: "authentication",
                        user: {
                            facebookId: user.facebookId,
                            email: user.email,
                            firstName: body.name,
                            lastName: "",
                            activated: true,
                        },
                    };
                    const refreshPayload = authenticationPayload;
                    refreshPayload.token_type = "bearer";
                    const refreshToken = jwt.sign(refreshPayload, config.secret, { expiresIn: config.refreshTokenLifetime });
                    const authenticationToken = jwt.sign(authenticationPayload, config.secret, { expiresIn: config.authTokenLifetime });
                    return resolve(res.json({ refreshToken, authenticationToken }));
                }
            });


        } catch (err) {
            logger.error(err);
            return resolve(res.json({ failure: "Internal server error" }));
        }
    });
};

interface CustomRequest extends Request {
    body: {
        token: string,
    };
}

export default servlet;