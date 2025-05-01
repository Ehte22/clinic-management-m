export interface IInvoice {
    _id?: string
    invoiceNumber: string;
    appointmentId?: string
    patientId?: string;
    doctorId?: string;
    clinic?: string;
    issueDate: Date;
    dueDate?: Date;
    label: string;
    items: {
        title: string;
        quantity: string;
        unitPrice: string;
        total: string;
    }[];
    subtotal: string;
    tax?: string;
    discount?: string;
    totalAmount: string;
    paymentStatus: 'paid' | 'unpaid' | 'pending';
    paymentMethod?: 'cash' | 'card' | 'online';
    notes?: string;
    isDelete: boolean;
}