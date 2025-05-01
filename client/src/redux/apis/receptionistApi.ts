import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IReceptionist } from "../../models/receptionist.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/receptionist`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const receptionistApi = createApi({
    reducerPath: "receptionistApi",
    baseQuery: customBaseQuery,
    tagTypes: ["receptionist"],
    endpoints: (builder) => {
        return {
            getReceptionists: builder.query<{ result: IReceptionist[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IReceptionist[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["receptionist"]
            }),

            getReceptionistById: builder.query<IReceptionist, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IReceptionist }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["receptionist"]
            }),

            addReceptionist: builder.mutation<{ message: string, result: IReceptionist }, FormData>({
                query: receptionistData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: receptionistData
                    }
                },
                transformResponse: (data: { message: string, result: IReceptionist }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["receptionist"]
            }),

            updateReceptionist: builder.mutation<string, { id: string, receptionistData: FormData }>({
                query: ({ id, receptionistData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: receptionistData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data?.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["receptionist"]
            }),

            updateReceptionistStatus: builder.mutation<string, { id: string, status: string }>({
                query: ({ id, status }) => {
                    return {
                        url: `/status/${id}`,
                        method: "PUT",
                        body: { status }
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data?.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["receptionist"]
            }),

            deleteReceptionist: builder.mutation<string, string>({
                query: (id) => {
                    return {
                        url: `/delete/${id}`,
                        method: "PUT",
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data?.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["receptionist"]
            }),

        }
    }
})

export const {
    useGetReceptionistsQuery,
    useGetReceptionistByIdQuery,
    useAddReceptionistMutation,
    useUpdateReceptionistMutation,
    useUpdateReceptionistStatusMutation,
    useDeleteReceptionistMutation
} = receptionistApi
