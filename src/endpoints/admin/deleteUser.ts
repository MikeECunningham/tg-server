import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Schema, Validator } from "jsonschema";
import * as fs from "fs";
import config from "@src/config";
import logs from "@src/lib/ts/logger";
import { User } from "@src/lib/models/user";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        id: { type: "string" },
    },
    required: ["id"],
    additionalProperties: false
};

interface RESTRequest extends Request {
    body: {
        id: string
    };
}

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (!result.valid) {
        logger.verbose(`Invalid json schema in deleteUser: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<any> {
    if (!!req.body.id) {
        try {
            let admn = await User.findById(req.user._id);
            if (!admn || !admn.admin) { return res.json({ failure: "Failed to validate request." }) }
            let usr = await User.findById(req.body.id);
            if (!!usr && usr.admin == true) {
                    let usrs = await User.find();
                let tally = 0
                for (let user of usrs) {
                    if (user.admin) { ++tally }
                }
                if (tally <= 1) { return res.json({ failure: "There has to be at least one admin." }) }
            }
            let user = await User.findByIdAndDelete({ _id: req.body.id }).exec();
            if (!!user) { return res.json({ success: "A USER HAS BEEN DELETED. ID: " + JSON.stringify(user._id) }); }
        } catch (err) {
            logger.warn(`Error thrown in deleteUser: ${err}`);
            return res.json({ failure: "Internal server error" });
        }
    } else {
        return res.json({ failure: "You must provide a User ID" })
    }
}

export default servlet;