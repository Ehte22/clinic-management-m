import { validationRulesSchema } from "../utils/validator";

export const prescriptionRules: validationRulesSchema = {
    clinic: { required: true },
    patient: { required: true },
    prescriptionNumber: { required: true },
    age: { required: true },
    weight: { required: true },
    medical: [
        {
            medicine: { required: true },
            dosage: { required: true },
            duration: { required: true, },
            frequency: { required: true, checkbox: true },
            quantity: { required: true },
            tests: { required: false },
            instructions: { required: true },
        }
    ],
    pulse: { required: false },
    note: { required: false },
    cvs: { required: false },
    bp: { required: false },
    rs: { required: false },
    pa: { required: false },
    temp: { required: false },
    complete: { required: false },
    diagnost: { required: false },
};