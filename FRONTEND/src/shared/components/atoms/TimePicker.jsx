    import {
    FormControl,
    Select as MUISelect,
    MenuItem,
    FormHelperText,
    } from "@mui/material";

    function TimePicker({
    label,
    value,
    onChange,
    error = "",
    disabled = false,
    options = []
    }) {
    return (
        <FormControl
        error={Boolean(error)}
        disabled={disabled}
        sx={{
            width: "auto",
            minWidth: { xs: "110px", sm: "120px" },
            maxWidth: { xs: "180px", sm: "200px" },
            "& .MuiOutlinedInput-root": {
            borderRadius: "0.5rem",
            backgroundColor: "var(--color-surface)",
            "& fieldset": {
                borderColor: error ? "var(--color-primary)" : "rgba(45,45,45,0.23)",
            },
            "&:hover fieldset": {
                borderColor: "var(--color-secondary)",
            },
            "&.Mui-focused fieldset": {
                borderColor: "var(--color-secondary)",
                boxShadow: "0 0 0 2px rgba(232,160,62,0.3)",
            },
            },
        }}
        >
        {label && (
            <label className="block text-sm font-semibold text-neutral mb-1">
            {label}
            </label>
        )}

        <MUISelect
            value={value}
            onChange={onChange}
            displayEmpty
            disabled={disabled}
            MenuProps={{
            PaperProps: {
                sx: {
                borderRadius: 2,
                backgroundColor: "var(--color-surface)",
                boxShadow: 3,
                "& .MuiMenuItem-root": {
                    fontSize: "0.9rem",
                    color: "var(--color-neutral)",
                    "&:hover": {
                    backgroundColor: "rgba(232,160,62,0.1)",
                    },
                    "&.Mui-selected": {
                    backgroundColor: "rgba(232,160,62,0.15)",
                    "&:hover": {
                        backgroundColor: "rgba(232,160,62,0.2)",
                    },
                    },
                },
                },
            },
            }}
        >
            <MenuItem value="">
            <em style={{ color: "rgba(45,45,45,0.6)" }}>Seleccionar hora</em>
            </MenuItem>
            {options.map((time) => (
            <MenuItem key={time} value={time}>
                {time}
            </MenuItem>
            ))}
        </MUISelect>

        {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
    );
    }

    export default TimePicker;