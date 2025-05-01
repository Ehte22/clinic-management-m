import { IUser } from "./user.interface";

export interface IReceptionist {
    _id?: string
    clinic?: string
    user?: IUser
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone: number
    confirmPassword?: string
    profile?: string
    status?: 'active' | 'inactive';
    schedule?: {
        date?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
        startTime?: string
        endTime?: string
    }
}