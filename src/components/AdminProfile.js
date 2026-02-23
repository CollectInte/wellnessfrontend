import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  Avatar,
  Divider,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

export default function AdminProfile() {
  const adminId = localStorage.getItem("adminId");

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState(null);
  const [theme, setTheme] = useState({});
  
  
    const fetchTheme = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/api/theme`, {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
  
        if (!res.ok || !json?.data) {
          alert("Failed to load theme", "error");
          setTheme({});
        } else {
          setTheme({ ...(json.data || {}) });
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMINPROFILE_FETCH}/${adminId}`,
        { credentials: "include" }
      );
      const json = await res.json();
      console.log(json);
      setProfile(json.data);
      setForm(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setStatus(null);
    try {

      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      formData.append("gym_name", form.gym_name);

      if (form.company_logo instanceof File) {
        formData.append("company_logo", form.company_logo);
      }
      const res = await fetch(
        `${process.env.REACT_APP_URL}/api/admin/update/${adminId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Update failed");
      }

      setProfile({
        ...profile,
        ...form,
        company_logo: json.company_logo || profile.company_logo,
      });

      setEditMode(false);
      setStatus({ type: "success", text: "Profile updated successfully" });
      window.location.reload();
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    }
  };

if (loading) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <CircularProgress />
    </Box>
  );
}

if (!profile) {
  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error">still loading.</Alert>
    </Box>
  );
}


  const logoPreview =
  form.company_logo instanceof File
    ? URL.createObjectURL(form.company_logo)
    : profile?.company_logo
    ? `${process.env.REACT_APP_URL}/Images/${profile.company_logo}`
    : "";


  return (
    <Box sx={{ p: 4, mt: 1 }}>
      <Typography variant="h5" fontWeight={600} mb={3} sx={{color:theme.text_color}}>
         My Profile
      </Typography>

      {status && (
        <Alert severity={status.type} sx={{ mb: 2 }}>
          {status.text}
        </Alert>
      )}

      <Card
        sx={{
          maxWidth: 900,
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Avatar
                src={logoPreview}
                variant="rounded"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  border: "1px solid #ddd",
                  bgcolor: "#f5f5f5",
                }}
              />

              {editMode && (
                <Button
                  component="label"
                  size="small"
                  sx={{
                    ml: 2,
                    textTransform: "none",
                    borderColor: "#3f6f7a",
                    color: "#3f6f7a",
                  }}
                  variant="outlined"
                >
                  Change
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) =>
                      setForm({ ...form, company_logo: e.target.files[0] })
                    }
                  />
                </Button>
              )}
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              {/* <Typography variant="h6" fontWeight={600}>
                {profile.name}
              </Typography> */}
              <Typography color="text.secondary">
                {profile.gym_name}
              </Typography>
            </Box>

            {!editMode && (
              <Button variant="outlined" sx={{ textTransform: "none", borderColor: "#3f6f7a", color: "#3f6f7a" }} onClick={() => setEditMode(true)}>
                <EditIcon sx={{ fontSize: "16px" }} /> Edit
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form */}
          <Grid container spacing={3}>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Gym Name"
                name="gym_name"
                value={form.gym_name || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Status"
                value={profile.status}
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Created On"
                value={new Date(profile.created_at).toLocaleDateString("en-IN")}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>

          {/* Actions */}
          {editMode && (
            <Stack direction="row" spacing={2} mt={4}>
              <Button variant="contained" onClick={handleUpdate}>
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setForm(profile);
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
