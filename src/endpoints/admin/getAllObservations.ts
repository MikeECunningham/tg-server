import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Observation } from "@src/lib/models/observation";
import logs from "@src/lib/ts/logger";
import { User } from "@src/lib/models/user";
const logger = logs(__filename);

const servlet = new Servlet();

servlet.post = async function (req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
        let usr = await User.findById(req.user._id);
        if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
        let usrs = await User.find();
        if (!usrs) { return res.json({ failure: "Couldn't find any users to link to observations for some reason" }) }
        return await res.json({
            observations: (await (Observation.find().exec())).map(
                function (val) {
                    let doc: any = val['_doc'];
                    if (!!doc.plastronImage) doc.plastronImage = doc.plastronImage.toString();
                    if (!!doc.carapaceImage) doc.carapaceImage = doc.carapaceImage.toString();
                    if (!!doc._id) doc._id = doc._id.toString();
                    if (!!doc.submittedBy) {
                        for (let usr of usrs) {
                            if (usr._id.toString() == doc.submittedBy.toString()) { doc.email = usr.email; }
                        }
                    } else {
                        doc.email = "Anonymous";
                    }
                    return doc;
                })
        });
    } catch (err) {
        logger.warn(`Error thrown in getAllObservations: ${err}`);
        return res.json({ failure: "Internal server error" });
    }
};

export default servlet;