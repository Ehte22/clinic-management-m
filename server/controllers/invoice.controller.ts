import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator } from "../utils/validator"
import { IUserProtected } from "../utils/protected"
import { Invoice } from "../models/Invoice"
import { invoiceRules } from "../rules/invoice.rules"

// Get All
export const getAllInvoices = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false, selectedClinic = "" } = req.query

    const { clinicId, role } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            role !== "Super Admin" ? { clinic: clinicId } : selectedClinic ? { clinic: selectedClinic } : {},
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { invoiceNumber: { $regex: searchQuery, $options: "i" } },
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Invoice.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Invoice.find(query).sort({ createdAt: -1 }).lean()
    } else {
        result = await Invoice.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Invoices Fetch Successfully", result, pagination })
})

// Get By ID
export const getInvoiceById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Invoice.findById(id).lean()

    if (!result) {
        return res.status(400).json({ message: "Invoice Not Found" })
    }

    res.status(200).json({ message: "Invoice Fetch Successfully", result })
})

// Add
export const addInvoice = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { clinicId } = req.user as IUserProtected

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${randomId}`

    const data = { ...req.body, clinic: clinicId, invoiceNumber }

    const { isError, error } = customValidator(data, invoiceRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Invoice.create(data)

    res.status(200).json({ message: "Invoice Add Successfully", result })
})

// Update
export const updateInvoice = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const invoice = await Invoice.findById(id).lean()
    if (!invoice) {
        return res.status(400).json({ message: "Invoice Not Found" })
    }

    await Invoice.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Invoice Update Successfully" })
})

// Update Status
export const updateInvoiceStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const invoice = await Invoice.findById(id).lean()
    if (!invoice) {
        return res.status(400).json({ message: "Invoice Not Found" })
    }

    await Invoice.findByIdAndUpdate(id, { paymentStatus: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Invoice Status Update Successfully" })
})

// Delete
export const deleteInvoice = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const invoice = await Invoice.findById(id)

    if (!invoice) {
        return res.status(400).json({ message: "Invoice Not Found" })
    }

    await Invoice.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Invoice Delete Successfully" })
})