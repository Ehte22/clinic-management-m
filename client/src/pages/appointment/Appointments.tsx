import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import ActionsMenu from "../../components/ActionsMenu";
import Toast from "../../components/Toast";
import { Chip, Paper, Stack } from "@mui/material";
import { IAppointment } from "../../models/appointment.interface";
import { useDeleteAppointmentMutation, useGetAppointmentsQuery } from "../../redux/apis/appointment.api";
import { format } from "date-fns";

const Appointments = React.memo(() => {

    // Hooks
    const [appointments, setAppointments] = useState<IAppointment[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedClinic, setSelectedClinic] = useState<string>("");

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Appointments",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedClinic
    }), [setSearchQuery, setSelectedClinic])

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetAppointmentsQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase(),
        onlyToday: true,
        selectedClinic
    })
    const [deleteAppointment, { data: message, isSuccess: isDeleteSuccess }] = useDeleteAppointmentMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        {
            field: 'name', headerName: 'Patient Name', minWidth: 170, flex: 1,
            valueGetter: (_, row) => row.patient?.name
        },
        {
            field: 'contactInfo', headerName: 'Patient Mobile', minWidth: 170, flex: 1,
            valueGetter: (_, row) => row.patient?.contactInfo
        },
        {
            field: 'doctorName', headerName: 'Doctor Name', minWidth: 170, flex: 1,
            valueGetter: (_, row) => `${row.doctor.user.firstName} ${row.doctor.user.lastName}`
        },
        {
            field: 'date', headerName: 'Date', minWidth: 120, flex: 0.8,
            valueGetter: (_, row) => format(new Date(row.date), "dd-MM-yyyy")
        },
        {
            field: 'from', headerName: 'From', minWidth: 120, flex: 0.8,
            valueGetter: (_, row) => row.timeSlot.from

        },
        {
            field: 'to', headerName: 'To', minWidth: 120, flex: 0.8,
            valueGetter: (_, row) => row.timeSlot.to

        },
        {
            field: 'status', headerName: 'Status', minWidth: 150, flex: 0.8,
            renderCell: (params) => {
                return <>
                    <Stack direction="row" sx={{ height: "100%", display: "flex", alignItems: "center" }} >
                        <Chip
                            label={params.value}
                            variant="outlined"
                            sx={{ borderRadius: 1 }} />
                    </Stack>
                </>
            }
        },

        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            flex: 0.6,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                return <>
                    <ActionsMenu id={params.row._id} deleteAction={deleteAppointment} />
                </>
            }
        }
    ], [deleteAppointment])

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "appointments" });
        if (isSuccess && navigator.onLine) {
            const appointments = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            await idbHelpers.saveAll({ storeName: "appointments", data: appointments });
            setAppointments(appointments);
        } else if (!navigator.onLine) {
            setAppointments(offlineData);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isSuccess, data, selectedClinic]);

    const handlePaginationChange = useCallback((params: { page: number, pageSize: number }) => {
        setPagination({ page: params.page, pageSize: params.pageSize });
    }, [])

    if (isLoading) {
        return <Loader />
    }

    return <>
        {isDeleteSuccess && <Toast type='success' message={String(message)} />}
        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={appointments}
                columns={columns}
                loading={isLoading}
                rowCount={data?.pagination.totalEntries || 0}
                paginationMode='server'
                pageSizeOptions={[5, 10, 20, 50]}
                paginationModel={{ page: pagination.page, pageSize: pagination.pageSize }}
                getRowId={(row) => row._id}
                onPaginationModelChange={handlePaginationChange}
                sx={{ border: 0 }}
            />
        </Paper >
    </>
})

export default Appointments