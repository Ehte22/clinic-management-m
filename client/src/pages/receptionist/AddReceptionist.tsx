import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useSendOTPMutation, useVerifyOTPMutation } from "../../redux/apis/auth.api"
import { useEffect, useState } from "react"
import { toast } from "../../utils/toast"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { useImagePreview } from "../../context/ImageContext"
import Toast from "../../components/Toast"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import { Box, Button, Divider, Grid2, Paper, TextField } from "@mui/material"
import { textFieldStyles } from "../../components/Inputs"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { IReceptionist } from "../../models/receptionist.interface"
import { useAddReceptionistMutation, useGetReceptionistByIdQuery, useUpdateReceptionistMutation } from "../../redux/apis/receptionistApi"

const AddReceptionist = () => {

    // hooks
    const navigate = useNavigate()
    const { id } = useParams()
    const { setPreviewImages } = useImagePreview()

    // States
    const [OTP, setOTP] = useState("")
    const [receptionist, setReceptionist] = useState<IReceptionist | null>(null)
    const [showEmailError, setShowEmailError] = useState<boolean>(false)

    // Queries and Mutations
    const [addReceptionist, { data: addData, isLoading: addLoading, error: addError, isSuccess: isAddSuccess, isError: isAddError }] = useAddReceptionistMutation()
    const [updateReceptionist, { data: updateData, isLoading: updateLoading, error: updateError, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateReceptionistMutation()
    const [sendOtp, { data: otpSendMessage, isLoading: isSendOtpLoading, error: otpSendErrorMessage, isSuccess: otpSendSuccess, isError: otpSendError }] = useSendOTPMutation()
    const [verifyOtp, { data: otpVerifyMessage, isLoading: isVerifyOtpLoading, error: otpVerifyErrorMessage, isSuccess: otpVerifySuccess, isError: otpVerifyError }] = useVerifyOTPMutation()
    const { data: receptionistData } = useGetReceptionistByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Receptionist" : "Add Receptionist",
        backLink: "../",
    }

    const fields: FieldConfig[] = [
        {
            name: "firstName",
            placeholder: "First Name",
            type: "text",
            rules: { required: true, min: 2, max: 50 }
        },
        {
            name: "lastName",
            placeholder: "Last Name",
            type: "text",
            rules: { required: true, min: 2, max: 50 }
        },
        {
            name: "email",
            placeholder: "Email Address",
            type: "text",
            rules: { required: true, email: true }
        },
        {
            name: "phone",
            placeholder: "Phone Number",
            type: "text",
            rules: { required: true, pattern: /^[6-9]\d{9}$/ }
        },
        {
            name: "profile",
            placeholder: "Profile",
            type: "file",
            rules: { required: false, file: true, maxSize: 10 }
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
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        profile: "",
        schedule: [
            { day: "", startTime: "", endTime: "" }
        ]
    }


    // Function for send OTP
    const sendOTP = () => {
        const email = getValues("email")
        if (email && navigator.onLine) {
            sendOtp({ username: email })
        } else if (!navigator.onLine) {
            toast.showInfo("You are offline")
        }
    }

    // Function for Verify OTP
    const verifyOTP = () => {
        const email = getValues("email")
        if (email && OTP && navigator.onLine) {
            verifyOtp({ username: email, otp: OTP })
        } else if (!navigator.onLine) {
            toast.showInfo("You are offline")
        }
    }

    // Custom Validator
    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = (values: FormValues) => {

        const formData = new FormData()

        Object.keys(values).forEach(key => {
            if (key === "profile" && typeof values[key] == "object") {
                Object.keys(values.profile).forEach(item => {
                    formData.append(key, values.profile[item])
                    setPreviewImages(values.profile[item])
                })
            } else if (key === "schedule") {
                values[key].forEach((item: Record<string, string>, index: number) => {
                    Object.keys(item).forEach((subKey: string) => {
                        formData.append(`${key}[${index}][${subKey}]`, item[subKey])
                    })
                })
            } else {
                formData.append(key, values[key])
            }
        })

        if (receptionist && receptionist._id) {
            const email = getValues("email")

            if (email === receptionist.user?.email) {
                if (navigator.onLine) {
                    updateReceptionist({ receptionistData: formData, id: receptionist._id })
                } else {
                    idbHelpers.update({ storeName: "receptionists", endpoint: "receptionist/update-receptionist", _id: receptionist._id, data: values, isFormData: true })
                }
            } else {
                setShowEmailError(true)
            }

        } else {
            if (otpVerifySuccess) {
                if (navigator.onLine) {
                    addReceptionist(formData)
                } else {
                    idbHelpers.add({ storeName: "receptionists", endpoint: "receptionist/add-receptionist", data: { ...values, status: "active" }, isFormData: true })
                }
            } else {
                setShowEmailError(true)
            }
        }
    }

    // Dynamic Form Component
    const { renderSingleInput, handleSubmit, getValues, errors, setValue, reset, disableField } =
        useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (id) {
            if (receptionistData && navigator.onLine) {
                setReceptionist(receptionistData)
            } else {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "receptionists", _id: id })
                    setReceptionist(offlineData)
                }
                fetchData()
            }
        }
    }, [id, receptionistData])

    useEffect(() => {
        if (id && receptionist) {
            setValue("firstName", receptionist.user?.firstName || "")
            setValue("lastName", receptionist.user?.lastName || "")
            setValue("email", receptionist.user?.email || "")
            setValue("phone", receptionist.user?.phone?.toString() || "")
            setValue("schedule", receptionist.schedule)


            if (receptionist.user?.profile) {
                setValue("profile", receptionist.user?.profile)
                setPreviewImages([receptionist.user?.profile])
            }


        }
    }, [id, receptionist])

    useEffect(() => {
        if (otpVerifySuccess) {
            disableField("email", true)
        }
    }, [otpVerifySuccess])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                navigate("/receptionists")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/receptionists")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    useEffect(() => {
        if (showEmailError) {
            const timer = setTimeout(() => setShowEmailError(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [showEmailError])

    return <>
        {isAddSuccess && <Toast type="success" message={addData?.message} />}
        {isAddError && <Toast type="error" message={addError as string} />}

        {isUpdateSuccess && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && <Toast type="error" message={updateError as string} />}

        {otpSendSuccess && <Toast type="success" message={otpSendMessage} />}
        {otpSendError && <Toast type="error" message={otpSendErrorMessage as string} />}

        {otpVerifySuccess && <Toast type="success" message={otpVerifyMessage as string} />}
        {otpVerifyError && <Toast type="error" message={otpVerifyErrorMessage as string} />}

        {showEmailError && <Toast type="error" message={"Please verify your email address"} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* First Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("firstName")}
                        </Grid2>

                        {/* Last Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("lastName")}
                        </Grid2>

                        {/* Phone Number */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("phone")}
                        </Grid2>

                        {/* Email */}
                        <Grid2 size={{ xs: 12, lg: 8 }}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    {renderSingleInput("email")}
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>

                                    <Grid2 container spacing={2}>
                                        {otpVerifySuccess && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                                <CheckCircleIcon sx={{ color: "#00c979" }} />
                                            </Box>
                                        )}

                                        {otpSendSuccess && !otpVerifySuccess && (
                                            <Paper sx={{ marginTop: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    sx={textFieldStyles}
                                                    label="OTP"
                                                    placeholder="Enter OTP"
                                                    onChange={(e) => setOTP(e.target.value)}
                                                />
                                            </Paper>
                                        )}

                                        {!otpVerifySuccess &&
                                            <Box sx={{ marginTop: errors.email?.message ? 0 : 2, display: "flex", alignItems: "center" }}>
                                                <Button
                                                    loading={isSendOtpLoading || isVerifyOtpLoading}
                                                    variant="contained"
                                                    color="success"
                                                    onClick={otpSendSuccess ? verifyOTP : sendOTP}
                                                    sx={{ textTransform: 'none', backgroundColor: "#0777de" }}
                                                >
                                                    Verify {otpSendSuccess ? "OTP" : "Email"}
                                                </Button>
                                            </Box>
                                        }
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("schedule")}
                        </Grid2>

                        {/* Profile */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("profile")}
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ mt: 4, mb: 3 }} />

                    <Box sx={{ textAlign: "end", px: 3 }}>
                        <Button
                            type='button'
                            onClick={() => { setPreviewImages([]), reset() }}
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


export default AddReceptionist