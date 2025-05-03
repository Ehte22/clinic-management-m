import React, { useCallback, useMemo } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldConfig } from "../hooks/useDynamicForm";
import { useForgotPasswordMutation } from "../redux/apis/auth.api";
import { customValidator } from "../utils/validator";
import Toast from "../components/Toast";

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

const ForgotPassword: React.FC = React.memo(() => {

    const [forgotPassword, { data, error, isSuccess, isError, isLoading }] = useForgotPasswordMutation()

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "email",
            label: "Email Address",
            type: "text",
            rules: { required: true }
        },
    ], [])

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })

    const onSubmit = useCallback((values: FormValues) => {
        forgotPassword(values.email)
    }, [forgotPassword])

    return <>
        {isSuccess && <Toast type="success" message={data} />}
        {isError && <Toast type="error" message={String(error)} />}
        <Container
            component="main"
            maxWidth={false}
            sx={{ minHeight: "100vh", maxWidth: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "100%", textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Forgot Password?
                </Typography>

                <Typography sx={{ color: "gray" }} mb={3}>
                    Enter your email address below, and we’ll send you a password reset link.
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                    {/* Email */}
                    <TextField
                        {...register("email")}
                        fullWidth
                        label="Email"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        sx={textFieldStyles}
                        error={!!errors.email}
                        helperText={errors.email?.message as string}
                    />

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        sx={{ my: 2, backgroundColor: "#0772ed", color: "white" }}
                    >
                        Send
                    </Button>

                    {/* Back Link */}
                    <Link to="/login" style={{ textDecoration: "none", color: "black" }}>
                        Back to Sign in
                    </Link>
                </Box>
            </Paper>
        </Container>
    </>

})

export default ForgotPassword;
