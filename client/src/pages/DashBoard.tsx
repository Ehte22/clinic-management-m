import { useEffect, useState } from "react"
import Loader from "../components/Loader"
import { IClinicRevenue, IIncome, IMonthlyTrends, useGetDashBoardDataQuery } from "../redux/apis/dashboard.api"
import { Chart as ChartJS, LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";

import { Bar, Line, Pie } from "react-chartjs-2"
import { Box, Card, CardContent, Grid2, Typography } from "@mui/material";

ChartJS.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const DashBoard = () => {

    const { data, isLoading } = useGetDashBoardDataQuery({})
    const [clinicData, setClinicData] = useState<{ total: number, active: number, inactive: number }>()
    const [userData, setUserData] = useState<{ total: number, active: number, inactive: number }>()
    const [clinicRevenueData, setClinicRevenueData] = useState<IClinicRevenue>()
    const [monthlyTrendChart, setMonthlyTrendChart] = useState<IMonthlyTrends[]>()
    const [income, setIncome] = useState<IIncome[]>()
    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Clinic Status Data
    const clinicChartData = {
        labels: ["Active Clinics", "Inactive Clinics"],
        datasets: [
            {
                label: "Clinics",
                data: [clinicData?.active, clinicData?.inactive],
                backgroundColor: ["#4BC0C0", "#FF6384"],
                hoverBackgroundColor: ["#22CFCF", "#FF4069"],
            },
        ],
    };

    // User Status Data
    const userChartData = {
        labels: ["Active Users", "Inactive Users"],
        datasets: [
            {
                label: "Users",
                data: [userData?.active, userData?.inactive],
                backgroundColor: ["#36A2EB", "#FF9F40"],
                hoverBackgroundColor: ["#36A2EB", "#FF9020"],
            },
        ],
    };

    // Total Revenue Per Clinic
    const clinicRevenue = {
        labels: clinicRevenueData?.revenuePerClinic.map(item => item.name),
        datasets: [
            {
                label: "Total Revenue",
                data: clinicRevenueData?.revenuePerClinic.map(item => item.revenue),
                backgroundColor: "rgba(7, 114, 237, 0.6)",
                borderColor: "rgba(7, 114, 237, 1)",
                borderWidth: 1,
            },
        ],
    }

    // Color generator
    const generateColor = (index: number) => {
        const colors = [
            "#4BC0C0", "#FF6384", "#FF9F40", "#36A2EB", "#A133FF", "#33FFF6", "#FF8C33", "#FF3333"
        ];
        return colors[index % colors.length];
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const clinics = [...new Set(monthlyTrendChart?.map(item => item.clinic))];

    const datasets = clinics.map((clinic, index) => {
        const color = generateColor(index);
        return {
            label: clinic,
            data: months.map(month => {
                const found = monthlyTrendChart?.find(item => item.clinic === clinic && +item.month === month);
                return found ? found.totalRevenue : 0;
            }),
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2
            // tension: 0.8,
        };
    });

    // Monthly Trend Data
    const monthlyTrendsData = {
        labels,
        datasets: datasets
    };

    // Income Data
    const incomeData = {
        labels,
        datasets: [
            {
                label: 'Total Income',
                data: income?.map((item: any) => item.totalAmount),
                backgroundColor: "rgba(7, 114, 237, 0.6)",
                borderColor: "rgba(7, 114, 237, 1)",
                borderWidth: 1,
            },
        ],
    };

    useEffect(() => {
        if (data?.clinics) {
            setClinicData(data.clinics)
        }

        if (data?.users) {
            setUserData(data.users)
        }

        if (data?.revenue) {
            setClinicRevenueData(data.revenue)

        }
        if (data?.monthlyTrends) {
            setMonthlyTrendChart(data.monthlyTrends)
        }

        if (data?.income) {
            setIncome(data.income)
        }

    }, [data])

    if (isLoading) {
        return <>
            <Loader />
        </>
    }

    return <>

        <Box>
            <Grid2 container spacing={3} sx={{ mt: 3 }}>
                <Grid2 size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Income</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Bar
                                    data={incomeData}
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
                            <Typography variant="h6">Total Revenue of Clinic</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Bar
                                    data={clinicRevenue}
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
                            <Typography variant="h6">Monthly Revenue Trend Per Clinic</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px" } }}>
                                <Line
                                    data={monthlyTrendsData}
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

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Clinic Status</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px", display: "flex", justifyContent: "center" } }}>
                                <Pie data={clinicChartData}
                                    options={{
                                        plugins: {
                                            legend: { display: false },
                                        }
                                    }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Users Status</Typography>
                            <Box sx={{ height: { xs: "220px", sm: "250px", lg: "280px", xl: "320px", display: "flex", justifyContent: "center" } }}>
                                <Pie data={userChartData}
                                    options={{
                                        plugins: {
                                            legend: { display: false },
                                        }
                                    }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2 >

        </Box>
    </>
}

export default DashBoard