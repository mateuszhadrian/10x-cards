import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CharacterCounter from "@/components/CharacterCounter";
import { useCharacterValidation } from "@/components/hooks/useCharacterValidation";

const MIN_FRONT_LENGTH = 1;
const MAX_FRONT_LENGTH = 200;
const MIN_BACK_LENGTH = 1;
const MAX_BACK_LENGTH = 500;

interface FlashcardEditFormProps {
  index: number;
  front: string;
  back: string;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  canSave: boolean;
}

/**
 * Edit mode component for editing flashcard content
 */
export default function FlashcardEditForm({
  index,
  front,
  back,
  onFrontChange,
  onBackChange,
  onSave,
  onCancel,
  canSave,
}: FlashcardEditFormProps) {
  const frontValidation = useCharacterValidation(front, MIN_FRONT_LENGTH, MAX_FRONT_LENGTH);
  const backValidation = useCharacterValidation(back, MIN_BACK_LENGTH, MAX_BACK_LENGTH);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`front-${index}`} className="text-sm font-medium text-foreground">
          Front (Question)
        </label>
        <Input
          id={`front-${index}`}
          data-testid={`flashcard-edit-front-${index}`}
          value={front}
          onChange={(e) => onFrontChange(e.target.value)}
          placeholder="Enter front text..."
          maxLength={MAX_FRONT_LENGTH}
          aria-invalid={!frontValidation.isValid}
          className="bg-background text-foreground border-border"
        />
        <CharacterCounter current={frontValidation.length} max={MAX_FRONT_LENGTH} color={frontValidation.color} />
      </div>

      <div className="space-y-2">
        <label htmlFor={`back-${index}`} className="text-sm font-medium text-foreground">
          Back (Answer)
        </label>
        <Textarea
          id={`back-${index}`}
          data-testid={`flashcard-edit-back-${index}`}
          value={back}
          onChange={(e) => onBackChange(e.target.value)}
          placeholder="Enter back text..."
          maxLength={MAX_BACK_LENGTH}
          className="min-h-[100px] bg-background text-foreground border-border"
          aria-invalid={!backValidation.isValid}
        />
        <CharacterCounter current={backValidation.length} max={MAX_BACK_LENGTH} color={backValidation.color} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel} data-testid={`flashcard-cancel-edit-button-${index}`}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={!canSave} data-testid={`flashcard-save-edit-button-${index}`}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
