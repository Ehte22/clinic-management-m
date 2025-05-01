import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IInvoice } from "../../models/invoice.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/invoice`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const invoiceApi = createApi({
    reducerPath: "invoiceApi",
    baseQuery: customBaseQuery,
    tagTypes: ["invoice"],
    endpoints: (builder) => {
        return {
            getInvoices: builder.query<{ result: IInvoice[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IInvoice[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["invoice"]
            }),

            getInvoiceById: builder.query<IInvoice, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IInvoice }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["invoice"]
            }),

            addInvoice: builder.mutation<{ message: string, result: IInvoice }, IInvoice>({
                query: invoiceData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: invoiceData
                    }
                },
                transformResponse: (data: { message: string, result: IInvoice }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["invoice"]
            }),

            updateInvoice: builder.mutation<string, { id: string, invoiceData: IInvoice }>({
                query: ({ id, invoiceData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: invoiceData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["invoice"]
            }),

            updateInvoiceStatus: builder.mutation<string, { id: string, status: string }>({
                query: ({ id, status }) => {
                    return {
                        url: `/status/${id}`,
                        method: "PUT",
                        body: { status }
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["invoice"]
            }),

            deleteInvoice: builder.mutation<string, string>({
                query: (id) => {
                    return {
                        url: `/delete/${id}`,
                        method: "PUT",
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["invoice"]
            }),

        }
    }
})

export const {
    useGetInvoicesQuery,
    useGetInvoiceByIdQuery,
    useAddInvoiceMutation,
    useUpdateInvoiceMutation,
    useUpdateInvoiceStatusMutation,
    useDeleteInvoiceMutation
} = invoiceApi
