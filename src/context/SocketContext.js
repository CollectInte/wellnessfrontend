import { createContext, useContext, useEffect } from "react";
import socket from "../socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ userId, children }) => {

  useEffect(() => {
    console.log("🟡 SocketProvider mounted");
    console.log("🟡 userId received:", userId);

    if (!userId) {
      console.log("❌ No userId, socket will NOT connect");
      return;
    }

    if (!socket.connected) {
      socket.connect();
      console.log("🟢 socket.connect() called");
    }

    socket.emit("register", userId);
    console.log("📡 register event emitted with userId:", userId);

    return () => {
      console.log("🔴 socket disconnected");
      socket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
