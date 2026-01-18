import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface GenerateAlertsProps {
  successMessage: string | null;
  errorMessage: string | null;
  onClearSuccess?: () => void;
}

/**
 * Alert component for success/error messages in generation flow
 */
export default function GenerateAlerts({
  successMessage,
  errorMessage,
  onClearSuccess,
}: GenerateAlertsProps) {
  if (!successMessage && !errorMessage) return null;

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" data-testid="generate-error-alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert
          className="border-green-600 bg-green-50 dark:bg-green-950/20 relative"
          data-testid="generate-success-alert"
        >
          <AlertTitle className="text-green-800 dark:text-green-400">Success</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 pr-8">
            {successMessage}
          </AlertDescription>
          {onClearSuccess && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSuccess}
              className="absolute right-2 top-2 h-6 w-6 p-0 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
            >
              ✕
            </Button>
          )}
        </Alert>
      )}
    </>
  );
}
