import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import AuthFormWrapper from "./AuthFormWrapper";
import ValidatedField from "./ValidatedField";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth.validation";

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});

  const passwordId = useId();
  const confirmPasswordId = useId();

  const validateForm = (): boolean => {
    try {
      resetPasswordSchema.parse({ password, confirmPassword });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        const zodError = err as any;
        const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
        zodError.issues.forEach((issue: any) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof ResetPasswordFormData] = issue.message;
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
      // TODO: Implement Supabase password update
      // const { error } = await supabase.auth.updateUser({
      //   password: password,
      // });
      
      // Placeholder for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccessMessage("Password updated successfully! Redirecting to login...");
      
      // Reset form
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      
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
      title="Reset Password"
      subtitle="Enter your new password below"
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
          id={passwordId}
          type="password"
          label="New Password"
          placeholder="Create a new password (min. 6 characters)"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          disabled={isSubmitting}
          helperText="Password must be at least 6 characters long"
        />

        <ValidatedField
          id={confirmPasswordId}
          type="password"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Updating password...
            </span>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
