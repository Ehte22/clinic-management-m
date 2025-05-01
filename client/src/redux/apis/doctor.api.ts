import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IDoctor } from "../../models/doctor.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/doctor`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const doctorApi = createApi({
    reducerPath: "doctorApi",
    baseQuery: customBaseQuery,
    tagTypes: ["doctor"],
    endpoints: (builder) => {
        return {
            getDoctors: builder.query<{ result: IDoctor[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IDoctor[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["doctor"]
            }),

            getDoctorById: builder.query<IDoctor, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IDoctor }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["doctor"]
            }),

            addDoctor: builder.mutation<{ message: string, result: IDoctor }, IDoctor>({
                query: doctorData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: doctorData
                    }
                },
                transformResponse: (data: { message: string, result: IDoctor }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["doctor"]
            }),

            updateDoctor: builder.mutation<string, { id: string, doctorData: IDoctor }>({
                query: ({ id, doctorData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: doctorData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["doctor"]
            }),

            updateDoctorStatus: builder.mutation<string, { id: string, status: string }>({
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
                invalidatesTags: ["doctor"]
            }),

            deleteDoctor: builder.mutation<string, string>({
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
                invalidatesTags: ["doctor"]
            }),

        }
    }
})

export const {
    useGetDoctorsQuery,
    useGetDoctorByIdQuery,
    useAddDoctorMutation,
    useUpdateDoctorMutation,
    useUpdateDoctorStatusMutation,
    useDeleteDoctorMutation
} = doctorApi
