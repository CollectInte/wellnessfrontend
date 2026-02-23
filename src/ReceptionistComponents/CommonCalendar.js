import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import { Box, IconButton } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { COLORS } from "./Themes";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", { weekStart: 0 });

const today = dayjs().startOf("day");
const minDate = today;

const CommonCalendar = ({ value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StaticDatePicker
        value={value ?? today}
        onChange={(newValue) => onChange(newValue ?? today)}
        minDate={minDate}
        views={["day"]}
        openTo="day"
        dayOfWeekFormatter={(day) => day.format("ddd")}
        showDaysOutsideCurrentMonth={false}
        slots={{
          toolbar: () => null,
        }}
        sx={{
          maxHeight: "270px",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",

          width: { xs: "100%", md: "100%" },

          /* 🔥 THIS IS THE KEY */
          minWidth: "unset",

          "& .MuiPickersLayout-root": {
            minWidth: "unset",
          },

          "& .MuiDayCalendar-root": {
            minWidth: "unset",
          },
          /* 🔥 REMOVE ROOT SIDE PADDING */
          "& .MuiPickersLayout-contentWrapper": {
            paddingLeft: 0,
            paddingRight: 0,
          },

          /* 🔥 CALENDAR GRID ALIGNMENT */
          "& .MuiDayCalendar-slideTransition": {
            paddingLeft: 0,
            paddingRight: 0,
          },

          /* HEADER */
          "& .MuiPickersCalendarHeader-root": {
            backgroundColor: COLORS.activeBg,
            borderRadius: "10px",
            minHeight: "40px",
          },

          /* arrows */
          "& .MuiPickersArrowSwitcher-root": {
            justifyContent: "space-between",
          },

          "& .MuiPickersCalendarHeader-label": {
            color: COLORS.primary,
            fontWeight: 600,
            fontSize: "0.95rem",
          },

          "& .MuiIconButton-root": {
            color: COLORS.primary,
            padding: "10px",
            paddingInline: { xs: 2, md: 0 },
          },

          /* WEEKDAYS */
          "& .MuiDayCalendar-weekDayLabel": {
            fontSize: "0.75rem",
            width: { xs: "35px", md: "40px" },
            height: "28px",
            color: COLORS.primary,
            paddingInline: { xs: 2, md: 0 },
          },

          /* DAY CELLS */
          "& .MuiPickersDay-root": {
            width: { xs: "35px", md: "40px" },
            height: "32px",
            borderRadius: 3,
            fontSize: "0.8rem",
            paddingInline: { xs: 2, md: 0 },
          },

          /* TODAY */
          "& .MuiPickersDay-root.MuiPickersDay-today:not(.Mui-selected)": {
            border: `1.5px solid ${COLORS.primary}`,
            backgroundColor: "transparent",
            paddingInline: { xs: 2, md: 0 },
          },

          /* SELECTED */
          "& .MuiPickersDay-root.Mui-selected": {
            backgroundColor: COLORS.primary,
            color: COLORS.texWhite,
            fontWeight: 600,
          },
          /* DISABLED */
          "& .Mui-disabled": {
            color: COLORS.softBg,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default CommonCalendar;
