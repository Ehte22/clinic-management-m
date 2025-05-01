export interface IPatient {
    _id?: string;
    clinic: string;
    name: string;
    age: number;
    weight: number;
    dateOfBirth: string;
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
        contactNumber: string
    }
    status: "active" | "inactive"
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
}