import { useEffect, useState } from "react"
import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { Box, Button, Divider, Grid2, Paper, Typography } from "@mui/material"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import Toast from "../../components/Toast"
import { IInvoice } from "../../models/invoice.interface"
import { useAddInvoiceMutation, useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from "../../redux/apis/invoiceApi"
import { useGetAppointmentsQuery } from "../../redux/apis/appointment.api"

const AddInvoice = () => {
    const [invoice, setInvoice] = useState<IInvoice | null>(null)
    const [appointmentOptions, setAppointmentOptions] = useState<{ label?: string, value?: string }[]>([])
    const [totalAmount, setTotalAmount] = useState<string>("")

    // Hooks
    const { id } = useParams()
    const navigate = useNavigate()

    // Queries and Mutations
    const [addInvoice, { data: addData, isLoading: addLoading, error: addError, isSuccess: isAddSuccess, isError: isAddError }] = useAddInvoiceMutation()
    const { data, isLoading, isFetching } = useGetInvoiceByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updateInvoice, { data: updateData, isLoading: updateLoading, error: updateError, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateInvoiceMutation()
    const { data: appointments, isSuccess: isAppointmentsFetchSuccess } = useGetAppointmentsQuery({ isFetchAll: true })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Invoice" : "Add Invoice",
        backLink: "../",
    }

    const fields: FieldConfig[] = [
        {
            name: "appointmentId",
            placeholder: "Appointment",
            type: "autoComplete",
            options: appointmentOptions,
            rules: { required: true }
        },
        {
            name: "issueDate",
            placeholder: "Issue Date",
            type: "date",
            rules: { required: true }
        },
        {
            name: "dueDate",
            placeholder: "Due Date",
            type: "date",
            rules: { required: true }
        },
        {
            name: "paymentMethod",
            type: "select",
            placeholder: "Select Payment Method",
            options: [
                { label: "Cash", value: "cash" },
                { label: "Card", value: "card" },
                { label: "Online", value: "online" },
            ],
            rules: { required: true }
        },
        {
            name: "tax",
            placeholder: "Tax",
            type: "text",
            rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
        },
        {
            name: "discount",
            placeholder: "Discount",
            type: "text",
            rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
        },
        {
            name: "notes",
            placeholder: "Notes",
            type: "textarea",
            rules: { required: false }
        },
        {
            name: "items",
            type: "formArray",
            label: "Invoice Items",
            formArray: [
                {
                    name: "title",
                    type: "text",
                    placeholder: "Title",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true }
                },
                {
                    name: "quantity",
                    type: "text",
                    placeholder: "Quantity",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                },
                {
                    name: "unitPrice",
                    type: "text",
                    placeholder: "Price Per Unit",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                },
                {
                    name: "total",
                    type: "text",
                    placeholder: "Total",
                    size: { xs: 12, sm: 6, lg: 3 },
                    rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
                },
            ],
            rules: {}
        }

    ]

    const defaultValues = {
        appointmentId: "",
        issueDate: "",
        dueDate: "",
        paymentMethod: "",
        tax: "",
        discount: "",
        notes: "",
        items: [
            { title: "", quantity: "", unitPrice: "", total: "" }
        ],
        totalAmount: ""
    }

    // Custom Validator
    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = (data: FormValues) => {

        const invoiceData = { ...data, totalAmount } as IInvoice

        if (invoice && invoice._id) {
            if (navigator.onLine) {
                updateInvoice({ invoiceData, id: invoice._id })
            } else {
                idbHelpers.update({ storeName: "invoices", endpoint: "invoice/update-invoice", _id: invoice._id, data })
            }
        } else {
            if (navigator.onLine) {
                addInvoice(invoiceData)
            } else {
                idbHelpers.add({ storeName: "invoices", endpoint: "invoice/create-invoice", data })
            }
        }
    }

    // Dynamic Form
    const { renderSingleInput, handleSubmit, setValue, reset, watch, index }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    const items = watch("items");
    const tax = Number(watch("tax") || 0);
    const discount = Number(watch("discount") || 0);
    const quantity = Number(watch(`items[${index}].quantity`) || 0);
    const unitPrice = Number(watch(`items[${index}].unitPrice`) || 0);

    const subtotal = items.reduce((acc: number, item: any) => acc + (+item.total || 0), 0);
    const TotalAmount = +subtotal - +discount + +tax;

    useEffect(() => {
        const calculatedTotal = +quantity * +unitPrice

        const currentTotal = items?.[index]?.total || 0
        if (currentTotal !== calculatedTotal) {
            setValue(`items[${index}].total`, calculatedTotal.toString())
        }
        setTotalAmount(calculatedTotal.toString())
    }, [quantity, unitPrice, index, items, setValue])

    useEffect(() => {
        if (isAppointmentsFetchSuccess) {
            const x = appointments.result.map((item) => {
                return { label: item.patient?.name, value: item._id }
            })

            setAppointmentOptions(x)
        }
    }, [isAppointmentsFetchSuccess])

    useEffect(() => {
        if (id) {
            if (data && navigator.onLine) {
                setInvoice(data);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "invoices", _id: id });
                    setInvoice(offlineData);
                };
                fetchData();
            }
        }
    }, [id, data]);

    useEffect(() => {
        if (id && invoice) {
            setValue("appointmentId", invoice.appointmentId)
            setValue("issueDate", invoice.issueDate)
            setValue("dueDate", invoice.dueDate)
            setValue("paymentMethod", invoice.paymentMethod)
            setValue("tax", invoice.tax?.toString() || "")
            setValue("discount", invoice.discount?.toString() || "")
            setValue("notes", invoice.notes)
            setValue("totalAmount", invoice.totalAmount)
            const invoiceItems = invoice.items.map(item => ({
                ...item,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toString(),
                total: item.total.toString()
            }))
            setValue("items", invoiceItems)

        }
    }, [id, invoice])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                navigate("/invoices")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/invoices")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    return <>
        {isAddSuccess && <Toast type="success" message={addData?.message} />}
        {isAddError && <Toast type="error" message={addError as string} />}

        {isUpdateSuccess && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && <Toast type="error" message={updateError as string} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* appointment */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("appointmentId")}
                        </Grid2>

                        {/* Issue Date */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("issueDate")}
                        </Grid2>

                        {/* Due Date */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("dueDate")}
                        </Grid2>

                        {/* Payment Method */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("paymentMethod")}
                        </Grid2>

                        {/* Tax */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("tax")}
                        </Grid2>

                        {/* Discount */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("discount")}
                        </Grid2>

                        {/* Notes */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("notes")}
                        </Grid2>

                        {/* Invoice Items */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("items")}
                        </Grid2>
                    </Grid2>

                    <Paper sx={{ background: "#F3F3F3", mx: 3, p: 3, mt: 4 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Invoice Summary
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
                            <Typography>Subtotal</Typography>
                            <Typography fontWeight={"bold"}>₹{subtotal}</Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
                            <Typography>Tax</Typography>
                            <Typography fontWeight={"bold"}>₹{tax || 0}</Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
                            <Typography>Discount</Typography>
                            <Typography fontWeight={"bold"}>₹{discount || 0}</Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", my: 2 }}>
                            <Typography sx={{ fontWeight: "bold", fontSize: 16 }}>Total Amount</Typography>
                            <Typography fontWeight={"bold"}>₹{TotalAmount || 0}</Typography>
                        </Box>
                    </Paper>



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
                            loading={id ? updateLoading : addLoading}
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
}

export default AddInvoice

