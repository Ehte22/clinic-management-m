import { validationRulesSchema } from "../utils/validator";

export const invoiceRules: validationRulesSchema = {
    appointmentId: { required: true },
    issueDate: { required: true },
    dueDate: { required: true },
    items: [
        {
            title: { required: true },
            quantity: { required: true, },
            unitPrice: { required: true, },
            total: { required: true, },
        },
    ],
    tax: { required: false },
    discount: { required: false },
    totalAmount: { required: true, },
    paymentMethod: { required: true, pattern: /^(cash|card|online)$/ },
    notes: { required: false, min: 2, max: 500 },
}