import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator } from "../utils/validator"
import { IUserProtected } from "../utils/protected"
import { Receptionist } from "../models/Receptionist"
import { User } from "../models/User"
import { receptionistRules } from "../rules/receptionist.rules"
import mongoose from "mongoose"
import { generatePassword } from "../utils/generatePassword"
import cloudinary from "../utils/uploadConfig"
import bcryptjs from "bcryptjs"

// Get All
export const getAllReceptionists = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
    const userConditions = userIds.length ? [{ user: { $in: userIds } }] : [];

    const query: any = {
        $and: [
            role !== "Super Admin" ? { clinic: clinicId } : selectedClinic ? { clinic: selectedClinic } : {},
            { deletedAt: null },
            searchQuery ? {
                $or: [
                    { status: { $regex: searchQuery, $options: "i" } },
                    ...userConditions
                ]
            } : {}
        ]
    }

    const totalEntries = await Receptionist.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Receptionist.find(query).populate("user").sort({ createdAt: -1 }).lean()
    } else {
        result = await Receptionist.find(query).populate("user").skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Receptionists Fetch Successfully", result, pagination })
})

// Get By ID
export const getReceptionistById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Receptionist.findById(id).populate("user").lean()

    if (!result) {
        return res.status(400).json({ message: "Receptionist Not Found" })
    }

    res.status(200).json({ message: "Receptionist Fetch Successfully", result })
})

// Add
export const addReceptionist = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { firstName, lastName, email, phone, schedule } = req.body

    const { clinicId } = req.user as IUserProtected

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] }).session(session)

        if (existingUser) {
            if (existingUser.email == email) {
                return res.status(409).json({ message: "Email already exist" })
            }
            if (existingUser.phone == phone) {
                return res.status(409).json({ message: "Phone number already exist" })
            }
        }

        let profile = ""
        if (req.file) {
            const { secure_url } = await cloudinary.uploader.upload(req.file.path)
            profile = secure_url
        }

        const generatedPassword = generatePassword(12)

        const data = { ...req.body, clinic: clinicId, password: generatedPassword, profile, role: "Receptionist" }

        const { isError, error } = customValidator(data, receptionistRules)

        if (isError) {
            return res.status(422).json({ message: "Validation errors", error });
        }

        const hashPassword = await bcryptjs.hash(generatedPassword, 10)

        const newUser = await User.create([{ clinicId, firstName, lastName, email, phone, password: hashPassword, profile }], { session })
        const userId = newUser[0]._id

        await Receptionist.create([{ user: userId, clinic: clinicId, schedule }], { session })

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Receptionist Add Successfully" })
    } catch (error: any) {
        await session.abortTransaction()
        session.endSession()

        res.status(400).json({ message: error.message || "Failed to add receptionist" })
    }
})

// Update
export const updateReceptionist = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { firstName, lastName, email, phone, schedule, remove } = req.body

    const { id } = req.params

    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        const receptionist = await Receptionist.findById(id).session(session)
        if (!receptionist) {
            return res.status(400).json({ message: "Receptionist Not Found" })
        }

        const user = await User.findById(receptionist.user).session(session)
        if (!user) {
            return res.status(400).json({ message: "User Not Found" })
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } }).session(session).lean()
            if (existingUser) {
                return res.status(409).json({ message: "Email Already Exists" })
            }
        }

        if (phone && phone !== user.phone) {
            const existingPhoneUser = await User.findOne({ phone, _id: { $ne: user._id } }).session(session).lean()
            if (existingPhoneUser) {
                return res.status(409).json({ message: "Phone Number Already Exists" })
            }
        }


        let profile
        if (req.file) {
            const publicId = user?.profile?.split("/").pop()?.split(".")[0]
            publicId && await cloudinary.uploader.destroy(publicId)

            const { secure_url } = await cloudinary.uploader.upload(req.file.path)
            profile = secure_url
        }

        if (remove === "true") {
            const publicId = user?.profile?.split("/").pop()?.split(".")[0]
            if (publicId) {
                await cloudinary.uploader.destroy(publicId)
                profile = ""
            }
        }

        await User.findByIdAndUpdate(user?._id, { firstName, lastName, email, phone, profile }, { session })

        await Receptionist.findByIdAndUpdate(id, { schedule }, { session })

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Receptionist Update Successfully" })
    } catch (error: any) {
        await session.abortTransaction()
        session.endSession()

        res.status(400).json({ message: error.message || "Failed to update receptionist" })
    }
})

// Delete
export const deleteReceptionist = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const receptionist = await Receptionist.findById(id)

    if (!receptionist) {
        return res.status(400).json({ message: "Receptionist Not Found" })
    }

    await Receptionist.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Receptionist Delete Successfully" })
})