import { Container, Typography, Button, Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = React.memo(() => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ textAlign: "center", marginTop: "10vh" }}>
            <Box>
                <Typography variant="h1" color="primary" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Oops! The page you're looking for doesn't exist.
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    It seems like you've hit a dead end. Try going back to the home page.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{ mt: 2, backgroundColor: "#00c979", color: "white" }}
                >
                    Go Home
                </Button>
            </Box>
        </Container>
    );
})

export default PageNotFound;
