import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// The Context object itself — just a container, not usable directly yet
const AuthContext = createContext();

// Wraps the whole app. Holds the actual "who's logged in" state, and makes
// it available to every component nested inside it
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Runs once, when the app first loads, to check whether a valid session
  // cookie already exists from a previous visit
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/me", {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        // A 401 here just means "not logged in" — not a real error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const logout = async () => {
    await axios.post(
      "http://localhost:8000/api/logout",
      {},
      { withCredentials: true },
    );
    setUser(null);
  };

  // Everything inside value={...} becomes available to any component that
  // calls useAuth() below, no matter how deeply nested it is
  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A small custom hook so components just call useAuth() instead of
// importing useContext and AuthContext separately every time
export function useAuth() {
  return useContext(AuthContext);
}