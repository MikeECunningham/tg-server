import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { Servlet } from "@src/lib/ts/servlet";
import { Project } from "@src/lib/models/project";
import { Location } from "@src/lib/models/location";
import logs from "@src/lib/ts/logger";
import * as fs from "fs";
import { promisify } from "util";
import * as toBufferCB from "blob-to-buffer";
import config from "@src/config";
import e = require("express");
import { User } from "@src/lib/models/user";
// Turns this call into a promise for easier use in the code
const toBuffer = promisify(toBufferCB);
const logger = logs(__filename);

const servlet = new Servlet();

interface RESTRequest extends Request {
    body: {
        name: string;
        email: string;
        description: string;
        phoneNumber: string;
        location: {
            minLat: number;
            maxLat: number;
            maxLong: number;
            innerBoundary: [[number]];
            outerBoundary: [[number]];
        };
    };
}
const validationSchema: Schema = {
    type: "object",
    properties: {
        name: { type: "string", maxLength: 200 },
        email: { type: "string", format: "email", maxLength: 200 },
        description: { type: "string", maxLength: 1500 },
        phoneNumber: { type: "string", pattern: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/ },
        location: {
            type: "object",
            properties: {
                minLat: { type: "number", minimum: -180, maximum: 180 },
                minLong: { type: "number", minimum: -180, maximum: 180 },
                maxLat: { type: "number", minimum: -180, maximum: 180 },
                maxLong: { type: "number", minimum: -180, maximum: 180 },
                innerBoundary: { type: "array", items: { type: "array", items: { type: "number" } } },
                outerBoundary: { type: "array", items: { type: "array", items: { type: "number" } } }
            },
            required: ["minLat", "minLong", "maxLat", "maxLong", "outerBoundary"]
        },
    },
    required: ["name", "email", "description", "location", "phoneNumber"],
    additionalProperties: false
};

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (!result.valid) {
        logger.warn(`Invalid json schema in project submission: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        let usr = await User.findById(req.user._id);
        if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
        let locDoc = await new Location(req.body.location);
        delete req.body.location;
        let projDoc = await new Project(req.body).save();
        locDoc.projectId = projDoc._id;
        await locDoc.save();
        await Project.findByIdAndUpdate({ _id: projDoc._id }, { location: locDoc._id }).exec();
        return res.json({ success: "Your Project was successfully submitted!" });
    } catch (e) {
        logger.error(e);
        return res.json({ failure: "Internal server error: has this project already been submitted?" });
    }
};

export default servlet;