import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Schema, Validator } from "jsonschema";
import { Image } from "@src/lib/models/image";
import { Observation } from "@src/lib/models/observation";
import * as fs from "fs";
import config from "@src/config";
import logs from "@src/lib/ts/logger";
import { User } from "@src/lib/models/user";
//import { Schema } from "mongoose";
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
        logger.verbose(`Invalid json schema in deleteImage: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<any> {
    if (!!req.body.id) {
        try {
            let usr = await User.findById(req.user._id);
            if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
            let img = await Image.findByIdAndDelete(req.body.id).exec();
            if (!!img) {
                fs.unlinkSync(`${config.imageDirectory}${img._id}.jpg`);
                let type = (img.type == "C") ? { carapaceImage: 1 } : { plastronImage: 1 };
                await Observation.findByIdAndUpdate({ _id: img.parentId }, { $unset: { type: 1 } }).exec();
                return res.json({ success: "AN IMAGE HAS BEEN DELETED. ID: " + JSON.stringify(img._id) })
            }
        } catch (err) {
            logger.warn(`Error thrown in deleteImage: ${err}`);
            return res.json({ failure: "Internal server error" });
        }
    } else {
        return res.json({ failure: "You must provide an Image ID" })
    }
}

export default servlet;