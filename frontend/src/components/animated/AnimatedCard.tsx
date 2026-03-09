import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MOTION } from "@/lib/motion";

type AnimatedCardBaseProps = {
  reduceMotion?: boolean;
  className?: string;
  children?: ReactNode;
};

type AnimatedCardAsDiv = AnimatedCardBaseProps & { as?: "div" } & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">;
type AnimatedCardAsAnchor = AnimatedCardBaseProps & { as: "a" } & Omit<ComponentPropsWithoutRef<"a">, "className" | "children">;
type AnimatedCardAsButton = AnimatedCardBaseProps & { as: "button" } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type AnimatedCardProps = AnimatedCardAsDiv | AnimatedCardAsAnchor | AnimatedCardAsButton;

function cx(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function AnimatedCard(props: AnimatedCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const reduceMotion = props.reduceMotion ?? prefersReducedMotion;
  const Component = (props.as ?? "div") as "div" | "a" | "button";

  const { className, children } = props;
  const rest = { ...(props as AnimatedCardProps & Record<string, unknown>) };
  delete rest.className;
  delete rest.children;
  delete rest.reduceMotion;

  const hoverClasses = reduceMotion
    ? ""
    : "transform-gpu transition-[transform,box-shadow,border-color] hover:-translate-y-2 hover:scale-[1.015] hover:shadow-[0_28px_60px_rgba(19,49,80,0.18)] hover:border-white/50";

  const shineClasses = reduceMotion
    ? ""
    : "relative overflow-hidden before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:opacity-0 before:translate-x-0 before:transition-[transform,opacity] before:duration-500 hover:before:opacity-100 hover:before:translate-x-[220%]";

  return (
    <Component
      {...(rest as any)}
      data-animated-card
      className={cx(
        "will-change-transform will-change-opacity duration-300",
        hoverClasses,
        shineClasses,
        className,
      )}
      style={
        reduceMotion
          ? undefined
          : ({
              transitionDuration: `${MOTION.duration.hover}s`,
            } as CSSProperties)
      }
    >
      {children}
    </Component>
  );
}
