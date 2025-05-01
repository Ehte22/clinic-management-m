import { validationRulesSchema } from "../utils/validator";

export const patientRules: validationRulesSchema = {
    name: { required: true, min: 2, max: 100 },
    age: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
    weight: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
    contactInfo: { required: true, pattern: /^[6-9]\d{9}$/ },
    email: { required: false, email: true },
    dateOfBirth: { required: true },
    gender: { required: true },
    address: {
        object: true,
        city: { required: true },
        state: { required: false },
        country: { required: false },
        street: { required: false, min: 2, max: 500 },
        zipCode: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
    },
    emergencyContact: {
        object: true,
        name: { required: false },
        relationship: { required: false },
        contactNumber: { required: false, pattern: /^[6-9]\d{9}$/ },
    },
} 