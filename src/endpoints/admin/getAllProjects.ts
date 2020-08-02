import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { Project, ProjectDocument } from "@src/lib/models/project";
import { Location, LocationDocument } from "@src/lib/models/location";
import { User } from "@src/lib/models/user";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

servlet.post = async function (req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
        let usr = await User.findById(req.user._id);
        if (!usr || !usr.admin) { return res.json({ failure: "Failed to validate request." }) }
        return await res.json({
            projects: (await (Project.find().exec())).map((val) => {
                let doc = val['_doc'];
                if (!!doc._id) doc._id = doc._id.toString();
                return doc;
            })
        });
    } catch (err) {
        logger.warn(`Error thrown in getAllProjects: ${err}`);
        return res.json({ failure: "Internal server error" });
    }
};

export default servlet;