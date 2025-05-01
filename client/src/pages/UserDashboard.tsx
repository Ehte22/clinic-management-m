import { useEffect, useState } from 'react';
import { useGetClinicAdminDashboardDataQuery } from '../redux/apis/dashboard.api';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import Loader from '../components/Loader';
import { Box, Card, CardContent, Grid2, Typography } from '@mui/material';
import DataContainer, { DataContainerConfig } from '../components/DataContainer';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const UserDashBoard = () => {

    const [incomeData, setIncomeData] = useState<any>([]);
    const [patientData, setPatientData] = useState<any>([]);
    const [selectedClinic, setSelectedClinic] = useState<string>("")

    const config: DataContainerConfig = {
        pageTitle: "Dashboard",
        showSelector: true,
        onSelect: setSelectedClinic
    }

    const { data: allDashBoardData, isLoading } = useGetClinicAdminDashboardDataQuery({ selectedClinic })

    useEffect(() => {
        if (allDashBoardData) {
            if (allDashBoardData.patients) {
                setPatientData(allDashBoardData.patients);
            }

            if (allDashBoardData.income) {
                setIncomeData(allDashBoardData.income)
            }
        }
    }, [allDashBoardData, patientData, incomeData]);



    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const patients = {
        labels: months,
        datasets: [
            {
                label: 'Old Patients',
                data: patientData.map((item: any) => item.oldPatients),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'New Patients',
                data: patientData.map((item: any) => item.newPatients),
                backgroundColor: "rgba(7, 114, 237, 0.6)",
                borderColor: "rgba(7, 114, 237, 1)",
                borderWidth: 1,
            },
        ],
    };

    const income = {
        labels: months,
        datasets: [
            {
                label: 'Income Per Month',
                data: Array.from({ length: 12 }, (_, index) => {
                    const monthData = incomeData.find((item: any) => item.month === index + 1);
                    return monthData ? monthData.totalIncome : 0;
                }),
                backgroundColor: "rgba(7, 114, 237, 0.6)",
                borderColor: "rgba(7, 114, 237, 1)",
                borderWidth: 1,
            },
        ],
    };

    if (isLoading) {
        return <>
            <Loader />
        </>
    }

    return <>
        <Box>
            <DataContainer config={config} />
            <Grid2 container spacing={3} sx={{ mt: 3 }}>
                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Income Per Month</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Bar
                                    data={income}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true }
                                        }
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Patients</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Bar
                                    data={patients}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true }
                                        }
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        </Box>

    </>
};

export default UserDashBoard;
