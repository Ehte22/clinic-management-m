import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Loader from "../../components/Loader";
import { format } from "date-fns";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import ActionsMenu from "../../components/ActionsMenu";
import Toast from "../../components/Toast";
import { Chip, Paper, Stack } from "@mui/material";
import { IInvoice } from "../../models/invoice.interface";
import { useDeleteInvoiceMutation, useGetInvoicesQuery, useUpdateInvoiceStatusMutation } from "../../redux/apis/invoiceApi";

const Invoices = React.memo(() => {

    // Hooks
    const [invoices, setInvoices] = useState<IInvoice[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedClinic, setSelectedClinic] = useState<string>("");

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Invoices",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedClinic
    }), [setSearchQuery, setSelectedClinic])

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetInvoicesQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase(),
        selectedClinic
    })
    const [deleteInvoice, { data: message, isSuccess: isDeleteSuccess }] = useDeleteInvoiceMutation()
    const [updateStatus, { data: statusMessage, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdateInvoiceStatusMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        { field: 'invoiceNumber', headerName: 'Invoice Number', minWidth: 150, flex: 0.8 },
        {
            field: 'issueDate', headerName: 'Issue Date', minWidth: 150, flex: 0.8,
            valueGetter: (_, row) => format(new Date(row.issueDate), "dd-MM-yyyy")
        },
        {
            field: 'dueDate', headerName: 'Due Date', minWidth: 150, flex: 0.8,
            valueGetter: (_, row) => format(new Date(row.dueDate), "dd-MM-yyyy")
        },
        { field: 'totalAmount', headerName: 'Amount', minWidth: 150, flex: 0.8 },
        {
            field: "paymentStatus", headerName: "Payment Status", minWidth: 150, flex: 0.8,
            renderCell: (params) => {
                const handleStatusChange = () => {
                    updateStatus({ id: params.row._id, status: params.value === "unpaid" ? "paid" : "unpaid" })
                };
                return <>
                    <Stack direction="row" sx={{ height: "100%", display: "flex", alignItems: "center" }} >
                        <Chip
                            label={params.value === "paid" ? "Paid" : "Unpaid"}
                            color={params.value === "paid" ? "success" : "error"}
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
                    <ActionsMenu id={params.row._id} deleteAction={deleteInvoice} />
                </>
            }
        }
    ], [updateStatus, deleteInvoice])

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "invoices" });
        if (isSuccess && navigator.onLine) {
            const invoices = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            await idbHelpers.saveAll({ storeName: "invoices", data: invoices });
            setInvoices(invoices);
        } else if (!navigator.onLine) {
            setInvoices(offlineData);
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
        {isDeleteSuccess && <Toast type='success' message={message} />}
        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={invoices}
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

export default Invoices