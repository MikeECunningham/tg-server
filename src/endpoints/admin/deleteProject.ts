import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Schema, Validator } from "jsonschema";
import { Project } from "@src/lib/models/project";
import { Location } from "@src/lib/models/location";
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
        logger.verbose(`Invalid json schema in deleteProject: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<any> {
    if (!!req.body.id) {
        try {
            let usr = await User.findById(req.user._id);
            if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
            let doc = await Project.findByIdAndDelete(req.body.id);
            if (!!doc) {
                await Location.findByIdAndDelete({ _id: doc.location });
                return res.json({ success: "A USER HAS BEEN DELETED. ID: " + JSON.stringify(doc._id) })
            }
        } catch (err) {
            logger.warn(`Error thrown in deleteProject: ${err}`);
            return res.json({ failure: "Internal server error" });
        }
    } else {
        return res.json({ failure: "You must provide a project ID" })
    }
}

export default servlet;