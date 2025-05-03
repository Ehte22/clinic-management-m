import React, { useCallback, useEffect, useMemo, useState } from "react"
import useDynamicForm from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { Box, Button, Divider, Grid2, Paper } from "@mui/material"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import Toast from "../../components/Toast"
import { IAppointment } from "../../models/appointment.interface"
import { useAddAppointmentMutation, useGetAppointmentByIdQuery, useUpdateAppointmentMutation } from "../../redux/apis/appointment.api"
import { useGetDoctorsQuery } from "../../redux/apis/doctor.api"
import { useGetPatientsQuery } from "../../redux/apis/patientApi"
import { io } from "socket.io-client"
const socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ["polling"]
})

const AddAppointment = React.memo(() => {
    const [appointment, setAppointment] = useState<IAppointment | null>(null)
    const [doctorOptions, setDoctorOptions] = useState<{ label?: string, value?: string }[]>([])
    const [patientOptions, setPatientOptions] = useState<{ label?: string, value?: string }[]>([])

    // Hooks
    const { id } = useParams()
    const navigate = useNavigate()

    // Queries and Mutations
    const [addAppointment, add] = useAddAppointmentMutation()
    const { data, isLoading, isFetching } = useGetAppointmentByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updateAppointment, update] = useUpdateAppointmentMutation()
    const { data: doctors, isSuccess: isDoctorsFetchSuccess } = useGetDoctorsQuery({ isFetchAll: true })
    const { data: patients, isSuccess: isPatientFetchSuccess } = useGetPatientsQuery({ isFetchAll: true, onlyToday: true })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: id ? "Edit Appointment" : "Add Appointment",
        backLink: "../",
    }), [id])

    const fields: any[] = useMemo(() => [
        {
            name: "doctor",
            placeholder: "Doctor",
            type: "autoComplete",
            options: doctorOptions,
            rules: { required: true }
        },
        {
            name: "patient",
            placeholder: "Patient",
            type: "autoComplete",
            options: patientOptions,
            rules: { required: true }
        },
        {
            name: "date",
            placeholder: "Date",
            type: "date",
            rules: { required: true }
        },
        {
            name: "label",
            placeholder: "Label",
            type: "text",
            rules: { required: false, min: 2, max: 100 }
        },
        {
            name: "reason",
            placeholder: "Reason",
            type: "textarea",
            rules: { required: false, min: 2, max: 500 }
        },
        {
            name: "notes",
            placeholder: "Notes",
            type: "textarea",
            rules: { required: false, min: 2, max: 500 }
        },
        {
            name: "payment",
            type: "formGroup",
            label: "Payment",
            object: true,
            formGroup: {
                amount: {
                    name: "amount",
                    placeholder: "Amount",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                },
                method: {
                    name: "method",
                    placeholder: "Select Payment Method",
                    type: "select",
                    options: [
                        { label: "Cash", value: "cash" },
                        { label: "Online", value: "online" },
                        { label: "Card", value: "card" }
                    ],
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false }
                },
                status: {
                    name: "status",
                    placeholder: "Select Payment Status",
                    type: "select",
                    options: [
                        { label: "paid", value: "paid" },
                        { label: "unpaid", value: "unpaid" }
                    ],
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false }
                },
            },
            rules: {}
        },
        {
            name: "timeSlot",
            type: "formGroup",
            object: true,
            formGroup: {
                from: {
                    name: "from",
                    placeholder: "From",
                    type: "time",
                    size: { xs: 12, sm: 6, },
                    rules: { required: true }
                },
                to: {
                    name: "to",
                    placeholder: "To",
                    type: "time",
                    size: { xs: 12, sm: 6 },
                    rules: { required: true }
                },
            },
            rules: {}
        },

    ], [doctorOptions, patientOptions])

    const defaultValues = {
        patient: "",
        doctor: "",
        date: "",
        reason: "",
        notes: "",
        label: "",
        timeSlot: {
            from: "",
            to: "",
        },
        payment: {
            method: "cash",
            amount: "0",
            status: "unpaid",
        },
        button: ""
    }

    // Submit Function
    const onSubmit = useCallback(
        (data: z.infer<ReturnType<typeof customValidator>>) => {

            const appointmentData = data as IAppointment

            if (appointment && appointment._id) {
                if (navigator.onLine) {
                    updateAppointment({ appointmentData, id: appointment._id })
                } else {
                    idbHelpers.update({ storeName: "appointments", endpoint: "appointment/update-appointment", _id: appointment._id, data })
                }
            } else {
                if (navigator.onLine) {
                    addAppointment(appointmentData)
                } else {
                    idbHelpers.add({ storeName: "appointments", endpoint: "appointment/create-appointment", data })
                }
            }
        }, [appointment, addAppointment, updateAppointment])

    // Dynamic Form
    const { renderSingleInput, handleSubmit, setValue, reset }
        = useDynamicForm({ schema: customValidator(fields), fields, onSubmit, defaultValues })

    useEffect(() => {
        if (isDoctorsFetchSuccess) {
            const x = doctors.result.map((item) => {
                return { label: `${item.user?.firstName} ${item.user?.lastName}`, value: item._id }
            })

            setDoctorOptions(x)
        }

    }, [isDoctorsFetchSuccess])

    useEffect(() => {
        if (isPatientFetchSuccess) {
            const x = patients.result.map((item) => {
                return { label: item.name, value: item._id }
            })

            setPatientOptions(x)
        }

    }, [isPatientFetchSuccess])

    useEffect(() => {
        socket.on('add-patient', (patient) => {
            const x = { label: patient.name, value: patient._id }
            setPatientOptions((prev) => [x, ...prev])
        });

        return () => {
            socket.off('add-patient');
        };
    }, [])


    useEffect(() => {
        if (id) {
            if (data && navigator.onLine) {
                setAppointment(data);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "appointments", _id: id });
                    setAppointment(offlineData);
                };
                fetchData();
            }
        }
    }, [id, data]);

    useEffect(() => {
        if (id && appointment) {
            setValue("patient", appointment.patient?._id)
            setValue("doctor", appointment.doctor?._id)
            setValue("date", appointment.date)
            setValue("reason", appointment.reason)
            setValue("notes", appointment.notes)
            setValue("label", appointment.label)
            setValue("payment.method", appointment.payment.method)
            setValue("payment.amount", appointment.payment.amount.toString() || "")
            setValue("payment.status", appointment.payment.status)
            setValue("timeSlot.from", appointment.timeSlot.from)
            setValue("timeSlot.to", appointment.timeSlot.to)
        }
    }, [id, appointment])

    useEffect(() => {
        if (add.isSuccess || update.isSuccess) {
            const timeout = setTimeout(() => navigate('/appointments'), 2000)
            return () => clearTimeout(timeout)
        }
    }, [add.isSuccess, update.isSuccess, navigate])

    return <>
        {add.isSuccess && <Toast type="success" message={add.data?.message} />}
        {add.isError && <Toast type="error" message={String(add.error)} />}
        {update.isSuccess && <Toast type={update.data === 'No Changes Detected' ? 'info' : 'success'} message={update.data} />}
        {update.isError && <Toast type="error" message={String(update.error)} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* Patient */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("patient")}
                        </Grid2>

                        {/* Doctor */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("doctor")}
                        </Grid2>

                        {/* Label */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("label")}
                        </Grid2>

                        {/* Date */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("date")}
                        </Grid2>

                        {/* Time Slot */}
                        <Grid2 size={{ xs: 12, lg: 8 }}>
                            {renderSingleInput("timeSlot")}
                        </Grid2>

                        {/* Payment */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("payment")}
                        </Grid2>

                        {/* Reason */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("reason")}
                        </Grid2>

                        {/* Notes */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("notes")}
                        </Grid2>

                    </Grid2>

                    <Divider sx={{ mt: 4, mb: 3 }} />

                    <Box sx={{ textAlign: "end", px: 3 }}>
                        <Button
                            type='button'
                            onClick={() => reset()}
                            variant='contained'
                            sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                            Reset
                        </Button>
                        <Button
                            loading={add.isLoading || update.isLoading}
                            type='submit'
                            variant='contained'
                            sx={{ ml: 2, background: "#0777de", color: "white", py: 0.65 }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper >
        </Box>
    </>
})

export default AddAppointment

