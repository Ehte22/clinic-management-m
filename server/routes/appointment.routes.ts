import express from "express"
import * as appointmentController from "../controllers/appointment.controller"

const appointmentRouter = express.Router()

appointmentRouter
    .get("/", appointmentController.getAllAppointments)
    .get("/:id", appointmentController.getAppointmentById)
    .post("/add", appointmentController.addAppointment)
    .put("/update/:id", appointmentController.updateAppointment)
    .put("/status/:id", appointmentController.updateAppointmentStatus)
    .put("/delete/:id", appointmentController.deleteAppointment)

export default appointmentRouter     