import React, { createContext, useContext, useMemo, useState } from "react";
import { AuthRepositoryHttp } from "@/infrastructure/repos/AuthRepositoryHttp";
import { loginUseCase } from "@/application/auth/login";
import { registerUseCase } from "@/application/auth/register";
import { getToken, setToken, clearToken } from "@/infrastructure/storage/tokenStorage";

type AuthCtx = {
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const authRepo = new AuthRepositoryHttp();

export function AuthProvider({ children }: {children: React.ReactNode }) {
    const [token, setTok] = useState<string | null>(getToken());
    const login = loginUseCase(authRepo);
    const register = registerUseCase(authRepo);

    const value = useMemo<AuthCtx>(() => ({
        token, 
        async login(email, password) {
            const t = await login(email, password);
            setToken(t); setTok(t);
        }, 
        async register(email, username, password) {
            await register(email, username, password); 
        }, 
        logout() {
            clearToken(); setTok(null);
        }, 
    }), [token]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => {
    const v = useContext(Ctx);
    if (!v) throw new Error("useAuth must be used within AuthProvider");
    return v;
};