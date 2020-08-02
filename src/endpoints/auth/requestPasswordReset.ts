import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { User } from "@src/lib/models/user";
import { Servlet } from "@src/lib/ts/servlet";
import config from "@src/config";
import * as jwt from "jsonwebtoken";
import * as nodemailer from "nodemailer";
import passwordResetEmail from "@src/pages/dynamic/passwordResetEmail";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        email: { type: "string" },
    },
    required: ["email"],
};

interface RESTRequest extends Request {
    body: {
        email: string
    };
}

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (!result.valid) {
        logger.verbose(`Invalid json schema in password reset request: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response> {
    try {
        req.body.email = req.body.email.toLowerCase();
        const user = await User.findOne({ email: req.body.email });
        if (user === null) {
            return res.json({failure: "User could not be found."});
        } else {
            if (process.env.NODE_ENV !== "test") {
                // create reusable transporter object using the default SMTP transport
                await requestPasswordReset(user)
            }
            return res.json({});
        }
    } catch (err) {
        logger.verbose(`Error thrown when verifying user in requestResetPassword: ${err}`);
        return res.json({failure: "An error occured while attempting to send the email"});
    }
};

export async function requestPasswordReset(user: any) {
    const transporter = nodemailer.createTransport(config.supportOptions);
    const verificationPayload = { _id: user._id };
    const verificationToken = jwt.sign(verificationPayload, config.verificationOptions.tokenSecret, { expiresIn: config.verificationOptions.tokenLifetime });
    const link = config.passwordResetOptions.baseUrl + "api/auth/resetPasswordPage?token=" + verificationToken;
    // setup email data with unicode symbols
    const mailOptions = {
        from: `"noreply" <${config.supportOptions.auth.user}>`, // sender address
        to: user.email, // list of receivers
        subject: "Password Reset", // Subject line
        html: passwordResetEmail(link) // html body
    };

    // send mail with defined transport object
    await transporter.sendMail(mailOptions);
}

export default servlet;