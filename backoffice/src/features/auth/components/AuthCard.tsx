/**
 * Auth card component using Flowbite React
 */
import { Card } from "flowbite-react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const AuthCard = ({
  title,
  subtitle,
  footer,
  children,
}: AuthCardProps) => {
  return (
    <Card className="w-full shadow-xl">
      <div className="space-y-5">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className="space-y-4 sm:space-y-5">{children}</div>
        {footer && (
          <div className="pt-5 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
};
