# E2E Tests - Quick Start Guide

## Problem Rozwiązany

**Przed:** Testy Playwright pokazywały ekran logowania zamiast testowanej strony

**Teraz:** Testy automatycznie logują się raz i reużywają sesję

## Szybkie Uruchomienie

### 1. Upewnij się że masz `.env.test`

Plik `.env.test` powinien zawierać credentials testowego użytkownika:

```bash
# .env.test (już istnieje)
E2E_USERNAME=tenhadrian@gmail.com
E2E_PASSWORD=EifA)))777
SUPABASE_URL=https://ysbiohasdktsriugbfrc.supabase.co
SUPABASE_PUBLIC_KEY=sb_publishable_4vaptL7B3w2dT2hwh-EEpw_uyWG8WVD
```

✅ Ten plik już istnieje i jest skonfigurowany!

### 2. Uruchom Dev Server

```bash
npm run dev
```

Serwer powinien być dostępny pod `http://localhost:4321`

### 3. Uruchom Testy E2E

W **nowym terminalu**:

```bash
npm run test:e2e
```

## Co się dzieje za kulisami?

1. **Setup project** uruchamia `auth.setup.ts`
   - Loguje użytkownika używając credentials z `.env.test`
   - Zapisuje stan sesji do `playwright/.auth/user.json`

2. **Main project** uruchamia wszystkie testy
   - Każdy test startuje z zalogowanym użytkownikiem
   - Nie ma potrzeby logowania w każdym teście
   - Testy tworzą dane w bazie (flashcards, generations)

3. **Teardown** uruchamia `global.teardown.ts`
   - Automatycznie czyści bazę danych po testach
   - Usuwa wszystkie dane testowego użytkownika
   - Zapewnia czysty stan dla następnego uruchomienia

## Dostępne Komendy

```bash
# Uruchom wszystkie testy
npm run test:e2e

# UI mode (interaktywny)
npm run test:e2e:ui

# Debug mode (krok po kroku)
npm run test:e2e:debug

# Zobacz raport HTML
npm run test:e2e:report

# Codegen (generuj kod testów)
npm run test:e2e:codegen
```

## UI Mode (Zalecany dla Development)

Najlepszy sposób na pracę z testami:

```bash
npm run test:e2e:ui
```

**Co daje UI mode:**
- ✅ Zobacz wszystkie testy w przeglądarce
- ✅ Uruchom pojedyncze testy
- ✅ Zobacz co test robi w real-time
- ✅ Debuguj krok po kroku
- ✅ Zobacz logi i network requests

## Przykładowe Testy

### 1. Generate Flashcards (Nowe!)

```bash
# Wszystkie testy generowania fiszek
npx playwright test generate-flashcards.spec.ts

# Tylko jeden test
npx playwright test -g "should generate and save all"
```

Testy obejmują:
- Walidację input (długość tekstu)
- Proces generowania
- Przegląd i edycję fiszek
- Zapisywanie do bazy

### 2. Authentication

```bash
npx playwright test auth.spec.ts
```

**Uwaga:** Testy auth NIE używają authenticated state (bo testują sam proces logowania)

### 3. Navigation

```bash
npx playwright test navigation.spec.ts
```

## Struktura Testów

```
e2e/
├── auth.setup.ts                    # 🔐 Global auth setup
├── pages/                           # 📄 Page Object Models
│   ├── GenerateFlashcardsPage.ts   # Główny POM dla generowania
│   ├── FlashcardReviewItem.ts      # POM dla pojedynczej fiszki
│   └── LoginPage.ts                # POM dla logowania
├── fixtures/
│   └── test-data.ts                # Dane testowe
├── auth.spec.ts                    # Testy autentykacji
├── navigation.spec.ts              # Testy nawigacji
└── generate-flashcards.spec.ts     # Testy generowania (NOWE!)

playwright/
└── .auth/
    └── user.json                   # 💾 Zapisana sesja (auto-generowana)
```

## Debugowanie

### Sprawdź czy auth setup działa

```bash
# Uruchom tylko setup
npx playwright test --project=setup

# Sprawdź czy sesja została zapisana
ls -la playwright/.auth/
cat playwright/.auth/user.json
```

### Wymuś ponowne logowanie

Jeśli testy mają problemy z autoryzacją:

```bash
# Usuń zapisaną sesję
rm -rf playwright/.auth/

# Uruchom testy ponownie (auth setup uruchomi się automatycznie)
npm run test:e2e
```

### Zobacz co test robi

```bash
# Headed mode (zobacz przeglądarkę)
npx playwright test --headed

# Slow motion (zwolnij wykonanie)
npx playwright test --headed --slow-mo=1000
```

### Debug konkretnego testu

```bash
# Debug mode dla konkretnego testu
npx playwright test --debug -g "should generate flashcards"
```

## Typowe Problemy

### ❌ "E2E_USERNAME and E2E_PASSWORD must be set"

**Rozwiązanie:** Sprawdź czy `.env.test` istnieje:

```bash
cat .env.test
```

Jeśli nie ma pliku, stwórz go z credentials.

### ❌ Testy przekierowują do /login

**Przyczyna:** Auth setup nie zadziałał poprawnie

**Rozwiązanie:**

```bash
# Usuń stary state
rm -rf playwright/.auth/

# Uruchom ponownie
npm run test:e2e
```

### ❌ Dev server nie działa

**Rozwiązanie:** Upewnij się że dev server jest uruchomiony:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e
```

### ❌ Testy timeout

**Rozwiązanie:** Zwiększ timeout w `playwright.config.ts`:

```typescript
timeout: 60000, // 60 seconds
```

## Pisanie Nowych Testów

### Używaj Page Object Model

```typescript
import { test, expect } from '@playwright/test';
import { GenerateFlashcardsPage } from './pages/GenerateFlashcardsPage';

test('my new test', async ({ page }) => {
  const generatePage = new GenerateFlashcardsPage(page);
  await generatePage.goto();
  
  // Use page object methods
  await generatePage.enterText('some text...');
  await generatePage.clickGenerate();
  
  // Assertions
  expect(await generatePage.getFlashcardCount()).toBeGreaterThan(0);
});
```

### Test bez autoryzacji

Jeśli chcesz testować bez logowania:

```typescript
test.use({ storageState: { cookies: [], origins: [] } });

test('unauthenticated user test', async ({ page }) => {
  await page.goto('/generate');
  
  // Should redirect to login
  await expect(page).toHaveURL('/login');
});
```

## Database Cleanup (Teardown)

Po zakończeniu wszystkich testów, Playwright automatycznie czyści bazę danych:

```bash
npm run test:e2e

# Po zakończeniu testów:
🧹 Starting global teardown - cleaning test data...
✓ Deleted 15 flashcard(s)
✓ Deleted 3 generation(s)
✅ Global teardown completed successfully
```

**Co jest czyszczone:**
- Wszystkie flashcards utworzone przez testowego użytkownika
- Wszystkie generations utworzone podczas testów
- Wszystkie generation errors

**Dlaczego to ważne:**
- ✅ Testy zawsze zaczynają od czystego stanu
- ✅ Brak akumulacji testowych danych w bazie
- ✅ Testy są idempotentne (można uruchamiać wiele razy)

Więcej: `e2e/TEARDOWN.md`

## Więcej Informacji

- `e2e/AUTH_SETUP.md` - Szczegółowa dokumentacja auth setup
- `e2e/TEARDOWN.md` - Dokumentacja database cleanup
- `e2e/pages/README.md` - Dokumentacja Page Object Model
- `e2e/POM_IMPLEMENTATION.md` - Implementacja POM dla generate flow

## Podsumowanie

✅ **Setup:** Auth setup działa automatycznie
✅ **Testy:** Używają authenticated state
✅ **Szybkość:** Login tylko raz, nie przy każdym teście
✅ **Niezawodność:** Konsystentny stan autoryzacji

**Zaczynaj testować:**

```bash
npm run test:e2e:ui
```

Wybierz test z listy i zobacz jak działa! 🚀
