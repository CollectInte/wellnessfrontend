import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  IconButton,
  Alert,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import axios from "axios";
import { COLORS } from "../Themes";

/* -------------------- STYLES -------------------- */

const inputStyle = {
  bgcolor: "#fff",
  borderRadius: 2,
};

/* -------------------- INITIAL STATES -------------------- */

const initialForm = {
  name: "",
  email: "",
  password: "",
  mobile: "",
  address: "",
  gender: "",
  dob: "",
  blood_group: "",
  status: 1,
};

const initialErrors = {
  name: "",
  email: "",
  mobile: "",
};

/* -------------------- HELPERS -------------------- */

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const generatePassword = (name, mobile) => {
  if (!name || mobile.length < 2) return "";

  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const firstThree = cleanName.charAt(0).toUpperCase() + cleanName.slice(1, 3);
  const firstTwoMobile = mobile.slice(0, 2);

  return `${firstThree}@${firstTwoMobile}`;
};

export default function AddClientModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  /* -------------------- VALIDATION -------------------- */

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Patient name is required";
        else if (value.length < 3) error = "Name must be at least 3 characters";
        break;

      case "email":
        if (!value) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Enter a valid email address";
        break;

      case "mobile":
        if (!value) error = "Mobile number is required";
        else if (!/^\d{10}$/.test(value))
          error = "Mobile number must be exactly 10 digits";
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(initialErrors).forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  /* -------------------- HANDLERS -------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d*$/.test(value)) return;

    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({
      ...p,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async () => {
    setApiError("");

    if (!validateForm()) return;

    const autoPassword = generatePassword(formData.name, formData.mobile);

    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_URL}/api/client/create`,
        {
          ...formData,
          password: autoPassword,
        },
        { withCredentials: true },
      );

      onClose();
      onSuccess();
      setFormData(initialForm);
      setErrors(initialErrors);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          bgcolor: COLORS.activeBg,
        }}
      >
        Add Client
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#ffffff" }}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {apiError}
          </Alert>
        )}

        {/* NAME */}
        <TextField
          fullWidth
          label="Patient Name"
          size="small"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          sx={inputStyle}
        />

        {/* EMAIL + MOBILE */}
        <Box display="flex" gap={1} mt={1}>
          <TextField
            fullWidth
            label="Email"
            size="small"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={inputStyle}
          />

          <TextField
            fullWidth
            label="Mobile"
            size="small"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            inputProps={{ maxLength: 10 }}
            error={!!errors.mobile}
            helperText={errors.mobile}
            sx={inputStyle}
          />
        </Box>

        {/* GENDER + BLOOD GROUP */}
        <Box display="flex" gap={1} mt={1}>
          <Select
            fullWidth
            size="small"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            displayEmpty
            renderValue={(selected) =>
              selected ? selected : "Select Gender (Optional)"
            }
            sx={{
              ...inputStyle,
              color: formData.gender ? "inherit" : "text.secondary",
            }}
          >
            <MenuItem value="" disabled>
              Select Gender (Optional)
            </MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>

          <Select
            fullWidth
            size="small"
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            displayEmpty
            renderValue={(selected) =>
              selected ? selected : "Blood Group (Optional)"
            }
            sx={{
              ...inputStyle,
              color: formData.blood_group ? "inherit" : "text.secondary",
            }}
          >
            <MenuItem value="">Blood Group (Optional)</MenuItem>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
              <MenuItem key={bg} value={bg}>
                {bg}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* DOB + STATUS */}
        <Box display="flex" gap={1} mt={1}>
          <TextField
            fullWidth
            size="small"
            type="date"
            name="dob"
            label="Date of Birth"
            value={formData.dob}
            onChange={handleChange}
            sx={inputStyle}
            InputLabelProps={{ shrink: true }}
          />

          <Select
            fullWidth
            size="small"
            name="status"
            value={formData.status}
            onChange={handleChange}
            sx={inputStyle}
          >
            <MenuItem value={1}>Active</MenuItem>
            <MenuItem value={0}>Inactive</MenuItem>
          </Select>
        </Box>

        {/* ADDRESS */}
        <TextField
          fullWidth
          label="Address (Optional)"
          size="small"
          rows={2}
          name="address"
          value={formData.address}
          onChange={handleChange}
          sx={{ ...inputStyle, mt: 1 }}
        />
      </DialogContent>

      {/* ACTIONS */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        sx={{
          bgcolor: COLORS.activeBg,
          color: COLORS.texBlack,
          px: 5,
          fontWeight: 600,
          textTransform: "none",
          fontSize: { xs: 12, md: 18 },
          "&:hover": { bgcolor: COLORS.softBg },
        }}
      >
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </Dialog>
  );
}