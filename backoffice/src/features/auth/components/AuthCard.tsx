import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card className="w-full shadow-lg shadow-neutral-200/50 dark:shadow-neutral-900/50 border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200/60 dark:hover:shadow-neutral-900/60">
      <CardHeader className="space-y-3 text-center pb-6 px-4 sm:px-6 pt-6 sm:pt-8">
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-neutral-900 dark:text-neutral-50">
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light">
            {subtitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="flex flex-col gap-3 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-4 text-sm text-neutral-600 dark:text-neutral-400 text-center border-t border-neutral-100 dark:border-neutral-800/50">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};
