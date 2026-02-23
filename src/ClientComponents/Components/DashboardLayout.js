import { Box, Toolbar } from "@mui/material";
import Sidebar, { drawerWidth, drawerWidthClosed } from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useState,useEffect } from "react";
import { COLORS } from "../Themes";
import { red } from "@mui/material/colors";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  return (
    <Box sx={{ display: "flex", bgcolor: theme.app_bg,minHeight: "100vh" }}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <Box
        sx={{
          flexGrow: 1, // 👈 Takes remaining width
          width: {
            xs: "100%",
            md: `calc(100% - ${sidebarOpen ? drawerWidth : drawerWidthClosed
              }px)`,
          },
          transition: "width 0.3s ease",
        }}
      >
        <Topbar sidebarOpen={sidebarOpen} />

        <Box
          component="main"
          sx={{
            ml: { md: 2, xs: 0 },
            p: { xs: 2, md: 3 },
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
