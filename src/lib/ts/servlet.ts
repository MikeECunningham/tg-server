import { NextFunction, Request, RequestHandler, Response } from "express";
import { Schema } from "mongoose";

/* Servlet for rest endpoint. Overriding a method will cause it to be added to the registry for the route */
export class Servlet {

    /** Called on the servlet being initialised */
    public init?: InitHandler;

    /** Catches all traffic for route that hasnt been caught by other methods.*/
    public use?: RequestHandler;

    public post?: RequestHandler;

    public put?: RequestHandler;

    public delete?: RequestHandler;

    public get?: RequestHandler;

    public head?: RequestHandler;

    public patch?: RequestHandler;

    public options?: RequestHandler;

    public trace?: RequestHandler;
}

interface InitHandler extends RequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}

export interface RequestUser {
    /** The index id of the user*/
    _id: Schema.Types.ObjectId;
    /** First name of the account user */
    firstName: string;
    /** Last name of the account user */
    lastName: string;
    /** Whether the account is activated */
    activated: boolean;
    /** Last time the resend activation button was pressed */
    lastActivationEmailDate: Date;
    /** Email */
    email: string;
}