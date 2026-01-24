
import { useEffect, useRef } from "react";
import { Ticket } from "lucide-react";
import gsap from "gsap";

interface TicketCTAProps {
    scrolled: boolean;
    className?: string;
}

export function TicketCTA({ scrolled, className = "" }: TicketCTAProps) {
    const buttonRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Continuous subtle pulse to attention
            gsap.to(buttonRef.current, {
                scale: 1.05,
                boxShadow: "0 0 20px rgba(249, 115, 22, 0.6)", // Orange glow
                repeat: -1,
                yoyo: true,
                duration: 1.5,
                ease: "sine.inOut",
            });

            // Rotate icon slightly occasionally
            const icon = buttonRef.current?.querySelector(".ticket-icon");
            if (icon) {
                gsap.to(icon, {
                    rotation: 15,
                    repeat: -1,
                    yoyo: true,
                    duration: 0.5,
                    repeatDelay: 2,
                    ease: "power1.inOut"
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <a
            ref={buttonRef}
            href="https://entradas.codetickets.com/entradas/aj-cabrera-de-mar"
            target="_blank"
            rel="noopener noreferrer"
            className={`
        relative flex items-center gap-2 px-5 py-2 rounded-full font-black uppercase tracking-widest text-xs
        transition-all duration-300 shadow-xl overflow-hidden group
        ${className}
        ${scrolled
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    : "bg-gradient-to-r from-orange-500/90 to-red-600/90 text-white backdrop-blur-md border border-white/20"}
      `}
        >
            {/* Shine effect overlay */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[30deg] group-hover:animate-shine" />

            <Ticket className="ticket-icon w-4 h-4 fill-current/20" />
            <span>Entradas</span>
        </a>
    );
}
