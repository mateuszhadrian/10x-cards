```markdown
# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd

Widok Generowania Fiszek umożliwia użytkownikowi wprowadzenie tekstu źródłowego (1000–10000 znaków) oraz zainicjowanie procesu automatycznego tworzenia propozycji fiszek przy użyciu AI. Następnie prezentuje listę wygenerowanych propozycji fiszek w trybie recenzji (możliwość akceptacji, edycji przed zatwierdzeniem i odrzucenia).

## 2. Routing widoku

Widok będzie dostępny pod ścieżką:

- `/generate`

## 3. Struktura komponentów

Proponowana hierarchia:

1. **GenerateLayout** (kontener i układ główny)
2. **InputTextForm** (formularz do wprowadzenia tekstu)
3. **GenerateButton** (przycisk wywołujący generowanie)
4. **LoadingComponent** (wyświetlany w trakcie generowania)
5. **ErrorNotification** (wyświetlany, gdy wystąpi błąd)
6. **FlashcardsReviewList** (lista propozycji fiszek)
   - **FlashcardsReviewListItem** (pojedyncza fiszka z funkcjonalnością checkboxa i edycji)
7. **FlashcardsReviewListBulkSaveButton** (pozwala zapisać wszystkie bądź tylko te zaakceptowane)

Przykładowa struktura w kodzie (wielopoziomowo):

- `GenerateLayout`
  - `InputTextForm`
    - `GenerateButton`
  - `LoadingComponent` (warunkowo)
  - `ErrorNotification` (warunkowo)
  - `FlashcardsReviewList` (warunkowo)
    - Wiele `FlashcardsReviewListItem`
  - `FlashcardsReviewListBulkSaveButton` (warunkowo)

## 4. Szczegóły komponentów

### GenerateLayout

- Opis: Główny kontener widoku. Zawiera logikę i layout.
- Elementy:
  - Sekcja formularza (InputTextForm + GenerateButton)
  - Sekcja wyświetlania listy (FlashcardsReviewList + FlashcardsReviewListItem w pętli)
  - Sekcja zapisu (FlashcardsReviewListBulkSaveButton)
  - LoadingComponent oraz ErrorNotification wbudowane w layout przez warunkowe renderowanie
- Obsługiwane interakcje:
  - Przejście do widoku/sekcji z listą fiszek po zakończeniu generowania (o ile API zwróci propozycje)
- Walidacja: Brak w samym layout
- Propsy: Może przyjmować children i ewentualny stan globalny, zależnie od implementacji

### InputTextForm

- Opis: Formularz służący do wprowadzenia tekstu źródłowego
- Główne elementy: Pole tekstowe + ewentualne wiadomości walidacyjne (np. podpowiedź, że potrzeba min. 1000 znaków)
- Obsługiwane interakcje:
  - OnChange: Aktualizacja stanu tekstu
  - Walidacja: musi sprawdzić, czy input ma 1000–10000 znaków (inaczej button generujący jest nieaktywny)
- Typy:
  - `TriggerGenerationCommandDTO`
- Propsy:
  - `textValue: string` (wartość inputa)
  - `onTextChange(value: string)` (aktualizuje stan rodzica w czasie pisania)

### GenerateButton

- Opis: Przycisk uruchamiający generowanie fiszek
- Główne elementy: Prostokątny przycisk, disabled, gdy:
  1. Wprowadzony tekst jest niepoprawnej długości
  2. Trwa obecnie generowanie fiszek (żeby uniknąć wielokrotnych wywołań)
- Obsługiwane interakcje:
  - OnClick: wywołanie `POST /api/generations` z tekstem
- Propsy:
  - `disabled: boolean` (steruje stanem przycisku)
  - `onGenerate()` (wywołuje logikę generowania w komponencie rodzicu)

### LoadingComponent

- Opis: Komponent wizualizujący stan ładowania/generowania
- Główne elementy: Skeleton z shadcn/ui
- Obsługiwane interakcje: Brak interakcji użytkownika, jedynie informacja wizualna
- Propsy: Może nie wymagać propsów, poza ewentualnym rozmiarem/wyglądem

### ErrorNotification

- Opis: Komponent wyświetlający błąd, np. w ramce, w obszarze widoku
- Główne elementy: Tekst błędu
- Obsługiwane interakcje: Może zawierać przycisk z zamknięciem powiadomienia lub ponowieniem operacji
- Propsy:
  - `message: string` – treść błędu
  - `onClose?: () => void` (opcjonalnie, jeśli chcemy pozwolić użytkownikowi zamknąć powiadomienie)

### FlashcardsReviewList

- Opis: Lista wygenerowanych fiszek wraz z możliwością zaakceptowania (checkbox) i edycji
- Główne elementy: Kontener w mapowaniu wielu `FlashcardsReviewListItem`
- Obsługiwane interakcje:
  - Kliknięcie checkboxa → Oznacza fiszkę jako zaakceptowaną / niezaakceptowaną
  - Przekazywanie zdarzeń edycji do rodzica
- Typy:
  - `FlashcardRow[]` lub model lokalny
- Propsy:
  - `flashcards: CreateFlashcardsCommandViewModelDTO[]` – wygenerowane propozycje (używamy modelu widoku, patrz niżej)
  - `onFlashcardChange( flashcardIndex: number, changes: Partial<CreateFlashcardsCommandViewModelDTO> )`

### FlashcardsReviewListItem

- Opis: Komponent reprezentujący pojedynczą wygenerowaną fiszkę
- Główne elementy:
  - `checkbox` do zaznaczania akceptacji
  - Tekst `front` i `back`
  - Mechanizm edycji → mały formularz w obrębie itemu
- Obsługiwane interakcje:
  - OnChange checkboxa (ustawia accepted = true/false)
  - OnClick edit → przejście w tryb edycji
  - OnSave edit → zapis zmian (jeśli user edytuje, source zamieniamy z "ai-full" na "ai-edited" i ustawiamy edited = true)
- Propsy:
  - `flashcard: CreateFlashcardsCommandViewModelDTO`
  - `onAcceptChange(checked: boolean)`
  - `onEdit(fields: { front: string; back: string })`
  - `onReject()` → usuwa fiszkę ze stanu

### FlashcardsReviewListBulkSaveButton

- Opis: Przycisk umożliwiający zapis propozycji fiszek (wszystkich lub tylko tych zaakceptowanych)
- Główne elementy: Przycisk w UI
- Obsługiwane interakcje:
  - OnClick: Wywołanie `POST /api/flashcards` z podzbiorem kart (np. accepted = true)
- Propsy:
  - `flashcards: CreateFlashcardsCommandViewModelDTO[]`
  - `onBulkSave(mode: 'all' | 'accepted')`

## 5. Typy

1. **TriggerGenerationCommandDTO** – Wysyłany do `/api/generations`:
   - `input_text: string` (1000–10000 znaków)
2. **GenerationResponseDTO** – Odpowiedź z `/api/generations`:
   - `message: string`
   - `generation: GenerationRow`
   - `flashcards: FlashcardRow[]`
3. **CreateFlashcardsCommandDTO** – Do zapisu przez `/api/flashcards`:
   - `front: string` (1–200 znaków)
   - `back: string` (1–500 znaków)
   - `source: "manual" | "ai-full" | "ai-edited"`
   - `generation_id: number | null`
4. **CreateFlashcardsCommandViewModelDTO** (Model lokalny w widoku)
   - `front: string`
   - `back: string`
   - `source: "ai-full" | "ai-edited"`
   - `accepted: boolean` (decyduje, czy zapisać fiszkę w bulk-save)
   - `edited: boolean` (informuje, czy user zmodyfikował fiszkę)

> **Uwaga**: Przy zapisywaniu do bazy mapujemy `CreateFlashcardsCommandViewModelDTO` na `CreateFlashcardsCommandDTO`. W szczególności:
>
> - Jeśli edited = true, to `source` w finalnym obiekcie jest "ai-edited"
> - Jeśli accepted = true, to idzie do bazy. W przeciwnym razie pomijamy.
> - Odrzucenie fiszki (onReject) usuwa ją z listy w stanie.

## 6. Zarządzanie stanem

- Główny stan (tekst, loading, błąd) w `GenerateLayout`.
  - Tablica `CreateFlashcardsCommandViewModelDTO[]` w momencie, gdy API zwróci wygenerowane fiszki.
- `InputTextForm` aktualizuje `textValue` w stanie rodzica.
- `GenerateButton` jest włączony/wyłączony w zależności od walidacji (1000–10000 znaków, brak aktywnego generowania).
- Po kliknięciu generowania:
  - `loading = true` → `LoadingComponent`.
  - POST `/api/generations`.
  - W razie sukcesu → konwertujemy zwrócone `FlashcardRow[]` na `CreateFlashcardsCommandViewModelDTO[]` (ustawiamy domyślnie `accepted = false`, `edited = false`, `source = "ai-full"`).
  - W razie błędu → `ErrorNotification`.
- `FlashcardsReviewListItem` odpowiada za modyfikację stanu danej fiszki (np. togglowanie accepted, wprowadzanie edycji front/back).
  - Jeśli user edytuje → source = "ai-edited", edited = true.
  - Jeśli user odrzuca → usuwamy obiekt z tablicy.
- `FlashcardsReviewListBulkSaveButton`:
  - Wywołuje `POST /api/flashcards` dla wszystkich lub tylko accepted = true. Podczas mapowania do `CreateFlashcardsCommandDTO` uwzględniamy finalne source.

## 7. Integracja API

- **POST** `/api/generations`: Wysyłamy `TriggerGenerationCommandDTO` z polem `input_text`.
  - Otrzymujemy `GenerationResponseDTO`: stamtąd bierzemy tablicę `flashcards`, konwertujemy na nasz model widoku.
- **POST** `/api/flashcards`: Wysyłamy tablicę `CreateFlashcardsCommandDTO` (już przefiltrowane i/lub zmienione pole source na "ai-edited" zgodnie z edited).

## 8. Interakcje użytkownika

1. Użytkownik wprowadza tekst w `InputTextForm`. Wartość jest walidowana.
2. `GenerateButton` staje się aktywny, gdy tekst ma odpowiednią liczbę znaków i nie trwa obecnie generowanie.
3. Kliknięcie `GenerateButton` → uruchamia generowanie (pokazywany jest `LoadingComponent`, przycisk disabled).
4. Po zakończeniu generowania:
   - W razie sukcesu: tworzona jest lista obiektów `CreateFlashcardsCommandViewModelDTO`.
   - W razie błędu: `ErrorNotification`.
5. Użytkownik przegląda listę: zaznacza checkboxy accepted, ewentualnie edytuje front/back (co automatycznie ustawia edited = true i source = "ai-edited").
6. Odrzucenie fiszki → usunięcie jej ze stanu.
7. Kliknięcie `FlashcardsReviewListBulkSaveButton` → tworzona tablica docelowa z obiektów, gdzie accepted = true (lub wszystkie), i wysyłamy do `/api/flashcards`. Po sukcesie można wyświetlić toast.

## 9. Warunki i walidacja

- Tekst wejściowy: 1000–10000 znaków, weryfikacja w `InputTextForm`.
- Fiszki (front/back) w UI: 1–200 znaków dla front, 1–500 znaków dla back (zależnie od API i logiki edycji w itemie).
- W razie błędów generowania bądź zapisu → `ErrorNotification`.

## 10. Obsługa błędów

- Błąd walidacji UI: blokuje `GenerateButton`.
- Błąd generowania → pokazuje `ErrorNotification`.
- Błąd zapisu → również `ErrorNotification`.
- Po wyjściu z błędu → można spróbować ponownie.

## 11. Kroki implementacji

- Upewnij się, że wszystkie komponenty wykorzystują klasy Tailwind i stylowanie shadcn/ui w sposób zapewniający płynną zmianę układu na różnych rozdzielczościach.
- Sprawdź poprawne działanie elementów formularza i przycisków na urządzeniach mobilnych, tabletach i desktopach.
- Zadbaj, by kluczowe elementy (np. przyciski, pola tekstowe) miały wystarczające marginesy i padding, a także poprawne skalowanie czcionki.
- Rozważ dodanie breakpointów (np. `md:`, `lg:`) w klasach Tailwind, aby układ i rozmiary komponentów dostosowywały się do szerokości ekranu.

1. **Utwórz** `GenerateLayout` i umieść w nim:
   - `InputTextForm` + `GenerateButton`
   - Warunkowo: `LoadingComponent`, `ErrorNotification`, `FlashcardsReviewList` + `FlashcardsReviewListBulkSaveButton`.
2. **Zaimplementuj** logikę `InputTextForm` → obsługa walidacji długości.
3. **Dodaj** `GenerateButton` z kontrolą `disabled` (walidacja + generowanie w toku).
4. **Obsłuż** POST `/api/generations`:
   - Ustaw `loading = true` i wyczyść poprzednie dane błędu.
   - Po sukcesie → przekształć `flashcards: FlashcardRow[]` na `CreateFlashcardsCommandViewModelDTO[]` (front/back/source, accepted=false, edited=false).
   - Po błędzie → `ErrorNotification`.
5. **Wstaw** `FlashcardsReviewList`:
   - Przekazuj listę `CreateFlashcardsCommandViewModelDTO[]`.
   - Loop tworzona z `FlashcardsReviewListItem`.
   - Edycja: jeśli user zmienia front/back → edited = true, source = "ai-edited".
   - Odrzucenie: usunięcie elementu z tablicy stanu.
6. **Dodaj** `FlashcardsReviewListBulkSaveButton`:
   - Kliknięcie → wywołuje zapytanie do POST `/api/flashcards`.
   - Filtrowanie listy: mode "accepted" (accepted = true) lub "all" (wszystkie). Modyfikujemy source na "ai-edited" w razie potrzeby.
7. **Testuj** scenariusze: walidacja pól, obsługa błędów, edycja poszczególnych fiszek, zapisywanie akceptowanych fiszek.
```
