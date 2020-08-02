import { Schema, Types, model, Model, Document } from "mongoose";

export interface LocationDocument extends Document {
  _id: Schema.Types.ObjectId;
  /** Project ID for this location */
  projectId: Schema.Types.ObjectId;
  /** The minimum latitude of the location */
  minLat: number;
  /** The minimum longitude of the location */
  minLong: number;
  /** The maximum latitude of the location */
  maxLat: number;
  /** The maximum longitude of the location */
  maxLong: number;
  /** The boundary for the inside polygon */
  innerBoundary: [[number]];
  /** The boundary for the outside polygon */
  outerBoundary: [[number]];
}

const locationSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
    required: true,
    auto: true
  },
  projectId: { type: Schema.Types.ObjectId, required: true, ref: "Project"},
  minLat: { type: Number, required: true, min: -180, max: 180 },
  minLong: { type: Number, required: true, min: -180, max: 180 },
  maxLat: { type: Number, required: true, min: -180, max: 180 },
  maxLong: { type: Number, required: true, min: -180, max: 180 },
  innerBoundary: { type: [[Number]] },
  outerBoundary: { type: [[Number]], required: true }
});

export let Location: Model<LocationDocument> = model(
  "Location",
  locationSchema
);