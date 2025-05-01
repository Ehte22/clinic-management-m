import mongoose, { Model, Schema } from "mongoose";

export interface IAppointment {
    patient: mongoose.Schema.Types.ObjectId;
    doctor: mongoose.Schema.Types.ObjectId;
    clinic: mongoose.Schema.Types.ObjectId;
    date: Date;
    timeSlot: { from: string; to: string };
    reason: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    payment: {
        amount: number;
        method: 'cash' | 'card' | 'online';
        status: 'paid' | 'unpaid';
    };
    notes?: string;
    label?: string;
    deletedAt?: Date | null;
}

const appointmentSchema = new Schema<IAppointment>(
    {
        clinic: { type: mongoose.Types.ObjectId, ref: 'Clinic', required: true },
        patient: { type: mongoose.Types.ObjectId, ref: 'Patient', required: true },
        doctor: { type: mongoose.Types.ObjectId, ref: 'Doctor', required: true },
        date: { type: Date, required: false },
        timeSlot: {
            from: { type: String, required: true },
            to: { type: String, required: true },
        },
        reason: { type: String, required: false },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
            default: 'scheduled',
        },
        payment: {
            amount: { type: Number, default: 0 },
            method: {
                type: String,
                enum: ['cash', 'card', 'online'],
                default: 'cash',
            },
            status: {
                type: String,
                enum: ['paid', 'unpaid'],
                default: 'unpaid',
            },
        },
        notes: { type: String },
        label: { type: String },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export const Appointment: Model<IAppointment> = mongoose.model<IAppointment>("Appointment", appointmentSchema);
