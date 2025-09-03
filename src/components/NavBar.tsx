import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
    const { token, logout } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();

    return (
        <div className="w-full border-b bd-background sticky top-0 z-10">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="font-semibold">Todo Maker</Link>
                <div className="space-x-2">
                    <Link to="/todos">
                        <Button variant={loc.pathname.startsWith("/todos") ? "default" : "outline"}>My Todos</Button>
                    </Link>
                    {!token ? (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Register</Button>
                            </Link>
                        </>
                    ) : (
                        <Button variant="destructive" onClick={() => { logout(); nav("/login"); }}>
                            Logout
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}