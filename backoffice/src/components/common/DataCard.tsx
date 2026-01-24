import { Card } from "flowbite-react";
import { LucideIcon } from "lucide-react";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * DataCard displays a metric with optional icon and trend
 */
export function DataCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: DataCardProps) {
  return (
    <Card>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h5 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h5>
        {Icon && <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% desde el mes pasado
          </p>
        )}
      </div>
    </Card>
  );
}
