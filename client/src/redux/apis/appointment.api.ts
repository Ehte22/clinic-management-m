import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IAppointment } from "../../models/appointment.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const appointmentApi = createApi({
    reducerPath: "appointmentApi",
    baseQuery: customBaseQuery,
    tagTypes: ["appointment"],
    endpoints: (builder) => {
        return {
            getAppointments: builder.query<{ result: IAppointment[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string, onlyToday: boolean }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IAppointment[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["appointment"]
            }),

            getAppointmentById: builder.query<IAppointment, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IAppointment }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["appointment"]
            }),

            addAppointment: builder.mutation<{ message: string, result: IAppointment }, IAppointment>({
                query: appointmentData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: appointmentData
                    }
                },
                transformResponse: (data: { message: string, result: IAppointment }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["appointment"]
            }),

            updateAppointment: builder.mutation<string, { id: string, appointmentData: IAppointment }>({
                query: ({ id, appointmentData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: appointmentData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data?.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["appointment"]
            }),

            updateAppointmentStatus: builder.mutation<string, { id: string, status: string }>({
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
                invalidatesTags: ["appointment"]
            }),

            deleteAppointment: builder.mutation<string, string>({
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
                invalidatesTags: ["appointment"]
            }),

        }
    }
})

export const {
    useGetAppointmentsQuery,
    useGetAppointmentByIdQuery,
    useAddAppointmentMutation,
    useUpdateAppointmentMutation,
    useUpdateAppointmentStatusMutation,
    useDeleteAppointmentMutation
} = appointmentApi
