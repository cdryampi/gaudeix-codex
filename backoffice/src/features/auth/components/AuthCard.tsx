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
    <Card className="w-full max-w-[640px] mx-auto rounded-xl border border-border bg-card text-foreground shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl p-0">
      <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 xl:px-12 xl:py-12 space-y-5">
        <CardHeader className="space-y-2 text-center p-0">
          <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-sm sm:text-base text-muted-foreground font-normal">
              {subtitle}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0 space-y-4 sm:space-y-5">
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="p-0 pt-5 text-sm text-muted-foreground text-center border-t border-border">
            {footer}
          </CardFooter>
        )}
      </div>
    </Card>
  );
};
