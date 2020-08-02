import { RequestUser } from "../../lib/ts/servlet";

declare module "express-serve-static-core" {
    export interface Request {
        user: RequestUser;
    }
}
