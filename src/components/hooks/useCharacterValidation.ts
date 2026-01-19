/**
 * Custom hook for character validation with color coding
 * Used for text inputs with min/max length requirements
 */
export function useCharacterValidation(text: string, minLength: number, maxLength: number) {
  const length = text.trim().length;
  const isValid = length >= minLength && length <= maxLength;
  const isOverLimit = length > maxLength;
  const isUnderLimit = length > 0 && length < minLength;

  const getColor = (): string => {
    if (length === 0) return "text-muted-foreground";
    if (isOverLimit || isUnderLimit) return "text-destructive";
    return "text-green-600 dark:text-green-500";
  };

  const getMessage = (): string | null => {
    if (isOverLimit) {
      return `Exceeded by ${length - maxLength} characters`;
    }
    if (isUnderLimit) {
      return `Need ${minLength - length} more characters`;
    }
    return null;
  };

  return {
    length,
    isValid,
    color: getColor(),
    message: getMessage(),
    isOverLimit,
    isUnderLimit,
  };
}
