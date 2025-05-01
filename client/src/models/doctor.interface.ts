import { IUser } from "./user.interface";

export interface IDoctor {
    _id: string;
    clinic?: string;
    user?: IUser;
    specialization?: string;
    schedule?: { day: string; from: string; to: string }[];
    qualification?: string[];
    experience_years?: number;
    bio?: string;
    label?: string;
    emergency_contact?: string;
}