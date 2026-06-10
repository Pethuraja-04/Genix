import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useToast } from "./ToastContext";
import { useDispatch } from "react-redux";
import { api } from "../../services/api";
import { useProfileQuery } from "../../services/authApi";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { showToast } = useToast();
  const dispatch = useDispatch();

  // Retrieve token to skip profile query when not logged in
  const token = localStorage.getItem("token");

  // Fetch user profile to get userId for joining the user-specific room
  const { data: profileData } = useProfileQuery(undefined, {
    skip: !token,
  });

  const userId = profileData?.data?._id;

  useEffect(() => {
    if (!token || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initialize Socket.io connection to backend
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      // Join room designated for this user
      socket.emit("join", userId);
    });

    // Listen for incoming notifications from server
    socket.on("notification", (data) => {
      let title = "Notification";
      
      if (data.type === "connection_request") {
        title = "Connection Request";
      } else if (data.type === "connection_accepted") {
        title = "Connection Accepted";
      } else if (data.type === "task_assigned") {
        title = "Task Assigned";
      } else if (data.type === "task_updated") {
        title = "Task Updated";
      }

      // Display real-time toast notification
      showToast(title, data.message, "success");

      // Invalidate tags so RTK Query refetches new data instantly
      dispatch(api.util.invalidateTags(["Task", "User"]));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, userId, showToast, dispatch]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
