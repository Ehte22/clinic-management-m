import React from 'react'
import { Paper } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimePicker } from "@mui/x-date-pickers/TimePicker"
import { IFieldProps } from '../hooks/useDynamicForm'
import { textFieldStyles } from './Inputs'
import dayjs from 'dayjs'

const TimeField: React.FC<IFieldProps> = ({ controllerField, field, errors }) => {
    const isError = Boolean(errors)
    return <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper sx={{ width: "100%" }}>
                <TimePicker
                    sx={{ ...textFieldStyles, width: "100%" }}
                    label={field.placeholder}
                    value={controllerField.value ? dayjs(controllerField.value, "hh:mm A") : null}
                    onChange={(newValue) => {
                        if (newValue) {
                            const formattedTime = dayjs(newValue).format("hh:mm A")
                            controllerField.onChange(formattedTime);
                        } else {
                            controllerField.onChange("");
                        }
                    }}
                    slotProps={{
                        textField: {
                            error: isError,
                        },
                    }}
                />
            </Paper>
        </LocalizationProvider>
    </>
}

export default TimeField