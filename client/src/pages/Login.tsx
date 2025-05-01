import { useEffect } from "react"
import { FieldConfig } from "../hooks/useDynamicForm"
import { useSignInMutation } from "../redux/apis/auth.api"
import { customValidator } from "../utils/validator"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import Toast from "../components/Toast"
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
        height: "44px",
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #0772ed',
        },
        '& .MuiSvgIcon-root': {
            color: '#0772ed',
        },
        '& .MuiInputBase-root': {
            color: '#0772ed',
        },
        '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #f0f6ff inset',
            WebkitTextFillColor: '#000',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'gray',
        transform: 'translate(14px, 11px) scale(1)',
        '&.Mui-focused, &.MuiFormLabel-filled': {
            transform: 'translate(14px, -6px) scale(0.75)',
        },
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#0772ed',
    },
};

const fields: FieldConfig[] = [
    {
        name: "email",
        label: "Email Address",
        type: "text",
        placeholder: "Enter Your Email",
        rules: { required: true, email: true }
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter Your Password",
        rules: { required: true }
    },
]

const Login = () => {
    const [signIn, { data, error, isSuccess, isError, isLoading }] = useSignInMutation()

    const navigate = useNavigate()
    const { user } = useSelector((state: RootState) => state.auth)

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })

    const onSubmit = (values: FormValues) => {
        signIn({ email: values.email, password: values.password })
    }

    useEffect(() => {
        if (isSuccess) {
            const timeout = setTimeout(() => {
                if (user) {
                    if (user.role === "Super Admin") {
                        navigate("/")
                    } else if (user.role === "Clinic Admin") {
                        navigate("/")
                    } else if (user.role === "Doctor") {
                        navigate("/appointment")
                    } else if (user.role === "Receptionist") {
                        navigate("/patients")
                    }
                }
            }, 2000);

            return () => clearTimeout(timeout)
        }

    }, [data, error, isSuccess, isError])

    return <>
        {isSuccess && <Toast type="success" message={data.message} />}
        {isError && <Toast type="error" message={error as string} />}
        <Container
            component="main"
            maxWidth={false}
            sx={{ minHeight: "100vh", maxWidth: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "100%", textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Sign In
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>

                    {/* Username */}
                    <TextField
                        {...register("email")}
                        fullWidth
                        label="Email"
                        type="text"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                        error={!!errors.email}
                        helperText={errors.email?.message as string}
                    />

                    {/* Password */}
                    <TextField
                        {...register("password")}
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                        error={!!errors.password}
                        helperText={errors.password?.message as string}
                    />

                    {/* Forgot Link */}
                    <Box sx={{ textAlign: "end", mb: 1 }}>
                        <Link to="/forgot-password" style={{ textDecoration: "none", color: "black", fontWeight: 550 }}>
                            Forgot Password?
                        </Link>
                    </Box>

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, backgroundColor: "#0772ed", color: "white" }}
                    >
                        Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    </>

}


export default Login