import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { User } from "@src/lib/models/user"; // get our mongoose model
import { Servlet } from "@src/lib/ts/servlet";
import config from "@src/config";
import * as bcrypt from "bcrypt";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        oldPassword: { type: "string" },
        password: { type: "string", minLength: 8 }
    },
    required: ["oldPassword", "password"],
};

interface RESTRequest extends Request {
    body: {
        oldPassword: string;
        password: string;
    };
}

interface Payload {
    _id: string;
}

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (!result.valid) {
        logger.verbose(`Invalid json schema in password reset: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response> {
    try {
        if (req.body.password.length < 8) { return res.json({ failure: "New password must be at least 8 characters long" }); }
        try {
            const doc = await User.findById({ _id: req.user._id });
            if (!!doc) {
                if (await bcrypt.compare(req.body.oldPassword, doc.password)) {
                    if (!await User.findByIdAndUpdate(req.user._id, { password: await bcrypt.hash(req.body.password, config.bcryptHashRounds) })) {
                        return res.json({ failure: "No user updated" });
                    }
                } else {
                    return res.json({ failure: "Wrong old password"});
                }
            } else {
                return res.json({ failure: "Error finding user"});
            }
        } catch (e) {
            return res.json({ failure: "Error when finding user in db" });
        }
    } catch (err) {
        logger.verbose(`Error thrown when verifying user in resetPassword: ${err}`);
        return res.json({ failure: "This link is either invalid or expired." });
    }
    return res.json({});
};

export default servlet;