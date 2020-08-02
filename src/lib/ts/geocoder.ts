import * as request from "superagent";
import config from "@src/config";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

export async function postalCodeLookup(postalCode: string): Promise<any> {
    return await new Promise((resolve, reject) => {
        request.get(config.geocoderURL + postalCode + "?json=1")
        .set("Content-Type", "application/json;charset=utf-8")
        .end((err, response) => {
            if (!err && response.status != 404) {
                return resolve(response.text);
            } else {
                if (err) logger.error(err);
                return reject(response.text);
            }
        });
    });
}