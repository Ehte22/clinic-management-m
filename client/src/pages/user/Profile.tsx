import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, Avatar, Typography, Button, Box, TextField, Grid2 } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/CloudUpload";
import { useParams } from "react-router-dom";
import { useGetUserByIdQuery, useUpdateUserMutation } from "../../redux/apis/user.api";
import { FieldConfig } from "../../hooks/useDynamicForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customValidator } from "../../utils/validator";
import { z } from "zod";
import Toast from "../../components/Toast";

const textFieldStyle = {
    mt: 2,
    backgroundColor: 'white',
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid black',
        },
        '& .MuiSvgIcon-root': {
            color: 'gray',
        },
        '& .MuiInputBase-root': {
            color: 'black',
        },
        '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px black inset',
            WebkitTextFillColor: 'black',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'gray',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: 'black',
    },
}

const Profile = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<File | string>("")
    const [profileUrl, setProfileUrl] = useState<string>("")

    const { id } = useParams()

    const { data } = useGetUserByIdQuery(id || "", { skip: !id })
    const [updateUser, { data: updateMessage, isSuccess, isError, error: updateError, isLoading }] = useUpdateUserMutation()

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "firstName",
            label: "First Name",
            type: "text",
            rules: { required: true }
        },
        {
            name: "lastName",
            label: "Last Name",
            type: "text",
            rules: { required: true }
        },
        {
            name: "email",
            label: "Email Address",
            type: "text",
            rules: { required: true, email: true }
        },
        {
            name: "phone",
            label: "Phone Number",
            type: "text",
            rules: { required: true, pattern: /^[6-9]\d{9}$/, patternMessage: "Please enter a valid phone number" }
        },
    ], [])

    const defaultValues = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        profile: ""
    }

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })

    const onSubmit = useCallback((values: FormValues) => {
        const formData = new FormData()

        Object.keys(values).forEach((key) => {
            if (typeof values[key] === "object") {
                Object.keys(values[key]).forEach((item) => {
                    formData.append(key, values[key][item])
                })
            } else {
                formData.append(key, values[key])
            }
        })

        if (profile) {
            formData.append("profile", profile);
        }

        if (id) {
            updateUser({ id, userData: formData })
        }
    }, [id, profile, updateUser])

    useEffect(() => {
        if (data) {
            setValue("firstName", data.firstName)
            setValue("lastName", data.lastName)
            setValue("email", data.email)
            setValue("phone", data.phone.toString() || "")

            if (data.profile) {
                setValue("profile", data.profile)
                setProfileUrl(data.profile)
            }
        }
    }, [data])

    useEffect(() => {
        if (isSuccess) {
            setIsEditing(false)
        }
    }, [isSuccess])


    return <>
        {isSuccess && <Toast type={updateMessage === "No Changes Detected" ? "info" : "success"} message={updateMessage} />}
        {isError && id && <Toast type="error" message={String(updateError)} />}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Card sx={{ width: "100%", p: 3, textAlign: "center" }}>
                <CardContent>
                    {/* Profile Picture */}
                    <Box position="relative" display="inline-block">
                        <Avatar
                            src={profileUrl}
                            sx={{ width: 100, height: 100, margin: "auto", cursor: "pointer" }}
                        />
                        <input
                            name="profile"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            id="upload-photo"
                            onChange={(e) => {
                                const { files } = e.target
                                if (files?.length) {
                                    setProfile(files[0])
                                    setProfileUrl(URL.createObjectURL(files[0]))
                                }
                            }}
                        />
                        <label htmlFor="upload-photo">
                            <Button
                                type="button"
                                component={"span" as unknown as React.ElementType}
                                size="small"
                                sx={{ position: "absolute", bottom: 5, right: 10, backgroundColor: "white", minWidth: 30 }}
                            >
                                <UploadIcon fontSize="small" color="secondary" />
                            </Button>
                        </label>
                    </Box>

                    {/* User Details */}
                    {isEditing
                        ? <Box >
                            <Grid2 container columnSpacing={2} rowSpacing={3} mt={4}>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        {...register("firstName")}
                                        fullWidth
                                        label="First Name"
                                        variant="outlined"
                                        size="small"
                                        sx={textFieldStyle}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName?.message as string}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        {...register("lastName")}
                                        fullWidth
                                        label="Last Name"
                                        variant="outlined"
                                        size="small"
                                        sx={textFieldStyle}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName?.message as string}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        {...register("email")}
                                        fullWidth
                                        label="Email"
                                        variant="outlined"
                                        size="small"
                                        sx={textFieldStyle}
                                        error={!!errors.email}
                                        helperText={errors.email?.message as string}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        {...register("phone")}
                                        fullWidth
                                        label="Phone Number"
                                        variant="outlined"
                                        size="small"
                                        sx={textFieldStyle}
                                        error={!!errors.phone}
                                        helperText={errors.phone?.message as string}
                                    />
                                </Grid2>

                            </Grid2>
                        </Box>
                        : <>
                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                                {data?.firstName} {data?.lastName}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {data?.email}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {data?.phone}
                            </Typography>
                        </>
                    }

                    {
                        isEditing
                            ? <Box sx={{ textAlign: "end", mt: 4 }}>
                                <Button
                                    type='button'
                                    onClick={() => setIsEditing(false)}
                                    variant='contained'
                                    sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                                    Cancel
                                </Button>
                                <Button
                                    loading={isLoading}
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    sx={{ backgroundColor: "#0777de", color: "white", ml: 2 }}
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </Box>
                            : <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                sx={{ mt: 2, backgroundColor: "#0777de", color: "white" }}
                                type="button"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </Button>
                    }

                </CardContent>
            </Card>
        </Box>
    </>
})

export default Profile;
