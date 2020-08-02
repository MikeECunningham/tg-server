import * as mongoose from "mongoose";
import { Schema, Model, model } from "mongoose";

export interface ImageDocument extends mongoose.Document {
    _id: Schema.Types.ObjectId;
    parentId: Schema.Types.ObjectId;
    type: string;
}

// set up a mongoose model and pass it using module.exports
const ImageSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId(), required: true, auto: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Observation" },        // The id of the observation this photo was added for
    type: { type: String, enum: ["P", "C"], required: true },  // The type of the item
});

export let Image: Model<ImageDocument> = model("Image", ImageSchema);