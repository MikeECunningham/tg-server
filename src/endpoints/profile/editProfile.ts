import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Schema, Validator } from "jsonschema";
import { User } from "@src/lib/models/user";
import config from "@src/config";
import * as jwt from "jsonwebtoken";
import {updateEmail} from "@src/lib/ts/mailchimp";
import { postalCodeLookup } from "@src/lib/ts/geocoder";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

interface RESTRequest extends Request {
    body: {
        firstName: string;
        lastName: string;
        acceptEmails: boolean;
        postalCode: string;
    };
}

const validationSchema: Schema = {
    type: "object",
    properties: {
        firstName: { type: "string", maxLength: 200 },
        lastName: { type: "string", maxLength: 200 },
        acceptEmails: { type: "boolean" },
        postalCode: { type: "string", maxLength: 6, pattern: "^([a-zA-Z][0-9]){3}$"}
    },
    required: ["firstName", "lastName", "acceptEmails", "postalCode"],
    additionalProperties: false
};

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (!result.valid) {
        logger.warn(`Invalid json schema in edit profile: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response> {
    if (!req.user) {
        return res.json({ failure: "No logged in user" });
    } else {
        try {
            const lookupReturn = await JSON.parse(await postalCodeLookup(req.body.postalCode));
            if (!!lookupReturn.error) { return res.json({ failure: "Couldn't find postal code" }); }
            await User.findByIdAndUpdate(req.user._id, req.body).exec();
            const doc = await User.findById({_id: req.user._id}).exec();
            if (!doc) { return res.json({ failure: "Incorrect username/password" }); }
            await updateEmail(req.user.email, 
                req.body.firstName, 
                req.body.lastName,
                req.body.postalCode,
                lookupReturn.standard.prov,
                lookupReturn.standard.city,
                req.body.acceptEmails);
            const authenticationPayload = {
                token_type: "authenticator",
                user: {
                    _id: doc._id,
                    email: doc.email,
                    firstName: doc.firstName,
                    lastName: doc.lastName,
                    activated: doc.activated,
                    passedTest: doc.passedTest,
                    acceptEmails: doc.acceptEmails,
                    postalCode: doc.postalCode
                },
            };
            const authToken = jwt.sign(authenticationPayload, config.secret, { expiresIn: config.authTokenLifetime });
            return res.json({ authToken });
        } catch (err) {
            logger.warn(`Error encountered when updating profile: ${err}`);
            return res.json({ failure: "Error when finding profile in db" });
        }
    }
};
export default servlet;