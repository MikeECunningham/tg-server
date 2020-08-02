import * as request from "superagent";
import config from "@src/config";
import * as md5 from "md5";
import logs from "@src/lib/ts/logger";
const logger = logs(__filename);

const apiKey = process.env.MAILCHIMP_API_KEY;
const listURL = config.mailchimpURL + "lists/" + config.mailchimpListId + "/members";
//city and province can be input incorrectly from geocoder, so this regex is here to validate against that
let regex = /^[A-Za-z0-9 ]+$/;

export async function registerEmail(email: string, firstName: string, lastName: string, postalCode: string, province: string, city: string, subscribe: boolean): Promise<boolean> {
    return await new Promise((resolve, reject) => {
        request.post(listURL)
            .set("Content-Type", "application/json;charset=utf-8")
            .set("Authorization", "Bearer " + apiKey)
            .send({
                email_address: email,
                status: subscribe ? "subscribed" : "unsubscribed",
                merge_fields: {
                    FNAME: firstName || "Indeterminate",
                    LNAME: lastName || "Indeterminate",
                    ADDRESS: {
                        addr1: "N/A",
                        city: (regex.test(city)) ? city : "Indeterminate",
                        state: (regex.test(province)) ? province : "Indeterminate",
                        country: "Canada",
                        zip: postalCode || "Indeterminate"
                    }
                }
            })
            .end((err, response) => {
                if (!err && (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists"))) {
                    return resolve();
                } else {
                    if (err) logger.error(err);
                    return reject(response.body.title);
                }
            });
    });
}

export async function updateEmail(email: string, firstName: string, lastName: string, postalCode: string, province: string, city: string, subscribe: boolean): Promise<boolean> {
    return await new Promise((resolve, reject) => {
        request.patch(listURL + "/" + md5(email.toLowerCase()))
            .set("Content-Type", "application/json;charset=utf-8")
            .set("Authorization", "Bearer " + apiKey)
            .send({
                status: subscribe ? "subscribed" : "unsubscribed",
                merge_fields: {
                    FNAME: firstName || "Indeterminate",
                    LNAME: lastName || "Indeterminate",
                    ADDRESS: {
                        addr1: "N/A",
                        city: (regex.test(city)) ? city : "Indeterminate",
                        state: (regex.test(province)) ? province : "Indeterminate",
                        country: "Canada",
                        zip: postalCode || "Indeterminate"
                    }
                }
            })
            .end((err, response) => {
                if (!err && (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists"))) {
                    return resolve();
                } else {
                    if (err) logger.error(err);
                    return reject(response.body.title);
                }
            });
    });
}

export async function archiveEmail(email: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
        request.delete(listURL + "/" + md5(email.toLowerCase()))
            .set("Content-Type", "application/json;charset=utf-8")
            .set("Authorization", "Bearer " + apiKey)
            .send()
            .end((err, response) => {
                if (!err && (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists"))) {
                    return resolve();
                } else {
                    if (err) logger.error(err);
                    return reject(response.body.title);
                }
            });
    });
}

export async function deleteEmail(email: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
        request.post(listURL + "/" + md5(email.toLowerCase()) + "/actions/delete-permanent")
            .set("Content-Type", "application/json;charset=utf-8")
            .set("Authorization", "Bearer " + apiKey)
            .send()
            .end((err, response) => {
                if (!err && (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists"))) {
                    return resolve();
                } else {
                    if (err) logger.error(err);
                    return reject(response.body.title);
                }
            });
    });
}