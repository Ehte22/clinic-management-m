import express from "express"
import * as patientController from "../controllers/patient.controller"

const medicineRouter = express.Router()

medicineRouter
    .get("/", patientController.getAllPatients)
    .get("/:id", patientController.getPatientsById)
    .post("/add", patientController.addPatient)
    .put("/update/:id", patientController.updatePatient)
    .put("/status/:id", patientController.updatePatientStatus)
    .put("/delete/:id", patientController.deletePatient)

export default medicineRouter     