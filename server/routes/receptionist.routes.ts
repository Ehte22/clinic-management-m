import { Router } from 'express'
import * as ReceptionistController from '../controllers/receptionist.controller'
import multerMiddleware from '../utils/upload'
import { restrict } from '../utils/protected'

const ReceptionistRouter = Router()
const upload = multerMiddleware()

ReceptionistRouter
    .get("/", ReceptionistController.getAllReceptionists)
    .get("/:id", ReceptionistController.getReceptionistById)
    .post('/add', restrict(["Super Admin", "Clinic Admin"]), upload.single('profile'), ReceptionistController.addReceptionist)
    .put("/update/:id", restrict(["Super Admin", "Clinic Admin"]), upload.single('profile'), ReceptionistController.updateReceptionist)
    .put("/receptionists/:id", restrict(["Super Admin", "Clinic Admin"]), ReceptionistController.deleteReceptionist)


export default ReceptionistRouter