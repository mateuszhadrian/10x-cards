import { useState, memo, useCallback, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LeftNavigation } from "./LeftNavigation";
import { RightNavigation } from "./RightNavigation";
import type { NavLink, UserStatus } from "@/types";

interface HamburgerMenuProps {
  links: NavLink[];
  userStatus: UserStatus;
  userEmail?: string | null;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogoutClick?: () => void;
  themeToggle?: ReactNode;
  onMenuToggle?: (isOpen: boolean) => void;
}

export const HamburgerMenu = memo(function HamburgerMenu({
  links,
  userStatus,
  userEmail,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  themeToggle,
  onMenuToggle,
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      onMenuToggle?.(newState);
      return newState;
    });
  }, [onMenuToggle]);

  const handleLinkClick = useCallback(() => {
    setIsOpen(false);
    onMenuToggle?.(false);
  }, [onMenuToggle]);

  // Reset menu state on unmount
  useEffect(() => {
    return () => {
      onMenuToggle?.(false);
    };
  }, [onMenuToggle]);

  return (
    <div>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="h-10 w-10 transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 rotate-90"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </Button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="absolute top-full left-0 right-0 max-h-[calc(100vh-4rem)] bg-background border-b border-border shadow-lg z-50 overflow-y-auto"
        >
          <div className="container mx-auto px-4 pt-4 pb-16 flex flex-col gap-2">
            {/* Only show navigation links for authenticated users */}
            {userStatus === "authenticated" && <LeftNavigation links={links} isMobile onLinkClick={handleLinkClick} />}
            <RightNavigation
              userStatus={userStatus}
              userEmail={userEmail}
              isMobile
              themeToggle={themeToggle}
              onLoginClick={() => {
                handleLinkClick();
                onLoginClick?.();
              }}
              onRegisterClick={() => {
                handleLinkClick();
                onRegisterClick?.();
              }}
              onLogoutClick={() => {
                handleLinkClick();
                onLogoutClick?.();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});
