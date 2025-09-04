// 📁 context/AuthContext.js
import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ✅ Establish socket connection
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id }
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // ✅ Auto-attach token to every axios request
  useEffect(() => {
    axios.interceptors.request.use((config) => {
      if (token) config.headers.token = token;
      return config;
    });
  }, [token]);

  // ✅ Login or Register Handler
  const login = async (authType, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${authType}`, credentials);

      if (data.success) {
        toast.success(`${authType} successful`);

        if (authType === "login") {
          setAuthUser(data.user);
          localStorage.setItem("token", data.token);
          setToken(data.token);
          axios.defaults.headers.common["token"] = data.token;
          connectSocket(data.user);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || `${authType} failed`);
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    if (socket) socket.disconnect();
    setSocket(null);
    toast.success("Logged out");
  };

  // ✅ Update Profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user); // ✅ FIXED: changed from data.userData → data.user
        toast.success("Profile updated");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Validate token and fetch user on page load
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      localStorage.removeItem("token");
      setAuthUser(null);
      setToken(null);
      toast.error("Session expired");
    }
  };

  useEffect(() => {
    if (token) checkAuth();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        axios,
        token,
        authUser,
        socket,
        onlineUsers,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
