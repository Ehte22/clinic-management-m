import mongoose, { Model, Schema, Types } from "mongoose";

interface IReceptionist {
    _id: Types.ObjectId;
    clinic?: Types.ObjectId;
    user?: Types.ObjectId;
    deletedAt: Date | null;
    status: 'active' | 'inactive';
    schedule: { day: string, startTime: string, endTime: string }[];
}

const receptionistSchema = new Schema<IReceptionist>({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    clinic: { type: mongoose.Types.ObjectId, ref: 'Clinic', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: "active" },
    schedule: [
        {
            day: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true }
        }
    ],
    deletedAt: { type: Date, default: null }
}, { timestamps: true })

export const Receptionist: Model<IReceptionist> = mongoose.model<IReceptionist>("Receptionist", receptionistSchema);
