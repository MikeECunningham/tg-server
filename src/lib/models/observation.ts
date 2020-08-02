// get an instance of mongoose and mongoose.Schema
import { Document, model, Model, Schema, Types } from "mongoose";
import { UserDocument } from "./user";

export interface ObservationDocument extends Document {
    _id: Schema.Types.ObjectId;
    species: string;
    habitat: string;
    behavior: string;
    submittedBy: UserDocument | Schema.Types.ObjectId;
    dateSubmitted: Date;
    gps: { lat: number, long: number, acc: number };
    lat: number;
    long: number;
    acc: number;
    carapaceImage: Schema.Types.ObjectId;
    plastronImage?: Schema.Types.ObjectId;
}

// set up a mongoose model and pass it using module.exports
const observationSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, default: new Types.ObjectId(), required: true, auto: true }, // The index id of the user
    species: {
        type: String,
        required: true,
        uppercase: true,
        enum: ["BNTU", "STIN", "MPTU", "MATU", "RSTU", "SNTU", "SSTU", "SPTU", "WPTU", "WOTU"]
    },
    habitat: {
        type: String,
        required: true,
        uppercase: true,
        enum: ["RIVER", "LAKE", "WETLAND", "ROCKBAREN", "OPEN", "FOREST", "ROAD", "ROADSHOULDER"]
    },
    behavior: {
        type: String,
        required: true,
        uppercase: true,
        enum: ["BASK", "SWIM", "CROS", "INJU", "NEST", "DEAD"]
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    },
    acc: {
        type: Number,
        required: true
    },
    submittedBy: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    carapaceImage: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "Image"
    },
    plastronImage: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "Image"
    },
    dateSubmitted: { 
        type: Date,
        required: true,
        default: Date.now()
    }
});

export let Observation: Model<ObservationDocument> = model("Observation", observationSchema);
