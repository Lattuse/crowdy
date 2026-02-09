import { createContext, useContext, useEffect, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id,name,email,role}
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const res = await http.get("/users/me");
      setUser(res.data);
      // важное: обновляем paused->active если пришло время
      await http.post("/subscriptions/refresh");
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function login(email, password) {
    const res = await http.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    await loadMe();
  }

  async function register(name, email, password) {
    const res = await http.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    await loadMe();
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
