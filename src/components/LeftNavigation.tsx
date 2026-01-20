import { memo } from "react";
import type { NavLink } from "@/types";

interface LeftNavigationProps {
  links: NavLink[];
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export const LeftNavigation = memo(function LeftNavigation({
  links,
  isMobile = false,
  onLinkClick,
}: LeftNavigationProps) {
  const baseClasses = isMobile ? "flex flex-col gap-2 w-full" : "flex items-center gap-8";

  return (
    <nav className={baseClasses} aria-label="Main navigation">
      {links.map((link) => {
        const isDisabled = link.isDisabled;
        const isActive = link.isActive;

        if (isDisabled) {
          return (
            <button
              key={link.path}
              type="button"
              disabled
              onClick={onLinkClick}
              className={`
                text-[var(--text-body-size)] font-medium tracking-[var(--text-body-tracking)]
                transition-all duration-[var(--duration-fast)]
                ${isMobile ? "px-4 py-3 rounded-lg" : ""}
                text-muted-foreground cursor-not-allowed opacity-50
                ${isActive && isMobile ? "bg-accent/10" : ""}
              `}
              aria-disabled={true}
            >
              {link.label}
            </button>
          );
        }

        return (
          <a
            key={link.path}
            href={link.path}
            onClick={onLinkClick}
            className={`
              text-[var(--text-body-size)] font-medium tracking-[var(--text-body-tracking)]
              transition-all duration-[var(--duration-fast)]
              ${isMobile ? "px-4 py-3 rounded-lg" : ""}
              ${isActive ? "text-primary scale-105" : "text-foreground hover:text-primary hover:scale-105"}
              ${isActive && isMobile ? "bg-accent/10" : ""}
              hover:translate-y-[-1px] active:translate-y-0
            `}
            aria-current={isActive ? "page" : undefined}
            tabIndex={0}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
});
