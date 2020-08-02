/**
 * Creates a weston logger for logging issues to a file
 */
import {createLogger, format, transports} from "winston";
import config from "@src/config";
import * as fs from "fs";
import * as path from "path";

const today = new Date().toISOString().split("T")[0];
const logs = path.resolve(`${config.logDirectory}logs`);
const errorLogs = path.resolve(`${config.logDirectory}logs`);

if (!fs.existsSync(logs)) {
    fs.mkdirSync(logs, { recursive: true });
}
if (!fs.existsSync(errorLogs)) {
    fs.mkdirSync(errorLogs, { recursive: true });
}

const errorStackFormat = format(info => {
    if (info instanceof Error) {
      return Object.assign({}, info, {
        stack: info.stack,
        message: info.message
      });
    }
    return info;
});

let transport: any = [
    new transports.Console({
        silent: true,
    }),
];
if (process.env.NODE_ENV !== "test") {
    transport = [
        new transports.Console({
            level: "verbose",
        }),
        new transports.File({
            filename: `${config.logDirectory}logs/${today}.log`,
            level: "info",
        }),

    ];
}

const logger = function(filename: string) {
    // Depending on if the server is run from the source code directly
    // or from the compiled folder
    let index = filename.indexOf('dist/');
    if(index === -1) index = filename.indexOf('src/');
    filename = filename.substring(index+4)
    return createLogger({
        exitOnError: false,
        format: format.combine(
            errorStackFormat(),
            format.timestamp({
                format: "YYYY-MM-DD HH:mm",
              }),
            format.printf((info) => `[${info.timestamp}][${filename}][${info.level}] ${info.message}`),
          ),
        transports: transport,

    });
};

export default logger;
