interface CharacterCounterProps {
  current: number;
  max: number;
  color: string;
  message?: string | null;
}

/**
 * Reusable character counter component with validation feedback
 */
export default function CharacterCounter({
  current,
  max,
  color,
  message,
}: CharacterCounterProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={color}>
        {current.toLocaleString()} / {max.toLocaleString()} characters
      </span>
      {message && <span className="text-destructive">{message}</span>}
    </div>
  );
}
