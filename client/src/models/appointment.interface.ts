import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";

export interface IAppointment {
    _id?: string;
    patient?: IPatient;
    doctor?: IDoctor;
    clinic?: string;
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
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}