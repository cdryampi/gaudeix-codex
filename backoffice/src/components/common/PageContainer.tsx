import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageContainer - Consistent spacing for all pages
 * Removed from this component since DashboardLayout handles it
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
