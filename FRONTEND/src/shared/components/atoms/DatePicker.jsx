    import dayjs from "dayjs";
    import "dayjs/locale/es"; 
    import { useCallback } from "react";
    import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
    import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
    import { DatePicker as MUIDatePicker } from "@mui/x-date-pickers/DatePicker";
    import { TextField } from "@mui/material";

    function DatePicker(props) {

    
    const { 
        label, 
        value, 
        onChange, 
        error = "", 
        disabled = false,
        ...restProps  
    } = props;
    
    
    const today = dayjs();
    const tomorrow = today.add(1, "day");

    // Solo hoy o mañana disponibles
    const shouldDisableDate = (date) =>
        !date.isSame(today, "day") && !date.isSame(tomorrow, "day");

    // Si no hay valor, se muestra hoy
    const dayjsValue = value && dayjs(value).isValid() ? dayjs(value) : today;


    
    const handleDateChange = useCallback((newValue) => {
        
        if (onChange && newValue && newValue.isValid()) {
        onChange(newValue);
        }
    }, [onChange]);  

    return (
        <div className="flex flex-col gap-1 w-full">
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <MUIDatePicker
            label={label}
            value={dayjsValue}
            onChange={handleDateChange}

            
            format="DD/MM/YYYY"
            disablePast
            shouldDisableDate={shouldDisableDate}
            disabled={disabled}
            enableAccessibleFieldDOMStructure={false}
            slots={{
                textField: (params) => (
                <TextField
                    {...params}
                    error={Boolean(error)}
                    helperText={error}
                    variant="outlined"
                    fullWidth
                    sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "0.75rem", // rounded-lg
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-neutral)",
                        "& fieldset": {
                        borderColor: "var(--color-neutral)",
                        },
                        "&:hover fieldset": {
                        borderColor: "var(--color-secondary)",
                        },
                        "&.Mui-focused fieldset": {
                        borderColor: "var(--color-secondary)",
                        borderWidth: "2px",
                        },
                    },
                    "& .MuiInputLabel-root": {
                        color: "var(--color-neutral)",
                        "&.Mui-focused": {
                        color: "var(--color-secondary)",
                        },
                    },
                    }}
                />
                ),
            }}
            />
        </LocalizationProvider>
        </div>
    );
    }
export default DatePicker;