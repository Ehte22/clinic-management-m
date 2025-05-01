import mongoose, { Model, Schema } from "mongoose";

export interface IPatient {
    _id?: string;
    clinic?: mongoose.Types.ObjectId;
    name: string;
    age: number;
    weight: number;
    dateOfBirth: Date;
    contactInfo: string;
    email: string;
    gender: string;
    address: {
        city: string;
        state: string;
        country: string;
        street: string;
        zipCode: string;
    };
    emergencyContact?: {
        name: string
        relationShip: string
        contactInfo: string
    }
    status: "active" | "inactive"
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
}

const patientSchema = new Schema<IPatient>(
    {
        clinic: { type: mongoose.Types.ObjectId, ref: 'Clinic', required: true },
        name: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['male', 'female', 'other'], required: true },
        contactInfo: { type: String, required: true, },
        email: { type: String },
        age: { type: Number, required: true },
        weight: { type: Number, required: true },
        address: {
            city: { type: String, required: true },
            state: { type: String },
            country: { type: String },
            street: { type: String },
            zipCode: { type: String },
        },
        status: { type: String, default: "active" },
        emergencyContact: {
            name: { type: String },
            relationShip: { type: String },
            contactNumber: { type: String, },
        },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export const Patient: Model<IPatient> = mongoose.model<IPatient>("Patient", patientSchema);


