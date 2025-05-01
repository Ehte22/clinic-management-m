import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "./User";

export interface IDoctor {
    user: IUser
    clinic: mongoose.Schema.Types.ObjectId;
    specialization: string;
    schedule: { day: string, startTime: string, endTime: string }[];
    qualification?: string[];
    experience_years?: String;
    bio?: string;
    label?: string;
    deletedAt?: Date | null;
    emergency_contact?: String;
}


const doctorSchema = new Schema<IDoctor>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',

    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Clinic',
    },
    specialization: { type: String },
    schedule: [
        {
            day: { type: String },
            startTime: { type: String },
            endTime: { type: String }
        }
    ],
    qualification: { type: String },
    experience_years: { type: String },
    bio: { type: String },
    label: { type: String },
    emergency_contact: { type: String },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });


export const Doctor: Model<IDoctor> = mongoose.model<IDoctor>("Doctor", doctorSchema);
