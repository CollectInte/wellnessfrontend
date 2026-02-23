import { useEffect } from "react";
import { useSocket } from "./context/SocketContext";
import { toast } from "react-toastify";

const NotificationListener = ({ userId }) => {
  const socket = useSocket();

  // 1️⃣ REGISTER USER TO SOCKET ROOM
  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit("register", {
      userId: userId,
      role: "client",
    });

    console.log("🔌 Socket registered for user:", userId);
  }, [socket, userId]);

  // 2️⃣ LISTEN FOR NOTIFICATIONS
  useEffect(() => {
    if (!socket) return;

    // Ask permission once
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const showNotification = (title, message) => {
      // 🔔 In-app toast
      toast.info(
        <>
          <strong>{title}</strong>
          <div>{message}</div>
        </>,
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          pauseOnHover: true,
        }
      );

      // 🔔 Chrome system notification (when tab hidden)
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.visibilityState === "hidden"
      ) {
        new Notification(title, {
          body: message,
          icon: "/icon.png", // optional
        });
      }
    };

    const handleNewNotification = (msg) => {
      showNotification(
        msg.title || "Notification",
        msg.message || ""
      );
    };

    const handleAppointmentCreated = (data) => {
      showNotification(
        "📅 Appointment Scheduled",
        `${data.message}\n${data.date} | ${data.from_time} - ${data.to_time}`
      );
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("appointment_created", handleAppointmentCreated);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("appointment_created", handleAppointmentCreated);
    };
  }, [socket]);

  return null;
};

export default NotificationListener;
