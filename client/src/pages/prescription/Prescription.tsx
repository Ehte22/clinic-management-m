import React, { useCallback, useEffect, useMemo, useState } from "react";
import { customValidator } from "../../utils/validator";
import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm";
import PrescriptionTable from "./PrescriptionTable";
import { idbHelpers } from "../../indexDB";
import { io } from "socket.io-client"
import { IMedicine } from "../../models/medicine.interface";
import { useGetMedicinesQuery } from "../../redux/apis/medicineApi";
import { IPatient } from "../../models/patient.interface";
import { useGetPatientsQuery } from "../../redux/apis/patientApi";
import { Box, Button, Divider, Grid2, Paper } from "@mui/material";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import MedicineModal from "./MedicineModal";
import { useAddPrescriptionMutation } from "../../redux/apis/prescriptionApi";
import Toast from "../../components/Toast";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ["polling"]
})

const Prescription = React.memo(() => {

    const [patientOptions, setPatientOptions] = useState<{ label?: string, value?: string, disabled?: boolean }[]>([]);
    const [open, setOpen] = useState(false)
    const [allMedicines, setAllMedicines] = useState<IMedicine[]>([])
    const [patient, setPatient] = useState<IPatient | null>(null)

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Prescription",
    }), [])

    const [addPrescription, add] = useAddPrescriptionMutation()
    const { data: patients, isSuccess: isPatientsFetchSuccess } = useGetPatientsQuery({ isFetchAll: true, onlyToday: true })
    const { data: medicines, isSuccess: isMedicineFetchSuccess } = useGetMedicinesQuery({ isFetchAll: true })

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "patient",
            placeholder: "Patient",
            type: "autoComplete",
            options: patientOptions,
            rules: { required: true },
        },
        {
            name: "age",
            placeholder: "Age",
            type: "text",
            rules: { required: true },
        },
        {
            name: "weight",
            placeholder: "Weight",
            type: "text",
            rules: { required: true },
        },
        {
            name: "medical",
            type: "formArray",
            formArray: [
                {
                    name: "medicine",
                    placeholder: "Medicine",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true },
                },
                {
                    name: "dosage",
                    placeholder: "Dosage",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true },
                },
                {
                    name: "frequency",
                    placeholder: "Frequency",
                    type: "checkbox",
                    size: { xs: 12, lg: 6 },
                    options: [
                        { label: "Morning", value: "Morning" },
                        { label: "Afternoon", value: "Afternoon" },
                        { label: "Evening", value: "Evening" },
                        { label: "Night", value: "Night" },
                    ],
                    rules: { required: true, array: true },
                },

                {
                    name: "quantity",
                    placeholder: "Quantity",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
                },
                {

                    name: "tests",
                    placeholder: "Test Name",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: false },
                },
                {
                    name: "instructions",
                    placeholder: "Select Meal",
                    type: "select",
                    options: [
                        { label: "Before Meal", value: "Before Meal" },
                        { label: "After Meal", value: "After Meal" },
                        { label: "Without Meal", value: "Without Meal" },
                    ],
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true },
                },
                {
                    name: "duration",
                    placeholder: "Duration",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
                },
            ],
            rules: {}
        },

        {
            name: "cvs",
            placeholder: "CVS",
            type: "text",
            rules: { required: false },
        },
        {
            name: "pulse",
            placeholder: "Pulse",
            type: "text",
            rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
        },
        {
            name: "bp",
            placeholder: "BP",
            type: "text",
            rules: { required: false },
        },
        {
            name: "temp",
            placeholder: "Temperature",
            type: "text",
            rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
        },
        {
            name: "pa",
            placeholder: "PA",
            type: "text",
            rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
        },
        {
            name: "rs",
            placeholder: "RS",
            type: "text",
            rules: { required: false },
        },
        {
            name: "complete",
            placeholder: "Complete",
            type: "textarea",
            rules: { required: false },
        },
        {
            name: "diagnost",
            placeholder: "Diagnost",
            type: "textarea",
            rules: { required: false },
        },
        {
            name: "note",
            placeholder: "Notes",
            type: "textarea",
            rules: { required: false },
        },
    ], [patientOptions])

    const defaultValues = {
        patient: "",
        medical: [{
            medicine: "",
            dosage: "",
            duration: "",
            frequency: "",
            tests: "",
            instructions: "",
            quantity: "",

        }],
        complete: "",
        note: "",
        add: "",
        pa: "",
        cvs: "",
        pulse: "",
        diagnost: "",
        rs: "",
        bp: "",
        temp: "",
        weight: "",
        age: ""

    };

    const onSubmit = useCallback((data: any) => {
        if (navigator.onLine) {
            addPrescription(data)
        } else {
            idbHelpers.add({ storeName: "prescriptions", endpoint: "prescription/create", data })
        }
    }, [addPrescription])

    const { renderSingleInput, handleSubmit, setValue, watch, reset, disableField } = useDynamicForm({
        schema: customValidator(fields), fields, onSubmit, defaultValues
    })

    const values = watch()


    useEffect(() => {
        if (isPatientsFetchSuccess) {
            const x = patients.result.map((item) => {
                return { label: item.name, value: item._id }
            })

            setPatientOptions(x)
        }

    }, [isPatientsFetchSuccess])

    useEffect(() => {
        if (isMedicineFetchSuccess && medicines.result) {
            setAllMedicines(medicines.result)
        }
    }, [isMedicineFetchSuccess, medicines])

    useEffect(() => {
        socket.on('add-patient', (patient) => {
            const newPatient = { label: patient.name, value: patient._id }
            setPatientOptions((prev) => [newPatient, ...prev])
        });

        return () => {
            socket.off('add-patient');
        };
    }, [])

    useEffect(() => {
        if (values.patient) {
            const patient = patients?.result.find(item => item._id === values.patient)

            if (patient) {
                setValue("age", patient.age.toString() || "")
                setValue("weight", patient.weight.toString() || "")

                disableField("age", true)
                disableField("weight", true)

                setPatient(patient)
            }

        }
    }, [values.patient])

    return <>
        {add.isSuccess && <Toast type="success" message={add.data?.message} />}
        {add.isError && <Toast type="error" message={String(add.error)} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* Patient */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("patient")}
                        </Grid2>

                        {/* Age */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("age")}
                        </Grid2>

                        {/* Weight */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("weight")}
                        </Grid2>

                        {/* Medicine Details */}
                        <Grid2 size={{ xs: 12 }}>
                            <Box sx={{ textAlign: "end" }}>
                                <Button
                                    onClick={() => setOpen(true)}
                                    type='button'
                                    variant='contained'
                                    sx={{ background: "#0777de", color: "white" }}>
                                    Select Medicine
                                </Button>
                            </Box>
                            {renderSingleInput("medical")}
                        </Grid2>

                        {/* Blood Pressure */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("bp")}
                        </Grid2>

                        {/* Temperature */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("temp")}
                        </Grid2>

                        {/* RS */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("rs")}
                        </Grid2>

                        {/* CVS */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("cvs")}
                        </Grid2>

                        {/* PA */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("pa")}
                        </Grid2>

                        {/* Pulse */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("pulse")}
                        </Grid2>

                        {/* Complete */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("complete")}
                        </Grid2>

                        {/* Diagnost */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("diagnost")}
                        </Grid2>

                        {/* Notes */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("note")}
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
                            loading={add.isLoading}
                            type='submit'
                            variant='contained'
                            sx={{ ml: 2, background: "#0777de", color: "white", py: 0.65 }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper >
        </Box>

        {open && <MedicineModal open={open} setOpen={setOpen} allMedicines={allMedicines} setValue={setValue} />}
        {values.patient && <PrescriptionTable allMedicines={watch("medical")} patientData={patient as IPatient} />}
    </>

})

export default Prescription;
