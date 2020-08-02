import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import { User } from "@src/lib/models/user";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

servlet.post = async function (req: Request, res: Response, next: NextFunction): Promise<Response> {
    if (!req.user) {
        return res.json({ failure: "No logged in user" });
    } else {
        try {
            await User.findByIdAndUpdate( req.user._id, { "$set": { passedTest: true } }).exec();
            return res.json({});
        } catch (e) {
            return res.json({ failure: JSON.stringify(e) });
        }
    }
};

export default servlet;