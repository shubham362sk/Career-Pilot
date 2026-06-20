import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiUrl } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  college?: string;
  degree?: string;
  year?: string;
  skills?: string;
  linkedin?: string;
  github?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch(apiUrl("/api/auth/profile"), {
            headers: { "x-auth-token": token },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser({
              id: userData._id,
              name: userData.name,
              email: userData.email,
              college: userData.college,
              degree: userData.degree,
              year: userData.year,
              skills: userData.skills,
              linkedin: userData.linkedin,
              github: userData.github,
              bio: userData.bio,
            });
          } else {
            logout();
          }
        } catch (err) {
          console.error("Failed to fetch user:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
