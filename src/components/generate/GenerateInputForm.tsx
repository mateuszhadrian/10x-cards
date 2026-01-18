import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CharacterCounter from "@/components/CharacterCounter";
import { useCharacterValidation } from "@/components/hooks/useCharacterValidation";
import { MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from "@/components/hooks/useGenerateFlashcards";

interface GenerateInputFormProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isValidLength: boolean;
}

/**
 * Input form component for flashcard generation
 */
export default function GenerateInputForm({
  inputText,
  onInputChange,
  onGenerate,
  isGenerating,
  isValidLength,
}: GenerateInputFormProps) {
  const validation = useCharacterValidation(inputText, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="input-text" className="text-sm font-medium text-foreground">
          Source Text
        </label>
        <Textarea
          id="input-text"
          data-testid="generate-input-text"
          placeholder="Paste your text here... (minimum 1,000 characters)"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isGenerating}
          className="h-[300px] resize-none overflow-y-auto bg-background text-foreground border-border"
        />
        <CharacterCounter
          current={validation.length}
          max={MAX_TEXT_LENGTH}
          color={validation.color}
          message={validation.message}
        />
      </div>

      <div className="scroll-mt-4">
        <Button
          data-testid="generate-flashcards-button"
          onClick={onGenerate}
          disabled={!isValidLength || isGenerating}
          className="w-full sm:w-auto"
        >
          {isGenerating ? "Generating..." : "Generate Flashcards"}
        </Button>
      </div>
    </div>
  );
}
