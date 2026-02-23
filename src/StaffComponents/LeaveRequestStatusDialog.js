// ========== LeaveRequestStatusDialog.jsx ==========
/* PASTE THIS IN YOUR LeaveRequestStatusDialog.jsx FILE */

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import api from "./services/api";
import LeaveRequestDialog from "./LeaveRequestDialog";

export default function LeaveRequestStatusDialog({ open, onClose }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, data: null });

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/leave/getownall");
      setLeaveRequests(res.data.data.slice(0, 10));
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      alert(err.response?.data?.message || "Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLeaveRequests();
    }
  }, [open]);

  // ✅ FIX: This will be called from LeaveRequestDialog after successful update
 const handleRefresh = () => {
  fetchLeaveRequests();
  onClose(); // close the status dialog
};



  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Recent Leave Requests</DialogTitle>
        <DialogContent>
          {loading ? (
            <CircularProgress />
          ) : leaveRequests.length === 0 ? (
            <Typography>No leave requests found</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Date From</TableCell>
                    <TableCell>Date To</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{new Date(request.start_date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{new Date(request.end_date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>
                        {request.status === "Approved" ? (
                          <Typography color="success.main">Approved</Typography>
                        ) : request.status === "Rejected" ? (
                          <Typography color="error.main">Rejected</Typography>
                        ) : (
                          <Typography color="text.secondary">Pending</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() =>
                            setEditDialog({ open: true, data: request })
                          }
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <LeaveRequestDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, data: null })}
        initialData={editDialog.data}
        onUpdate={handleRefresh}
      />
    </>
  );
}