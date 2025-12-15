export function SkeletonBlock({
  className,
  rounded = "md",
}: {
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}) {
  const roundedClass =
    rounded === "none"
      ? "rounded-none"
      : rounded === "sm"
        ? "rounded-sm"
        : rounded === "md"
          ? "rounded-md"
          : rounded === "lg"
            ? "rounded-lg"
            : rounded === "xl"
              ? "rounded-xl"
              : rounded === "2xl"
                ? "rounded-2xl"
                : rounded === "3xl"
                  ? "rounded-3xl"
                  : "rounded-full";

  return (
    <div
      className={["animate-pulse bg-gray-200/80 ring-1 ring-gray-200", roundedClass, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
