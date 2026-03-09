import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const MOTION = {
  ease: {
    entrance: "power3.out",
    smooth: "power2.out",
    emphasis: "expo.out",
  },
  duration: {
    heroIn: 1,
    reveal: 0.75,
    stagger: 0.12,
    hover: 0.4,
  },
  scrollStart: {
    section: "top 82%",
    grid: "top 80%",
    parallax: "top bottom",
  },
} as const;

let pluginsRegistered = false;
export const shouldSkipMotion =
  typeof window !== "undefined" && /jsdom/i.test(window.navigator?.userAgent ?? "");

export function ensureGsapPlugins() {
  if (typeof window === "undefined" || pluginsRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  pluginsRegistered = true;
}
