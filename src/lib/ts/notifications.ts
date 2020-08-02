import { Schema, Types, model, Model, Document, SchemaTimestampsConfig } from "mongoose";
import pointInPolygon from "assemblysys-point-in-polygon";
import { Location, LocationDocument } from "@src/lib/models/location";
import { Project } from "@src/lib/models/project";
import { Observation } from "@src/lib/models/observation";
import { Image } from "@src/lib/models/image";
import * as fs from "fs";
import observationProjectEmail from "@src/pages/dynamic/observationProjectEmail";
import logs from "@src/lib/ts/logger";
import config from "@src/config";
import * as nodemailer from "nodemailer";
import { exceptions } from "winston";

const logger = logs(__filename);

const speciesList = {
    BNTU: "Blanding's Turtle",
    STIN: "Eastern Musk Turtle",
    MPTU: "Midland Painted Turtle",
    MATU: "Northern Map Turtle",
    RSTU: "Red-eared Slider Turtle",
    SNTU: "Snapping Turtle",
    SSTU: "Spiny Softshell Turtle",
    SPTU: "Spotted Turtle",
    WPTU: "Western Painted Turtle",
    WOTU: "Wood Turtle",
    UNKN: "Other"
};

const behaviorList = {
    BASK: "Basking",
    SWIM: "Swimming",
    CROS: "Crossing Road",
    INJU: "Injured",
    NEST: "Nesting",
    DEAD: "Dead"
};

const habitatList = {
    RIVER: "River",
    LAKE: "Lake",
    WETLAND: "Wetland",
    ROCKBAREN: "Rock Barren",
    OPEN: "Open area",
    FOREST: "Forest",
    ROAD: "Road",
    ROADSHOULDER: "Shoulder Of Road"
};

export async function sendObsNotification(projectId: Schema.Types.ObjectId, observationId: Schema.Types.ObjectId): Promise<Boolean> {
    const project = await Project.findById(projectId);
    const observation = await Observation.findById(observationId);
    if (!project || !observation) { return false; }
    const transporter = nodemailer.createTransport(config.supportOptions);
    let attachments = [{ filename: "CarapaceImage.jpg", content: fs.createReadStream(`${config.imageDirectory}${observation.carapaceImage}.jpg`) }];
    if (!!observation.plastronImage) {
            attachments.push({ filename: "plastronImage.jpg", content: fs.createReadStream(`${config.imageDirectory}${observation.plastronImage}.jpg`) })
    }
    const mailOptions = {
        from: `"noreply" <${config.supportOptions.auth.user}>`,
        to: project.email,
        subject: "Turtle Observation in Your Area",
        html: observationProjectEmail(
            observation.long,
            observation.lat,
            speciesList[observation.species],
            behaviorList[observation.behavior],
            habitatList[observation.habitat],
            observation.dateSubmitted.toString()
            ),
        attachments: attachments
    };
    await transporter.sendMail(mailOptions);
    return true;
}

export async function matchAndNotifyProject(observationId: Schema.Types.ObjectId): Promise<Boolean> {
    let observation = await Observation.findById(observationId).exec();
    if (!observation) { return false; }
    let projectId = await findMatchingProject(observation.lat, observation.long);
    if (!projectId) { return false; }
    return await sendObsNotification(projectId, observation._id);
}

/**
 * Checks if a point is within a project's territory and emails that project with the details
 */
export async function findMatchingProject(obsLat: number, obsLong: number): Promise<any> {
    let locs = await (await Location.find().exec()).map((val) => val['_doc']);
    for (let loc of locs) {
        let res = pointInPolygon([obsLong, obsLat], loc.outerBoundary, true, loc.minLong, loc.maxLong, loc.minLat, loc.maxLat);
        if (res == "inside" || res == "vertex" || res == "boundary") {
            if (!!loc.innerBoundary) {
                res = pointInPolygon([obsLong, obsLat], loc.innerBoundary, true, loc.minLong, loc.maxLong, loc.minLat, loc.maxLat);
                if (res == "outside" || res == "vertex" || res == "boundary") {
                    let proj = await Project.findOne({ location: loc._id }).exec();
                    if (!proj) { return false; }
                    return proj._id;
                }
            } else {
                let proj = await Project.findOne({ location: loc._id }).exec();
                if (!proj) { return false; }
                return proj._id;
            }
        }
    }
    return false;
}