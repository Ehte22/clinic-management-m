import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IPrescription } from "../../models/prescription.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/prescription`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const prescriptionApi = createApi({
    reducerPath: "prescriptionApi",
    baseQuery: customBaseQuery,
    tagTypes: ["prescription"],
    endpoints: (builder) => {
        return {
            getPrescriptions: builder.query<{ result: IPrescription[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IPrescription[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["prescription"]
            }),

            getPrescriptionById: builder.query<IPrescription, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IPrescription }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["prescription"]
            }),

            addPrescription: builder.mutation<{ message: string, result: IPrescription }, IPrescription>({
                query: prescriptionData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: prescriptionData
                    }
                },
                transformResponse: (data: { message: string, result: IPrescription }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["prescription"]
            }),

            updatePrescription: builder.mutation<string, { id: string, prescriptionData: IPrescription }>({
                query: ({ id, prescriptionData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: prescriptionData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["prescription"]
            }),

            deletePrescription: builder.mutation<string, string>({
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
                invalidatesTags: ["prescription"]
            }),

        }
    }
})

export const {
    useGetPrescriptionsQuery,
    useGetPrescriptionByIdQuery,
    useAddPrescriptionMutation,
    useUpdatePrescriptionMutation,
    useDeletePrescriptionMutation
} = prescriptionApi
