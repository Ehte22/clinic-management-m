import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { Doctor } from "../models/Doctor"
import { User } from "../models/User"

// Get All
export const getAllDoctors = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false, selectedClinic = "" } = req.query

    const { clinicId, role } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const searchedData = await User.find({
        $or: [
            { "firstName": { $regex: searchQuery, $options: "i" } },
            { "lastName": { $regex: searchQuery, $options: "i" } },
            { "email": { $regex: searchQuery, $options: "i" } },
            {
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$phone" },
                        regex: searchQuery,
                        options: "i"
                    }
                }
            },

        ]
    })

    const userIds = searchedData.map(item => item._id)

    const query: any = {
        $and: [
            role !== "Super Admin" ? { clinic: clinicId } : selectedClinic ? { clinic: selectedClinic } : {},
            { deletedAt: null },
            searchQuery ? {
                $or: [
                    { status: { $regex: searchQuery, $options: "i" } },
                    ...(userIds.length ? [{ user: { $in: userIds } }] : []),
                ]
            } : {}
        ]
    }

    const totalEntries = await Doctor.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Doctor.find(query).populate("user").sort({ createdAt: -1 }).lean()
    } else {
        result = await Doctor.find(query).populate("user").skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Doctors Fetch Successfully", result, pagination })
})

// Get By ID
export const getDoctorById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Doctor.findById(id).populate("user").lean()

    if (!result) {
        return res.status(400).json({ message: "Doctor Not Found" })
    }

    res.status(200).json({ message: "Doctor Fetch Successfully", result })
})

// Update
export const updateDoctor = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const doctor = await Doctor.findById(id).lean()
    if (!doctor) {
        return res.status(400).json({ message: "Doctor Not Found" })
    }

    await Doctor.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    res.status(200).json({ message: "Doctor Details Update Successfully" })
})

// Delete
export const deleteDoctor = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const doctor = await Doctor.findById(id)

    if (!doctor) {
        return res.status(400).json({ message: "Doctor Not Found" })
    }

    await Doctor.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Doctor Delete Successfully" })
})