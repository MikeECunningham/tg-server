import { NextFunction, Response, Request } from "express";
import { User } from "@src/lib/models/user";
import { Servlet } from "@src/lib/ts/servlet";
import * as nodemailer from "nodemailer";
import config from "@src/config";
import * as jwt from "jsonwebtoken";
import activationEmail from "@src/pages/dynamic/activationEmail";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const servlet = new Servlet();

servlet.post = async function (req: Request, res: Response, next: NextFunction): Promise<any> {
    const doc = await User.findOne({email: req.user.email}).exec();
    if (!!doc && !req.user.activated) {
        if (new Date().getTime() - doc.lastActivationEmailDate.getTime() >= 2000) {
            try {
                await User.findByIdAndUpdate(req.user._id, { lastActivationEmailDate: new Date() });
            } catch (err) {
                logger.warn(`Error thrown in resendVerificationEmail: ${err.toString()}`);
                return res.json({ failure: "Couldn't find account." });
            }
            if (process.env.NODE_ENV !== "test") {
                // create reusable transporter object using the default SMTP transport
                const transporter = nodemailer.createTransport(config.supportOptions);
                const verificationPayload = { _id: req.user._id };
                const verificationToken = jwt.sign(verificationPayload, config.verificationOptions.tokenSecret, { expiresIn: config.verificationOptions.tokenLifetime });
                const link = config.verificationOptions.baseUrl + "api/auth/verifyEmail?token=" + verificationToken;
                const mailOptions = {
                    from: `"noreply" <${config.supportOptions.auth.user}>`, // sender address
                    to: req.user.email, // list of receivers
                    subject: "Account activation", // Subject line
                    html: activationEmail(link)// html body
                };
                // send mail with defined transport object
                await transporter.sendMail(mailOptions);
            }
            return res.json({});
        } else {
            return res.json({ failure: "You have resent too many times" });
        }
    } else {
        return res.json({ failure: "User is already activated" });
    }
};

export default servlet;