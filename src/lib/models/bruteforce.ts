/* Use strict to allow let and other ES2016 features*/
"use strict";

// get an instance of mongoose and mongoose.Schema
import { Document, model, Model, Schema } from "mongoose";

export interface BruteForceDocument extends Document {
    _id: Schema.Types.ObjectId;
    data: {
        count: number;
        firstRequest: Date;
        lastRequest: Date;
    };
    expires: Date;
}

// set up a mongoose model and pass it using module.exports
const bruteForceSchema = new Schema({
    _id: { type: String },
    data: {
        count: Number,
        firstRequest: Date,
        lastRequest: Date,
    },
    expires: { type: Date, index: { expires: "1d" } }
});

export let BruteForce: Model<BruteForceDocument> = model("BruteForce", bruteForceSchema);