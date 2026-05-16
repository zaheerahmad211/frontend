import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        `${API}/api/auth/login`,
        {
          email,
          password,
        }
      );
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await axios.post(
        `${API}/api/auth/register`,
        {
          name,
          email,
          password,
          role,
        }
      );
      // Wait for OTP verification before setting user
      return { success: true, tempToken: data.tempToken, otp: data.otp };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const verifyOtp = async (tempToken, otp) => {
    try {
      const { data } = await axios.post(
        `${API}/api/auth/verify-otp`,
        {
          tempToken,
          otp,
        }
      );
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "OTP verification failed",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
