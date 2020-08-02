import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Observation } from "@src/lib/models/observation";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

servlet.post = async function (req: Request, res: Response, next: NextFunction): Promise<Response> {
    if (!!req.user) {
        try {
            return res.json({ observations: await (await (Observation.find({ submittedBy: req.user._id }, {previousSubmissions: false}).exec())).map((val)=>val['_doc'])});
        } catch (err) {
            logger.warn(`Error thrown in get Observations: ${err}`);
            return res.json({ failure: "Internal server error" });
        }
    } else {
        return res.json({ failure: "No logged in user" });
    }
};

export default servlet;