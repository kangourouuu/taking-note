import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserResponseDto, LoginRequestDto, RegisterRequestDto } from "@taking-note/shared";
import { authApi } from "../api/auth";

interface AuthContextValue {
  user: UserResponseDto | null;
  token: string | null;
  isLoading: boolean;
  login: (dto: LoginRequestDto) => Promise<void>;
  register: (dto: RegisterRequestDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getMe();
        setUser(profile);
      } catch {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (dto: LoginRequestDto): Promise<void> => {
    const result = await authApi.login(dto);
    localStorage.setItem("auth_token", result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (dto: RegisterRequestDto): Promise<void> => {
    const result = await authApi.register(dto);
    localStorage.setItem("auth_token", result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const logout = (): void => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
