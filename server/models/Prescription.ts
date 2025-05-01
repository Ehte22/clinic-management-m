import mongoose, { Document } from "mongoose";

export interface IPrescription extends Document {
    clinic: mongoose.Schema.Types.ObjectId;
    patient: mongoose.Schema.Types.ObjectId;
    weight?: number;
    age?: number;
    medical: {
        medicine: string;
        dosage: string;
        duration: number;
        instructions: "Before Meal" | "After Meal" | "Without Meal";
        frequency: string;
        tests?: string[];
        quantity: number
    }[];
    prescriptionNumber: string;

    pulse?: number;
    quantity: number;
    frequency: string
    note?: string;
    temp?: string;
    cvs?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    bp?: string;
    pa?: string;
    rs?: number;
    complete?: boolean;
    diagnost?: string;
    visitDate: Date;
}

const prescriptionSchema = new mongoose.Schema<IPrescription>(
    {
        clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        age: { type: Number, required: true },
        weight: { type: Number, required: true },
        medical: [
            {
                medicine: { type: String, required: true },
                dosage: { type: String, required: true },
                duration: { type: Number, required: true },
                frequency: { type: [String], required: true },
                quantity: { type: Number, required: true },
                tests: { type: String },
                instructions: {
                    type: String,
                    enum: ["Before Meal", "After Meal", "Without Meal"],
                    required: true
                },
            },
        ],
        note: { type: String, },
        complete: { type: String },
        diagnost: { type: String },
        prescriptionNumber: { type: String, unique: true, },
        deletedAt: { type: Date, default: null },
        temp: { type: String },
        bp: { type: String },
        pulse: { type: String },
        pa: { type: String },
        rs: { type: String },
        cvs: { type: String },


    },
    { timestamps: true }
);

export const Prescription = mongoose.model<IPrescription>("Prescription", prescriptionSchema);



