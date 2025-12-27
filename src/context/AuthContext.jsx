import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("auth_token") || ""
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;
      try {
        const me = await apiFetch("/api/auth/me", { method: "GET" }, token);
        setUser(me?.user || me);
      } catch (err) {
        console.error("Failed to load user", err);
        setToken("");
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const signOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("auth_token");
  };

  const value = useMemo(
    () => ({ token, setToken, user, setUser, loading, signOut }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
