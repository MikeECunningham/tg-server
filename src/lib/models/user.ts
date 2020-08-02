import { Document, model, Model, Schema, Types } from "mongoose";

export interface UserDocument extends Document {
    _id: Schema.Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    activated: boolean;
    lastActivationEmailDate: Date;
    accountType: string;
    passedTest: boolean;
    facebookId: string;
    acceptEmails: boolean;
    postalCode: string;
    admin: boolean;
}

// set up a mongoose model and pass it using module.exports
const userSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, default: new Types.ObjectId(), required: true, auto: true }, // The index id of the user
    facebookId: { type: String }, // The id for the user of they are from facebook
    email: { type: String, unique: true, lowercase: true, maxlength: 200 },     // Login Username
    firstName: { type: String, required: true, maxlength: 200 },    // Name of the account user
    lastName: { type: String, maxlength: 200 },     // Name of the account user
    password: { type: String, minlength: 8 },                    // Blowfish hashed password
    activated: { type: Boolean },                   // If the account has been authenticated via email(native accounts only)
    lastActivationEmailDate: { type: Date, default: new Date(new Date().getTime() - 600000) }, // Time signature for the last time the activation button resend was pressed
    referenceType: { type: String, maxlength: 200 },              // The way the account was refered
    accountType: { type: String, enum: ["facebook", "twitter", "google", "email"], required: true },
    acceptEmails: { type: Boolean },
    passedTest: { type: Boolean }, // If the user passed the turtle test
    postalCode: { type: String },
    admin: { type: Boolean }
});

export let User: Model<UserDocument> = model("User", userSchema);
