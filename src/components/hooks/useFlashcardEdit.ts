import { useState, useCallback } from "react";

interface FlashcardEditState {
  front: string;
  back: string;
}

interface UseFlashcardEditReturn {
  isEditing: boolean;
  editedFront: string;
  editedBack: string;
  setEditedFront: (value: string) => void;
  setEditedBack: (value: string) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  canSave: (minFront: number, maxFront: number, minBack: number, maxBack: number) => boolean;
}

/**
 * Custom hook for managing flashcard edit mode
 * Handles edit state, validation, and edit lifecycle
 */
export function useFlashcardEdit(
  initialFront: string,
  initialBack: string
): UseFlashcardEditReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(initialFront);
  const [editedBack, setEditedBack] = useState(initialBack);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setEditedFront(initialFront);
    setEditedBack(initialBack);
  }, [initialFront, initialBack]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedFront(initialFront);
    setEditedBack(initialBack);
  }, [initialFront, initialBack]);

  const canSave = useCallback(
    (minFront: number, maxFront: number, minBack: number, maxBack: number) => {
      const frontLength = editedFront.trim().length;
      const backLength = editedBack.trim().length;
      const isFrontValid = frontLength >= minFront && frontLength <= maxFront;
      const isBackValid = backLength >= minBack && backLength <= maxBack;
      return isFrontValid && isBackValid;
    },
    [editedFront, editedBack]
  );

  return {
    isEditing,
    editedFront,
    editedBack,
    setEditedFront,
    setEditedBack,
    startEdit,
    cancelEdit,
    canSave,
  };
}
