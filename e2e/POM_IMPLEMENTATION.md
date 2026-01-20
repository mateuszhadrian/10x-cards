# Page Object Model Implementation - Generate Flashcards

## Overview

Zaimplementowano dedykowane klasy Page Object Model (POM) dla scenariusza generowania i zapisywania fiszek, zgodnie z wzorcem Playwright i najlepszymi praktykami testowania E2E.

## Utworzone Pliki

### 1. GenerateFlashcardsPage.ts

**Ścieżka:** `e2e/pages/GenerateFlashcardsPage.ts`

Główna klasa POM dla całego widoku generowania fiszek, obejmująca 4 kroki workflow:

#### Krok 1: Wprowadzanie Tekstu

- `enterText(text)` - wprowadzenie tekstu
- `getCharacterCount()` - pobranie liczby znaków
- `isGenerateButtonEnabled()` - sprawdzenie czy przycisk jest aktywny

#### Krok 2: Generowanie

- `clickGenerate()` - kliknięcie przycisku generowania
- `waitForGenerationComplete()` - oczekiwanie na zakończenie generowania
- `hasGenerationError()` - sprawdzenie czy wystąpił błąd
- `getErrorMessage()` - pobranie treści błędu

#### Krok 3: Przegląd Fiszek

- `getFlashcardItems()` - pobranie listy wszystkich fiszek
- `getFlashcardItem(index)` - pobranie konkretnej fiszki
- `selectAllFlashcards()` - zaznaczenie wszystkich
- `deselectAllFlashcards()` - odznaczenie wszystkich
- `getAcceptedCount()` - liczba zaakceptowanych fiszek

#### Krok 4: Zapisywanie

- `saveAllFlashcards()` - zapisanie wszystkich
- `saveAcceptedFlashcards()` - zapisanie zaznaczonych
- `waitForSaveComplete()` - oczekiwanie na zakończenie zapisu

#### Workflow Methods (łączą wiele kroków)

- `generateFlashcards(text)` - wprowadzenie i generowanie
- `generateAndSaveAll(text)` - pełny przepływ: wprowadzenie, generowanie i zapis wszystkich
- `generateAndSaveSelected(text, indices)` - pełny przepływ z wyborem konkretnych fiszek

### 2. FlashcardReviewItem.ts

**Ścieżka:** `e2e/pages/FlashcardReviewItem.ts`

Klasa pomocnicza dla pojedynczej fiszki w liście przeglądu.

#### Akcje na Fiszce

- `accept()` - zaakceptowanie fiszki (zaznaczenie checkboxa)
- `unaccept()` - odznaczenie fiszki
- `toggleAccept()` - przełączenie stanu
- `isAccepted()` - sprawdzenie czy zaakceptowana

#### Edycja

- `startEdit()` - rozpoczęcie edycji
- `edit(front?, back?)` - edycja treści
- `saveEdit()` - zapisanie zmian
- `cancelEdit()` - anulowanie edycji
- `editAndSave(front?, back?)` - kompletny workflow edycji

#### Odczyt Danych

- `getFrontText()` - pobranie treści przodu (w trybie podglądu)
- `getBackText()` - pobranie treści tyłu (w trybie podglądu)
- `getFrontInputValue()` - pobranie wartości z pola edycji przodu
- `getBackInputValue()` - pobranie wartości z pola edycji tyłu
- `isEdited()` - sprawdzenie czy fiszka była edytowana

#### Inne

- `reject()` - odrzucenie (usunięcie) fiszki
- `isVisible()` - sprawdzenie widoczności

### 3. Rozszerzone Dane Testowe

**Ścieżka:** `e2e/fixtures/test-data.ts`

Dodano nowe dane do `testGenerations`:

- `validInput` - poprawny tekst (1000-9500 znaków) o JavaScript
- `shortInput` - tekst zbyt krótki (<1000 znaków)
- `tooLongInput` - tekst zbyt długi (>10000 znaków)

### 4. Pełny Test Suite

**Ścieżka:** `e2e/generate-flashcards.spec.ts`

Kompletny zestaw testów E2E pokrywający wszystkie kroki scenariusza:

#### Test Groups:

1. **Text Input Validation** - walidacja wprowadzania tekstu
2. **Generation Process** - proces generowania
3. **Review Flashcards** - przegląd i edycja fiszek
4. **Save Flashcards** - zapisywanie do bazy
5. **Complete Workflow** - pełne przepływy end-to-end

#### Liczba Testów: 24 testy

### 5. Dokumentacja POM

**Ścieżka:** `e2e/pages/README.md`

Kompletna dokumentacja zawierająca:

- Przegląd struktury POM
- Przykłady użycia każdej klasy
- Best practices
- Konwencje nazewnictwa
- Strategie lokalizacji elementów
- Instrukcje debugowania

## Data-TestID Mapping

### GenerateView.tsx

| Element         | data-testid                  |
| --------------- | ---------------------------- |
| Text input      | `generate-input-text`        |
| Generate button | `generate-flashcards-button` |
| Loading state   | `generate-loading-state`     |
| Error alert     | `generate-error-alert`       |
| Success alert   | `generate-success-alert`     |
| Review section  | `flashcards-review-section`  |

### FlashcardsReviewListHeader.tsx

| Element             | data-testid                      |
| ------------------- | -------------------------------- |
| Select All button   | `select-all-flashcards-button`   |
| Deselect All button | `deselect-all-flashcards-button` |

### FlashcardsReviewList.tsx

| Element               | data-testid              |
| --------------------- | ------------------------ |
| Review list container | `flashcards-review-list` |

### FlashcardReviewItem.tsx

| Element              | data-testid                            |
| -------------------- | -------------------------------------- |
| Item container       | `flashcard-review-item-{index}`        |
| Checkbox             | `flashcard-checkbox-{index}`           |
| Edit button          | `flashcard-edit-button-{index}`        |
| Reject button        | `flashcard-reject-button-{index}`      |
| Front input (edit)   | `flashcard-edit-front-{index}`         |
| Back textarea (edit) | `flashcard-edit-back-{index}`          |
| Save edit button     | `flashcard-save-edit-button-{index}`   |
| Cancel edit button   | `flashcard-cancel-edit-button-{index}` |

### FlashcardsBulkSaveButton.tsx

| Element              | data-testid                       |
| -------------------- | --------------------------------- |
| Save section         | `flashcards-bulk-save-section`    |
| Save All button      | `save-all-flashcards-button`      |
| Save Accepted button | `save-accepted-flashcards-button` |

## Przykłady Użycia

### Podstawowy Test

```typescript
import { test, expect } from "@playwright/test";
import { GenerateFlashcardsPage } from "./pages/GenerateFlashcardsPage";
import { testGenerations } from "./fixtures/test-data";

test("should generate and save flashcards", async ({ page }) => {
  const generatePage = new GenerateFlashcardsPage(page);
  await generatePage.goto();

  // Kompletny workflow w jednej linii
  await generatePage.generateAndSaveAll(testGenerations.validInput);

  expect(page.url()).toContain("/flashcards");
});
```

### Test z Selekcją

```typescript
test("should save only selected flashcards", async ({ page }) => {
  const generatePage = new GenerateFlashcardsPage(page);
  await generatePage.goto();

  // Generuj fiszki
  await generatePage.generateFlashcards(testGenerations.validInput);

  // Zaznacz konkretne fiszki
  await generatePage.getFlashcardItem(0).accept();
  await generatePage.getFlashcardItem(2).accept();
  await generatePage.getFlashcardItem(4).accept();

  // Zapisz tylko zaznaczone
  await generatePage.saveAcceptedFlashcards();
  await generatePage.waitForSaveComplete();

  expect(page.url()).toContain("/flashcards");
});
```

### Test Edycji

```typescript
test("should edit flashcard before saving", async ({ page }) => {
  const generatePage = new GenerateFlashcardsPage(page);
  await generatePage.goto();

  await generatePage.generateFlashcards(testGenerations.validInput);

  // Edytuj pierwszą fiszkę
  const flashcard = generatePage.getFlashcardItem(0);
  await flashcard.editAndSave("Custom Question", "Custom Answer");

  // Sprawdź czy oznaczona jako edytowana
  expect(await flashcard.isEdited()).toBe(true);

  // Zaakceptuj i zapisz
  await flashcard.accept();
  await generatePage.saveAcceptedFlashcards();
  await generatePage.waitForSaveComplete();
});
```

### Test z Mockowanym API

```typescript
test("should handle API error gracefully", async ({ page }) => {
  const generatePage = new GenerateFlashcardsPage(page);
  await generatePage.goto();

  // Mock błędu API
  await page.route("**/api/generations", (route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Generation failed" }),
    });
  });

  await generatePage.enterText(testGenerations.validInput);
  await generatePage.clickGenerate();

  // Sprawdź czy błąd jest wyświetlony
  await expect(generatePage.errorAlert).toBeVisible();
  const errorMessage = await generatePage.getErrorMessage();
  expect(errorMessage).toContain("Generation failed");
});
```

## Korzyści z Implementacji POM

### 1. Czytelność Testów

Testy są napisane w języku domeny biznesowej, a nie w kategoriach technicznych:

```typescript
// ✅ Czytelne
await generatePage.generateAndSaveAll(text);

// ❌ Niejasne
await page.getByTestId("generate-input-text").fill(text);
await page.getByTestId("generate-flashcards-button").click();
// ... więcej kodu ...
```

### 2. Łatwa Konserwacja

Zmiana w UI wymaga aktualizacji tylko w jednym miejscu (klasa POM), nie we wszystkich testach.

### 3. Reużywalność

Metody workflow można używać w wielu testach:

```typescript
await generatePage.generateFlashcards(text);
// Używane w 10+ testach
```

### 4. Bezpieczeństwo Typów

TypeScript zapewnia autouzupełnianie i wykrywanie błędów:

```typescript
const flashcard = generatePage.getFlashcardItem(0);
await flashcard.accept(); // ✅ autocomplete
await flashcard.invalid(); // ❌ błąd kompilacji
```

### 5. Enkapsulacja Logiki Oczekiwania

Logika oczekiwania na zmiany stanu jest ukryta w metodach:

```typescript
await generatePage.waitForGenerationComplete();
// Wewnątrz: czeka na zniknięcie loadingu, pojawienie się wyników, obsługuje błędy
```

## Uruchamianie Testów

```bash
# Wszystkie testy E2E
npm run test:e2e

# Tylko testy generowania
npx playwright test generate-flashcards.spec.ts

# Z UI mode
npx playwright test --ui

# Z debugowaniem
npx playwright test --debug generate-flashcards.spec.ts

# Konkretny test
npx playwright test -g "should generate and save all"
```

## Następne Kroki

### Możliwe Rozszerzenia:

1. **FlashcardsListPage** - POM dla listy zapisanych fiszek
2. **AddManuallyPage** - POM dla ręcznego dodawania fiszek
3. **FlashcardDetailPage** - POM dla widoku szczegółów pojedynczej fiszki
4. **Navigation** - Wspólna klasa dla nawigacji między stronami

### Sugerowane Nowe Testy:

1. Testy responsywności (mobile, tablet)
2. Testy dostępności (a11y)
3. Testy wydajnościowe
4. Visual regression tests
5. Testy integracyjne z prawdziwym API

## Podsumowanie

Zaimplementowana struktura POM zapewnia:

- ✅ Pełne pokrycie scenariusza generowania i zapisywania fiszek
- ✅ 24 testy E2E
- ✅ Czytelną i łatwą w utrzymaniu bazę kodu testowego
- ✅ Reużywalne komponenty i dane testowe
- ✅ Kompletną dokumentację
- ✅ Zgodność z best practices Playwright
- ✅ Bezpieczeństwo typów dzięki TypeScript
