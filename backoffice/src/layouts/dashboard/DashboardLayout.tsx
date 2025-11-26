import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * DashboardLayout - Supabase-style dark layout:
 * - Fixed 220px sidebar with dark bg-sidebar
 * - Minimalist header with 56px height
 * - Main content area with proper dark background
 * - Consistent spacing and overflow handling
 */
export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content with scroll */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
