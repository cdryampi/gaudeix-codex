import { ThemeToggle } from "./ThemeToggle";

/**
 * Shared Header component for backoffice
 * Used in landing page and auth pages
 */
export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container flex h-20 items-center justify-between px-6">
                {/* Logo section */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 shadow-lg shadow-primary/20">
                        <span className="text-xl font-black text-white tracking-tighter">GC</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-foreground leading-none">Gaudeix Codex</span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Backoffice</span>
                    </div>
                </div>

                {/* Theme toggle */}
                <ThemeToggle />
            </div>
        </header>
    );
}
