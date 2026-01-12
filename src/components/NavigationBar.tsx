import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "./hooks/useWindowSize";
import { LeftNavigation } from "./LeftNavigation";
import { RightNavigation } from "./RightNavigation";
import { HamburgerMenu } from "./HamburgerMenu";
import { ThemeToggleInline } from "./ThemeToggleInline";
import type { NavigationProps, NavLink } from "@/types";

export function NavigationBar({ currentPath, userStatus }: NavigationProps) {
  const { isMobile } = useWindowSize();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define navigation links with useMemo to prevent recreation on every render
  const navLinks: NavLink[] = useMemo(() => [
    {
      label: "Home",
      path: "/",
      isActive: currentPath === "/",
      isDisabled: false,
    },
    {
      label: "Generate",
      path: "/generate",
      isActive: currentPath === "/generate",
      isDisabled: false,
    },
    {
      label: "Flashcards",
      path: "/flashcards",
      isActive: currentPath === "/flashcards",
      isDisabled: false,
    },
    {
      label: "Learning Sessions",
      path: "/sessions",
      isActive: currentPath === "/sessions",
      isDisabled: true, // Not yet implemented
    },
    {
      label: "Profile",
      path: "/profile",
      isActive: currentPath === "/profile",
      isDisabled: true, // Not yet implemented
    },
  ], [currentPath]);

  // Mock handlers for auth actions (will be implemented with Supabase later)
  const handleLogin = useCallback(() => {
    toast.info("Login feature coming soon", {
      description: "Supabase Auth integration in progress",
    });
  }, []);

  const handleRegister = useCallback(() => {
    toast.info("Registration feature coming soon", {
      description: "Supabase Auth integration in progress",
    });
  }, []);

  const handleLogout = useCallback(() => {
    toast.success("Logged out successfully", {
      description: "See you later!",
    });
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border transition-all duration-300 ${
        isMenuOpen 
          ? "bg-background" 
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }`}
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 flex items-center gap-8">
        {/* Desktop Navigation */}
        <div className="flex items-center">
          {!isMobile && <LeftNavigation links={navLinks} />}
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Desktop Auth Buttons */}
          {!isMobile && (
            <RightNavigation
              userStatus={userStatus}
              onLoginClick={handleLogin}
              onRegisterClick={handleRegister}
              onLogoutClick={handleLogout}
              themeToggle={<ThemeToggleInline />}
            />
          )}

          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <HamburgerMenu
              links={navLinks}
              userStatus={userStatus}
              onLoginClick={handleLogin}
              onRegisterClick={handleRegister}
              onLogoutClick={handleLogout}
              themeToggle={<ThemeToggleInline />}
              onMenuToggle={setIsMenuOpen}
            />
          )}
        </div>
      </div>
    </header>
  );
}
