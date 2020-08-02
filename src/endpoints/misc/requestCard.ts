/**
 * This servlet should send an email with a card request
 */
import { Servlet } from "@src/lib/ts/servlet";
import { NextFunction, Response, Request } from "express";
import * as nodemailer from "nodemailer";
import config from "@src/config";
import getCardRequestEmail from "@src/pages/dynamic/cardRequest";
import { Schema, Validator } from "jsonschema";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const validationSchema: Schema = {
    type: "object",
    properties: {
        email: { type: "string" },
        address: { type: "string" },
        name: { type: "string" }
    },
    required: ["email", "name", "address"],
    additionalProperties: false
};

interface CustomRequest extends Request {
    body: {
        email: string,
        address: string;
        name: string;
    };
}

const servlet = new Servlet();

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<any> {
    const validator = new Validator();
    if (!validator.validate(req.body, validationSchema)) {
        return res.json({ failure: "Invalid JSON schema" });
    }
    next();
};

servlet.post = async function (req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    req.body.email = req.body.email.toLowerCase();
    if (process.env.NODE_ENV !== "test") {
        const transporter = nodemailer.createTransport(config.supportOptions);
        const mailOptions = {
            from: `"noreply" <${config.supportOptions.auth.user}>`, // sender address
            to: config.cardRequestEmail, // list of receivers
            subject: "Turtle Guardians Card Request", // Subject line
            html: getCardRequestEmail(req.body.address, req.body.name, req.body.email)// html body
                // send mail with defined transport object
        };
        await transporter.sendMail(mailOptions);
        res.json({});

    } else {
        res.json({});
    }
};

export default servlet;