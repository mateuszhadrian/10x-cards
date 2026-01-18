import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthFormWrapperProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  successMessage?: string | null;
  errorMessage?: string | null;
  footer?: ReactNode;
}

/**
 * Reusable wrapper for authentication forms
 * Provides consistent layout and alert handling
 */
export default function AuthFormWrapper({
  title,
  subtitle,
  children,
  successMessage,
  errorMessage,
  footer,
}: AuthFormWrapperProps) {
  return (
    <Card className="w-full max-w-md mx-auto bg-card shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <Alert className="border-green-600 bg-green-50 dark:bg-green-950/20">
              <AlertTitle className="text-green-800 dark:text-green-400">Success</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Form Content */}
          {children}

          {/* Footer */}
          {footer && (
            <div className="text-center text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
