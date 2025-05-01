export interface IPrescription extends Document {
    _id?: string;
    clinic?: string;
    patient?: string;
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

