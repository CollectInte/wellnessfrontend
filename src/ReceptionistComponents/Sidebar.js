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
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useEffect } from "react";
import api from "./services/api";

import DashboardIcon from "@mui/icons-material/Dashboard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LogoutIcon from "@mui/icons-material/Logout";

import DoctorProfileModal from "./ReceptionistProfileModal";
import React, { useState } from "react";

export const drawerWidth = 240;
export const drawerWidthClosed = 70;




export default function Sidebar({ isOpen, onToggle, company }) {
  const staffRole = localStorage.getItem('role');
  const staffName = localStorage.getItem('userName');
  const [openProfile, setOpenProfile] = useState(false);
  const [staff, setStaff] = useState(null);



  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/receptionist/dashboard" },
    { text: "Appointment", icon: <EventAvailableIcon />, path: "/receptionist/dashboard/appointments" },
    { text: "Doctor Schedule", icon: <CalendarMonthIcon />, path: "/receptionist/dashboard/schedule" },
    { text: "Attendance", icon: <AccessTimeIcon />, path: "/receptionist/dashboard/attendance" },
    { text: "Documents", icon: <DescriptionIcon />, path: "/receptionist/dashboard/documents" },
    { text: "Bills", icon: <ReceiptLongIcon />, path: "/receptionist/dashboard/bills" },
    { text: "Clients", icon: <PeopleAltIcon />, path: "/receptionist/dashboard/clients" },
    { text: "Add Slot", icon: <AddCircleOutlineIcon />, path: "/receptionist/dashboard/add-slots" },
    {
      text: "Logout", icon: <LogoutIcon />, onClick: () => {
        handleLogout();
      }
    },
  ];

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
          background: "#F8F6F6",
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
      {/* <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "end",
          pb: 1,
        }}
      >
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: "black",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.15)",
            },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box> */}

      <Box
        sx={{
          backgroundColor: "#F8F6F6",
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
            width: isOpen ? 60 : 48, // increased size
            height: isOpen ? 60 : 48, // increased size
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
            }}
          />
        </Box>

        {/* Company Name */}
        {/* {isOpen && (
    <Typography
      sx={{
        color: "#0d7377",
        fontWeight: "bold",
        fontSize: "14px",
        lineHeight: 1.2,
        letterSpacing: "0.5px",
        textAlign: "center",
      }}
    >
      {company?.company_name || "HEALTHCARE"}
    </Typography>
  )} */}
      </Box>

      {/* Blue Section */}
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(180deg, #2C5E6A 0%,#80BECD 100%)",
          borderTopRightRadius: { md: 80, xs: 40 },
          pt: { xs: 2, sm: 0 },
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.3)",
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
                ? `${process.env.REACT_APP_SITE_URL}/Images/${staff.profile_photo}?t=${Date.now()}`
                : undefined
            }
            onClick={() => setOpenProfile(true)}
            sx={{
              width: isOpen ? 70 : 40,
              height: isOpen ? 70 : 40,
              mx: "auto",
              mb: 1,
              cursor: "pointer",
              border: "3px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {!staff?.profile_photo && staffName?.charAt(0)}
          </Avatar>




          <Typography fontWeight="bold" sx={{ color: "white", fontSize: { md: "14px", xs: "10px" } }}>
            {staffName}
          </Typography>

        </Box>

        {/* White divider after Profile */}
        <Box
          sx={{
            height: "1px",
            backgroundColor: "rgba(236, 239, 240, 0.4)",
            mx: 2,
            my: 1.5,
          }}
        />

        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isLogout = item.text === "Logout";

            return (
              <ListItem
                key={item.text}
                component={isLogout ? "div" : NavLink}
                to={!isLogout ? item.path : undefined}
                end={!isLogout && item.path === "/receptionist/dashboard"}
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
        </List>

        <DoctorProfileModal
          open={openProfile}
          onClose={handleProfileClose}
        />
      </Box>
    </Drawer>
  );
}