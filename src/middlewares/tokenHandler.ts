/** This servlet decodes the user from the json web token(if it exists) */
import { NextFunction, Response, Request } from "express";
import * as jwt from "jsonwebtoken";
import { User, UserDocument } from "@src/lib/models/user";
import { RequestUser } from "@src/lib/ts/servlet";
import config from "@src/config";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

interface Payload {
    user: RequestUser;
}

const tokenHandler = async function (req: Request, res: Response, next: NextFunction) {
    // use whichever auth header is present
    let token: string = req.header("Authorization") as string;
    if (token || req.query['token']) {
        try {
            token = !token ? req.query['token'] as string: token.split(" ")[1];
            const decoded: Payload = jwt.verify(token, config.secret) as Payload;
            const user = await User.findById(decoded.user._id, { password: false }).exec();
            req.user = user as RequestUser;
            req.user.email = req.user.email.toLowerCase();
            if (!(user as UserDocument).activated && req.originalUrl !== "/api/auth/resendVerificationEmail") return res.json({ failure: "Account not activated" });
            return next();
        } catch (err) {
            logger.verbose(`Error thrown while decoding token: ${err}`);
            next();
        }
    } else {
        next();
    }
};

export default tokenHandler;