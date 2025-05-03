import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import ActionsMenu from "../../components/ActionsMenu";
import Toast from "../../components/Toast";
import { Paper } from "@mui/material";
import { IPatient } from "../../models/patient.interface";
import { useDeletePatientMutation, useGetPatientsQuery } from "../../redux/apis/patientApi";

const Patients = React.memo(() => {

  // Hooks
  const [patients, setPatients] = useState<IPatient[]>([])
  const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClinic, setSelectedClinic] = useState<string>("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const config: DataContainerConfig = useMemo(() => ({
    pageTitle: "Patients",
    showAddBtn: true,
    showRefreshButton: true,
    showSearchBar: true,
    showSelector: true,
    onSearch: setSearchQuery,
    onSelect: setSelectedClinic
  }), [setSearchQuery, setSelectedClinic])

  // Queries and Mutations
  const { data, isLoading, isSuccess } = useGetPatientsQuery({
    page: pagination.page + 1,
    limit: pagination.pageSize,
    searchQuery: debouncedSearchQuery.toLowerCase(),
    onlyToday: true,
    selectedClinic
  })
  const [deletePatient, { data: message, isSuccess: isDeleteSuccess }] = useDeletePatientMutation()

  const columns: GridColDef[] = useMemo(() => [
    { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
    { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
    { field: 'age', headerName: 'Age', minWidth: 100, flex: 0.7 },
    { field: 'weight', headerName: 'Weight', minWidth: 100, flex: 0.7 },
    { field: 'gender', headerName: 'Gender', minWidth: 150, flex: 0.8 },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      flex: 0.6,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return <>
          <ActionsMenu id={params.row._id} deleteAction={deletePatient} />
        </>
      }
    }
  ], [deletePatient])

  const fetchData = async () => {
    const offlineData = await idbHelpers.getAll({ storeName: "patients" });
    if (isSuccess && navigator.onLine) {
      const patients = data.result.map((item, index) => {
        return { ...item, serialNo: index + 1 }
      })
      await idbHelpers.saveAll({ storeName: "patients", data: patients });
      setPatients(patients);
    } else if (!navigator.onLine) {
      setPatients(offlineData);
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
    {isDeleteSuccess && <Toast type='success' message={message} />}
    <DataContainer config={config} />
    <Paper sx={{ width: '100%', mt: 2 }}>
      <DataGrid
        rows={patients}
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

export default Patients