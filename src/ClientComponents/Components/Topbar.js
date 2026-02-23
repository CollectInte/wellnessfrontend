import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { COLORS } from "../Themes";
import { useEffect, useState } from "react";
import axios from "axios";
import NotificationBell from '../../NotificationBell';

export default function Topbar() {
  const [companyName, setCompanyName] = useState("");
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);

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
    const fetchCompanyInfo = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL}/api/company-info`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setCompanyName(res.data.data.company_name);
        }
      } catch (error) {
        console.error("Failed to fetch company info", error);
      }
    };

    fetchCompanyInfo();
  }, []);
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.topbar_bg,
        width: { xs: "100%", md: "94%" },
        borderRadius: { xs: 0, md: 2 },
        mt: { xs: 0, md: 3 },
        ml: { xs: 0, md: 6 },
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar>
        <Typography
          sx={{
            fontSize: { xs: 15, md: 30 },
            color: theme.text_color,
            fontWeight: "bold",
          }}
        >
          {companyName}
        </Typography>

        <Box sx={{ marginLeft: "auto" }}>
          <NotificationBell />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
