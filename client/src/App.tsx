import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, useEffect } from "react"
import './i18n';
import Layout from "./components/Layout"
import { useDispatch } from "react-redux"
import { idbHelpers } from "./indexDB"
import { supplierApi } from "./redux/apis/supplier.api"
import { appointmentApi } from "./redux/apis/appointment.api"
import { clinicApi } from "./redux/apis/clinic.api"
import { doctorApi } from "./redux/apis/doctor.api"
import { invoiceApi } from "./redux/apis/invoiceApi"
import { medicineApi } from "./redux/apis/medicineApi"
import { patientApi } from "./redux/apis/patientApi"
import { prescriptionApi } from "./redux/apis/prescriptionApi"
import { receptionistApi } from "./redux/apis/receptionistApi"
import { userApi } from "./redux/apis/user.api"
import { ImageContextProvider } from "./context/ImageContext";
import { createTheme, ThemeProvider } from "@mui/material";
import SessionExpiredModal from "./components/SessionExpiredModal";
import Protected from "./components/Protected";
import ErrorBoundary from "./components/ErrorBoundary";

const Clinics = lazy(() => import("./pages/clinic/Clinics"))
const AddClinic = lazy(() => import("./pages/clinic/AddClinic"))
const Users = lazy(() => import("./pages/user/Users"))
const AddUser = lazy(() => import("./pages/user/AddUser"))
const Medicines = lazy(() => import("./pages/medicine/Medicines"))
const Profile = lazy(() => import("./pages/user/Profile"))
const Invoice = lazy(() => import("./pages/invoice/Invoices"))
const Receptionist = lazy(() => import("./pages/receptionist/Receptionists"))
const AddReceptionist = lazy(() => import("./pages/receptionist/AddReceptionist"))
const Doctor = lazy(() => import("./pages/doctor/Doctor"))
const Appointment = lazy(() => import("./pages/appointment/Appointments"))
const Login = lazy(() => import("./pages/Login"))
const AddDoctor = lazy(() => import("./pages/doctor/AddDoctor"))
const AddAppointment = lazy(() => import("./pages/appointment/AddAppointment"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const Prescription = lazy(() => import("./pages/prescription/Prescription"))
const Suppliers = lazy(() => import("./pages/supplier/Suppliers"))
const AddSupplier = lazy(() => import("./pages/supplier/AddSupplier"))
const AddMedicine = lazy(() => import("./pages/medicine/AddMedicine"))
const PageNotFound = lazy(() => import("./pages/PageNotFound"))
const Unauthorized = lazy(() => import("./pages/Unauthorized"))
const DashBoard = lazy(() => import("./pages/DashBoard"))
const UserDashBoard = lazy(() => import("./pages/UserDashboard"))
const AddInvoice = lazy(() => import("./pages/invoice/AddInvoice"))
const Patients = lazy(() => import("./pages/patient/Patients"))
const AddPatient = lazy(() => import("./pages/patient/AddPatient"))

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#FFFFFF", contrastText: "#000000" },
    secondary: { main: "#0772ed" },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 1000, lg: 1200, xl: 1536 } },
})

const App = () => {
  const dispatch = useDispatch()

  const x = localStorage.getItem("user")
  let user
  if (x) {
    user = JSON.parse(x || "")
  }

  useEffect(() => {

    const handleOnline = async () => {
      await idbHelpers.sync().then(() => {
        const apis = [
          { api: appointmentApi, tag: "Appointments" },
          { api: clinicApi, tag: "clinic" },
          { api: doctorApi, tag: "Doctors" },
          { api: invoiceApi, tag: "Invoice" },
          { api: medicineApi, tag: "Medicine" },
          { api: patientApi, tag: "Patient" },
          { api: prescriptionApi, tag: "Prescription" },
          { api: receptionistApi, tag: "Receptionist" },
          { api: supplierApi, tag: "supplier" },
          { api: userApi, tag: "user" },
        ]

        apis.forEach(({ api, tag }) => {
          dispatch(api.util.invalidateTags([tag as any]))
        });
      })
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch]);

  return <>
    <ThemeProvider theme={theme}>
      <ImageContextProvider>
        <BrowserRouter>
          <SessionExpiredModal />
          <Routes>

            {/* Super Admin */}
            <Route path="/" element={<Layout />}>

              {/* dashboards */}
              <Route index element={<Protected roles={user?.role === "Super Admin" ? ["Super Admin"] : ["Clinic Admin", "Super Admin"]}
                compo={user?.role === "Super Admin"
                  ? <ErrorBoundary><DashBoard /> </ErrorBoundary>
                  : <ErrorBoundary><UserDashBoard /> </ErrorBoundary>} />}
              />
              <Route path="user-dashboard" element={<Protected roles={["Clinic Admin", "Super Admin"]} compo={<ErrorBoundary><UserDashBoard /> </ErrorBoundary>} />} />
              <Route path="admin" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><DashBoard /> </ErrorBoundary>} />} />

              {/* user */}
              <Route path="users">
                <Route index element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><Users /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddUser /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddUser /></ErrorBoundary>} />} />
              </Route>

              {/* user profile */}
              <Route path="/profile/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Profile /></ErrorBoundary>} />} />

              {/* clinic */}
              <Route path="clinics">
                <Route index element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><Clinics /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddClinic /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddClinic /></ErrorBoundary>} />} />
              </Route>

              {/* medicine */}
              <Route path="medicines">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Medicines /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddMedicine /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddMedicine /></ErrorBoundary>} />} />
              </Route>

              {/* invoice */}
              <Route path="invoices">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Invoice /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddInvoice /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddInvoice /></ErrorBoundary>} />} />

              </Route>
              {/* receptionist */}
              <Route path="receptionists">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><Receptionist /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><AddReceptionist /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><AddReceptionist /></ErrorBoundary>} />} />
              </Route>

              {/* doctor */}
              <Route path="doctors">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><Doctor /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><AddDoctor /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><AddDoctor /></ErrorBoundary>} />} />
              </Route>

              {/* appointment */}
              <Route path="appointments">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Appointment /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddAppointment /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddAppointment /></ErrorBoundary>} />} />
              </Route>

              {/* patient */}
              <Route path="patients">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Patients /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddPatient /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddPatient /></ErrorBoundary>} />} />
              </Route>

              {/* prescription */}
              <Route path="/prescription" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><Prescription /></ErrorBoundary>} />} />

              {/* Supplier */}
              <Route path="suppliers">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Suppliers /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddSupplier /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddSupplier /></ErrorBoundary>} />} />
              </Route>

            </Route>


            {/* auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<PageNotFound />} />

          </Routes>
        </BrowserRouter >
      </ImageContextProvider>
    </ThemeProvider >
  </>
}


export default App