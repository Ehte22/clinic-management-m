import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IPatient } from "../../models/patient.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/patient`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const patientApi = createApi({
  reducerPath: "patientApi",
  baseQuery: customBaseQuery,
  tagTypes: ["patient"],
  endpoints: (builder) => {
    return {
      getPatients: builder.query<{ result: IPatient[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string, onlyToday: boolean }>>({
        query: (queryParams = {}) => {
          return {
            url: "/",
            method: "GET",
            params: queryParams
          }
        },
        transformResponse: (data: { result: IPatient[], pagination: IPagination }) => {
          return data
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        providesTags: ["patient"]
      }),

      getPatientById: builder.query<IPatient, string>({
        query: (id) => {
          return {
            url: `/${id}`,
            method: "GET"
          }
        },
        transformResponse: (data: { result: IPatient }) => {
          return data.result
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        providesTags: ["patient"]
      }),

      addPatient: builder.mutation<{ message: string, result: IPatient }, IPatient>({
        query: patientData => {
          return {
            url: "/add",
            method: "POST",
            body: patientData
          }
        },
        transformResponse: (data: { message: string, result: IPatient }) => {
          return data
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        invalidatesTags: ["patient"]
      }),

      updatePatient: builder.mutation<string, { id: string, patientData: IPatient }>({
        query: ({ id, patientData }) => {
          return {
            url: `/update/${id}`,
            method: "PUT",
            body: patientData
          }
        },
        transformResponse: (data: { message: string }) => {
          return data.message
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        invalidatesTags: ["patient"]
      }),

      updatePatientStatus: builder.mutation<string, { id: string, status: string }>({
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
        invalidatesTags: ["patient"]
      }),

      deletePatient: builder.mutation<string, string>({
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
        invalidatesTags: ["patient"]
      }),

    }
  }
})

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useAddPatientMutation,
  useUpdatePatientMutation,
  useUpdatePatientStatusMutation,
  useDeletePatientMutation
} = patientApi
