import { useState, useEffect, useCallback } from "react";

interface AlertState {
  success: string | null;
  error: string | null;
}

/**
 * Custom hook for managing success/error alerts with auto-dismiss
 */
export function useAlertManager(autoDismissDelay = 5000) {
  const [alerts, setAlerts] = useState<AlertState>({
    success: null,
    error: null,
  });

  const showSuccess = useCallback((message: string) => {
    setAlerts({ success: message, error: null });
  }, []);

  const showError = useCallback((message: string) => {
    setAlerts({ success: null, error: message });
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts({ success: null, error: null });
  }, []);

  // Auto-dismiss success messages
  useEffect(() => {
    if (alerts.success) {
      const timer = setTimeout(() => {
        setAlerts((prev) => ({ ...prev, success: null }));
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [alerts.success, autoDismissDelay]);

  return {
    successMessage: alerts.success,
    errorMessage: alerts.error,
    showSuccess,
    showError,
    clearAlerts,
  };
}
