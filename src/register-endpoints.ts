/** Registers endpoints and midldewares in order */

import { Express } from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import tokenHandler from "./middlewares/tokenHandler";
import protectedHandler from "./middlewares/protectedHandler";
import config from "./config";

import registerEndpoint from "./lib/ts/register-endpoint";

import { privateEndpoints, publicEndpoints } from "./endpoints";
import { Servlet } from "./lib/ts/servlet";

import { encode, decode } from "msgpack-lite";
import * as msgpack from "express-msgpack";

import * as favicon from "serve-favicon";
import * as path from "path";

import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const registerEndpoints = async (app: Express) => {
    /* Allows cross origin requests so that the mobile app can use the endpoints */
    app.use(cors());
    // add favicon
    app.use(favicon(path.join(__dirname, "assets", "favicon.ico")));
    // Allow the messagepack encoding type
    app.use(msgpack({ decoder: decode, encoder: encode }));
    /* Enable this if there are any get requests using url encoding */
    app.get("*", bodyParser.urlencoded({ extended: false, limit: config.urlEncodedMax }));
    app.post("*", bodyParser.json({ limit: config.bodyParserMax }));
    app.use((error, req, res, next) => {
        /* Catch bodyParser error */
        if (error) { return res.send({ failure: "Invalid JSON" }); } else { next(); }
    });

      /* Registers the jwt middleware*/
      app.use("/api/*", tokenHandler);

    /* Registers the public servlets for the server */
    for (const endpoint of publicEndpoints) {
        registerEndpoint(app, endpoint[0] as Servlet, endpoint[1], catchError);
    }

    /* Registers the jwt middleware*/
    app.use("/api/*", protectedHandler);

    /* Catches the error thrown when the users jwt fails */
    app.use(catchAuthError);

    /* Registers all the protected endpoints */
    for (const endpoint of privateEndpoints) {
        registerEndpoint(app, endpoint[0] as Servlet, endpoint[1], catchError);
    }
    logger.verbose("Servlet registration complete");

    app.use(catchErrors);
};

/** Simply logs the shutdown message and kills the process */
function catchError(err: Error): void {
    logger.error(err);
    logger.error("Server instance shutting down");
    process.exit(1);
}


/* Catches the error thrown by jwt when the token is invalid */
function catchAuthError(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        return res.json({ failure: "Invalid token" });
    } else {
        return next();
    }
}

/* Catches all uncaught errors thrown by the rest endpoints */
function catchErrors(err, req, res, next) {
    logger.error("Warning: Uncaught error thrown by rest endpoint");
    logger.error(err);
    res.status(500).json({ failure: "Internal server error" });
}

export default registerEndpoints;