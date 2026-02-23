import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import axios from "axios";

const GenerateBill = ({
  open,
  onClose,
  requestId,
  clientId,
  staffId,
}) => {
  const [form, setForm] = useState({
    subtotal: "",
    tax: "",
    totalAmount: 0,
    status: "pending",
    dueDate: "",
    notes: "",
  });

  // Auto-calc total
  useEffect(() => {
    const subtotal = Number(form.subtotal || 0);
    const tax = Number(form.tax || 0);
    setForm((prev) => ({
      ...prev,
      totalAmount: subtotal + tax,
    }));
  }, [form.subtotal, form.tax]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        process.env.REACT_APP_BILL_CREATE,
        {
          request_id: requestId,
          subtotal: form.subtotal,
          tax: form.tax,
          total_amount: form.totalAmount,
          status: form.status,
          dueDate: form.dueDate,
          notes: form.notes,
        },
        { withCredentials: true }
      );

      onClose();
      alert("Bill generated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to generate bill");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Bill</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField label="Request ID" value={requestId} fullWidth disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Client ID" value={clientId} fullWidth disabled />
          </Grid>

          <Grid item xs={6}>
            <TextField label="Staff ID" value={staffId} fullWidth disabled />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Subtotal"
              name="subtotal"
              value={form.subtotal}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Tax"
              name="tax"
              value={form.tax}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Total Amount"
              value={form.totalAmount}
              fullWidth
              disabled
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Due Date"
              type="date"
              name="dueDate"
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={form.notes}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateBill;
