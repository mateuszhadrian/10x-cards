import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth.validation";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({});

  const emailId = useId();

  const validateForm = (): boolean => {
    try {
      forgotPasswordSchema.parse({ email });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        const zodError = err as any;
        const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};
        zodError.issues.forEach((issue: any) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof ForgotPasswordFormData] = issue.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement Supabase password reset
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${window.location.origin}/reset-password`,
      // });
      
      // Placeholder for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccessMessage(
        "If an account exists with this email, you will receive a password reset link shortly. Please check your inbox."
      );
      
      // Reset form
      setEmail("");
      
      // Call onSuccess callback
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot Password?</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <Alert className="border-green-600 bg-green-50 dark:bg-green-950/20">
              <AlertTitle className="text-green-800 dark:text-green-400">Email Sent</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor={emailId} className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id={emailId}
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.email}
                className="bg-background text-foreground border-border"
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending reset link...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Sign in
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
