import { memo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { UserStatus } from "@/types";

interface RightNavigationProps {
  userStatus: UserStatus;
  userEmail?: string | null;
  isMobile?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogoutClick?: () => void;
  themeToggle?: ReactNode;
}

export const RightNavigation = memo(function RightNavigation({
  userStatus,
  userEmail,
  isMobile = false,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  themeToggle,
}: RightNavigationProps) {
  const containerClasses = isMobile
    ? "flex flex-col gap-2 w-full mt-4 pt-4 border-t border-border"
    : "flex items-center gap-4";

  const buttonSize = isMobile ? "default" : "sm";

  if (userStatus === "loading") {
    return (
      <div className={containerClasses}>
        <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (userStatus === "authenticated") {
    return (
      <div className={containerClasses}>
        {isMobile && themeToggle && <div className="flex justify-center pb-2">{themeToggle}</div>}
        {!isMobile && themeToggle}
        {userEmail && <span className="text-sm text-muted-foreground">{userEmail}</span>}
        <Button
          variant="outline"
          size={buttonSize}
          onClick={onLogoutClick}
          className={isMobile ? "w-full justify-center" : ""}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {isMobile && themeToggle && <div className="flex justify-center pb-2">{themeToggle}</div>}
      {!isMobile && themeToggle}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={onLoginClick}
        className={isMobile ? "w-full justify-center" : ""}
      >
        Login
      </Button>
      <Button size={buttonSize} onClick={onRegisterClick} className={isMobile ? "w-full justify-center" : ""}>
        Sign Up
      </Button>
    </div>
  );
});
