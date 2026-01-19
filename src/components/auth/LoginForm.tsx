import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import AuthFormWrapper from "./AuthFormWrapper";
import ValidatedField from "./ValidatedField";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.validation";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const emailId = useId();
  const passwordId = useId();

  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        const zodError = err as { issues: { path: (string | number)[]; message: string }[] };
        const errors: Partial<Record<keyof LoginFormData, string>> = {};
        zodError.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof LoginFormData] = issue.message;
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call login API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        throw new Error(data.error || "Login failed");
      }

      // Login successful - redirect to generate page
      // Use onSuccess callback if provided, otherwise redirect
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/generate";
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Sign In"
      subtitle="Enter your credentials to access your account"
      errorMessage={error}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            Sign Up
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor={passwordId} className="text-sm font-medium text-foreground">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Forgot password?
            </a>
          </div>
          <ValidatedField
            id={passwordId}
            type="password"
            label=""
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
