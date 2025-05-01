import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator } from "../utils/validator"
import { IUserProtected } from "../utils/protected"
import { Prescription } from "../models/Prescription"
import { prescriptionRules } from "../rules/prescription.rules"

// Get All
export const getAllPrescriptions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
                        { prescriptionNumber: { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Prescription.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Prescription.find(query).sort({ createdAt: -1 }).lean()
    } else {
        result = await Prescription.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Prescriptions Fetch Successfully", result, pagination })
})

// Get By ID
export const getPrescriptionById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Prescription.findById(id).lean()

    if (!result) {
        return res.status(400).json({ message: "Prescription Not Found" })
    }

    res.status(200).json({ message: "Prescription Fetch Successfully", result })
})

// Add
export const addPrescription = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const { clinicId } = req.user as IUserProtected

    const lastPrescription = await Prescription.findOne({ clinic: clinicId }, { prescriptionNumber: 1 })
        .sort({ createdAt: -1 })
        .lean();

    let newNumber = 1001;

    if (lastPrescription?.prescriptionNumber) {
        const lastNumber = parseInt(lastPrescription.prescriptionNumber.split("-")[1], 10);
        newNumber = lastNumber + 1;
    }

    const prescriptionNumber = `PRES-${newNumber}`;

    const data = { ...req.body, clinic: clinicId, prescriptionNumber }

    const { isError, error } = customValidator(data, prescriptionRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Prescription.create(data)

    res.status(200).json({ message: "Prescription Add Successfully", result })
})

// Update
export const updatePrescription = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const prescription = await Prescription.findById(id).lean()
    if (!prescription) {
        return res.status(400).json({ message: "Prescription Not Found" })
    }

    await Prescription.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Prescription Update Successfully" })
})

// Delete
export const deletePrescription = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const prescription = await Prescription.findById(id)

    if (!prescription) {
        return res.status(400).json({ message: "Prescription Not Found" })
    }

    await Prescription.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Prescription Delete Successfully" })
})