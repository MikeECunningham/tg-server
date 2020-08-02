import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { User } from "@src/lib/models/user";
import { Servlet } from "@src/lib/ts/servlet";
import config from "@src/config";
import * as jwt from "jsonwebtoken";
import expiredPage from "@src/pages/html/expiredPage";
import alreadyActivatedPage from "@src/pages/html/alreadyActivatedPage";
import accountActivatedPage from "@src/pages/html/accountActivatedPage";
import { registerEmail } from "@src/lib/ts/mailchimp";
import { postalCodeLookup } from "@src/lib/ts/geocoder";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        token: { type: "string" },
    },
    required: ["token"],
};

interface RESTRequest extends Request {
    query: {
        token: string
    };
}

interface Payload {
    _id: string;
}

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.query, validationSchema);
    if (!result.valid) {
        logger.verbose(`Invalid json schema in email verification: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.get = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const decodedToken: Payload = jwt.verify(req.query.token, config.verificationOptions.tokenSecret) as Payload;
        const user = await User.findById(decodedToken._id);
        if (!user) {
            logger.warn(`A valid verification token contained a nonexistant userid. This should NOT HAPPEN.`);
            return res.status(400).end(expiredPage);
        } else {
            if (!user.activated) {
                await User.findByIdAndUpdate(user._id, { $set: { activated: true } });
                if (process.env.NODE_ENV !== "test") {
                    try {
                        let lookupReturn = JSON.parse(await postalCodeLookup(user.postalCode));
                        if (process.env.NODE_ENV !== "test") await registerEmail(
                            user.email,
                            user.firstName,
                            user.lastName,
                            user.postalCode,
                            lookupReturn.standard.prov,
                            lookupReturn.standard.city,
                            user.acceptEmails);
                    } catch { logger.warn("Mailchimp registerEmail() failed to send in verifyEmail.ts"); }
                }
                return res.end(accountActivatedPage);
            } else {
                return res.status(400).end(alreadyActivatedPage);
            }
        }
    } catch (err) {
        logger.verbose(`Error thrown when verifying user in verifyEmail: ${err}`);
        return res.status(500).end(expiredPage);
    }
};

export default servlet;