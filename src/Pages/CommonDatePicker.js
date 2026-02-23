import * as React from "react";
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function CommonDatePicker({
  label = "Select Date",
  value,
  onChange,
  disableSunday = false,   // 🔥 NEW (optional)
}) {

  const shouldDisableDate = (date) => {
    // ❌ disable past dates
    if (date.isBefore(dayjs().startOf("day"))) return true;

    // ❌ disable all Sundays (only if enabled)
    if (disableSunday && date.day() === 0) return true;

    return false;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        shouldDisableDate={shouldDisableDate}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
}
