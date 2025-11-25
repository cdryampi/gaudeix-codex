import { cn } from "@/lib/utils";
import { Button } from "./button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-2 py-1 shadow-sm backdrop-blur",
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full px-3 text-xs hover:bg-primary/10 dark:hover:bg-primary/20"
        onClick={() => onPageChange(page - 1)}
        disabled={prevDisabled}
      >
        Anterior
      </Button>
      <span className="text-xs text-muted-foreground">
        {page} / {totalPages || 1}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full px-3 text-xs hover:bg-primary/10 dark:hover:bg-primary/20"
        onClick={() => onPageChange(page + 1)}
        disabled={nextDisabled}
      >
        Siguiente
      </Button>
    </div>
  );
}
