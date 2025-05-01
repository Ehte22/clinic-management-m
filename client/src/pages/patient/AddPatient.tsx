import { useEffect, useState } from "react"
import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { Box, Button, Divider, Grid2, Paper } from "@mui/material"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import Toast from "../../components/Toast"
import { IPatient } from "../../models/patient.interface"
import { useAddPatientMutation, useGetPatientByIdQuery, useUpdatePatientMutation } from "../../redux/apis/patientApi"

const AddPatient = () => {
    const [patient, setPatient] = useState<IPatient | null>(null)

    // Hooks
    const { id } = useParams()
    const navigate = useNavigate()

    // Queries and Mutations
    const [addPatient, { data: addData, isLoading: addLoading, error: addError, isSuccess: isAddSuccess, isError: isAddError }] = useAddPatientMutation()
    const { data, isLoading, isFetching } = useGetPatientByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updatePatient, { data: updateData, isLoading: updateLoading, error: updateError, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdatePatientMutation()

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Patient" : "Add Patient",
        backLink: "../",
    }

    const fields: FieldConfig[] = [
        {
            name: "name",
            type: "text",
            placeholder: "Name",
            rules: { required: true, min: 2, max: 100 },
        },
        {
            name: "age",
            type: "text",
            placeholder: "Age",
            rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
        },
        {
            name: "weight",
            type: "text",
            placeholder: "Weight",
            rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
        },
        {
            name: "contactInfo",
            placeholder: "Contact Info",
            type: "text",
            rules: { required: true, pattern: /^[6-9]\d{9}$/ },
        },
        {
            name: "dateOfBirth",
            placeholder: "Date of Birth",
            type: "date",
            rules: { required: true },
        },
        {
            name: "gender",
            placeholder: "Gender",
            type: "radio",
            options: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
            ],
            rules: { required: true },
        },
        {
            name: "email",
            placeholder: "Email",
            type: "text",
            rules: { required: false, email: true },
        },
        {
            name: "address",
            type: "formGroup",
            label: "Address",
            object: true,
            formGroup: {
                city: {
                    name: "city",
                    placeholder: "City",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: true },
                },
                state: {
                    name: "state",
                    placeholder: "State",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false },
                },
                country: {
                    name: "country",
                    placeholder: "Country",
                    type: "select",
                    options: [
                        { label: "India", value: 'India' },
                        { label: "United States", value: "United States" },
                        { label: "United Kingdom", value: "United Kingdom" },
                        { label: "Australia", value: "Australia" },
                    ],
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false },
                },
                zipCode: {
                    name: "zipCode",
                    placeholder: "Zip Code",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false },
                },
                street: {
                    name: "street",
                    placeholder: "Street Address",
                    type: "textarea",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false },
                },
            },
            rules: {},
        },

        {
            name: "emergencyContact",
            label: "Emergency Contact",
            type: "formGroup",
            object: true,
            formGroup: {
                name: {
                    name: "name",
                    placeholder: "Name",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false },
                },
                relationShip: {
                    name: "relationShip",
                    placeholder: "Relationship",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false },
                },
                contactNumber: {
                    name: "contactNumber",
                    placeholder: "Contact Number",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false, pattern: /^[6-9]\d{9}$/ },
                },
            },
            rules: {},
        },

    ]

    const defaultValues = {
        name: "",
        dateOfBirth: "",
        gender: "",
        contactInfo: "",
        email: "",
        age: "",
        weight: "",
        address: {
            city: "",
            state: "",
            country: "",
            street: "",
            zipCode: "",
        },

        emergencyContact: {
            name: "",
            relationShip: "",
            contactNumber: "",
        },
    }

    // Custom Validator
    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = (data: FormValues) => {

        if (patient && patient._id) {
            if (navigator.onLine) {
                updatePatient({ patientData: data as IPatient, id: patient._id })
            } else {
                idbHelpers.update({ storeName: "patients", endpoint: "patient/update-patient", _id: patient._id, data })
            }
        } else {
            if (navigator.onLine) {
                addPatient(data as IPatient)
            } else {
                idbHelpers.add({ storeName: "patients", endpoint: "patient/create-patient", data: { ...data, status: "active" } })
            }
        }
    }

    // Dynamic Form
    const { renderSingleInput, handleSubmit, setValue, reset, watch, disableField }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    const { dateOfBirth } = watch()


    useEffect(() => {
        if (id) {
            if (data && navigator.onLine) {
                setPatient(data);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "patients", _id: id });
                    setPatient(offlineData);
                };
                fetchData();
            }
        }
    }, [id, data]);

    useEffect(() => {
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()

            if (age) {
                setValue("age", age.toString())
                disableField("age", true)
            }
        }
    }, [dateOfBirth])

    useEffect(() => {
        if (id && patient) {
            setValue("name", patient.name)
            setValue("dateOfBirth", patient.dateOfBirth)
            setValue("gender", patient.gender)
            setValue("contactInfo", patient.contactInfo.toString() || "")
            setValue("email", patient.email)
            setValue("age", patient.age.toString() || "")
            setValue("weight", patient.weight.toString() || "")
            setValue("address.city", patient.address.city)
            setValue("address.state", patient.address.state)
            setValue("address.country", patient.address.country)
            setValue("address.street", patient.address.street)
            setValue("address.zipCode", patient.address.zipCode.toString())
            setValue("emergencyContact.name", patient.emergencyContact?.name)
            setValue("emergencyContact.relationShip", patient.emergencyContact?.relationShip)
            setValue("emergencyContact.contactNumber", patient.emergencyContact?.contactNumber.toString() || "")

        }
    }, [id, patient])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                navigate("/patients")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/patients")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    return <>
        {isAddSuccess && <Toast type="success" message={addData?.message} />}
        {isAddError && <Toast type="error" message={addError as string} />}

        {isUpdateSuccess && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && <Toast type="error" message={updateError as string} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("name")}
                        </Grid2>

                        {/* Date of Birth */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("dateOfBirth")}
                        </Grid2>

                        {/* Age */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("age")}
                        </Grid2>

                        {/* Weight */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("weight")}
                        </Grid2>

                        {/* Contact Info */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("contactInfo")}
                        </Grid2>

                        {/* Email */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("email")}
                        </Grid2>

                        {/* Gender */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("gender")}
                        </Grid2>

                        {/* Address */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("address")}
                        </Grid2>

                        {/* Emergency Contact */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("emergencyContact")}
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
                            loading={id ? updateLoading : addLoading}
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
}

export default AddPatient

