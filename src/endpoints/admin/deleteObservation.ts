import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Schema, Validator } from "jsonschema";
import { Image } from "@src/lib/models/image";
import { Observation } from "@src/lib/models/observation";
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
        logger.verbose(`Invalid json schema in deleteObservation: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<any> {
    if (!!req.body.id) {
        try {
            let usr = await User.findById(req.user._id);
            if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
            // Deleting an obs means deleting 1. the obs, 2. the image metadata listing(s), and 3. the image(s) on file
            let doc = await Observation.findByIdAndDelete(req.body.id);
            if (!!doc) {
                let img = await Image.findOneAndDelete({ parentId: doc._id }).exec();
                if (!!img) { fs.unlinkSync(`${config.imageDirectory}${img._id}.jpg`); }
                img = await Image.findOneAndDelete({ parentId: doc._id }).exec();
                if (!!img) { fs.unlinkSync(`${config.imageDirectory}${img._id}.jpg`); }
                return res.json({ success: "AN OBSERVATION HAS BEEN DELETED. ID: " + JSON.stringify(doc._id) });
            }
        } catch (err) {
            logger.warn(`Error thrown in deleteObservation: ${err}`);
            return res.json({ failure: "Internal server error" });
        }
    } else {
        return res.json({ failure: "You must provide an observation ID" })
    }
}

export default servlet;