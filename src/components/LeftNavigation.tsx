import { memo } from "react";
import type { NavLink } from "@/types";

interface LeftNavigationProps {
  links: NavLink[];
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export const LeftNavigation = memo(function LeftNavigation({ links, isMobile = false, onLinkClick }: LeftNavigationProps) {
  const baseClasses = isMobile
    ? "flex flex-col gap-2 w-full"
    : "flex items-center gap-8";

  return (
    <nav className={baseClasses} aria-label="Main navigation">
      {links.map((link) => {
        const isDisabled = link.isDisabled;
        const isActive = link.isActive;

        return (
          <a
            key={link.path}
            href={isDisabled ? undefined : link.path}
            onClick={onLinkClick}
            className={`
              text-[var(--text-body-size)] font-medium tracking-[var(--text-body-tracking)]
              transition-all duration-[var(--duration-fast)]
              ${isMobile ? "px-4 py-3 rounded-lg" : ""}
              ${
                isActive
                  ? "text-primary scale-105"
                  : isDisabled
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:text-primary hover:scale-105"
              }
              ${isActive && isMobile ? "bg-accent/10" : ""}
              hover:translate-y-[-1px] active:translate-y-0
            `}
            aria-current={isActive ? "page" : undefined}
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : 0}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
});
