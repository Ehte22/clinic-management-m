import express from "express"
import * as medicineController from "../controllers/medicine.controller"

const medicineRouter = express.Router()

medicineRouter
     .get("/", medicineController.getAllMedicines)
     .get("/:id", medicineController.getMedicineById)
     .post("/add", medicineController.addMedicine)
     .put("/update/:id", medicineController.updateMedicine)
     .put("/status/:id", medicineController.updateMedicineStatus)
     .put("/delete/:id", medicineController.deleteMedicine)

export default medicineRouter     