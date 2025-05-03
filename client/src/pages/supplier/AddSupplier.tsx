import React, { useCallback, useEffect, useMemo, useState } from "react"
import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { Box, Button, Divider, Grid2, Paper } from "@mui/material"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import Toast from "../../components/Toast"
import { ISupplier } from "../../models/supplier.interface"
import { useAddSupplierMutation, useGetSupplierByIdQuery, useUpdateSupplierMutation } from "../../redux/apis/supplier.api"

const AddMedicine = React.memo(() => {
    const [supplier, setSupplier] = useState<ISupplier | null>(null)

    // Hooks
    const { id } = useParams()
    const navigate = useNavigate()

    // Queries and Mutations
    const [addSupplier, add] = useAddSupplierMutation()
    const { data, isLoading, isFetching } = useGetSupplierByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updateSupplier, update] = useUpdateSupplierMutation()

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: id ? "Edit Supplier" : "Add Supplier",
        backLink: "../",
    }), [id])

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "name",
            placeholder: "Name",
            type: "text",
            rules: { required: true, min: 2, max: 50 }
        },
        {
            name: "phone",
            placeholder: "Phone Number",
            type: "text",
            rules: { required: true, pattern: /^[6-9]\d{9}$/ }
        },
        {
            name: "email",
            placeholder: "Email",
            type: "text",
            rules: { required: false, email: true }
        },
        {
            name: "address",
            type: "formGroup",
            label: "Address",
            object: true,
            formGroup: {
                city: {
                    name: "city",
                    placeholder: "City",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: true, min: 2, max: 50 }
                },
                state: {
                    name: "state",
                    placeholder: "State",
                    type: "text",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: true, min: 2, max: 50 }
                },
                country: {
                    name: "country",
                    placeholder: "Country",
                    type: "select",
                    options: [
                        { label: "India", value: "India" },
                        { label: "United States", value: "United States" },
                        { label: "United Kingdom", value: "United Kingdom" },
                        { label: "Australia", value: "Australia" }
                    ],
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false, min: 2, max: 50 }
                },
                street: {
                    name: "street",
                    placeholder: "Street Address",
                    type: "textarea",
                    size: { xs: 12, sm: 6, lg: 4 },
                    rules: { required: false, min: 2, max: 100 }
                },
            },
            rules: {}
        }
    ], [])

    const defaultValues: ISupplier = {
        name: "",
        phone: "",
        email: "",
        address: {
            city: "",
            state: "",
            street: "",
            country: "India",
        },
    }

    // Submit Function
    const onSubmit = useCallback((data: z.infer<ReturnType<typeof customValidator>>) => {

        const supplierData = data as ISupplier

        if (supplier && supplier._id) {
            if (navigator.onLine) {
                updateSupplier({ supplierData, id: supplier._id })
            } else {
                idbHelpers.update({ storeName: "suppliers", endpoint: "supplier/update-supplier", _id: supplier._id, data })
            }
        } else {
            if (navigator.onLine) {
                addSupplier(supplierData)
            } else {
                idbHelpers.add({ storeName: "suppliers", endpoint: "supplier/create-supplier", data: supplierData })
            }
        }
    }, [supplier, addSupplier, updateSupplier])

    // Dynamic Form
    const { renderSingleInput, handleSubmit, setValue, reset }
        = useDynamicForm({ schema: customValidator(fields), fields, onSubmit, defaultValues })

    useEffect(() => {
        if (id) {
            if (data && navigator.onLine) {
                setSupplier(data);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "suppliers", _id: id });
                    setSupplier(offlineData);
                };
                fetchData();
            }
        }
    }, [id, data]);

    useEffect(() => {
        if (id && supplier) {
            setValue("name", supplier.name)
            setValue("phone", supplier.phone.toString() || "")
            setValue("email", supplier.email)
            setValue("address.city", supplier.address.city)
            setValue("address.state", supplier.address.state)
            setValue("address.street", supplier.address.street)
            setValue("address.country", supplier.address.country)
        }
    }, [id, supplier])

    useEffect(() => {
        if (add.isSuccess || update.isSuccess) {
            const timeout = setTimeout(() => navigate('/suppliers'), 2000)
            return () => clearTimeout(timeout)
        }
    }, [add.isSuccess, update.isSuccess, navigate])

    return <>
        {add.isSuccess && <Toast type="success" message={add.data?.message} />}
        {add.isError && <Toast type="error" message={String(add.error)} />}
        {update.isSuccess && <Toast type={update.data === 'No Changes Detected' ? 'info' : 'success'} message={update.data} />}
        {update.isError && <Toast type="error" message={String(update.error)} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("name")}
                        </Grid2>

                        {/* Phone */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("phone")}
                        </Grid2>

                        {/* Email */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("email")}
                        </Grid2>

                        {/* Address */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("address")}
                        </Grid2>

                    </Grid2>

                    <Divider sx={{ mt: 4, mb: 3 }} />

                    <Box sx={{ textAlign: "end", px: 3 }}>
                        <Button
                            type='button'
                            onClick={() => reset()}
                            variant='contained'
                            sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                            Reset
                        </Button>
                        <Button
                            loading={add.isLoading || update.isLoading}
                            type='submit'
                            variant='contained'
                            sx={{ ml: 2, background: "#0777de", color: "white", py: 0.65 }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper >
        </Box>
    </>
})

export default AddMedicine

