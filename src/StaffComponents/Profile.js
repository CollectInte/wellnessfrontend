import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Paper,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import api from "./services/api";
const SIDEBAR_WIDTH = 70;

export default function StaffProfilePage() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/getstaff/id"); // ✅ FIXED
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile fetch error", err.response?.data || err.message);
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
      await api.put(`/api/updatestaff/${profile.id}`, {
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile,
        address: profile.address,
      });
      setEdit(false);
      fetchProfile();
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const firstLetter = profile?.name?.charAt(0)?.toUpperCase() || "?";

  return (
  <Box
  sx={{
    minHeight: "100vh",
    width: {xs:'calc(100%-100px',md:'100%'},
    ml: {  sm: 0 }, // sidebar space
    pr: { xs: 1.5, sm: 4 }, // padding only on right
    pl: { xs: 1.5, sm: 4 },
    py: { xs: 1.5, sm: 4 },
    backgroundColor: "#f5f5f5",
    boxSizing: "border-box",
    overflowX: "hidden", // 🔥 prevents horizontal scroll
  }}
>


      <Paper
        sx={{
          maxWidth: 600,
          mx: "auto",
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={3}>
          My Profile
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && profile && (
          <>
            {/* HEADER */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                {firstLetter}
              </Avatar>

              <Box flex={1}>
                <Typography fontWeight={600}>{profile.name}</Typography>
                <Typography fontSize={13} color="text.secondary">
                  {profile.email}
                </Typography>
              </Box>

              <IconButton onClick={() => setEdit(!edit)}>
                {edit ? <CloseIcon /> : <EditIcon />}
              </IconButton>
            </Box>

            {/* FORM */}
            <Box display="flex" flexDirection="column" gap={2}>
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
                multiline
                rows={2}
                fullWidth
              />

              {edit && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdate}
                >
                  Save Changes
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
