import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { ISupplier } from "../../models/supplier.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/supplier`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const supplierApi = createApi({
    reducerPath: "supplierApi",
    baseQuery: customBaseQuery,
    tagTypes: ["supplier"],
    endpoints: (builder) => {
        return {
            getSuppliers: builder.query<{ result: ISupplier[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: ISupplier[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["supplier"]
            }),

            getSupplierById: builder.query<ISupplier, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: ISupplier }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["supplier"]
            }),

            addSupplier: builder.mutation<{ message: string, result: ISupplier }, ISupplier>({
                query: supplierData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: supplierData
                    }
                },
                transformResponse: (data: { message: string, result: ISupplier }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["supplier"]
            }),

            updateSupplier: builder.mutation<string, { id: string, supplierData: ISupplier }>({
                query: ({ id, supplierData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: supplierData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["supplier"]
            }),

            updateSupplierStatus: builder.mutation<string, { id: string, status: string }>({
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
                invalidatesTags: ["supplier"]
            }),

            deleteSupplier: builder.mutation<string, string>({
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
                invalidatesTags: ["supplier"]
            }),

        }
    }
})

export const {
    useGetSuppliersQuery,
    useGetSupplierByIdQuery,
    useAddSupplierMutation,
    useUpdateSupplierMutation,
    useUpdateSupplierStatusMutation,
    useDeleteSupplierMutation
} = supplierApi
