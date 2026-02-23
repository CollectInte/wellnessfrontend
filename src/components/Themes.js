import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";

const API_BASE = process.env.REACT_APP_URL || ""; // e.g. https://api.caredesk360.com

const DEFAULT_THEME = {
  app_bg: "#ffffff",
  sidebar_bg: "#107881",
  topbar_bg: "#107881",
  text_color: "#ffffff",
  primary_color: "#107881",
};

const THEME_KEYS = ["app_bg", "sidebar_bg", "topbar_bg", "text_color", "primary_color"];
function isValidColor(v) {
  if (!v || typeof v !== "string") return false;
  const val = v.trim();
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(val)) return true;
  if (/^(black|white|red|green|blue|gray|grey|orange|yellow|purple|pink)$/i.test(val))
    return true;
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(val)) return true;
  if (
    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0(\.\d+)?|1(\.0+)?)\s*\)$/.test(
      val
    )
  )
    return true;
  return false;
}

const ColorRow = ({ label, keyName, value, onChange }) => {
  const showError = value.length > 0 && !isValidColor(value);

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid item xs={12} md={4}>
        <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Example: #ff0000 or black
        </Typography>
      </Grid>

      <Grid item xs={12} md={5}>
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => onChange(keyName, e.target.value)}
          error={showError}
          helperText={showError ? "Invalid color format" : " "}
          placeholder="#107881"
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <Box
          sx={{
            height: 38,
            borderRadius: 1.5,
            border: "1px solid rgba(0,0,0,0.12)",
            backgroundColor: isValidColor(value) ? value : "transparent",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const hasInvalid = useMemo(() => {
    return THEME_KEYS.some((k) => !isValidColor(String(theme?.[k] ?? "")));
  }, [theme]);

  const handleChange = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const showSnack = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const fetchTheme = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/theme`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        showSnack(json.message || "Failed to load theme", "error");
        setTheme({});
      } else {
        setTheme({ ...(json.data || {}) });
      }
    } catch (err) {
      console.error(err);
      showSnack("Network error while loading theme", "error");
      setTheme({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (hasInvalid) {
      showSnack("Please fix invalid color fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = THEME_KEYS.reduce((acc, k) => {
          acc[k] = theme?.[k] ?? "";
          return acc;
        }, {});
      const res = await fetch(`${API_BASE}/api/theme`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        showSnack(json.message || "Theme update failed", "error");
        return;
      }

      showSnack("Theme updated successfully ✅", "success");
    } catch (err) {
      console.error(err);
      showSnack("Network error while saving theme", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/theme`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        showSnack(json.message || "Theme reset failed", "error");
        return;
      }

      fetchTheme();
      showSnack("Theme reset to default ✅", "success");
    } catch (err) {
      console.error(err);
      showSnack("Network error while resetting theme", "error");
    } finally {
      setSaving(false);
    }
  };

  // Live preview block
  const previewStyles = {
    appBg: isValidColor(theme.app_bg) ? theme.app_bg : {},
    sidebarBg: isValidColor(theme.sidebar_bg) ? theme.sidebar_bg : {},
    topbarBg: isValidColor(theme.topbar_bg) ? theme.topbar_bg : {},
    textColor: isValidColor(theme.text_color) ? theme.text_color : {},
    primary: isValidColor(theme.primary_color) ? theme.primary_color : {},
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Theme Settings
      </Typography>

      <Grid container spacing={2}>
        {/* Settings Form */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Customize Colors (Admin Only)
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                These colors will apply to your staff & clients only.
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {loading ? (
                <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <ColorRow
                    label="App Background"
                    keyName="app_bg"
                    value={theme.app_bg}
                    onChange={handleChange}
                  />
                  <ColorRow
                    label="Sidebar Background"
                    keyName="sidebar_bg"
                    value={theme.sidebar_bg}
                    onChange={handleChange}
                  />
                  <ColorRow
                    label="Topbar Background"
                    keyName="topbar_bg"
                    value={theme.topbar_bg}
                    onChange={handleChange}
                  />
                  <ColorRow
                    label="Text Color"
                    keyName="text_color"
                    value={theme.text_color}
                    onChange={handleChange}
                  />
                  <ColorRow
                    label="Primary Color (Buttons)"
                    keyName="primary_color"
                    value={theme.primary_color}
                    onChange={handleChange}
                  />

                  {hasInvalid && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Some fields have invalid color values. Use hex like <b>#ff0000</b> or
                      named colors like <b>black</b>.
                    </Alert>
                  )}

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving || loading}
                      sx={{ minWidth: 160 }}
                    >
                      {saving ? "Saving..." : "Save Theme"}
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleReset}
                      disabled={saving || loading}
                      sx={{ minWidth: 160 }}
                    >
                      Reset to Default
                    </Button>

                    <Button
                      variant="text"
                      onClick={fetchTheme}
                      disabled={saving}
                    >
                      Reload
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: previewStyles.topbarBg,
                color: previewStyles.textColor,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <Typography sx={{ fontWeight: 800 }}>Top Bar Preview</Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                This is how the header looks
              </Typography>
            </Box>

            <Box sx={{ display: "flex", height: 260 }}>
              <Box
                sx={{
                  width: 140,
                  backgroundColor: previewStyles.sidebarBg,
                  color: previewStyles.textColor,
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Sidebar</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Menu
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  backgroundColor: previewStyles.appBg,
                  color: previewStyles.textColor,
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 700, mb: 1 }}>App Area</Typography>

                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: previewStyles.primary,
                    "&:hover": { backgroundColor: previewStyles.primary },
                  }}
                >
                  Primary Button
                </Button>
              </Box>
            </Box>
          </Card>

          <Alert severity="info" sx={{ mt: 2 }}>
            After saving, apply this theme globally by loading <b>/api/theme</b> once after
            login and setting your layout colors from it.
          </Alert>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
