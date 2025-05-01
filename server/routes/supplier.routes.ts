import express from "express"
import * as supplierController from "../controllers/supplier.controller"

const supplierRouter = express.Router()

supplierRouter
    .get("/", supplierController.getSuppliers)
    .get("/:id", supplierController.getSupplierById)
    .post("/add", supplierController.addSupplier)
    .put("/update/:id", supplierController.updateSupplier)
    .put("/delete/:id", supplierController.deleteSupplier)

export default supplierRouter