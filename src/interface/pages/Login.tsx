import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Logged in!");
      nav("/todos");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
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
            {submitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
