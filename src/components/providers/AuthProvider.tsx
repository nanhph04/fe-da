"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "guest" | "viewer" | "creator" | "admin";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  balanceAC: number;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "guest",
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("guest");
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session từ LocalStorage khi mount
  useEffect(() => {
    const savedSession = localStorage.getItem("mock_auth_session");
    if (savedSession) {
      try {
        const parsed: UserProfile = JSON.parse(savedSession);
        setUser(parsed);
        setRole(parsed.role);
      } catch (e) {
        console.error("Failed to parse mock session", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newRole: UserRole) => {
    // Generate mock mock profile based on role
    const mockUser: UserProfile = {
      id: "MOCK-" + Math.random().toString(36).substring(7),
      name: newRole === "admin" ? "System Admin" : "Velvet User",
      role: newRole,
      balanceAC: newRole === "creator" ? 15000 : 200,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDikpv5v0hj6EMVs8YVv1uB55c3gzdDU6S0z3PLdAvH5sAgG3PBb-0hQIoDQk7iEc3z7X-bkYTnbFi1IOIsYmePNofnXWxQGabvXF9n49k1Rlt26Ncsn4ef1xJv5POM0x0bolheMH0gojxK8VxTFSRVUnK_tphvu3qiHDzK2AebMixAkjpSP3QoD3dDHH52gwg4yh0tcFw0ZTPNZOO3ZP2XSoVzj08NNmQc87iUcZPk457GH6cVhGZXFTlEb6PAvV7N0Zc2WLM4Uo0f"
    };
    
    setUser(mockUser);
    setRole(newRole);
    localStorage.setItem("mock_auth_session", JSON.stringify(mockUser));
    
    // Auto-redirect logic
    if (newRole === "admin") {
      router.push("/admin");
    } else if (newRole === "creator") {
      router.push("/studio");
    } else {
      router.push("/library");
    }
  };

  const logout = () => {
    setUser(null);
    setRole("guest");
    localStorage.removeItem("mock_auth_session");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
