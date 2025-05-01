import express from 'express'
import * as doctorController from '../controllers/doctor.controller'
import { restrict } from '../utils/protected'

const doctorRouter = express.Router()

doctorRouter
    .get("/", doctorController.getAllDoctors)
    .get("/:id", doctorController.getDoctorById)
    .put("/update/:id", restrict(["Super Admin", "Clinic Admin"]), doctorController.updateDoctor)
    .put("/receptionists/:id", restrict(["Super Admin"]), doctorController.deleteDoctor)


export default doctorRouter