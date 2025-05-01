import { validationRulesSchema } from "../utils/validator";

export const appointmentRules: validationRulesSchema = {
    patient: { required: true },
    doctor: { required: true },
    date: { required: true },
    reason: { required: false, min: 2, max: 500 },
    status: { required: false },
    notes: { required: false, min: 2, max: 500 },
    label: { required: false, min: 2, max: 100 },
    timeSlot: {
        object: true,
        from: { required: true },
        to: { required: true }
    }
    ,
    payment: {
        object: true,
        amount: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
        method: { required: false },
        status: { required: false }
    }
};