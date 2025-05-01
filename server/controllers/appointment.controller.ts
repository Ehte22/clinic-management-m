import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator } from "../utils/validator"
import { IUserProtected } from "../utils/protected"
import { Patient } from "../models/Patient"
import { User } from "../models/User"
import { Appointment } from "../models/Appointment"
import { appointmentRules } from "../rules/appointment.rules"

// Get All
export const getAllAppointments = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false, selectedClinic = "", onlyToday = false } = req.query

    const { clinicId, role } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit


    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const patients = await Patient.find({
        $or: [
            { "name": { $regex: searchQuery, $options: "i" } },
            { "email": { $regex: searchQuery, $options: "i" } },
            { "contactInfo": { $regex: searchQuery, $options: "i" } },
        ]
    })

    const patientIds = patients.map(item => item._id)

    const patientConditions = patientIds.length ? [{ patient: { $in: patientIds } }] : [];


    const query: any = {
        $and: [
            role !== "Super Admin" ? { clinic: clinicId } : selectedClinic ? { clinic: selectedClinic } : {},
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        ...patientConditions,
                    ]
                }
                : {},
            onlyToday === "true" ? { createdAt: { $gte: todayStart, $lte: todayEnd } } : {},
        ]
    }

    const totalEntries = await Appointment.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Appointment.find(query)
            .populate("patient")
            .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } }).lean()
            .sort({ createdAt: -1 })
            .lean()
    } else {
        result = await Appointment.find(query)
            .populate("patient")
            .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } }).lean()
            .skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Appointments Fetch Successfully", result, pagination })
})

// Get By ID
export const getAppointmentById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Appointment.findById(id)
        .populate("patient")
        .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } }).lean()

    if (!result) {
        return res.status(400).json({ message: "Appointment Not Found" })
    }

    res.status(200).json({ message: "Appointment Fetch Successfully", result })
})

// Add
export const addAppointment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const { clinicId } = req.user as IUserProtected

    const data = { ...req.body, clinic: clinicId }

    const { isError, error } = customValidator(data, appointmentRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Appointment.create(data)

    res.status(200).json({ message: "Appointment Add Successfully", result })
})

// Update
export const updateAppointment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const appointment = await Appointment.findById(id).lean()
    if (!appointment) {
        return res.status(400).json({ message: "Appointment Not Found" })
    }

    await Appointment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Appointment Update Successfully" })
})

// Update Status
export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const appointment = await Appointment.findById(id).lean()
    if (!appointment) {
        return res.status(400).json({ message: "Appointment Not Found" })
    }

    await Appointment.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Appointment Status Update Successfully" })
})

// Delete
export const deleteAppointment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const appointment = await Appointment.findById(id)

    if (!appointment) {
        return res.status(400).json({ message: "Appointment Not Found" })
    }

    await Appointment.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Appointment Delete Successfully" })
})