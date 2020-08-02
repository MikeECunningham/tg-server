import { Schema, Types, model, Model, Document } from "mongoose";

export interface ProjectDocument extends Document {
  _id: Schema.Types.ObjectId;
  /** The name given to the project */
  name: string;
  /** The description of this project */
  description: string;
  /** The project location */
  location: Schema.Types.ObjectId;
  /** The email address for the project */
  email: string;
  /** The phone number of the project */
  phoneNumber: string;
}

const projectSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
    required: true,
    auto: true
  },
  name: { type: String, required: true, unique: true, maxLength: 200 },
  description: { type: String, required: false, maxLength: 1500 },
  location: { type: Schema.Types.ObjectId, required: false, ref: "Location" },
  email: { type: String, required: true, maxLength: 200 },
  phoneNumber: { type: String, required: true, pattern: "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$" }
});

export let Project: Model<ProjectDocument> = model(
  "Project",
  projectSchema
);