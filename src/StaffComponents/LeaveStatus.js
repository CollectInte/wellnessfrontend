import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Stack,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import api from "./services/api";
import EditIcon from "@mui/icons-material/Edit";
import LeaveRequestDialog from "./LeaveRequestDialog";
import { TableContainer } from "@mui/material";

const RECORDS_PER_PAGE = 5;

export default function LeaveStatusPopup({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editLeave, setEditLeave] = useState(null);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (open) fetchLeaveData();
  }, [open]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/leave/getownall");
      if (res.data.success) {
        setLeaveData(res.data.data);
      } else {
        setLeaveData([]);
      }
    } catch (error) {
      setLeaveData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (leave) => {
    setEditLeave({
      id: leave.id,
      leaveType: leave.leave_type,
      fromDate: leave.start_date,
      toDate: leave.end_date,
      reason: leave.reason,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditLeave(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(leaveData.length / RECORDS_PER_PAGE);
  const paginatedData = leaveData.slice(
    (page - 1) * RECORDS_PER_PAGE,
    page * RECORDS_PER_PAGE
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Leave Status</DialogTitle>

        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : paginatedData.length === 0 ? (
            <Typography>No leave requests found.</Typography>
          ) : (
            <>
              {/* ================= MOBILE CARD VIEW ================= */}
              {isMobile ? (
                <Stack spacing={2}>
                  {paginatedData.map((leave) => (
                    <Card key={leave.id} sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack spacing={1}>
                          <Typography fontWeight={700}>
                            {leave.leave_type}
                          </Typography>

                          <Typography variant="body2">
                            <strong>From:</strong>{" "}
                            {new Date(leave.start_date).toLocaleDateString()}
                          </Typography>

                          <Typography variant="body2">
                            <strong>To:</strong>{" "}
                            {new Date(leave.end_date).toLocaleDateString()}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Reason:</strong>{" "}
                            {leave.reason || "-"}
                          </Typography>

                          <Typography
                            fontWeight={600}
                            color={
                              leave.status === "Approved"
                                ? "green"
                                : leave.status === "Pending"
                                ? "orange"
                                : "red"
                            }
                          >
                            {leave.status}
                          </Typography>

                          {leave.status === "Pending" && (
                            <Box textAlign="right">
                              <IconButton
                                onClick={() => handleEditClick(leave)}
                              >
                                <EditIcon color="primary" />
                              </IconButton>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                /* ================= DESKTOP TABLE VIEW ================= */
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Edit</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedData.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.leave_type}</TableCell>
                          <TableCell>
                            {new Date(leave.start_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{leave.reason || "-"}</TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              color:
                                leave.status === "Approved"
                                  ? "green"
                                  : leave.status === "Pending"
                                  ? "orange"
                                  : "red",
                            }}
                          >
                            {leave.status}
                          </TableCell>
                          <TableCell>
                            {leave.status === "Pending" && (
                              <IconButton
                                onClick={() => handleEditClick(leave)}
                              >
                                <EditIcon color="primary" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* ================= PAGINATION ================= */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} sx={{ color: "#107881" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      {editLeave && (
        <LeaveRequestDialog
          open={editOpen}
          onClose={handleEditClose}
          initialData={editLeave}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}