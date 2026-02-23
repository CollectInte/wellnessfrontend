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
  Chip,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import api from "./services/api";

const DoctorProfileModal = ({ open, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (open) fetchProfile();
  }, [open]);

  // 🔹 fetch logged-in user's profile (works for admin/staff)

const fetchProfile = async () => {
  try {
    setLoading(true);

    const res = await api.get("/api/staff/self");
    const data = res.data.data ?? res.data;

    setProfile(data);

    if (data.profile_photo) {
      const fullUrl = `${api.defaults.baseURL.replace("/api", "")}/Images/${data.profile_photo}`;
      setPreviewUrl(fullUrl);
    } else {
      setPreviewUrl(null);
    }

  } catch (err) {
    console.error("Profile fetch error:", err);
  } finally {
    setLoading(false);
  }
};



  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 🔹 file select → local preview
  const handlePhotoSelect = (file) => {
    setPhotoFile(file);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 🔹 update profile + photo
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("name", profile.name || "");
      fd.append("email", profile.email || "");
      fd.append("mobile", profile.mobile || "");
      fd.append("address", profile.address || "");
      fd.append("branch", profile.branch || "");
      fd.append("qualification", profile.qualification || "");

      if (photoFile) {
        fd.append("profile_photo", photoFile);
      }

      // ⚠️ DO NOT SET CONTENT-TYPE (axios does it)
      await api.put("/api/staff/self/edit", fd);

      setEdit(false);
      setPhotoFile(null);

      await fetchProfile();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarLetters = (name = "") => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        Recepionist Profile
        <IconButton onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          profile && (
            <>
              {/* HEADER */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #0d7377",
                
                }}
              >
                {/* PHOTO */}
                <Avatar
                  src={previewUrl || undefined}
                  sx={{ width: 72, height: 72, bgcolor: "#0d7377" }}
                >
                  {!previewUrl && getAvatarLetters(profile.name)}
                </Avatar>

                <Box flex={1}>
                  <Typography fontWeight={600}>{profile.name}</Typography>
                  <Typography variant="body2">{profile.email}</Typography>

                  <Chip
                    label={profile.status === 1 ? "Active" : "Inactive"}
                    size="small"
                  />
                </Box>

                <IconButton onClick={() => setEdit(!edit)}>
                  {edit ? <CloseRoundedIcon /> : <EditRoundedIcon />}
                </IconButton>
              </Box>

              {/* FORM */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Name"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  disabled={!edit}
                />

                <TextField label="Email" name="email" value={profile.email || ""}   onChange={handleChange}
                  disabled={!edit} />

                <TextField
                  label="Mobile"
                  name="mobile"
                  value={profile.mobile || ""}
                  onChange={handleChange}
                  disabled={!edit}
                />

                <TextField
                  label="Address"
                  name="address"
                  value={profile.address || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  multiline
                />

                <TextField
                  label="Qualification"
                  name="qualification"
                  value={profile.qualification || ""}
                  onChange={handleChange}
                  disabled={!edit}
                />

                <TextField
                  label="Branch"
                  name="branch"
                  value={profile.branch || ""}
                  onChange={handleChange}
                  disabled={!edit}
                />

                {edit && (
                  <Button component="label" variant="outlined">
                    Upload Profile Photo
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e.target.files[0])}
                    />
                  </Button>
                )}
              </Box>

              {edit && (
                <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    onClick={handleUpdate}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DoctorProfileModal;