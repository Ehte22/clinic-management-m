import { useEffect, useState } from "react"
import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { Box, Button, Divider, Grid2, Paper } from "@mui/material"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import Toast from "../../components/Toast"
import { IDoctor } from "../../models/doctor.interface"
import { useGetDoctorByIdQuery, useUpdateDoctorMutation } from "../../redux/apis/doctor.api"

const AddDoctor = () => {
    const [doctor, setDoctor] = useState<IDoctor | null>(null)

    // Hooks
    const { id } = useParams()
    const navigate = useNavigate()

    // Queries and Mutations
    const { data, isLoading, isFetching } = useGetDoctorByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updateDoctor, { data: updateData, isLoading: updateLoading, error: updateError, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateDoctorMutation()
    console.log(doctor);


    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Doctor" : "Add Doctor",
        backLink: "../",
    }

    const fields: FieldConfig[] = [
        {
            name: "specialization",
            placeholder: "Specialization",
            type: "text",
            rules: { required: false, min: 2, max: 100 }
        },
        {
            name: "experience_years",
            placeholder: "Years of Experience",
            type: "text",
            rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
        },
        {
            name: "qualification",
            placeholder: "Qualification",
            type: "text",
            rules: { required: false }
        },
        {
            name: "emergency_contact",
            placeholder: "Emergency Contact",
            type: "text",
            rules: { required: false, pattern: /^[6-9]\d{9}$/ }
        },
        {
            name: "bio",
            placeholder: "Bio",
            type: "textarea",
            rules: { required: false }
        },
        {
            name: "schedule",
            type: "formArray",
            label: "Schedule",
            formArray: [
                {
                    name: "day",
                    type: "text",
                    placeholder: "Day",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: true }
                },
                {
                    name: "startTime",
                    type: "time",
                    placeholder: "Start Time",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: true }
                },
                {
                    name: "endTime",
                    type: "time",
                    placeholder: "End Time",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: true }
                }
            ],
            rules: {}
        }
    ]

    const defaultValues = {
        specialization: "",
        experience_years: "",
        qualifications: "",
        emergency_contact: "",
        bio: "",
        schedule: [
            { day: "", startTime: "", endTime: "" }
        ]
    }

    // Custom Validator
    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = (data: FormValues) => {

        if (id) {
            if (navigator.onLine) {
                updateDoctor({ id, doctorData: data })
            } else {
                idbHelpers.update({ storeName: "doctors", endpoint: "doctor/update-doctors", _id: id, data })
            }
        }
    }

    // Dynamic Form
    const { renderSingleInput, handleSubmit, setValue, reset }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (id) {
            if (data && navigator.onLine) {
                setDoctor(data);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "doctors", _id: id });
                    setDoctor(offlineData);
                };
                fetchData();
            }
        }
    }, [id, data]);

    useEffect(() => {
        if (id && doctor) {
            setValue("specialization", doctor.specialization)
            setValue("experience_years", doctor.experience_years)
            setValue("qualification", doctor.qualification)
            setValue("emergency_contact", doctor.emergency_contact)
            setValue("bio", doctor.bio)
            setValue("schedule", doctor.schedule)
        }
    }, [id, doctor])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/doctors")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    return <>
        {isUpdateSuccess && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && <Toast type="error" message={updateError as string} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* Specialization */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("specialization")}
                        </Grid2>

                        {/* Year of Experience */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("experience_years")}
                        </Grid2>

                        {/* Qualification */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("qualification")}
                        </Grid2>

                        {/* Emergency Contact */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("emergency_contact")}
                        </Grid2>

                        {/* Bio */}
                        <Grid2 size={{ xs: 8 }}>
                            {renderSingleInput("bio")}
                        </Grid2>

                        {/* Schedule */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("schedule")}
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
                            loading={updateLoading}
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

export default AddDoctor

