/** This servlet decodes the user from the json web token(if it exists) */
import { NextFunction, Response, Request } from "express";
import * as jwt from "jsonwebtoken";
import { User, UserDocument } from "../lib/models/user";
import { RequestUser } from "../lib/ts/servlet";
import logger from "../lib/ts/logger";
import config from "../config";

interface Payload {
    user: RequestUser;
}

const protectedHandler = async function (req: Request, res: Response, next: NextFunction) {
    if (req.user) {
        return await next();
    } else {
        return await res.json({ failure: "No token provided" });
    }
};

export default protectedHandler;