import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getToken, setToken, clearToken } from "@/lib/auth";
import { api } from "@/lib/api";

type AuthCtx = {
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setTok] = useState<string | null>(getToken());

    useEffect(() => {
        setTok(getToken());
    }, []);

    const value = useMemo<AuthCtx>(() => ({ 
        token, 
        async login(email, password) {
            const { data } = await api.post("/login", { email, password });
            const t: string = data.token;
            setToken(t); setTok(t);
        }, 
        async register(email, username, password) {
            await api.post("/register", { email, username, password });
        }, 
        async logout() {
            clearToken(); setTok(null);
        },
      }), [token]);
        return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const v = useContext(Ctx);
    if (!v) throw new Error("useAuth must be used within an AuthProvider");
    return v;
}