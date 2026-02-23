import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const ClientProfileModal = ({ open, onClose }) => {
  const clientId = localStorage.getItem("id");

  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchProfile();
  }, [open]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/client/get/${clientId}`,
        { withCredentials: true }
      );
      setProfile(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await axios.put(
        `${process.env.REACT_APP_URL}/api/client/update/self/${clientId}`,
        profile,
        { withCredentials: true }
      );

      setEdit(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const firstLetter = profile?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        My Profile
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && profile && (
          <>
            {/* ================= AVATAR HEADER ================= */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#1976d2",
                  width: 64,
                  height: 64,
                  fontSize: 28,
                  fontWeight: 600,
                }}
              >
                {firstLetter}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700}>{profile.name}</Typography>
                <Typography color="text.secondary">ID: {profile.id}</Typography>
                <Typography color="text.secondary">{profile.email}</Typography>
              </Box>

              <IconButton onClick={() => setEdit(!edit)}>
                {edit ? <CloseIcon /> : <EditIcon />}
              </IconButton>
            </Box>

            {/* ================= FIELDS ================= */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Name"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                disabled={!edit}
                fullWidth
              />

              <TextField
                label="Email"
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                disabled={!edit}
                fullWidth
              />

              <TextField
                label="Mobile"
                name="mobile"
                value={profile.mobile || ""}
                onChange={handleChange}
                disabled={!edit}
                fullWidth
              />

              <TextField
                label="Address"
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                disabled={!edit}
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="GST No"
                name="gst_no"
                value={profile.gst_no || ""}
                onChange={handleChange}
                disabled={!edit}
                fullWidth
              />

              <TextField
                label="PAN No"
                name="pan_no"
                value={profile.pan_no || ""}
                onChange={handleChange}
                disabled={!edit}
                fullWidth
              />

              {edit && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdate}
                  sx={{ mt: 2 }}
                >
                  Save Changes
                </Button>
              )}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientProfileModal;
