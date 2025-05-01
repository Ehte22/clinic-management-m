import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import ActionsMenu from "../../components/ActionsMenu";
import Toast from "../../components/Toast";
import { Paper } from "@mui/material";
import { ISupplier } from "../../models/supplier.interface";
import { useDeleteSupplierMutation, useGetSuppliersQuery } from "../../redux/apis/supplier.api";

const Suppliers = () => {

    // Hooks
    const [suppliers, setSuppliers] = useState<ISupplier[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedClinic, setSelectedClinic] = useState<string>("");

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const config: DataContainerConfig = {
        pageTitle: "Suppliers",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedClinic
    }

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetSuppliersQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase(),
        selectedClinic
    })
    const [deleteSuppliers, { data: message, isSuccess: isDeleteSuccess }] = useDeleteSupplierMutation()

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        { field: 'name', headerName: 'Name', minWidth: 170, flex: 1 },
        { field: 'phone', headerName: 'Phone', minWidth: 170, flex: 1 },
        { field: 'email', headerName: 'Email', minWidth: 150, flex: 0.8 },
        {
            field: 'city', headerName: 'City', minWidth: 120, flex: 0.8,
            valueGetter: (_, row) => row.address.city
        },
        {
            field: 'state', headerName: 'State', minWidth: 120, flex: 0.8,
            valueGetter: (_, row) => row.address.state
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
                    <ActionsMenu id={params.row._id} deleteAction={deleteSuppliers} />
                </>
            }
        }
    ];

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "suppliers" });
        if (isSuccess && navigator.onLine) {
            const suppliers = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            await idbHelpers.saveAll({ storeName: "suppliers", data: suppliers });
            setSuppliers(suppliers);
        } else if (!navigator.onLine) {
            setSuppliers(offlineData);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isSuccess, data]);

    if (isLoading) {
        return <Loader />
    }

    return <>
        {isDeleteSuccess && <Toast type='success' message={message as string} />}
        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={suppliers}
                columns={columns}
                loading={isLoading}
                rowCount={data?.pagination.totalEntries || 0}
                paginationMode='server'
                pageSizeOptions={[5, 10, 20, 50]}
                paginationModel={{ page: pagination.page, pageSize: pagination.pageSize }}
                getRowId={(row) => row._id}
                onPaginationModelChange={(params) => {
                    setPagination({ page: params.page, pageSize: params.pageSize })
                }}
                sx={{ border: 0 }}
            />
        </Paper >
    </>
}

export default Suppliers