import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
  Box,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Button,
} from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const StaffAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    date: null,
    branch: "",
    staffId: "",
  });

    const handleReset = () => {
    setFilters({
      date: null,
      branch: "",
      staffId: "",
    });
  };

  // 🔹 Fetch staff list (Admin / Receptionist)
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}/api/staff/role?role=doctor`, {
        withCredentials: true,
      })
      .then((res) => setStaffList(res.data.data || []))
      .catch((err) =>
        console.error("Staff list fetch error", err)
      );
  }, []);

  // 🔹 Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};

      if (filters.date) {
        params.date = dayjs(filters.date).format("YYYY-MM-DD");
      }

      if (filters.branch) {
        params.branch = filters.branch;
      }

      if (filters.staffId) {
        params.staffId = filters.staffId;
      }

      const res = await axios.get(
        `${process.env.REACT_APP_URL}/appointment/admin/appointments`,
        {
          params,
          withCredentials: true,
        }
      );

      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Appointments fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2} sx={{ color: "#3f6f7a" }}>
          Staff Appointments
        </Typography>

        {/* 🔹 FILTERS */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <DatePicker
            label="Date"
            value={filters.date}
            onChange={(v) =>
              setFilters({ ...filters, date: v })
            }
            slotProps={{
              textField: {
                size: "small",   // ✅ THIS is required
              },
            }}
          />

          <TextField
            label="Branch"
            size="small"
            variant="outlined"
            value={filters.branch}
            onChange={(e) =>
              setFilters({
                ...filters,
                branch: e.target.value,
                staffId: "", // reset staff on branch change
              })
            }
            sx={{ minWidth: 200 }}
          />

          <TextField
            select
            label="Staff"
            size="small"
            value={filters.staffId}
            onChange={(e) =>
              setFilters({
                ...filters,
                staffId: e.target.value,
              })
            }
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All Staff</MenuItem>
            {staffList.map((staff) => (
              <MenuItem key={staff.id} value={staff.id}>
                {staff.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Reset Button */}
      <Button variant="outlined" size="small" sx={{backgroundColor:"#3f6f7a",color:"white",textTransform:"none"}} onClick={handleReset}>
        <RestoreIcon/> Reset
      </Button>
        </Box>

        {/* 🔹 TABLE */}
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : appointments.length === 0 ? (
          <Typography color="text.secondary">
            No appointments found
          </Typography>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 420,          // 🔥 Fixed height (adjust as needed)
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["App Id", "Client", "Doctor", "Date", "Time","Branch", "Status", "Purpose"].map(
                    (head) => (
                      <TableCell
                        key={head}
                        align="center"
                        sx={{
                          backgroundColor: "#0F7C82",
                          color: "#fff",
                          fontWeight: 600,
                          height: 36,
                        }}
                      >
                        {head}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {appointments.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "& td": {
                        borderBottom: "1px dashed #7FB7BC",
                        height: 36,
                        textAlign: "center",
                      },
                    }}
                  >
                    <TableCell>{row.id}</TableCell>

                    {/* Column shaded */}
                    <TableCell sx={{ backgroundColor: "#D6E9E8" }}>
                      {row.client_name}
                    </TableCell>

                    <TableCell>{row.doctor_name}</TableCell>


                    {/* Column shaded */}
                    <TableCell sx={{ backgroundColor: "#D6E9E8" }}>
                      {row.appointment_date}
                    </TableCell>

                    <TableCell>
                      {row.from_time} - {row.to_time}
                    </TableCell>

                    <TableCell sx={{ backgroundColor: "#D6E9E8" }}>
                      {row.selected_branch}
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            row.status === "completed"
                              ? "#6BC3C8"      // green/teal
                              : row.status === "assigned"
                                ? "#F2AD58"      // orange
                                : "#F6B1AC",     // red (cancelled)

                          color:
                            row.status === "completed"
                              ? "#004D50"
                              : row.status === "assigned"
                                ? "#000"
                                : "#8B0000",

                          fontWeight: 500,
                          minWidth: 90,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {row.purpose}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default StaffAppointments;
