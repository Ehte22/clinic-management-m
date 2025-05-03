import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import React from "react";

const Unauthorized = React.memo(() => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" style={{ textAlign: "center", marginTop: "20vh" }}>
            <Box >
                <LockIcon style={{ fontSize: 80, color: "#f44336" }} />
                <Typography variant="h4" gutterBottom>
                    401 - Unauthorized
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    You do not have permission to access this page.
                </Typography>
                <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/")}
                >
                    Go Home
                </Button>
            </Box>
        </Container>
    );
})

export default Unauthorized;
