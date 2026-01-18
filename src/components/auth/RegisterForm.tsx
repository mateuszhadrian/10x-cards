import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import AuthFormWrapper from "./AuthFormWrapper";
import ValidatedField from "./ValidatedField";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth.validation";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const validateForm = (): boolean => {
    try {
      registerSchema.parse({ email, password, confirmPassword });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        const zodError = err as any;
        const errors: Partial<Record<keyof RegisterFormData, string>> = {};
        zodError.issues.forEach((issue: any) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof RegisterFormData] = issue.message;
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
      // Call registration API endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        const errorMessage = data.error || data.message || "Registration failed";
        setError(errorMessage);
        return;
      }

      // Show success message
      setSuccessMessage(
        "Registration successful! You can now sign in with your credentials."
      );

      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login page after a delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Create Account"
      subtitle="Enter your details to create a new account"
      successMessage={successMessage}
      errorMessage={error}
      footer={
        <>
          Already have an account?{" "}
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

        <ValidatedField
          id={passwordId}
          type="password"
          label="Password"
          placeholder="Create a password (min. 6 characters)"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          disabled={isSubmitting}
          helperText="Password must be at least 6 characters long"
        />

        <ValidatedField
          id={confirmPasswordId}
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
