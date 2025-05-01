import React from 'react'
import { IFieldProps } from '../hooks/useDynamicForm'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'

const Radios: React.FC<IFieldProps> = ({ controllerField, field }) => {
    return <>
        <FormControl>
            <FormLabel id="demo-row-radio-buttons-group-label" style={{ fontWeight: 500, color: "black" }}>{field.placeholder}</FormLabel>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={controllerField.value}
                onChange={controllerField.onChange}
            >
                {field.options?.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio color='secondary' />}
                        label={option.label}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    </>
}

export default Radios