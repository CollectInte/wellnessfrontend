import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  TablePagination,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
} from "@mui/material";
import api from "./services/api";

const DoctorAttendanceDialog = ({ open, onClose }) => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [doctors, setDoctors] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0 });

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    if (open) fetchAttendance(today);
  }, [open]);

  const fetchAttendance = async (selectedDate) => {
    try {
      const res = await api.get(
        `api/doctor/attendance-by-date?date=${selectedDate}`
      );
      if (res.data.success) {
        setDoctors(res.data.doctors);
        setSummary(res.data.summary);
        setPage(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const paginatedDoctors = doctors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Doctors Attendance</DialogTitle>

      <DialogContent>
        {/* 🔹 HEADER */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
            <TextField
              type="date"
              label="Select Date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchAttendance(e.target.value);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* 🔹 COUNT BUTTONS – NEAT ON BOTH DEVICES */}
          <Grid item xs={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={{ height: 45, textTransform: "none" }}
            >
              Present ({summary.present})
            </Button>
          </Grid>

          <Grid item xs={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              sx={{ height: 45, textTransform: "none" }}
            >
              Absent ({summary.absent})
            </Button>
          </Grid>
        </Grid>

        {/* ================= MOBILE VIEW ================= */}
        {isMobile ? (
          <Grid container spacing={2}>
            {paginatedDoctors.map((doc) => (
              <Grid item xs={12} key={doc.doctorId}>
                <Card
                  variant="outlined"
                  sx={{
                    width: "100%",
                    minHeight: 120, // 🔹 same height for all cards
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CardContent sx={{ width: "100%" }}>
                    <Typography fontWeight={600} mb={1}>
                      {doc.doctorName}
                    </Typography>

                    {/* Status Button */}
                    <Button
                      size="small"
                      variant="contained"
                      color={
                        doc.attendanceStatus === "present"
                          ? "success"
                          : "error"
                      }
                      sx={{ mb: 1, textTransform: "none" }}
                    >
                      {doc.attendanceStatus}
                    </Button>

                    {/* Time */}
                    <Typography variant="body2" color="text.secondary">
                      {doc.clockIn || "--"} → {doc.clockOut || "--"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {paginatedDoctors.length === 0 && (
              <Typography textAlign="center" width="100%">
                No records found
              </Typography>
            )}
          </Grid>
        ) : (
          /* ================= DESKTOP VIEW ================= */
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedDoctors.map((doc) => (
                <TableRow key={doc.doctorId}>
                  <TableCell>{doc.doctorName}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      color={
                        doc.attendanceStatus === "present"
                          ? "success"
                          : "error"
                      }
                      sx={{ textTransform: "none" }}
                    >
                      {doc.attendanceStatus}
                    </Button>
                  </TableCell>
                  <TableCell>{doc.clockIn || "--"}</TableCell>
                  <TableCell>{doc.clockOut || "--"}</TableCell>
                </TableRow>
              ))}

              {paginatedDoctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* 🔹 Pagination */}
        <TablePagination
          component="div"
          count={doctors.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />

        <Box textAlign="right">
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorAttendanceDialog;
