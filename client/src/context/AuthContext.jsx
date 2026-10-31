import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

// Custom hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (form) => {
    const res = await api.post("/auth/login", form);

    const { token, user } = res.data.data || res.data;

    localStorage.setItem("token", token);
    setUser(user);
  };

  // Register
  const register = async (form) => {
    const res = await api.post("/auth/register", form);

    const { token, user } = res.data.data || res.data;

    if (token) {
      localStorage.setItem("token", token);
      setUser(user);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};