import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { User } from "@src/lib/models/user";
import { Servlet } from "@src/lib/ts/servlet";
import config from "@src/config";
import * as bcrypt from "bcrypt";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        id: { type: "string" },
        enabled: { type: "boolean" }
    },
    required: ["id", "enabled"],
};

interface RESTRequest extends Request {
    body: {
        id: string;
        enabled: boolean
    };
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

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        let usr = await User.findById(req.user._id);
        if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
        if (!req.body.enabled) {
            let usrs = await User.find();
            let tally = 0
            for (let user of usrs) {
                if (user.admin) { ++tally }
            }
            if (tally <= 1) { return res.json({ failure: "There has to be at least one admin." }) }
        }
        await User.findByIdAndUpdate({ _id: req.body.id }, { admin: req.body.enabled })
    } catch (err) {
        logger.verbose(`Error thrown when verifying user in updatePrivileges: ${err}`);
        return res.json({ failure: "Request failed." });
    }
    return res.json({});
};

export default servlet;