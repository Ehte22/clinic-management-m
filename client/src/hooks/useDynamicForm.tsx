import { useForm, Controller, FieldValues, DefaultValues, Path, UseFormSetValue, useFieldArray, ArrayPath, FieldErrors, ControllerRenderProps, FieldArray } from "react-hook-form";
import { ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Inputs from "../components/Inputs";
import Selects from "../components/Selects";
import Radios from "../components/Radios";
import Checkboxes from "../components/Checkboxes";
import InputFile from "../components/InputFile";
import Textarea from "../components/Textarea";
import { ValidationRules } from "../utils/validator";
import AutoComplete from "../components/AutoComplete";
import DateField from "../components/DateField";
import { Box, Grid2, IconButton, InputLabel, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import TimeField from "../components/TimeField";

export interface FieldConfig {
    name: string;
    label?: string;
    type: "text" | "password" | "email" | "number" | "color" | "range" | "date" | "time" | "select" | "radio" | "checkbox" | "file" | "textarea" | "formGroup" | "formArray" | "submit" | "autoComplete";
    placeholder?: string;
    options?: { name?: string | number, label?: string; value?: string | number, description?: string | number, disabled?: boolean, className?: string }[];
    className?: string
    size?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
    accept?: string
    multiple?: boolean
    displayName?: string
    legend?: string
    text?: string
    rows?: number
    cols?: number
    formArray?: FieldConfig[],
    formGroup?: {
        [key: string]: FieldConfig
    },
    object?: boolean
    rules: ValidationRules
}

export interface IFieldProps {
    controllerField: ControllerRenderProps<any, any>,
    field: FieldConfig
    setValue?: UseFormSetValue<any>
    errors?: string | undefined
    previewImages?: string | string[];
    setPreviewImages?: React.Dispatch<React.SetStateAction<string | string[] | undefined>>;
    disabled?: boolean
}

interface DynamicFormProps<T extends FieldValues> {
    schema: ZodSchema<T>;
    fields: FieldConfig[];
    onSubmit: (data: T) => void;
    defaultValues: DefaultValues<T>
}

const getErrorMessage = <T extends FieldValues>(
    fieldName: string,
    index: number,
    subFieldName: string,
    errors: FieldErrors<T>
) => {
    const fieldErrors = errors[fieldName];
    if (fieldErrors && Array.isArray(fieldErrors)) {
        const error = fieldErrors[index];
        if (error) {
            return error[subFieldName]?.message || null;
        }
    }
    return null;
};

const useDynamicForm = <T extends FieldValues>({
    schema,
    fields,
    onSubmit,
    defaultValues
}: DynamicFormProps<T>) => {

    const [disabledFields, setDisabledFields] = useState<string[]>([]);
    const [index, setIndex] = useState<number>(0);

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
        reset,
        getValues,
    } = useForm<T>({
        resolver: zodResolver(schema),
        defaultValues
    });

    const formArray = fields.find((item) => item.type === "formArray")

    const { fields: arrayFields, append, remove } = useFieldArray({
        control,
        name: formArray?.name as ArrayPath<T>
    })

    const disableField = (fieldName: string, isDisabled: boolean) => {
        setDisabledFields((prev) => {
            if (isDisabled) {
                return [...prev, fieldName]
            } else {
                return prev.filter((field) => field !== fieldName)
            }
        });
    };

    // Function to render a single input field
    const renderInput = (field: FieldConfig) => {

        return <>
            <Box key={field.name}>
                <InputLabel htmlFor={field.name} sx={{ fontWeight: 500, color: "black", my: 1 }}>
                    {field.label}
                </InputLabel>
                <Controller
                    key={field.name}
                    name={field.name as Path<T>}
                    control={control}
                    render={({ field: controllerField }) => {
                        switch (field.type) {
                            case "text":
                            case "password":
                            case "email":
                            case "number":
                            case "color":
                            case "range":
                                return <>
                                    <Inputs
                                        controllerField={controllerField}
                                        field={field}
                                        errors={errors[field.name as keyof T]?.message?.toString()}
                                        disabled={disabledFields.includes(field.name)} />
                                </>

                            case "date":
                                return <>
                                    <DateField
                                        controllerField={controllerField}
                                        field={field}
                                        errors={errors[field.name as keyof T]?.message?.toString()} />
                                </>

                            case "time":
                                return <>
                                    <TimeField
                                        controllerField={controllerField}
                                        field={field}
                                        errors={errors[field.name as keyof T]?.message?.toString()} />
                                </>

                            case "select":
                                return <>
                                    <Selects controllerField={controllerField} field={field} errors={errors[field.name as keyof T]?.message?.toString()} />
                                </>

                            case "autoComplete":
                                return <>
                                    <AutoComplete
                                        controllerField={controllerField}
                                        field={field}
                                        errors={errors[field.name as keyof T]?.message?.toString()}
                                    />
                                </>

                            case "radio":
                                return <>
                                    <Radios controllerField={controllerField} field={field} />
                                </>

                            case "checkbox":
                                return <>
                                    <Checkboxes controllerField={controllerField} field={field} />
                                </>

                            case "file":
                                return <>
                                    <InputFile
                                        controllerField={controllerField}
                                        field={field}
                                        setValue={setValue}
                                        errors={errors[field.name as keyof T]?.message?.toString()}
                                    />
                                </>

                            case "textarea":
                                return <>
                                    <Textarea
                                        controllerField={controllerField}
                                        field={field}
                                        errors={errors[field.name as keyof T]?.message?.toString()}
                                    />
                                </>

                            case "formGroup":
                                return <>
                                    <Box key={field.name}>
                                        <Typography variant="h4" >
                                            {field.displayName}
                                        </Typography>
                                        <Grid2 container columnSpacing={2} rowSpacing={3}>
                                            {field.formGroup &&
                                                Object.entries(field.formGroup).map(([_, subField]) => {
                                                    const fieldName = `${field.name}.${subField.name}`
                                                    const error = errors[field.name] &&
                                                        (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                                                            <Typography variant="caption" color="error">
                                                                {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                                                            </Typography>
                                                        )

                                                    return (
                                                        <Grid2 key={fieldName} size={subField.size}>
                                                            <InputLabel htmlFor={subField.name} sx={{ fontWeight: 500, color: "black" }}>
                                                                {subField.label}
                                                            </InputLabel>
                                                            <Controller
                                                                key={fieldName}
                                                                name={fieldName as Path<T>}
                                                                control={control}
                                                                rules={subField.rules}
                                                                render={({ field: controllerField }) => {
                                                                    switch (subField.type) {
                                                                        case "text":
                                                                        case "password":
                                                                        case "email":
                                                                        case "number":
                                                                        case "color":
                                                                        case "range":
                                                                            return <>
                                                                                <Inputs
                                                                                    controllerField={controllerField}
                                                                                    field={subField}
                                                                                    errors={error}
                                                                                    disabled={disabledFields.includes(subField.name)} />
                                                                            </>

                                                                        case "date":
                                                                            return <>
                                                                                <DateField
                                                                                    controllerField={controllerField}
                                                                                    field={subField}
                                                                                    errors={errors[subField.name as keyof T]?.message?.toString()} />
                                                                            </>

                                                                        case "time":
                                                                            return <>
                                                                                <TimeField
                                                                                    controllerField={controllerField}
                                                                                    field={subField}
                                                                                    errors={errors[subField.name as keyof T]?.message?.toString()} />
                                                                            </>

                                                                        case "select":
                                                                            return <>
                                                                                <Selects controllerField={controllerField} field={subField} errors={error} />
                                                                            </>

                                                                        case "autoComplete":
                                                                            return <>
                                                                                <AutoComplete
                                                                                    controllerField={controllerField}
                                                                                    field={subField}
                                                                                    errors={error}
                                                                                />
                                                                            </>

                                                                        case "radio":
                                                                            return <>
                                                                                <Radios controllerField={controllerField} field={subField} />
                                                                            </>

                                                                        case "checkbox":
                                                                            return <>
                                                                                <Checkboxes controllerField={controllerField} field={subField} />
                                                                            </>

                                                                        case "file":
                                                                            return <>
                                                                                <InputFile
                                                                                    controllerField={controllerField}
                                                                                    field={subField}
                                                                                    setValue={setValue}
                                                                                    errors={error}
                                                                                />
                                                                            </>

                                                                        case "textarea":
                                                                            return <>
                                                                                <Textarea
                                                                                    controllerField={controllerField}
                                                                                    field={subField}
                                                                                    errors={error}
                                                                                />
                                                                            </>
                                                                        default:
                                                                            return <></>;
                                                                    }
                                                                }}
                                                            />
                                                            {errors[field.name] &&
                                                                (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                                                                    <Typography variant="caption" color="error">
                                                                        {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                                                                    </Typography>
                                                                )}

                                                        </Grid2>
                                                    );
                                                })}
                                        </Grid2>
                                    </Box>
                                </>

                            case "formArray":
                                return <>
                                    <Box key={field.name}>
                                        {arrayFields.map((item, index) => (
                                            <Box key={item.id}>
                                                <Grid2 container columnSpacing={2} rowSpacing={3}>
                                                    {field.formArray?.map((subField) => {
                                                        setIndex(index)
                                                        const fieldName = `${field.name}[${index}].${subField.name}`
                                                        const error = (getErrorMessage(field.name, index, subField.name, errors)) && (
                                                            <Typography variant="caption" color="error">
                                                                {getErrorMessage(field.name, index, subField.name, errors)}
                                                            </Typography>
                                                        )

                                                        return (
                                                            <Grid2
                                                                key={`${fieldName}-${subField.name}`}
                                                                size={subField.size}
                                                            >
                                                                <InputLabel htmlFor={subField.name} sx={{ fontWeight: 500, color: "black" }}>
                                                                    {subField.label}
                                                                </InputLabel>
                                                                <Controller
                                                                    key={fieldName}
                                                                    name={fieldName as Path<T>}
                                                                    control={control}
                                                                    rules={subField.rules}
                                                                    render={({ field: controllerField }) => {
                                                                        switch (subField.type) {
                                                                            case "text":
                                                                            case "password":
                                                                            case "email":
                                                                            case "number":
                                                                            case "color":
                                                                            case "range":
                                                                                return <>
                                                                                    <Inputs
                                                                                        controllerField={controllerField}
                                                                                        field={subField}
                                                                                        errors={error}
                                                                                    />
                                                                                </>

                                                                            case "date":
                                                                                return <>
                                                                                    <DateField
                                                                                        controllerField={controllerField}
                                                                                        field={subField}
                                                                                        errors={error}
                                                                                    />
                                                                                </>

                                                                            case "time":
                                                                                return <>
                                                                                    <TimeField
                                                                                        controllerField={controllerField}
                                                                                        field={subField}
                                                                                        errors={error}
                                                                                    />
                                                                                </>

                                                                            case "select":
                                                                                return <>
                                                                                    <Selects controllerField={controllerField} field={subField} errors={error} />
                                                                                </>

                                                                            case "autoComplete":
                                                                                return <>
                                                                                    <AutoComplete
                                                                                        controllerField={controllerField}
                                                                                        field={subField}
                                                                                        errors={error}
                                                                                    />
                                                                                </>

                                                                            case "radio":
                                                                                return <>
                                                                                    <Radios controllerField={controllerField} field={subField} />
                                                                                </>

                                                                            case "checkbox":
                                                                                return <>
                                                                                    <Checkboxes controllerField={controllerField} field={subField} />
                                                                                </>

                                                                            case "file":
                                                                                return <>
                                                                                    <InputFile
                                                                                        controllerField={controllerField}
                                                                                        field={subField}
                                                                                        setValue={setValue}
                                                                                        errors={error}
                                                                                    />
                                                                                </>

                                                                            case "textarea":
                                                                                return <>
                                                                                    <Textarea
                                                                                        controllerField={controllerField}
                                                                                        field={subField}
                                                                                        errors={error}
                                                                                    />
                                                                                </>

                                                                            default:
                                                                                return <></>
                                                                        }
                                                                    }}
                                                                />
                                                                {(getErrorMessage(field.name, index, subField.name, errors)) && (
                                                                    <Typography variant="caption" color="error">
                                                                        {getErrorMessage(field.name, index, subField.name, errors)}
                                                                    </Typography>
                                                                )}
                                                            </Grid2>
                                                        );
                                                    })}
                                                </ Grid2>

                                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, my: 2 }}>
                                                    {arrayFields.length > 1 &&
                                                        <IconButton
                                                            type='button'
                                                            onClick={() => remove(index)}
                                                            sx={{
                                                                backgroundColor: '#f3f3f3',
                                                                borderRadius: "4px",
                                                                px: "12px",
                                                                boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faMinus} fontSize="16px" />
                                                        </IconButton>
                                                    }
                                                    {(arrayFields.length - 1) === index &&
                                                        <IconButton
                                                            type='button'
                                                            sx={{
                                                                backgroundColor: '#f3f3f3',
                                                                borderRadius: "4px",
                                                                px: "12px",
                                                                boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                                                            }}
                                                            onClick={() => {
                                                                if (arrayFields.length > 0) {
                                                                    const defaultField = arrayFields.reduce((acc: any, field) => {
                                                                        Object.keys(field).forEach((key) => { acc[key] = "" });
                                                                        return acc;
                                                                    }, {} as FieldArray<T, ArrayPath<T>>);

                                                                    append(defaultField as FieldArray<T, ArrayPath<T>>);
                                                                }
                                                            }}>
                                                            <FontAwesomeIcon icon={faPlus} fontSize="16px" />
                                                        </IconButton>
                                                    }

                                                </Box>
                                            </Box>
                                        ))}

                                    </Box>
                                </>

                            case "submit":
                                return (
                                    <button
                                        type="submit"
                                        className={field.className}
                                    >
                                        {field.displayName}
                                    </button>
                                );
                            default:
                                return <></>;
                        }
                    }}
                />
                <div>
                    {errors[field.name as keyof T]?.message && (
                        <Typography variant="caption" color="error">
                            {errors[field.name as keyof T]?.message?.toString()}
                        </Typography>
                    )}
                </div>
            </Box>
        </>
    };

    // Function to render the full form
    const renderFullForm = () => {
        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    {fields.map((field) => <div key={field.name}>{renderInput(field)}</div>)}
                </div>
            </form>
        );
    };

    // Function to render a single input
    const renderSingleInput = (fieldName: string) => {
        const field = fields.find((f) => f.name === fieldName);

        if (!field) return null;
        return renderInput(field);
    };


    return {
        renderFullForm,
        renderSingleInput,
        handleSubmit,
        errors,
        watch,
        reset,
        control,
        append,
        remove,
        getValues,
        setValue,
        disableField,
        index
    };
};

export default useDynamicForm;