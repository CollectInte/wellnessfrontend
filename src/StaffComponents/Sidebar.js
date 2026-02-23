import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useEffect } from "react";
import api from "./services/api";
import LockIcon from "@mui/icons-material/Lock";

import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";
import DoctorProfileModal from "./DoctorProfileModal";
import React, { useState } from "react";

export const drawerWidth = 240;
export const drawerWidthClosed = 70;


export default function Sidebar({ isOpen, onToggle, company }) {
  const staffRole = localStorage.getItem('role');
  const staffName = localStorage.getItem('userName');
  const [openProfile, setOpenProfile] = useState(false);
  const [staff, setStaff] = useState(null);
  const [modules, setModules] = useState([]);
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

  const modulesfetch = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/user-modules`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setModules(data.modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    modulesfetch();
  }, []);

  const protectedModules = {
    sessions: modules.some((m) => m.module_key === "sessions"),
    appointments: modules.some((m) => m.module_key === "appointments"),
    documents: modules.some((m) => m.module_key === "documents"),
    attendance: modules.some((m) => m.module_key === "attendance"),
    reviews: modules.some((m) => m.module_key === "reviews"),
    bills: modules.some((m) => m.module_key === "billing"),
  };

  // const menuItems = [
  //   { text: "Dashboard", icon: <DashboardIcon />, path: "/staff/dashboard" },
  //   { text: "Appointment", icon: <EventIcon />, path: "/staff/dashboard/appointments" },
  //   { text: "Attendance", icon: <AccessTimeIcon />, path: "/staff/dashboard/attendance" },
  //   { text: "Appointment Review", icon: <AssignmentIcon />, path: "/staff/dashboard/task-review" },
  //   { text: "Documents", icon: <DescriptionIcon />, path: "/staff/dashboard/documents" },
  //   {
  //     text: "Logout", icon: <LogoutIcon />, onClick: () => {
  //       handleLogout();
  //     }
  //   },
  // ];

    const handleLogout = async () => {
    try {
      await fetch(process.env.REACT_APP_LOGOUT, {
        method: "POST",
        credentials: "include", // 🔴 REQUIRED
      });
      localStorage.clear(); // optional (admin_id, role, etc.)
      window.location.replace("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/staff/dashboard" },

    { text: "Appointments", icon: <EventIcon />, path: "/staff/dashboard/appointments", gate: "appointments" },
    { text: "Sessions", icon: <EventIcon />, path: "/staff/dashboard/sessions", gate: "sessions" },

    { text: "Attendance", icon: <AccessTimeIcon />, path: "/staff/dashboard/attendance", gate: "attendance" },

    { text: "Client Reviews", icon: <AssignmentIcon />, path: "/staff/dashboard/task-review", gate: "reviews" },

    { text: "Documents", icon: <DescriptionIcon />, path: "/staff/dashboard/documents", gate: "documents" },

    {
      text: "Logout",
      icon: <LogoutIcon />,
      onClick: handleLogout,
    },
  ];




  // ✅ Fetch staff profile
  const fetchStaff = async () => {
    try {
      const res = await api.get("/api/staff/self");
      setStaff(res.data.data);
    } catch (err) {
      console.error("Failed to load staff profile", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ✅ Handle profile modal close + refresh
  const handleProfileClose = () => {
    setOpenProfile(false);
    fetchStaff(); // Refresh profile data after modal closes
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        flexShrink: 0,
        width: isOpen ? drawerWidth : drawerWidthClosed,
        "& .MuiDrawer-paper": {
          width: isOpen ? drawerWidth : drawerWidthClosed,
          boxSizing: "border-box",
          background: theme.app_bg,
          transition: "width 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          border: "none"
        },
      }}
    >
      {/* Mobile-only divider */}
      {/* <Box
        sx={{
          display: { xs: "block", md: "none" },
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.4)",
          mx: 2,
          my: 1.5,
        }}
      /> */}

      {/* Mobile-only Toggle Button */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "end",
          p: 1.75,
          bgcolor: theme.sidebar_bg,
        }}
      >
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: theme.text_color,
            border: `1px solid ${theme.sidebar_bg}`,
            "&:hover": {
              backgroundColor: theme.sidebar_bg,
            },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Logo Section */}
      <Box
        sx={{
          backgroundColor: theme.app_bg,
          p: isOpen ? 4 : 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isOpen ? "flex-start" : "center",
          gap: 1.5,
          transition: "all 0.3s",
          cursor: { xs: "pointer", md: "default" }, // clickable only on mobile
        }}
        onClick={() => {
          // Toggle sidebar only on mobile (xs view)
          if (window.innerWidth < 900) {
            onToggle();
          }
        }}
      >
        {/* Company Logo */}
        <Box
          sx={{
            width: isOpen ? 60 : 48,
            height: isOpen ? 60 : 48,
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          <Box
            component="img"
            src={
              company?.company_logo
                ? `${process.env.REACT_APP_SITE_URL}/Images/${company.company_logo}`
                : "/RVlogo.png"
            }
            alt="Company Logo"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/RVlogo.png";
            }}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              border: "0px solid black",
            }}
          />
        </Box>

        {/* Company Name */}
        {/* {isOpen && (
    <Typography ...>{company?.company_name || "HEALTHCARE"}</Typography>
  )} */}
      </Box>

      {/* Blue Section */}
      <Box
        sx={{
          flex: 1,
          background: theme.sidebar_bg,
          borderTopRightRadius: { md: 80, xs: 40 },
          pt: { xs: 2, sm: 0 },
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.primary_color,
            borderRadius: "4px",
          },
        }}
      >
        {/* Profile */}
        <Box
          sx={{
            py: 2,
            px: isOpen ? 3 : 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={
              staff?.profile_photo
                ? `${process.env.REACT_APP_SITE_URL}/Images/${staff.profile_photo}`
                : ""
            }
            onClick={() => setOpenProfile(true)}
            sx={{
              width: isOpen ? 70 : 40,
              height: isOpen ? 70 : 40,
              mx: "auto",
              mb: 1,
              cursor: "pointer",
              transition: "all 0.3s",
              border: `3px solid ${theme.primary_color}`,
              backgroundColor: theme.primary_color, // Fallback color if image fails to load
              color:theme.text_color,
            }}
          >
            {!staff?.profile_photo && staff?.name?.charAt(0)}
          </Avatar>


          <Typography fontWeight="bold" sx={{ color: theme.text_color, fontSize: { md: "14px", xs: "10px" }, textAlign: "center" }}>
            {staff?.name || staffName}
          </Typography>

        </Box>

        {/* White divider after Profile */}
        <Box
          sx={{
            height: "1px",
            backgroundColor: theme.app_bg,
            mx: 2,
            my: 1.5,
          }}
        />

        {/* Menu */}
        {/* <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isLogout = item.text === "Logout";

            return (
              <ListItem
                key={item.text}
                component={isLogout ? "div" : NavLink}
                to={!isLogout ? item.path : undefined}
                end={!isLogout && item.path === "/doctor/dashboard"}
                onClick={isLogout ? item.onClick : undefined}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  color: "white",
                  textDecoration: "none",
                  justifyContent: isOpen ? "flex-start" : "center",
                  px: isOpen ? 2 : 1,
                  py: 0.5,
                  minHeight: "44px",
                  transition: "all 0.2s",

                  "&.active": !isLogout
                    ? {
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }
                    : {},

                  "&.active .MuiListItemIcon-root": {
                    color: "white",
                    transform: "scale(1.1)",
                  },

                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isOpen ? 36 : "auto",
                    justifyContent: "center",
                    color: "white",
                    transition: "all 0.2s",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {isOpen && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiTypography-root": {
                        fontSize: "14px",
                        fontWeight: 500,
                      },
                    }}
                  />
                )}
              </ListItem>
            );
          })}
        </List> */}
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isLogout = item.text === "Logout";
            const isGated = Boolean(item.gate);
            const isEnabled = !isGated ? true : Boolean(protectedModules[item.gate]);

            return (
              <ListItem
                key={item.text}
                component={isLogout || !isEnabled ? "div" : NavLink}
                to={!isLogout && isEnabled ? item.path : undefined}
                onClick={(e) => {
                  if (isLogout) return item.onClick?.();
                  if (!isEnabled) {
                    e.preventDefault();
                    return;
                  }
                }}
                sx={{
                  cursor: isLogout || isEnabled ? "pointer" : "not-allowed",
                  borderRadius: 2,
                  color: "white",
                  textDecoration: "none",
                  justifyContent: isOpen ? "flex-start" : "center",
                  px: isOpen ? 2 : 1,
                  py: 0.5,
                  minHeight: "44px",
                  transition: "all 0.2s",
                  opacity: isEnabled ? 1 : 0.55,

                  "&.active": !isLogout
                    ? {
                      backgroundColor: theme.primary_color,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }
                    : {},

                  "&.active .MuiListItemIcon-root": {
                    color: theme.text_color,
                    transform: "scale(1.1)",
                  },

                  "&:hover": {
                    backgroundColor: isEnabled ? theme.primary_color : "transparent",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isOpen ? 36 : "auto",
                    justifyContent: "center",
                    color: theme.text_color,
                    transition: "all 0.2s",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {isOpen && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiTypography-root": {
                        fontSize: "14px",
                        fontWeight: 500,
                        color: theme.text_color,
                      },
                    }}
                  />
                )}

                {/* 🔒 lock indicator */}
                {isOpen && !isLogout && isGated && !isEnabled && (
                  <LockIcon sx={{ fontSize: 18, ml: 1, opacity: 0.9 }} />
                )}
              </ListItem>
            );
          })}
        </List>


        <DoctorProfileModal
          open={openProfile}
          onClose={handleProfileClose}
        />
      </Box>
    </Drawer>
  );
}