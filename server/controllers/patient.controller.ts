import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator } from "../utils/validator"
import { IUserProtected } from "../utils/protected"
import { Patient } from "../models/Patient"
import { patientRules } from "../rules/patient.rules"

// Get All
export const getAllPatients = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false, selectedClinic = "", onlyToday = false } = req.query

    const { clinicId, role } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const query: any = {
        $and: [
            role !== "Super Admin" ? { clinic: clinicId } : selectedClinic ? { clinic: selectedClinic } : {},
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { name: { $regex: searchQuery, $options: "i" } },
                    ]
                }
                : {},
            onlyToday === "true" ? { createdAt: { $gte: todayStart, $lte: todayEnd } } : {},
        ]
    }

    const totalEntries = await Patient.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Patient.find(query).sort({ createdAt: -1 }).lean()
    } else {
        result = await Patient.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Patients Fetch Successfully", result, pagination })
})

// Get By ID
export const getPatientsById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Patient.findById(id).lean()

    if (!result) {
        return res.status(400).json({ message: "Patient Not Found" })
    }

    res.status(200).json({ message: "Patient Fetch Successfully", result })
})

// Add
export const addPatient = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const { clinicId } = req.user as IUserProtected

    const data = { ...req.body, clinic: clinicId }

    const { isError, error } = customValidator(data, patientRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Patient.create(data)

    res.status(200).json({ message: "Patient Add Successfully", result })
})

// Update
export const updatePatient = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const patient = await Patient.findById(id).lean()
    if (!patient) {
        return res.status(400).json({ message: "Patient Not Found" })
    }

    await Patient.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Patient Update Successfully" })
})

// Update Status
export const updatePatientStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const patient = await Patient.findById(id).lean()
    if (!patient) {
        return res.status(400).json({ message: "Patient Not Found" })
    }

    await Patient.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Patient Status Update Successfully" })
})

// Delete
export const deletePatient = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const patient = await Patient.findById(id)

    if (!patient) {
        return res.status(400).json({ message: "Patient Not Found" })
    }

    await Patient.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Patient Delete Successfully" })
})