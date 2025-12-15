import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function NavbarSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center justify-start gap-3 overflow-x-auto md:justify-center md:gap-7"
      aria-label="Cargando navegación"
    >
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className="h-7 w-24 shrink-0"
          rounded="md"
        />
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
