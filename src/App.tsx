import React, { ReactElement, ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Todos from "@/pages/Todos";
import { useAuth } from "@/context/AuthContext";

function PrivateRoute({ children }: { children: ReactElement | ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={<PrivateRoute><Todos /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}


const Test: React.FC = () => <div>Hello JSX</div>;