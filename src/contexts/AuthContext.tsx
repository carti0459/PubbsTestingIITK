"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserData {
  email: string;
  phoneNumber: string;
  username: string;
  id: string;
  uid: string;
  active: boolean | string;
  name: string;
  displayName?: string;
  lastLoginAt?: string;
  gender?: string;
  age?: number;
  address?: string;
  deviceId?: string;
  imei?: string;
  mobile?: string;
  operator?: string;
  area?: string;
  area_id?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  setUserData: (userData: UserData) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
    user?: User;
    errorCode?: string;
  }>;
  register: (
    username: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string
  ) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
    user?: User;
  }>;
  updatePhoneNumber: (
    userId: string,
    phoneNumber: string
  ) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
    user?: User;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  setUserData: () => {},
  login: async () => ({ success: false, error: "Not implemented" }),
  register: async () => ({ success: false, error: "Not implemented" }),
  updatePhoneNumber: async () => ({ success: false, error: "Not implemented" }),
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserDataFromStorage = () => {
    try {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        return parsedData;
      }
    } catch (_error) {
      localStorage.removeItem("userData");
      console.error(_error);
    }
    return null;
  };

  const saveUserDataToStorage = (data: UserData) => {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const dataString = JSON.stringify(data);
      localStorage.setItem("userData", dataString);
      setUserData(data);
      
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        try {
          localStorage.removeItem("tempRegistrationData");
          sessionStorage.clear();
          localStorage.setItem("userData", JSON.stringify(data));
          setUserData(data);
        } catch (_retryError) {
          console.error("Failed to save user data after clearing storage:", _retryError);
        }
      }
    }
  };

  useEffect(() => {
    loadUserDataFromStorage();
  }, []); // Only run once on mount

  useEffect(() => {
    const checkLocalStorage = () => {
      if (user && !userData) {
        loadUserDataFromStorage();
      }
    };

    const interval = setInterval(checkLocalStorage, 5000);

    return () => clearInterval(interval);
  }, [user, userData]); // Remove loadUserDataFromStorage from dependencies

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userData") {
        if (e.newValue) {
          try {
            const newUserData = JSON.parse(e.newValue);
            setUserData(newUserData);
          } catch (_error) {
            console.error(_error);
          }
        } else {
          setUserData(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        if (!userData) {
          loadUserDataFromStorage();
        }
      } else {
        const storedData = localStorage.getItem('userData');
        if (!storedData) {
          setUserData(null);
        } else {
          try {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData);
          } catch (_error) {
            setUserData(null);
            console.error(_error);
            localStorage.removeItem('userData');
          }
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - adding userData would cause infinite loops

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Login failed",
          message: result.message || "Login failed",
          errorCode: result.errorCode || "api/login-failed",
        };
      }

      if (result.user) {
        const userDataToStore = {
          email: result.user.email,
          phoneNumber: result.user.phoneNumber,
          username: result.user.username,
          id: result.user.id,
          uid: result.user.uid,
          active: result.user.active,
          name: result.user.name,
          displayName: result.user.displayName,
          lastLoginAt: result.user.lastLoginAt,
          gender: result.user.gender,
          age: result.user.age,
          address: result.user.address,
          deviceId: result.user.deviceId,
          imei: result.user.imei,
        };

        saveUserDataToStorage(userDataToStore);
      }

      return result;
    } catch (_error) {
      return {
        success: false,
        error: "Network error. Please check your connection." + _error,
        errorCode: "network-error",
      };
    }
  };

  const register = async (
    username: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      const requestData = {
        username,
        email,
        phoneNumber,
        password,
        confirmPassword,
      };

      localStorage.setItem(
        "tempRegistrationData",
        JSON.stringify({
          username,
          email,
          phoneNumber,
          password,
          confirmPassword,
          timestamp: new Date().toISOString(),
          rType: 0,
        })
      );

      sessionStorage.setItem(
        "registrationTempData",
        JSON.stringify({
          username,
          email,
          phoneNumber,
          password,
          confirmPassword,
          timestamp: new Date().toISOString(),
          rType: 0,
        })
      );

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Registration failed",
          message: result.message || "Registration failed",
        };
      }

      sessionStorage.setItem(
        "phoneVerificationData",
        JSON.stringify({
          phoneNumber: phoneNumber,
          timestamp: new Date().toISOString(),
          verified: false,
          action: "registration",
        })
      );

      return result;
    } catch (_error) {
      return {
        success: false,
        error: "Network error. Please check your connection." + _error,
        errorCode: "network-error",
      };
    }
  };

  const updatePhoneNumber = async (userId: string, phoneNumber: string) => {
    try {
      const requestData = {
        id: userId,
        phoneNumber,
      };

      const response = await fetch("/api/register", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Phone update failed",
          message: result.message || "Failed to update phone number",
        };
      }

      return result;
    } catch (_error) {
      return {
        success: false,
        error: "Network error. Please check your connection." + _error,
        errorCode: "network-error",
      };
    }
  };

  const logout = async () => {
    try {
      setUserData(null);
      localStorage.removeItem("userData");
      localStorage.removeItem("tempRegistrationData");
      localStorage.removeItem('selectedOperator');
      sessionStorage.clear();
      
      if (auth.currentUser) {
        await auth.signOut();
      }
    } catch (error) {
      setUserData(null);
      localStorage.removeItem("userData");
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    setUserData,
    login,
    register,
    updatePhoneNumber,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
