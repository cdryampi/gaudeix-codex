import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Login } from "@/features/auth/components/Login";
import { useAuthStore } from "@/features/auth/store";

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <Login
        onToggleRegister={() => navigate("/register")}
        onTogglePasswordReset={() => navigate("/password-reset")}
      />
      <div className="text-center mt-4">
        <Link to="/" className="text-sm text-gray-500 hover:text-puerto-rico-600">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
