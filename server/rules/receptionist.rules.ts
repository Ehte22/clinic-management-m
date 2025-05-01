import { validationRulesSchema } from "../utils/validator";

export const receptionistRules: validationRulesSchema = {
    clinic: { required: true },
    firstName: { required: true },
    lastName: { required: true },
    email: { required: true, email: true },
    phone: { required: true, pattern: /^[6-9]\d{9}$/ },
    schedule: [
        {
            day: { required: true },
            startTime: { required: true },
            endTime: { required: true },
        },
    ],
    profile: { required: false }
}