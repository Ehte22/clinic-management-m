import React, { useCallback, useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Paper, Stack } from "@mui/material";
import ActionsMenu from "../../components/ActionsMenu";
import Toast from "../../components/Toast";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import { IReceptionist } from "../../models/receptionist.interface";
import { receptionistApi, useGetReceptionistsQuery } from "../../redux/apis/receptionistApi";
import { useUpdateUserStatusMutation } from "../../redux/apis/user.api";
import { useDispatch } from "react-redux";

const Receptionists = React.memo(() => {
    // States
    const [receptionists, setReceptionists] = useState<IReceptionist[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedClinic, setSelectedClinic] = useState<string>("")

    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const dispatch = useDispatch()

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Receptionists",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedClinic
    }), [setSearchQuery, setSelectedClinic])

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetReceptionistsQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase(),
        selectedClinic
    })
    const [updateStatus, { data: statusMessage, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdateUserStatusMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        {
            field: 'name', headerName: 'Name', minWidth: 200, flex: 0.8,
            valueGetter: (_, row) => `${row.user?.firstName} ${row.user?.lastName}`
        },
        {
            field: 'email', headerName: 'Email', minWidth: 200, flex: 1,
            valueGetter: (_, row) => row.user?.email
        },
        {
            field: 'phone', headerName: 'Phone Number', minWidth: 200, flex: 0.7,
            valueGetter: (_, row) => row.user?.phone
        },
        {
            field: 'status', headerName: 'Status', minWidth: 120, flex: 0.8,
            renderCell: (params) => {
                const handleStatusChange = () => {
                    updateStatus({ id: params.row.user._id, status: params.row.user.status === "active" ? "inactive" : "active" }).unwrap()
                        .then(() => {
                            dispatch(
                                receptionistApi.util.invalidateTags([{ type: 'receptionist' }])
                            );
                        });
                };
                return <>
                    <Stack direction="row" sx={{ height: "100%", display: "flex", alignItems: "center" }} >
                        <Chip
                            label={params.row.user?.status === "active" ? "Active" : "Inactive"}
                            color={params.row.user?.status === "active" ? "success" : "error"}
                            variant="outlined"
                            onClick={handleStatusChange}
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
                    <ActionsMenu id={params.row._id} showDelete={false} />
                </>
            }
        }
    ], [updateStatus])


    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "receptionists" });
        if (isSuccess && navigator.onLine) {
            const receptionists = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            await idbHelpers.saveAll({ storeName: "receptionists", data: data.result });
            setReceptionists(receptionists);
        } else if (!navigator.onLine) {
            setReceptionists(offlineData);
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
        {statusUpdateSuccess && <Toast type="success" message={statusMessage} />}
        {statusUpdateError && <Toast type="error" message={String(statusError)} />}

        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={receptionists}
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

export default Receptionists