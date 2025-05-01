import express from "express";
import * as invoiceController from "../controllers/invoice.controller";

const invoiceRouter = express.Router();

invoiceRouter
    .get("/", invoiceController.getAllInvoices)
    .get("/:id", invoiceController.getInvoiceById)
    .post("/add", invoiceController.addInvoice)
    .put("/update/:id", invoiceController.updateInvoice)
    .put("/status/:id", invoiceController.updateInvoiceStatus)
    .put("/delete/:id", invoiceController.deleteInvoice)

export default invoiceRouter
