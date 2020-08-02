/** Removes error caused by import library */
require('events').EventEmitter.defaultMaxListeners = 0
require('events').EventEmitter.prototype._maxListeners = 0;
/** This import allows node to use absolute imports*/
import 'module-alias/register';

import * as express from "express";
import { Express } from "express";
import * as fs from "fs";
import * as path from "path";
import * as mongoose from "mongoose";
import registerEndpoints from "./register-endpoints";
import { User } from "@src/lib/models/user";
import * as bcrypt from "bcrypt";
import config from "./config";
import logs from "@src/lib/ts/logger";
import { requestPasswordReset } from "@src/endpoints/auth/requestPasswordReset"
const logger = logs(__filename);
require("isomorphic-fetch");

logger.info(`Node Environment: ${process.env.NODE_ENV}`);

/* Create the express server */
const app: Express = express();


/* Main function to start application. */
try {
    /* Checks the mongoose database connection */
    setTimeout(() => checkDB(), 10000);
    

    createFolders();

    /* Registers all of the endpoints */
    registerEndpoints(app);
    createDefaultAdmin();
    app.listen(config.port);
    logger.verbose(`Listening on port ${config.port}`);
} catch (exception) {
    logger.error(exception);
    shutdown();
}

/** Simply logs the sutdown message and kills the process */
function shutdown(): void {
    logger.error("Server instance shutting down");
    process.exit(1);
}

async function createDefaultAdmin() {
    try {
        let password = await bcrypt.hash(config.defaultUser.password, config.bcryptHashRounds);
        await User.findOneAndDelete({ email: config.defaultUser.email });
        let user = await new User({ ...config.defaultUser, password }).save();
        await requestPasswordReset(user);
    } catch (err) {
        logger.error(err);
    }
}

/** Checks the mongodb database connection */
async function checkDB() {
    try {
        mongoose.set("useCreateIndex", true);
        const uri = `${config.databaseOptions.url}${config.databaseOptions.username}:${config.databaseOptions.password}@database:${config.databaseOptions.port}/${config.databaseOptions.dbName}`;

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useFindAndModify: false,
            authSource: "admin",
            reconnectTries: 30,
            reconnectInterval: 5000,
            autoReconnect: true,
            poolSize: 5,
            useUnifiedTopology: true
        });
        const db = mongoose.connection;
        db.on("error", () => {
            console.error(`Could not connect to mongodb instance at ${uri};`);
            logger.info(`Could not connect to mongodb instance at ${uri};`);
            shutdown();
        });
    } catch (exception) {
        logger.error(exception);
        shutdown();
    }
}

/** Creates the needed folders at startup */
function createFolders() {
    const temp = path.resolve(config.tempDirectory);
    const images = path.resolve(config.imageDirectory);
    if (!fs.existsSync(temp)) {
        logger.info("Temp folder not found; Creating");
        fs.mkdirSync(temp, { recursive: true });
    }
    if (!fs.existsSync(images)) {
        logger.info("Image folder not found; Creating");
        fs.mkdirSync(images, { recursive: true });
    }
}
process.on("unhandledRejection", (err) => {
    logger.error(err || "Unhandled promise rejection in main scope.");
    process.exit(1);
});

export default app;
