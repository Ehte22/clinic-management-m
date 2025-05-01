import React from "react";
import { useTranslation } from "react-i18next";
import { usePDF } from "react-to-pdf";
import i18n from 'i18next';
import { format } from "date-fns";
import { IPatient } from "../../models/patient.interface";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, Paper, Typography } from "@mui/material";


interface Medicine {
    dosage: number;
    medicine: string;
    frequency: number | number[];
    instructions: string;
    duration: number;
    quantity: number;
}

interface PrescriptionTableProps {
    allMedicines: Medicine[];
    patientData?: IPatient;
}

const convertToMarathiNumerals = (number: number): string => {
    const marathiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return number.toString().split('').map(digit => marathiNumerals[parseInt(digit)]).join('');
};

const PrescriptionTable: React.FC<PrescriptionTableProps> = ({ allMedicines, patientData }) => {
    const { t } = useTranslation();
    const { toPDF, targetRef } = usePDF({ filename: "prescription.pdf" });

    const toggleLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: t("Sr_No"),
            minWidth: 70,
            flex: 0.5,
            renderCell: (params: GridRenderCellParams) => (
                i18n.language === "mr" ? convertToMarathiNumerals(params.value) : params.value
            )
        },
        {
            field: 'medicine',
            headerName: t("Medicine_Name"),
            minWidth: 180,
            flex: 0.8,
            renderCell: (params: GridRenderCellParams) => (
                params.value || (i18n.language === "mr" ? "न/अ" : "N/A")
            )
        },
        {
            field: 'dosage',
            headerName: t("Dose"),
            minWidth: 120,
            flex: 0.8,
            renderCell: (params: GridRenderCellParams) => (
                params.value
                    ? i18n.language === "mr"
                        ? t("dose", { value: convertToMarathiNumerals(params.value) })
                        : t("dose", { value: params.value })
                    : i18n.language === "mr"
                        ? "न/अ"
                        : "N/A"
            )
        },
        {
            field: 'frequency',
            headerName: t("Frequency"),
            minWidth: 240,
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                if (!params.value) {
                    return t("N/A", {
                        defaultValue: i18n.language === "mr"
                            ? "न/अ"
                            : "N/A"
                    });
                }

                if (Array.isArray(params.value)) {
                    return params.value.length > 0
                        ? params.value.map(f => t(String(f))).join(", ")
                        : t("N/A", { defaultValue: "न/अ" });
                }

                return t(String(params.value));
            }
        },
        {
            field: 'duration',
            headerName: t("Duration"),
            minWidth: 120,
            flex: 0.8,
            renderCell: (params: GridRenderCellParams) => (
                params.value
                    ? i18n.language === "mr"
                        ? t("duration", { value: convertToMarathiNumerals(params.value) })
                        : t("duration", { value: params.value })
                    : i18n.language === "mr"
                        ? "न/अ"
                        : "N/A"
            )
        },
        {
            field: 'instructions',
            headerName: t("Instructions"),
            minWidth: 180,
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                params.value ? t(params.value) : (i18n.language === "mr" ? "न/अ" : "N/A")
            )
        },
        {
            field: 'quantity',
            headerName: t("Quantity"),
            minWidth: 120,
            flex: 0.8,
            renderCell: (params: GridRenderCellParams) => (
                params.value
                    ? i18n.language === "mr"
                        ? t("quantity", { value: convertToMarathiNumerals(params.value) })
                        : t("quantity", { value: params.value })
                    : i18n.language === "mr"
                        ? "न/अ"
                        : "N/A"
            )
        },
    ];

    const rows = allMedicines.map((medicine, index) => ({
        id: index + 1,
        ...medicine
    }));

    return (
        <Box>
            <Paper sx={{ my: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => toggleLanguage("en")}
                    >
                        English
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => toggleLanguage("mr")}
                    >
                        मराठी
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => toPDF()}
                        sx={{ ml: 'auto' }}
                    >
                        {t("print")}
                    </Button>
                </Box>
            </Paper>

            <div ref={targetRef}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    {patientData && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                <strong>{t("Patient Details")}</strong>
                            </Typography>
                            <Typography><strong>{t("Name")}:</strong> {patientData.name}</Typography>
                            <Typography><strong>{t("Contact Info")}:</strong> {patientData.contactInfo}</Typography>
                            <Typography><strong>{t("Date of Birth")}:</strong> {format(patientData.dateOfBirth, "dd-MM-yyyy")}</Typography>
                            <Typography><strong>{t("Gender")}:</strong> {patientData.gender}</Typography>
                        </Box>
                    )}

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            hideFooter
                        />
                    </Box>

                </Paper>
            </div>
        </Box>
    );
};

export default PrescriptionTable;