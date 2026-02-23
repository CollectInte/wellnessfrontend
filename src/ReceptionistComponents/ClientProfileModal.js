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
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import axios from "axios";
import { COLORS } from "./Themes";
import ForgotPassword from "./ForgotPassword";

const GENDERS = ["male", "female", "other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ClientProfileModal = ({ open, onClose }) => {
  const clientId = localStorage.getItem("id");
  const isMobile = useMediaQuery("(max-width:600px)");

  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openReset, setOpenReset] = useState(false);

  useEffect(() => {
    if (open) fetchProfile();
  }, [open]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/client/self`,
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
        `${process.env.REACT_APP_URL}/api/client/update/${clientId}`,
        profile,
        { withCredentials: true }
      );
      setEdit(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const firstLetter = profile?.name?.charAt(0)?.toUpperCase() || "?";

  const getAvatarLetters = (name = "") => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            background: `linear-gradient(180deg, ${COLORS.softBg} 0%,${COLORS.activeBg} 49%)`,
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
          }}
        >
          My Profile
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        {/* CONTENT */}
        <DialogContent
          sx={{
            p: 3,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            profile && (
              <>
                {/* PROFILE HEADER */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    border: `solid 2px ${COLORS.primary}`,

                    // background: `linear-gradient(210deg, ${COLORS.activeBg} 0%,${COLORS.softBg} 100%)`,
                    // backdropFilter: "blur(6px)",
                    // boxShadow: "0 9px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 45, md: 64 },
                      height: { xs: 45, md: 64 },
                      fontSize: { xs: 16, md: 26 },
                      bgcolor: COLORS.primary,
                    }}
                  >
                    {getAvatarLetters(`${profile.name}`)}
                  </Avatar>

                  <Box flex={1}>
                    <Typography fontWeight={600}>{profile.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile.email}
                    </Typography>
                    <Chip
                      label={profile.status === 1 ? "Active" : "Inactive"}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <IconButton onClick={() => setEdit(!edit)}>
                    {edit ? (
                      <CloseRoundedIcon
                        sx={{
                          fontSize: { xs: "18px", md: "24px" },
                        }}
                      />
                    ) : (
                      <EditRoundedIcon
                        sx={{
                          fontSize: { xs: "18px", md: "24px" },
                        }}
                      />
                    )}
                  </IconButton>
                </Box>

                {/* FORM */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    // border:"solid red 1px",
                    py: 2,
                    "& .MuiTextField-root": {
                      backgroundColor: COLORS.activeBg,
                      borderRadius: 1.5,
                    },
                  }}
                >
                  {/* Row 1 */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <TextField
                      label="Name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!edit}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      value={profile.email}
                      disabled={!edit}
                      fullWidth
                    />
                  </Box>

                  {/* Row 2 */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <TextField
                      label="Mobile"
                      name="mobile"
                      value={profile.mobile}
                      onChange={handleChange}
                      disabled={!edit}
                      fullWidth
                    />
                    <TextField
                      label="Address"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      disabled={!edit}
                      fullWidth
                    />
                  </Box>

                  {/* Row 3 */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <TextField
                      label="Date of Birth"
                      type="date"
                      name="dob"
                      value={profile.dob?.slice(0, 10)}
                      onChange={handleChange}
                      disabled={!edit}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      select
                      label="Gender"
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      disabled={!edit}
                      fullWidth
                    >
                      {GENDERS.map((g) => (
                        <MenuItem key={g} value={g}>
                          {g}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Blood Group"
                      name="blood_group"
                      value={profile.blood_group}
                      onChange={handleChange}
                      disabled={!edit}
                      fullWidth
                    >
                      {BLOOD_GROUPS.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </>
            )
          )}
        </DialogContent>

        {/* ACTIONS – FIXED FOR MOBILE */}
        {edit && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              flexDirection: isMobile ? "column" : "row",
              position: isMobile ? "sticky" : "static",
              bottom: 0,
              bgcolor: COLORS.activeBg,
              borderTop: `1px solid ${COLORS.primary}`,
            }}
          >
            <Button
              variant="text"
              startIcon={<LockResetRoundedIcon />}
              onClick={() => setOpenReset(true)}
              sx={{ textTransform: "none", color: COLORS.primary }}
            >
              Reset Password
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleUpdate}
              disabled={loading}
              sx={{
                textTransform: "none",
                color: COLORS.texWhite,
                bgcolor: COLORS.primary,
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Dialog>

      <ForgotPassword
        open={openReset}
        onClose={() => setOpenReset(false)}
        userType="client"
      />
    </>
  );
};

export default ClientProfileModal;
