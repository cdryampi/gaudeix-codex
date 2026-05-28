/**
 * PasswordReset Page
 *
 * Dedicated password reset page with URL routing.
 */

import { PasswordReset } from "@/features/auth/components/PasswordReset";

export default function PasswordResetPage() {
  const loginPath = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/login`;

  return (
    <div className="min-h-screen bg-gray-50">
      <PasswordReset onToggleLogin={() => (window.location.href = loginPath)} />
    </div>
  );
}
