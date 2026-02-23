import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import axios from "axios";
import { useSocket } from "./context/SocketContext";
import CallMadeIcon from "@mui/icons-material/CallMade";
import { useNavigate } from "react-router-dom";

export default function NotificationBell({ setAdminContent }) {
  const socket = useSocket();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const BASE_URL = process.env.REACT_APP_URL;

  // Fetch unread count
  const fetchCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/news/notifications/unread-count`, { withCredentials: true });
      setCount(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Fetch notifications list
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/news/notifications`, { withCredentials: true });
      setList(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      setList(prev => prev.filter(n => n.id !== notificationId));
      setCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Handle socket events
  useEffect(() => {
    fetchCount();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      fetchCount();
      fetchNotifications();
    };

    socket.on("new-notification", handleNewNotification);
    return () => socket.off("new-notification", handleNewNotification);
  }, [socket]);

  // Open / close popover
  const openPopup = (e) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };
  const closePopup = () => setAnchorEl(null);

  // Handle click on notification
 const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    closePopup();

    const title = notification.title.toLowerCase();

    if (role === "admin") {
      // Map notification titles to dashboard content
      if (title.includes("appointment")) setAdminContent("Appointments");
      else if(title.includes("attendance")) setAdminContent("Attendance");
      else if (title.includes("leave") || title.includes("request")) setAdminContent("Leave Requests");
      else if (title.includes("bill")) setAdminContent("Bills");
      else if (title.includes("review")) setAdminContent("Reviews");
      else setAdminContent("Home"); // fallback
      return;
    }

    // For non-admin users, keep your navigate logic
    if (title.includes("appointment")) {
      if (role === "staff") navigate("/staff/dashboard/appointments");
      else if (role === "receptionist") navigate("/receptionist/dashboard/appointments");
      else navigate("/client/appointment");
      return;
    }

   if (title.includes("bill")) {
    if (role === "client") {
      navigate("/client/bills");
    } 
    return;
  }


    if (title.includes("leave") || title.includes("request")) {
  if (role === "staff") {
    navigate("/staff/dashboard/attendance");
  } else if(role === "receptionist"){
    navigate("/receptionist/dashboard/attendance");
  }
  else {
    navigate("/client/dashboard"); // fallback
  }
  return;
}

  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={openPopup}>
        <Badge badgeContent={count} color="error">
          <NotificationsIcon sx={{ color: "white" }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePopup}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 350, position: "relative", p: 1, overflow: "visible" },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            closePopup();
          }}
          size="small"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 10,
            color: "grey.700",
            bgcolor: "transparent",
            "&:hover": { bgcolor: "error.main", color: "white" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <List sx={{ pt: 5, maxHeight: 400, overflowY: "auto" }}>
          {list.length === 0 && <Typography sx={{ p: 2 }}>No notifications</Typography>}

          {list.map((n) => (
            <ListItem
              key={n.id}
              alignItems="flex-start"
              onClick={() => handleNotificationClick(n)}
              sx={{
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    fontWeight={700}
                    sx={{
                      textDecoration: "underline",
                      "&:hover": { color: "primary.main" },
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {n.title}
                    <CallMadeIcon fontSize="small" color="primary" />
                  </Typography>
                </Box>
                <Typography variant="body2">{n.message}</Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
}
