import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const { login } = useAuth();
    const nav = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success("Logged in successfully!");
            nav("/todos");
        } catch (e: any) {
            toast.error(e?.response?.data?.error || "Login failed");
        }
    }

    return (
        <div className="max-w-md mx-auto p-4">
            <Card className="p-6 space-y-4">
                <h1 className="text-xl font-semibold">Login</h1>
                {err && <p className="text-red-600 text-sm">{err}</p>}
                <form className="space-y-3" onSubmit={onSubmit}>
                    <Input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                    <Input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </Card>
        </div>
    );
}
