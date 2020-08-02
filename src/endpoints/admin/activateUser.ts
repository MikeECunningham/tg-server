import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { Servlet } from "@src/lib/ts/servlet";
import { User } from "@src/lib/models/user";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

const validationSchema: Schema = {
    type: "object",
    properties: {
        id: { type: "string" }
    },
    required: ["id"],
};

interface RESTRequest extends Request {
    body: {
        id: string;
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

servlet.post = async function (req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
        let usr = await User.findById(req.user._id);
        if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
        await User.findByIdAndUpdate(req.body.id, { $set: { activated: true } });
        return res.json({ success: "User activated" });
    } catch (err) {
        logger.warn(`Error thrown in activateUser: ${err}`);
        return res.json({ failure: "Internal server error" });
    }
};

export default servlet;