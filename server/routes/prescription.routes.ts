import express from "express"
import * as prescriptionController from "../controllers/prescription.controller"

const prescriptionRouter = express.Router()

prescriptionRouter
    .get("/", prescriptionController.getAllPrescriptions)
    .get("/:id", prescriptionController.getPrescriptionById)
    .post("/add", prescriptionController.addPrescription)
    .put("/update/:id", prescriptionController.updatePrescription)
    .put("/delete/:id", prescriptionController.deletePrescription)

export default prescriptionRouter