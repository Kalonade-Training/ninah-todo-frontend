import { JSX, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";

const TodosPage = lazy(() => import("@/pages/TodosPage"));
const LoginPage = lazy(() => import("@/pages/Login"));
const RegisterPage = lazy(() => import("@/pages/Register"));

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function Loader() {
  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-6">Loading…</Card>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route
          path="/todos"
          element={
            <RequireAuth>
              <TodosPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </Suspense>
  );
}
