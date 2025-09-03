import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log("[Register] submit", { username, email });
      await register(username, email, password);
      toast.success("Account created! Please log in.");
      nav("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Register failed";
      console.error("Register error:", err);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Register</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
