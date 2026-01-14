/**
 * PasswordReset Page
 *
 * Dedicated password reset page with URL routing.
 */

import { PasswordReset } from "@/features/auth/components/PasswordReset";

export default function PasswordResetPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PasswordReset onToggleLogin={() => window.location.href = "/login"} />
    </div>
  );
}
