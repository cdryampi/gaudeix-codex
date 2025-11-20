import { Outlet } from "react-router-dom";

/**
 * AuthLayout provides a simple centered layout for authentication pages
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
