import { NextFunction, Response, Request } from "express";
import { Schema, Validator } from "jsonschema";
import { Servlet } from "@src/lib/ts/servlet";
import { Observation } from "@src/lib/models/observation";
import { Image } from "@src/lib/models/image";
import logs from "@src/lib/ts/logger";
import * as fs from "fs";
import { promisify } from "util";
import * as toBufferCB from "blob-to-buffer";
import config from "@src/config";
import { matchAndNotifyProject } from "@src/lib/ts/notifications";

// Turns this call into a promise for easier use in the code
const toBuffer =  promisify(toBufferCB);
const logger = logs(__filename);

const servlet = new Servlet();


interface RESTRequest extends Request {
    body: {
        species: string;
        behavior: string;
        habitat: string;
        lat: number;
        long: number;
        acc: number;
        plastronImage: Buffer,
        carapaceImage: Buffer;
        previousSubmissions: string;
    };
}
const validationSchema: Schema = {
    type: "object",
    properties: {
        species: { type: "string", enum: ["BNTU", "STIN", "MPTU", "MATU", "RSTU", "SNTU", "SSTU", "SPTU", "WPTU", "WOTU"] },
        behavior: { type: "string", enum: ["BASK", "SWIM", "CROS", "INJU", "NEST", "DEAD"] },
        habitat: { type: "string", enum: ["RIVER", "LAKE", "WETLAND", "ROCKBAREN", "OPEN", "FOREST", "ROAD", "ROADSHOULDER"] },
        lat: { type: "number" },
        long: { type: "number" },
        acc: { type: "number" },
        plastronImage: { type: "buffer" },
        carapaceImage: { type: "buffer" },
        previousSubmissions: { type: "string", maxLength: 200 }
    },
    required: ["species", "behavior", "habitat", "lat", "long", "acc", "carapaceImage"],
    additionalProperties: false
};

servlet.init = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const validator = new Validator();
    const result = validator.validate(req.body, validationSchema);
    if (!result.valid) {
        logger.warn(`Invalid json schema in submit observation: ${result.errors.toString()}`);
        logger.verbose(JSON.stringify(req.body));
        return res.json({ failure: "Invalid JSON Schema" });
    }
    return next();
};

servlet.post = async function (req: RESTRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        logger.info("Hit post submitObservation");
        const carapaceImage = req.body.carapaceImage;
        const plastronImage = req.body.plastronImage;
        delete req.body.carapaceImage;
        delete req.body.plastronImage;
        let observationDocument = new Observation(req.body);
        if (req.user) observationDocument.submittedBy = req.user._id;
        observationDocument = await observationDocument.save();
        const carapaceImageDocument = await new Image({ parentId: observationDocument._id, type: "C" }).save();
        observationDocument.carapaceImage = carapaceImageDocument._id;
        fs.writeFileSync(`${config.imageDirectory}${carapaceImageDocument._id}.jpg`, carapaceImage);

        if (!!plastronImage) {
            const plastronImageDocument = await new Image({ parentId: observationDocument._id, type: "P" }).save();
            observationDocument.plastronImage = plastronImageDocument._id;
            fs.writeFileSync(`${config.imageDirectory}${plastronImageDocument._id}.jpg`, plastronImage);
        }
        await observationDocument.save();
        await matchAndNotifyProject(observationDocument._id);
        return res.json({ _id: observationDocument._id });
    } catch (e) {
        logger.error(e);
        return res.json({ failure: e });
    }
};
export default servlet;
