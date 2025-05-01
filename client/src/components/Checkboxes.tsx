import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel
} from "@mui/material";
import { IFieldProps } from "../hooks/useDynamicForm";

const Checkboxes: React.FC<IFieldProps> = ({ controllerField, field }) => {
    const handleCheckboxChange = (value: string) => {
        const currentValue: string[] = controllerField.value || [];

        const updatedValue = currentValue.includes(value)
            ? currentValue.filter((val) => val !== value)
            : [...currentValue, value];

        controllerField.onChange(updatedValue);
    };

    return (
        <FormControl component="fieldset">
            <FormLabel style={{ fontWeight: 500, color: "black" }}>
                {field.placeholder}
            </FormLabel>
            <FormGroup row>
                {field.options?.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        control={
                            <Checkbox
                                size="small"
                                color="secondary"
                                checked={controllerField.value?.includes(option.value)}
                                onChange={() => handleCheckboxChange(option.value as string)}
                            />
                        }
                        label={option.label}
                    />
                ))}
            </FormGroup>
        </FormControl>
    );
};

export default Checkboxes;
