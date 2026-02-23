import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";

import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import NotificationBell from '../NotificationBell';

export default function Topbar({ sidebarOpen, company }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [themedata, setTheme] = useState({});
        const [loading, setLoading] = useState(false);
      
      
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

  const sidebarWidth = sidebarOpen ? 240 : 70;

  return (
    <AppBar
      position="sticky"

      elevation={0}
      sx={{
        backgroundColor: themedata.sidebar_bg ,
        width: { xs: "100%", md: "92%", lg: "94%"  },
        borderRadius: { xs: 0, md: 2 },
        mt: { xs: 0, md: 3 },
        ml: { xs: 0, md: 6 },
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >


      <Toolbar
        sx={{
          px: { xs: 2, sm: 3 },
          minHeight: 64,
          display: "flex",
        }}
      >
        {/* LEFT SECTION */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pl: { xs: 2 },
            color: themedata.text_color,
          }}
        >
      <Typography fontWeight={700} >
  {company?.gym_name || "Company"}
</Typography>
        </Box>

        {/* RIGHT SECTION (NOTIFICATIONS) */}
        <Box
          sx={{
            marginLeft: "auto", // ✅ pushes icons to the right
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
<NotificationBell />


        </Box>
      </Toolbar>
    </AppBar>
  );
}
