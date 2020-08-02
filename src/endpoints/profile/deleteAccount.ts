import { NextFunction, Response, Request } from "express";
import { User } from "@src/lib/models/user";
import { Servlet } from "@src/lib/ts/servlet";
import { archiveEmail } from "@src/lib/ts/mailchimp";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

servlet.delete = async function (req: Request, res: Response, next: NextFunction): Promise<Response> {
    let usr = await User.findById(req.user._id)
    if (!!usr && usr.admin) {
        let usrs = await User.find();
        let tally = 0
        for (let user of usrs) {
            if (user.admin) { ++tally }
        }
        if (tally <= 1) { return res.json({ failure: "There has to be at least one admin." }) }
    }
    const doc = await User.findByIdAndDelete({ _id: req.user._id }).exec();
    if (!!doc) {
        await archiveEmail(req.user.email);
        return res.json({});
    } else {
        return res.json({ failure: "Error when finding profile in db" });
    }
};

export default servlet;