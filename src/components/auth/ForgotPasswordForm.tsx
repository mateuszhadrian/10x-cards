import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import AuthFormWrapper from "./AuthFormWrapper";
import ValidatedField from "./ValidatedField";
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
    <AuthFormWrapper
      title="Forgot Password?"
      subtitle="Enter your email address and we'll send you a link to reset your password"
      successMessage={successMessage}
      errorMessage={error}
      footer={
        <>
          Remember your password?{" "}
          <a
            href="/login"
            className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            Sign in
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ValidatedField
          id={emailId}
          type="email"
          label="Email"
          placeholder="your.email@example.com"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          disabled={isSubmitting}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Sending reset link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
