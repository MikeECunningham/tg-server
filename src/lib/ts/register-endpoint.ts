/**
 * Runs all of the middleware files stored inside of the provided directory.
 */

import { Application } from "express";
import { Servlet } from "./servlet";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

export default function registerEndpoint(app: Application, servlet: Servlet, route, err): void {
    logger.verbose("Registering endpoints");
    try {
        logger.verbose(`Registering ${route}`);
        try {
            const routes: string[] = Object.getOwnPropertyNames(servlet);
            if (routes.indexOf("init") !== -1) { routes.splice(routes.indexOf("init"), 1); }
            if (routes.indexOf("destroy") !== -1) { routes.splice(routes.indexOf("destroy"), 1); }

            const leftover: string[] = ["post", "put", "delete", "get", "head", "patch", "options", "trace"];

            for (const i of routes) {
                if (servlet.init) { app[i](route, servlet.init); }
                app[i](route, servlet[i]);
                leftover.splice(leftover.indexOf(i), 1);
            }

            // Registers servlet use for all servlet routes not already defined
            if (servlet.use) {
                for (const i of leftover) {
                    app[i](route, servlet.use);
                }
            }

            logger.verbose(`Registered ${route} successfully`);
        } catch (exception) {
            logger.warn(`Failed to register servlet ${route}`);
            logger.error(exception);
        }
    } catch (exception) {
        return err(exception);
    }

}
