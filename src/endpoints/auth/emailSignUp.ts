import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { User } from "@src/lib/models/user";
import { Servlet } from "@src/lib/ts/servlet";
import * as nodemailer from "nodemailer";
import config from "@src/config";
import * as jwt from "jsonwebtoken";
import activationEmail from "@src/pages/dynamic/activationEmail";
import { postalCodeLookup } from "@src/lib/ts/geocoder";
import * as bcrypt from "bcrypt";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        referenceType: { type: "string", maxLength: 200 },
        acceptEmails: { type: "boolean" },
        postalCode: { type: "string", maxLength: 6, pattern: "^([a-zA-Z][0-9]){3}$" }
    },
    required: ["email", "password", "firstName", "lastName", "referenceType", "acceptEmails", "postalCode"],
    additionalProperties: false
};

interface RESTRequest extends Request {
    body: {
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        referenceType: string,
        acceptEmails: boolean,
        postalCode: string,
    };
}

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (!result.valid) {
        logger.warn(`Invalid json schema in email signUp: ${result.errors.toString()}`);
        return res.json({ failure: "Error: " + result.errors.toString() });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response> {
    try {
        req.body.email = req.body.email.toLowerCase();
        req.body.postalCode = req.body.postalCode.toUpperCase();
        const document = await User.findOne({ email: req.body.email }).exec();
        if (document) {
            return res.json({ failure: "That email is already in use." });
        } else {
            if (req.body.password.length < 8) { return res.json({ failure: "Password must be at least 8 characters long" }); }
            let lookupReturn = await JSON.parse(await postalCodeLookup(req.body.postalCode));
            if (!!lookupReturn.error) { return res.json({ failure: "Couldn't find postal code" }) }
            // Creates a user as activated if the environment is testing so that an email is not needed
            req.body.password = await bcrypt.hash(req.body.password, config.bcryptHashRounds);
            const user = new User({ accountType: "email", activated: (process.env.NODE_ENV === "test"), ...req.body });
            const doc = await user.save();
            // create reusable transporter object using the default SMTP transport
            const transporter = nodemailer.createTransport(config.supportOptions);
            const verificationPayload = { _id: user._id };
            const verificationToken = jwt.sign(verificationPayload, config.verificationOptions.tokenSecret, { expiresIn: config.verificationOptions.tokenLifetime });
            const link = config.verificationOptions.baseUrl + "api/auth/verifyEmail?token=" + verificationToken;
            // setup email data with unicode symbols
            // logger.info(activationEmail(link));
            const mailOptions = {
                from: `"noreply" <${config.supportOptions.auth.user}>`, // sender address
                to: req.body.email, // list of receivers
                subject: "Account activation", // Subject line
                html: activationEmail(link)// html body
            };
            // send mail with defined transport object
            await transporter.sendMail(mailOptions);
            const authenticationPayload = {
                token_type: "authentication",
                user: {
                    _id: doc._id,
                    email: doc.email,
                    firstName: doc.firstName,
                    lastName: doc.lastName,
                    activated: false,
                    postalCode: doc.postalCode,
                    admin: doc.admin
                },
            };
            const authenticationToken = jwt.sign(authenticationPayload, config.secret, { expiresIn: config.authTokenLifetime });

            return doc ? res.json({ authenticationToken }) : res.json({ failure: "An error occured while creating the account." });
        }
    } catch (err) {
        logger.warn(`Error thrown in signUp: ${err.toString()}`);
        return res.json({ failure: "An error occured creating your account." });
    }
};

export default servlet;