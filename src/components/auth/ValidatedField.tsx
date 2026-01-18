import { Input } from "@/components/ui/input";

interface ValidatedFieldProps {
  id: string;
  type: "email" | "password" | "text";
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  helperText?: string;
}

/**
 * Reusable validated input field for auth forms
 */
export default function ValidatedField({
  id,
  type,
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  helperText,
}: ValidatedFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        className="bg-background text-foreground border-border"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
