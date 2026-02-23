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
  const [theme, setTheme] = useState({});

  const fetchTheme = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/api/theme`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert("Failed to load theme", "error");
        setTheme({});
      } else {
        setTheme({ ...(json.data || {}) });
        console.log("Theme loaded:", json.data);
      }
    } catch (err) {
      console.error(err);
      alert("Network error while loading theme", "error");
      setTheme({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Get the base URL from your api instance
        const baseURL = process.env.REACT_APP_SITE_URL;
        const fullUrl = `${baseURL}/Images/${data.profile_photo}`;

        console.log("Final URL:", fullUrl); // Debug
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

      await api.put(
        "/api/staff/self/edit",
        {
          name: profile.name || "",
          email: profile.user_email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          branch: profile.branch || "",
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setEdit(false);
      await fetchProfile();
      onClose();
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", backgroundColor: theme.app_bg, color: theme.text_color }}>
        Trainer Profile
        <IconButton onClick={onClose} sx={{ color: theme.text_color }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3, backgroundColor: theme.app_bg, color: theme.text_color }}>
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
                  border: `1px solid ${theme.sidebar_bg}`,
                }}
              >
                {/* PHOTO */}
                <Avatar
                  src={previewUrl || undefined}
                  sx={{ width: 72, height: 72, bgcolor: theme.sidebar_bg, color: theme.text_color }}
                >
                  {!previewUrl && getAvatarLetters(profile.name)}
                </Avatar>

                <Box flex={1}>
                  <Typography fontWeight={600} sx={{ color: theme.text_color }}>{profile.name}</Typography>
                  <Typography variant="body2" sx={{ color: theme.text_color }}>{profile.user_email}</Typography>

                  <Chip
                    label={profile.status}
                    size="small"
                  />
                </Box>

                <IconButton onClick={() => setEdit(!edit)} sx={{ color: theme.text_color }}>
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
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    // 🔹 Label
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.primary_color,
                    },

                    // 🔹 Input text
                    "& .MuiOutlinedInput-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Disabled text color
                    "& .Mui-disabled": {
                      WebkitTextFillColor: theme.text_color,
                      color: theme.text_color,
                      opacity: 0.7,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // 🔹 Hover border
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: 2,
                    },

                    // 🔹 Background
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.app_bg,
                      transition: "all 0.2s ease",
                    },
                  }}
                />


                <TextField label="Email" variant="outlined" size="small" name="user_email" value={profile.user_email || ""} onChange={handleChange}
                  disabled={!edit} sx={{
                    // 🔹 Label
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.primary_color,
                    },

                    // 🔹 Input text
                    "& .MuiOutlinedInput-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Disabled text color
                    "& .Mui-disabled": {
                      WebkitTextFillColor: theme.text_color,
                      color: theme.text_color,
                      opacity: 0.7,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // 🔹 Hover border
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: 2,
                    },

                    // 🔹 Background
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.app_bg,
                      transition: "all 0.2s ease",
                    },
                  }} />

                <TextField
                  label="Mobile"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  variant="outlined"
                  size="small"
                  sx={{
                    // 🔹 Label
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.primary_color,
                    },

                    // 🔹 Input text
                    "& .MuiOutlinedInput-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Disabled text color
                    "& .Mui-disabled": {
                      WebkitTextFillColor: theme.text_color,
                      color: theme.text_color,
                      opacity: 0.7,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // 🔹 Hover border
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: 2,
                    },

                    // 🔹 Background
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.app_bg,
                      transition: "all 0.2s ease",
                    },
                  }}
                />

                <TextField
                  label="Branch"
                  name="branch"
                  value={profile.branch || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  variant="outlined"
                  size="small"
                  sx={{
                    // 🔹 Label
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.primary_color,
                    },

                    // 🔹 Input text
                    "& .MuiOutlinedInput-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Disabled text color
                    "& .Mui-disabled": {
                      WebkitTextFillColor: theme.text_color,
                      color: theme.text_color,
                      opacity: 0.7,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // 🔹 Hover border
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: 2,
                    },

                    // 🔹 Background
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.app_bg,
                      transition: "all 0.2s ease",
                    },
                  }}
                />

                {/* <TextField
                  label="Address"
                  name="address"
                  value={profile.address || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  multiline
                /> */}

                <TextField
                  label="Address"
                  name="address"
                  value={profile.address || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  multiline
                  rows={3}
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    // Label
                    "& .MuiInputLabel-root": { color: theme.text_color },
                    "& .MuiInputLabel-root.Mui-focused": { color: theme.primary_color },

                    // ✅ Enabled textarea text
                    "& .MuiOutlinedInput-root textarea": {
                      color: theme.text_color,
                      WebkitTextFillColor: theme.text_color,
                      caretColor: theme.text_color,
                    },

                    // ✅ Disabled textarea text (THIS is the missing part)
                    "& .MuiOutlinedInput-root.Mui-disabled textarea": {
                      color: theme.text_color,
                      WebkitTextFillColor: theme.text_color,
                      opacity: 0.7, // ✅ prevents faded disabled look
                    },

                    // Border
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: 2,
                    },

                    // Background (also for disabled)
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.app_bg,
                      transition: "all 0.2s ease",
                    },
                    "& .MuiOutlinedInput-root.Mui-disabled": {
                      backgroundColor: theme.app_bg,
                    },
                    "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                      opacity: 0.4,
                    },
                  }}
                />


                {/* <TextField
                  label="Qualification"
                  name="qualification"
                  value={profile.qualification || ""}
                  onChange={handleChange}
                  disabled={!edit}
                /> */}



                {/* {edit && (
                  <Button component="label" variant="outlined">
                    Upload Profile Photo
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e.target.files[0])}
                    />
                  </Button>
                )} */}
              </Box>

              {edit && (
                <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    onClick={handleUpdate}
                    sx={{ backgroundColor: theme.sidebar_bg, color: theme.text_color, textTransform: "none" }}
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