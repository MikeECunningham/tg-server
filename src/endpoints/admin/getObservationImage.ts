import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Schema, Validator } from "jsonschema";
import { Image } from "@src/lib/models/image"
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
};

interface RESTRequest extends Request {
    query: {
        id: string
    };
}

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.query, validationSchema);
    if (!result.valid) {
        logger.verbose(`Invalid json schema in email verification: ${result.errors.toString()}`);
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.get = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<any> {
    if (!!req.query.id) {
        try {
            let usr = await User.findById(req.user._id);
            if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
            let doc = await Image.findById(req.query.id);
            if (!!doc) {
                let readStream = fs.createReadStream(`${config.imageDirectory}${req.query.id}.jpg`);
                readStream.pipe(res);
            }
        } catch (err) {
            logger.warn(`Error thrown in getObservationImage: ${err}`);
            return res.json({ failure: "Internal server error" });
        }
    } else {
        return res.json({ failure: "You must provide an observation ID" })
    }
};

export default servlet;