import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  IconButton,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import CommonDatePicker from "./CommonDatePicker";
import CloseIcon from "@mui/icons-material/Close";

const ServiceRequestForm = ({ open, onClose, isEdit, editData }) => {
  const [complianceTypes, setComplianceTypes] = useState([]);
  const [preferredDate, setPreferredDate] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ SINGLE FORM STATE
  const [form, setForm] = useState({
    compliance_type_id: "",
    description: "",
    preferred_date: "",
    priority: "medium",
  });

  // -------------------------
  // FETCH COMPLIANCE TYPES
  // -------------------------
  useEffect(() => {
    if (open) {
      axios
        .get(`${process.env.REACT_APP_URL}/api/getcompliancetypes`, {
          withCredentials: true,
        })
        .then((res) => {
          setComplianceTypes(res.data.data || []);
        })
        .catch((err) => console.error("Compliance fetch error:", err));
    }
  }, [open]);

  // -------------------------
  // PREFILL DATA (EDIT MODE)
  // -------------------------
  useEffect(() => {
    if (isEdit && editData && open) {
      const formattedDate = editData.preferred_date
        ? dayjs(editData.preferred_date).format("YYYY-MM-DD")
        : "";

      setForm({
        compliance_type_id: editData.compliance_type_id ?? "",
        description: editData.description ?? "",
        preferred_date: formattedDate,
        priority: editData.priority ?? "medium",
      });

      setPreferredDate(
        editData.preferred_date
          ? dayjs(editData.preferred_date).startOf("day")
          : null
      );

      setErrors({});
    }
  }, [isEdit, editData, open]);

  // -------------------------
  // VALIDATION
  // -------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!form.compliance_type_id) {
      newErrors.compliance_type_id = "Compliance type is required";
    }

    if (!form.description || form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!form.preferred_date) {
      newErrors.preferred_date = "Preferred date is required";
    }

    if (!form.priority) {
      newErrors.priority = "Priority is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // SUBMIT HANDLER
  // -------------------------
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEdit) {
        // UPDATE
        await axios.put(
          `${process.env.REACT_APP_URL}/service/client/service-request/${editData.id}`,
          form,
          { withCredentials: true }
        );
      } else {
        // CREATE
        await axios.post(
          `${process.env.REACT_APP_URL}/service/client/service-request`,
          form,
          { withCredentials: true }
        );
      }

      // ✅ RESET FORM STATE
      setForm({
        compliance_type_id: "",
        description: "",
        preferred_date: "",
        priority: "medium",
      });

      // ✅ RESET DATE PICKER STATE (THIS WAS MISSING)
      setPreferredDate(null);

      onClose();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  useEffect(() => {
    if (open && !isEdit) {
      setForm({
        compliance_type_id: "",
        description: "",
        preferred_date: "",
        priority: "medium",
      });

      setPreferredDate(null);
      setErrors({});
    }
  }, [open, isEdit]);

  const isValid =
    form.compliance_type_id &&
    form.description &&
    form.preferred_date &&
    form.priority;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
    >
      <DialogContent>
        {/* HEADER */}
        <Box
          sx={{
            bgcolor: "#dbeafe",
            p: 1,
            mb: 2,
            fontWeight: 700,
            fontSize: 22,
            textAlign: "center",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>
            {isEdit ? "Edit Service Request" : "Book an Service Request"}
          </Typography>

          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={2}>
          {/* Compliance Type */}
          <TextField
            select
            label="Compliance Type"
            size="small"
            value={form.compliance_type_id}
            onChange={(e) =>
              setForm({ ...form, compliance_type_id: e.target.value })
            }
            required
            error={!!errors.compliance_type_id}
            helperText={errors.compliance_type_id}
          >
            {complianceTypes.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Description */}
          <TextField
            label="Description"
            required
            multiline
            rows={3}
            size="small"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* Preferred Date */}
          <CommonDatePicker
            key={isEdit ? editData?.id : "create"}
            label="Preferred Date"
            value={preferredDate}
            mode="service"
            onChange={(newValue) => {
              if (!newValue) {
                setPreferredDate(null);
                setForm({ ...form, preferred_date: "" });
                return;
              }

              setPreferredDate(newValue);
              setForm({
                ...form,
                preferred_date: newValue.format("YYYY-MM-DD"),
              });
            }}
          />

          {/* Priority */}
          <Typography fontWeight={500}>
            Choose Priority <span style={{ color: "red" }}>*</span>
          </Typography>

          <ToggleButtonGroup
            exclusive
            value={form.priority}
            onChange={(e, val) => val && setForm({ ...form, priority: val })}
            fullWidth
            sx={{
              border: errors.priority ? "1px solid #d32f2f" : "none",
              borderRadius: 1,
            }}
          >
            <ToggleButton value="low">Low</ToggleButton>
            <ToggleButton value="medium">Medium</ToggleButton>
            <ToggleButton value="high">High</ToggleButton>
          </ToggleButtonGroup>

          {errors.priority && (
            <Typography color="error" fontSize={12}>
              {errors.priority}
            </Typography>
          )}

          {/* SUBMIT */}
          <Button
            fullWidth
            sx={{ bgcolor: "#dbeafe", color: "#000" }}
            disabled={!isValid}
            onClick={handleSubmit}
          >
            {isEdit ? "Update Request" : "Submit Request"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestForm;
