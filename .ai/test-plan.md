# Plan Testów - 10x-cards

## 1. Wprowadzenie i zakres

**Cel dokumentu:**

Dokument ma za zadanie określić kompleksowy plan testów dla projektu 10x-cards, którego celem jest zapewnienie wysokiej jakości aplikacji poprzez systematyczne testowanie kluczowych funkcjonalności.

**Zakres testów:**

- Testy jednostkowe i integracyjne dla komponentów frontendowych (React, Astro) i logiki biznesowej.
- Testy end-to-end (E2E) dla ścieżek użytkownika takich jak logowanie, rejestracja, przeglądanie flashcards oraz generowanie nowych zestawów kart.
- Testy wydajnościowe dla krytycznych ścieżek oraz API backendu.

**Elementy poza zakresem:**

- Testowanie konfiguracji środowiskowych, których ustawienia są specyficzne dla infrastruktury wdrożeniowej (np. konfiguracja Supabase poza podstawowymi migracjami i interfejsem API).

## 2. Środowisko techniczne

### 2.1 Stack technologiczny

Projekt korzysta z następujących technologii:

- **Astro 5** – Służy do budowania statycznych stron oraz dynamicznych elementów w aplikacji.
- **TypeScript 5** – Zapewnia typowanie statyczne i nowoczesne funkcjonalności językowe.
- **React 19** – Używany do budowy interaktywnych komponentów.
- **Tailwind CSS 4** – Do stylowania i responsywnego designu.
- **Shadcn/ui** – Komponenty UI wspierające spójny design.
- **Supabase** – Backend jako usługa, obsługa bazy danych i logiki autoryzacji.

### 2.2 Narzędzia i frameworki testowe

Dla poszczególnych technologii najlepiej dopasowane będą:

- **Testy jednostkowe i integracyjne:**
  - *Vitest* – Narzędzie testowe zbudowane na Vite, natywnie zintegrowane z Astro. Oferuje 10-50x lepszą wydajność niż Jest, pełne wsparcie TypeScript i ESM bez konfiguracji.
  - *React Testing Library* – Do testowania komponentów React z perspektywy użytkownika, promuje najlepsze praktyki testowania.
  - *@testing-library/user-event* – Do symulacji realistycznych interakcji użytkownika (kliknięcia, wpisywanie tekstu, nawigacja klawiaturą).
  
- **Mockowanie i symulacja API:**
  - *MSW (Mock Service Worker)* – Przechwytywanie i mockowanie requestów HTTP na poziomie sieci. Działa zarówno w testach jak i w przeglądarce, zapewniając spójne środowisko testowe.
  
- **Testy end-to-end (E2E):**
  - *Playwright* – Nowoczesne narzędzie E2E od Microsoft, będące aktualnym standardem branżowym (2026). Oferuje lepszą wydajność, debugging (trace viewer, UI mode) i natywne wsparcie dla wielu przeglądarek w porównaniu do Cypress.
  
- **Testy dostępności (a11y):**
  - *Axe-core* / *axe-playwright* – Automatyczne wykrywanie problemów z dostępnością zgodnie z WCAG 2.1/2.2.
  
- **Testy wydajnościowe:**
  - *Lighthouse CI* – Do automatycznego audytu wydajności, SEO i dostępności w pipeline CI/CD.
  - *Artillery* – Narzędzie do testów obciążeniowych, prostsze w użyciu niż k6, idealne dla projektów małej/średniej skali.
  - *WebPageTest* – Do szczegółowej analizy wydajności i Core Web Vitals.

### 2.3 Dodatkowe narzędzia (opcjonalnie)

- **Storybook** – Do izolowanego rozwoju i dokumentacji komponentów UI, z możliwością visual regression testing.
- **Chromatic** – Automatyczne visual regression testing dla komponentów w Storybook.
- **@vitest/ui** – Interfejs graficzny do przeglądarki dla Vitest, ułatwiający debugging testów.

## 3. Strategia testowania

**Podejście do testowania:**

Testowanie zostanie przeprowadzone etapowo, zaczynając od testów jednostkowych funkcji i komponentów, następnie kontynuując do testów integracyjnych oraz testów E2E symulujących pełne ścieżki użytkownika.

**Struktura katalogów testowych:**

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── LoginForm.test.tsx              # Vitest + RTL
│   └── FlashcardReviewItem.test.tsx
├── lib/
│   ├── services/
│   │   ├── flashcards.service.ts
│   │   └── flashcards.service.test.ts      # Vitest
│   └── validations/
│       ├── auth.validation.ts
│       └── auth.validation.test.ts         # Vitest
tests/
├── e2e/
│   ├── auth.spec.ts                        # Playwright
│   ├── flashcards.spec.ts                  # Playwright
│   └── navigation.spec.ts                  # Playwright
├── fixtures/
│   ├── mockData.ts
│   └── mockHandlers.ts                     # MSW handlers
└── setup/
    ├── vitest.setup.ts
    └── playwright.config.ts
```

**Typy testów:**

- **Testy jednostkowe (Unit Tests):** 
  - Skupiają się na weryfikacji pojedynczych funkcjonalności lub metod
  - Walidacje (np. w `flashcards.validation.ts` czy `auth.validation.ts`)
  - Serwisy (np. `flashcards.service.ts`, `openrouter.service.ts`)
  - Funkcje pomocnicze (utility functions)
  - **Narzędzia:** Vitest + MSW (do mockowania API)

- **Testy integracyjne (Integration Tests):** 
  - Testowanie współdziałania między komponentami
  - Integracja między formularzami i backendowym API
  - Przepływ danych między komponentami React a Astro
  - Interakcje z Supabase client
  - **Narzędzia:** Vitest + React Testing Library + MSW

- **Testy end-to-end (E2E):** 
  - Symulacja rzeczywistych scenariuszy użytkownika
  - Pełne ścieżki: rejestracja, logowanie, CRUD flashcards
  - Testowanie nawigacji i przepływów wieloetapowych
  - **Narzędzia:** Playwright (Chrome, Firefox, Safari)

- **Testy dostępności (Accessibility Tests):**
  - Weryfikacja zgodności z WCAG 2.1/2.2
  - Nawigacja klawiaturą, screen readers, kontrast kolorów
  - **Narzędzia:** Axe-core w testach Playwright i Vitest

- **Testy wydajnościowe (Performance Tests):**
  - Core Web Vitals (LCP, FID, CLS)
  - Szybkość ładowania stron i responsywność interfejsu
  - Wydajność API i czasy odpowiedzi
  - **Narzędzia:** Lighthouse CI, Artillery, WebPageTest

**Continuous Testing:**

- **Development:** Vitest w watch mode (`vitest --watch`) dla instant feedback
- **Pre-commit:** Husky + lint-staged dla testów zmienionych plików
- **CI/CD:** Pełny suite testów (unit + integration + E2E + a11y) w GitHub Actions/GitLab CI

**Priorytety testowania:**

Priorytet testów określany jest na podstawie:

- **Ryzyka biznesowego:** Funkcjonalności związane z autoryzacją, zarządzaniem danymi (flashcards) oraz krytycznymi przepływami użytkownika są najważniejsze.
- **Złożoności technicznej:** Komponenty mieszające logikę biznesową z prezentacją (np. interaktywne formularze, integracja z Supabase) wymagają dokładniejszej weryfikacji.
- **Częstotliwości zmian:** Elementy aplikacji, które ulegają częstym modyfikacjom (np. komponenty UI, logika walidacji) mają wyższy priorytet.
- **Wpływu na użytkowników:** Ścieżki rejestracji, logowania oraz obsługi flashcards są krytyczne dla doświadczenia użytkownika.

## 4. Szczegółowe przypadki testowe

### 4.1 Moduł Uwierzytelniania

**Priorytet:** Wysoki

**Opis:** Testowanie ścieżek logowania, rejestracji, resetowania hasła i weryfikacji danych użytkownika.

- **Test Case 1.1: Poprawne logowanie**
  - **Typ:** E2E (Playwright)
  - **Cel:** Umożliwić użytkownikowi poprawne zalogowanie przy użyciu prawidłowych danych.
  - **Kroki:**
    1. Przejdź do strony `/login`
    2. Wprowadź poprawny adres e-mail: `test@example.com`
    3. Wprowadź poprawne hasło: `SecurePass123!`
    4. Kliknij przycisk "Log in"
  - **Oczekiwany rezultat:** 
    - Użytkownik jest przekierowany do `/flashcards`
    - Widoczne jest powiadomienie "Welcome back"
    - Session jest zapisana w localStorage/cookies
    - Nawigacja pokazuje "Logout" zamiast "Login"

- **Test Case 1.2: Logowanie z niepoprawnymi danymi**
  - **Typ:** E2E (Playwright) + Integration (Vitest)
  - **Cel:** System powinien odmówić dostępu przy błędnych danych.
  - **Kroki:**
    1. Wprowadź nieprawidłowy adres e-mail lub hasło
    2. Kliknij przycisk logowania
  - **Oczekiwany rezultat:** 
    - System wyświetla komunikat "Invalid email or password"
    - Użytkownik pozostaje na stronie `/login`
    - Pola formularza pozostają wypełnione (email) lub puste (password)
    - Brak session w storage

- **Test Case 1.3: Walidacja formularza logowania**
  - **Typ:** Unit (Vitest + RTL)
  - **Cel:** Sprawdzenie walidacji po stronie klienta
  - **Kroki:**
    1. Pozostaw email pusty i kliknij submit
    2. Wprowadź nieprawidłowy format email (np. `invalid-email`)
    3. Wprowadź za krótkie hasło (< 8 znaków)
  - **Oczekiwany rezultat:**
    - "Email is required"
    - "Invalid email format"
    - "Password must be at least 8 characters"

- **Test Case 1.4: Dostępność formularza logowania**
  - **Typ:** A11y (Axe + Playwright)
  - **Cel:** Zapewnienie dostępności dla wszystkich użytkowników
  - **Kroki:**
    1. Uruchom Axe scanner na `/login`
    2. Sprawdź nawigację klawiaturą (Tab, Enter)
    3. Sprawdź ARIA labels i roles
  - **Oczekiwany rezultat:**
    - Zero critical/serious violations
    - Wszystkie pola mają odpowiednie labels
    - Focus jest widoczny i logiczny
    - Screen reader announcements są poprawne

### 4.2 Moduł Flashcards

**Priorytet:** Wysoki

**Opis:** Zarządzanie zestawami kart - tworzenie, edycja, przeglądanie i usuwanie flashcards.

- **Test Case 2.1: Dodawanie nowej flashcard (manualnie)**
  - **Typ:** E2E (Playwright)
  - **Cel:** Sprawdzenie, czy użytkownik może dodać nową kartę manualnie.
  - **Kroki:**
    1. Przejdź do `/add-manually`
    2. Wprowadź front: "What is React?"
    3. Wprowadź back: "A JavaScript library for building UIs"
    4. Kliknij "Save Flashcard"
  - **Oczekiwany rezultat:** 
    - Toast notification: "Flashcard saved successfully"
    - Karta pojawia się na `/flashcards`
    - Formularz jest wyczyszczony (ready for next card)

- **Test Case 2.2: Generowanie flashcards z AI**
  - **Typ:** Integration (Vitest + MSW) + E2E (Playwright)
  - **Cel:** Testowanie przepływu generowania kart przez OpenRouter
  - **Kroki:**
    1. Przejdź do `/generate`
    2. Wprowadź topic: "JavaScript ES6 features"
    3. Wybierz liczbę kart: 5
    4. Kliknij "Generate"
  - **Oczekiwany rezultat:**
    - Loading skeleton podczas generowania
    - 5 wygenerowanych flashcards pojawia się na liście
    - Możliwość preview (flip cards)
    - Możliwość bulk save lub individual select

- **Test Case 2.3: Edycja flashcard**
  - **Typ:** E2E (Playwright)
  - **Cel:** Upewnić się, że użytkownik może modyfikować istniejącą kartę.
  - **Kroki:**
    1. Przejdź do `/flashcards`
    2. Kliknij "Edit" na wybranej karcie
    3. Zmień front z "Old question" na "New question"
    4. Kliknij "Save"
  - **Oczekiwany rezultat:** 
    - Toast: "Flashcard updated successfully"
    - Zmodyfikowane dane widoczne na liście
    - Timestamp "updated_at" jest zaktualizowany

- **Test Case 2.4: Usuwanie flashcard z potwierdzeniem**
  - **Typ:** E2E (Playwright) + Integration (Vitest)
  - **Cel:** Bezpieczne usuwanie kart z modal confirmation
  - **Kroki:**
    1. Kliknij "Delete" na karcie
    2. Zobacz modal "Are you sure?"
    3. Kliknij "Cancel" - karta pozostaje
    4. Ponownie kliknij "Delete"
    5. Kliknij "Confirm" - karta jest usunięta
  - **Oczekiwany rezultat:**
    - Modal pojawia się z opisem akcji
    - Cancel nie usuwa karty
    - Confirm usuwa kartę i pokazuje toast
    - Karta znika z listy
    - API DELETE endpoint jest wywołany

- **Test Case 2.5: Paginacja listy flashcards**
  - **Typ:** Integration (Vitest + RTL)
  - **Cel:** Prawidłowe działanie paginacji
  - **Kroki:**
    1. Załaduj listę z >20 kartami
    2. Sprawdź obecność pagination controls
    3. Kliknij "Next page"
    4. Kliknij "Previous page"
  - **Oczekiwany rezultat:**
    - Wyświetlane są 20 kart per page
    - Przycisk "Previous" disabled na pierwszej stronie
    - Przycisk "Next" disabled na ostatniej stronie
    - URL query param `?page=N` jest aktualizowany

- **Test Case 2.6: Walidacja API flashcards**
  - **Typ:** Unit (Vitest)
  - **Cel:** Testowanie validations i error handling
  - **Kroki:**
    1. Test `flashcards.validation.ts`
    2. Sprawdź walidację front/back (min/max length)
    3. Test error responses z API
  - **Oczekiwany rezultat:**
    - Front: required, min 1 char, max 500 chars
    - Back: required, min 1 char, max 1000 chars
    - Proper error messages dla każdego case

### 4.3 Komponenty UI i Nawigacja

**Priorytet:** Średni

**Opis:** Testowanie spójności interfejsu oraz poprawności nawigacji między widokami (np. lewa i prawa nawigacja, pasek nawigacyjny, elementy responsywne).

- **Test Case 3.1: Nawigacja między stronami**
  - **Typ:** E2E (Playwright)
  - **Cel:** Upewnić się, że użytkownik może przechodzić między głównymi stronami aplikacji.
  - **Kroki:**
    1. Zaloguj się jako user
    2. Kliknij "Generate" w navigation
    3. Kliknij "Add Manually" w navigation
    4. Kliknij "My Flashcards" w navigation
    5. Sprawdź hamburger menu na mobile
  - **Oczekiwany rezultat:** 
    - Każda strona ładuje się <500ms
    - URL jest poprawny dla każdego widoku
    - Active state w nawigacji odpowiada current page
    - Brak JavaScript errors w console

- **Test Case 3.2: Responsywność komponentów**
  - **Typ:** E2E (Playwright multi-viewport)
  - **Cel:** Sprawdzenie, czy komponenty prawidłowo skalują się na różnych urządzeniach.
  - **Kroki:**
    1. Test na mobile (375x667 - iPhone SE)
    2. Test na tablet (768x1024 - iPad)
    3. Test na desktop (1920x1080)
    4. Test na ultra-wide (2560x1440)
  - **Oczekiwany rezultat:** 
    - Mobile: hamburger menu widoczne, karty w 1 kolumnie
    - Tablet: side navigation widoczne, karty w 2 kolumnach
    - Desktop: full navigation, karty w 3+ kolumnach
    - Brak horizontal scroll
    - Touch targets ≥44x44px na mobile

- **Test Case 3.3: Hamburger Menu (mobile)**
  - **Typ:** E2E (Playwright mobile viewport)
  - **Cel:** Testowanie mobilnej nawigacji
  - **Kroki:**
    1. Ustaw viewport na mobile (375px)
    2. Kliknij hamburger icon
    3. Menu się otwiera
    4. Kliknij link w menu
    5. Menu się zamyka
  - **Oczekiwany rezultat:**
    - Animacja otwierania/zamykania jest smooth
    - Menu overlay zakrywa content
    - Kliknięcie poza menu zamyka je
    - ESC key zamyka menu

- **Test Case 3.4: Theme Toggle**
  - **Typ:** Integration (Vitest + RTL)
  - **Cel:** Przełączanie dark/light mode
  - **Kroki:**
    1. Default theme powinien być system preference
    2. Kliknij theme toggle
    3. Theme zmienia się na light/dark
    4. Reload page - theme jest zachowany (localStorage)
  - **Oczekiwany rezultat:**
    - Smooth transition między themes
    - `data-theme` attribute na `<html>`
    - LocalStorage key: `theme`
    - Icon zmienia się (sun/moon)

### 4.4 Integracja API i Logika Biznesowa

**Priorytet:** Wysoki

**Opis:** Weryfikacja współpracy między frontendem a backendem, w tym
komunikacja z API autoryzacyjnym i endpointami flashcards oraz generations.

- **Test Case 4.1: Integracja API autoryzacji**
  - **Typ:** Integration (Vitest + MSW)
  - **Cel:** Sprawdzenie poprawności komunikacji między interfejsem a API przy logowaniu i rejestracji.
  - **Kroki:**
    1. Mock Supabase auth endpoints
    2. Test `POST /api/auth/login` z prawidłowymi credentials
    3. Test `POST /api/auth/register` z nowymi danymi
    4. Test `POST /api/auth/logout`
  - **Oczekiwany rezultat:** 
    - Login: 200 OK + `{ user, session }`
    - Register: 201 Created + verification email sent
    - Logout: 200 OK + session cleared
    - Proper headers (Content-Type, Authorization)

- **Test Case 4.2: Obsługa błędów po stronie API**
  - **Typ:** Unit (Vitest)
  - **Cel:** Upewnić się, że nieprawidłowe lub niekompletne żądania są właściwie obsługiwane.
  - **Kroki:**
    1. Test 400 Bad Request - invalid JSON
    2. Test 401 Unauthorized - invalid token
    3. Test 403 Forbidden - insufficient permissions
    4. Test 404 Not Found - resource doesn't exist
    5. Test 422 Unprocessable Entity - validation errors
    6. Test 500 Internal Server Error - server error
  - **Oczekiwany rezultat:**
    - Proper HTTP status codes
    - Consistent error response format:
      ```json
      {
        "error": "Error message",
        "code": "ERROR_CODE",
        "details": {}
      }
      ```
    - Error logging (without sensitive data)

- **Test Case 4.3: API Flashcards CRUD**
  - **Typ:** Integration (Vitest + MSW)
  - **Cel:** Testowanie wszystkich operacji CRUD
  - **Kroki:**
    1. `GET /api/flashcards` - lista flashcards
    2. `GET /api/flashcards/:id` - pojedyncza flashcard
    3. `POST /api/flashcards` - nowa flashcard
    4. `PUT /api/flashcards/:id` - update flashcard
    5. `DELETE /api/flashcards/:id` - usuń flashcard
  - **Oczekiwany rezultat:**
    - GET list: 200 + array of flashcards + pagination metadata
    - GET single: 200 + flashcard object
    - POST: 201 + created flashcard
    - PUT: 200 + updated flashcard
    - DELETE: 204 No Content
    - Proper RLS (Row Level Security) - user widzi tylko swoje karty

- **Test Case 4.4: API Generations (OpenRouter)**
  - **Typ:** Integration (Vitest + MSW)
  - **Cel:** Testowanie generowania flashcards przez AI
  - **Kroki:**
    1. Mock OpenRouter API response
    2. Test `POST /api/generations` z topic + count
    3. Test rate limiting (max 10 generations/minute)
    4. Test error handling (API timeout, quota exceeded)
  - **Oczekiwany rezultat:**
    - 200 OK + array of generated flashcards
    - Generation saved to `generations` table
    - Errors saved to `generations_errors` table
    - Proper retry logic for transient failures

- **Test Case 4.5: Middleware i Authentication Guards**
  - **Typ:** Unit (Vitest)
  - **Cel:** Testowanie middleware `src/middleware/index.ts`
  - **Kroki:**
    1. Test redirect for unauthenticated users
    2. Test protected routes (`/flashcards`, `/generate`, etc.)
    3. Test public routes (`/login`, `/register`, `/`)
    4. Test session validation
  - **Oczekiwany rezultat:**
    - Unauthenticated users redirected to `/login`
    - Authenticated users can access protected routes
    - Public routes accessible for everyone
    - Session token properly validated

- **Test Case 4.6: Service Layer Tests**
  - **Typ:** Unit (Vitest)
  - **Cel:** Testowanie business logic w services
  - **Kroki:**
    1. Test `flashcards.service.ts` methods
    2. Test `generations.service.ts` methods
    3. Test `openrouter.service.ts` API calls
    4. Test error handling i edge cases
  - **Oczekiwany rezultat:**
    - Pure functions są testowalne bez mocków
    - External calls są mockowane przez MSW
    - Proper error propagation
    - Input validation w service layer

## 5. Kryteria akceptacji

### 5.1 Pokrycie kodu (Code Coverage)

- **Ogólne pokrycie:** Minimum 80% dla całego projektu
- **Krytyczne moduły:** Minimum 90% pokrycia dla:
  - `src/lib/services/*` (serwisy)
  - `src/lib/validations/*` (walidacje)
  - `src/pages/api/*` (endpointy API)
- **Komponenty UI:** Minimum 70% pokrycia dla komponentów React
- **Metryki pokrycia:** Statements, Branches, Functions, Lines

### 5.2 Kryteria sukcesu

- ✅ Wszystkie krytyczne ścieżki przechodzą testy bez błędów:
  - Uwierzytelnianie (login, register, logout, password reset)
  - CRUD flashcards (create, read, update, delete)
  - Generowanie flashcards z AI
  - Nawigacja między widokami
  
- ✅ **Zero błędów dostępności** na poziomie krytycznym (Critical & Serious w Axe)

- ✅ **Wydajność:**
  - Lighthouse Performance Score: ≥90
  - Time to Interactive (TTI): <3s
  - First Contentful Paint (FCP): <1.5s
  - Cumulative Layout Shift (CLS): <0.1

- ✅ **E2E Tests:** 100% success rate dla krytycznych scenariuszy

### 5.3 Definicja ukończenia (Definition of Done)

- ✅ Wszystkie testy przechodzą (green) w CI/CD
- ✅ Brak krytycznych błędów wykrytych przez linters
- ✅ Code coverage osiąga zdefiniowane progi
- ✅ Dokumentacja testów jest aktualna
- ✅ Raport z testów E2E wygenerowany i przejrzany
- ✅ Visual regression tests (jeśli używamy Storybook) przeszły pomyślnie
- ✅ Performance budgets nie zostały przekroczone

## 6. Harmonogram i zasoby

### 6.1 Szacunkowy czas realizacji

**Faza 1: Setup i konfiguracja (3-5 dni)**
- Instalacja i konfiguracja Vitest, Playwright, MSW
- Setup CI/CD pipeline
- Konfiguracja coverage reporting
- Utworzenie struktury katalogów testowych

**Faza 2: Testy jednostkowe i integracyjne (2-3 tygodnie)**
- Walidacje i utility functions (3 dni)
- Serwisy (flashcards, generations, openrouter) (5 dni)
- Komponenty React (auth forms, flashcards lists) (7 dni)
- API endpoints (2 dni)

**Faza 3: Testy E2E (1-2 tygodnie)**
- Ścieżki autoryzacji (3 dni)
- CRUD flashcards (4 dni)
- Nawigacja i responsywność (2 dni)
- Edge cases i error handling (2 dni)

**Faza 4: Testy dostępności i wydajności (1 tydzień)**
- Audyty Axe dla wszystkich widoków (2 dni)
- Lighthouse CI setup i optimizacja (2 dni)
- Testy obciążeniowe Artillery (opcjonalnie) (1 dzień)

**Faza 5: Weryfikacja i poprawki (1 tydzień)**
- Przegląd coverage reports
- Fixing flaky tests
- Dokumentacja i best practices
- Finalne testy przed release

### 6.2 Wymagane zasoby

**Zespół:**
- QA Engineer z doświadczeniem w:
  - Vitest i React Testing Library
  - Playwright (lub gotowość do szybkiej nauki)
  - TypeScript i nowoczesny JavaScript (ES modules)
  - Testowaniu aplikacji Astro/Vite

**Infrastruktura:**
- Środowisko deweloperskie (local)
- Środowisko staging z testową bazą Supabase
- CI/CD (GitHub Actions, GitLab CI lub podobne)
- Ewentualnie: BrowserStack lub Sauce Labs do testów cross-browser

**Narzędzia (devDependencies):**
```json
{
  "vitest": "^2.x",
  "@testing-library/react": "^16.x",
  "@testing-library/user-event": "^14.x",
  "@vitest/ui": "^2.x",
  "jsdom": "^25.x",
  "msw": "^2.x",
  "@playwright/test": "^1.48.x",
  "axe-core": "^4.x",
  "axe-playwright": "^2.x",
  "@lhci/cli": "^0.14.x",
  "artillery": "^2.x"
}
```

**Dokumentacja i szkolenia:**
- Vitest documentation (vitest.dev)
- Playwright Best Practices (playwright.dev)
- MSW Tutorials (mswjs.io)
- Testing Library Guiding Principles

## 7. Konfiguracja i Best Practices

### 7.1 Przykładowa konfiguracja Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup/vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### 7.2 Przykładowa konfiguracja MSW

```typescript
// tests/fixtures/mockHandlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        user: { id: '1', email },
        session: { token: 'mock-token' }
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),
  
  http.get('/api/flashcards', () => {
    return HttpResponse.json([
      { id: '1', front: 'Question 1', back: 'Answer 1' },
      { id: '2', front: 'Question 2', back: 'Answer 2' },
    ]);
  }),
];
```

### 7.3 Przykład testu komponentu React

```typescript
// src/components/auth/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<LoginForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
  
  it('should show error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);
    
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

### 7.4 Przykład testu E2E (Playwright)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from 'axe-playwright';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/flashcards');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });
  
  test('should not have accessibility violations', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### 7.5 Best Practices

**Testowanie komponentów:**
- ✅ Testuj z perspektywy użytkownika (use Testing Library queries)
- ✅ Unikaj testowania szczegółów implementacji
- ✅ Używaj `userEvent` zamiast `fireEvent` dla realistycznych interakcji
- ❌ Nie testuj stylów CSS (chyba że krytyczne dla funkcjonalności)
- ❌ Nie testuj third-party libraries

**Mockowanie:**
- ✅ Używaj MSW do mockowania API requests
- ✅ Mockuj tylko external dependencies (API, third-party services)
- ❌ Nie mockuj wewnętrznej logiki aplikacji
- ❌ Unikaj nadmiernego mockowania (over-mocking)

**E2E Tests:**
- ✅ Testuj krytyczne user journeys
- ✅ Używaj data-testid tylko gdy inne selektory nie działają
- ✅ Czekaj na elementy z `expect(...).toBeVisible()` zamiast `waitFor`
- ❌ Nie testuj każdego edge case w E2E (użyj unit tests)
- ❌ Unikaj flaky tests - używaj proper waiting strategies

**Performance:**
- ✅ Uruchamiaj testy unit w watch mode podczas development
- ✅ Grupuj testy logicznie używając `describe`
- ✅ Używaj `beforeEach`/`afterEach` dla cleanup
- ✅ Równoległe wykonywanie testów (Vitest robi to domyślnie)

## 8. Integracja z CI/CD

### 8.1 GitHub Actions example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Run Lighthouse CI
        run: npm run test:lighthouse
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### 8.2 Scripts w package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:lighthouse": "lhci autorun",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}
```

## 9. Podsumowanie zmian technologicznych

### 9.1 Kluczowe zmiany względem pierwotnego planu

| Kategoria | Przed | Po | Uzasadnienie |
|-----------|-------|-------|--------------|
| **Unit Testing** | Jest | **Vitest** | Natywna integracja z Vite/Astro, 10-50x szybsze, lepsze wsparcie TS/ESM |
| **E2E Testing** | Cypress lub Playwright | **Playwright** | Standard branżowy 2026, lepszy debugging, szybsze wykonanie |
| **API Mocking** | ❌ Brak | **MSW** | Realistyczne mockowanie na poziomie sieci, działa w testach i browser |
| **Accessibility** | ❌ Brak | **Axe-core** | Automatyczne wykrywanie problemów a11y, integracja z Playwright |
| **Performance** | Lighthouse, k6 | **Lighthouse CI, Artillery** | Lighthouse CI dla CI/CD, Artillery prostsze niż k6 dla tego projektu |
| **User Interactions** | ❌ Brak | **@testing-library/user-event** | Realistyczna symulacja user actions |

### 9.2 Dlaczego Vitest zamiast Jest?

**Kluczowe przewagi:**

1. **Performance**: 10-50x szybsze wykonanie dzięki:
   - Native ESM support
   - Równoległe wykonywanie testów out-of-the-box
   - Hot Module Replacement (instant re-runs)

2. **Integracja z ekosystemem**: 
   - Vitest używa tej samej konfiguracji co Vite (używany przez Astro)
   - Zero dodatkowej konfiguracji dla TypeScript
   - Wspólne resolving, transformations, plugins

3. **Developer Experience**:
   - `@vitest/ui` - piękny UI mode w przeglądarce
   - Better error messages i stack traces
   - Watch mode z intelligent re-running

4. **Kompatybilność**:
   - Jest-compatible API (easy migration)
   - Wszystkie popularne narzędzia (RTL, MSW) działają out-of-the-box

### 9.3 Dlaczego Playwright zamiast Cypress?

**Playwright (2026) vs Cypress:**

| Feature | Playwright | Cypress |
|---------|-----------|---------|
| Multi-browser | ✅ Chrome, Firefox, Safari, Edge | ⚠️ Głównie Chrome |
| Szybkość | ✅ Bardzo szybki | ⚠️ Wolniejszy |
| Auto-wait | ✅ Built-in smart waiting | ✅ Dobry |
| API Quality | ✅ Nowoczesne, intuitive | ✅ Dobre |
| Debugging | ✅ Trace viewer, UI mode, codegen | ⚠️ Time-travel debugging (heavy) |
| Parallel | ✅ Native, bardzo szybki | ⚠️ Wymaga dashboard ($$$) |
| Community | ✅ Microsoft, rosnący | ✅ Duży, ale stabilny |
| Maintenance | ✅ Aktywny rozwój | ⚠️ Mniej updates |

**Verdict**: W 2026 roku Playwright jest de facto standardem dla nowych projektów.

### 9.4 Rekomendowane dependency versions

```json
{
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@vitest/ui": "^2.1.8",
    "axe-core": "^4.10.2",
    "axe-playwright": "^2.0.3",
    "jsdom": "^25.0.1",
    "msw": "^2.6.8",
    "vitest": "^2.1.8",
    "@lhci/cli": "^0.14.0",
    "artillery": "^2.0.20"
  }
}
```

**Note**: Wszystkie wersje są aktualne na styczeń 2026 i używają najnowszych stabilnych release'ów.

### 9.5 Migration Path (jeśli projekt używał Jest/Cypress)

**Z Jest na Vitest:**
1. Zainstaluj Vitest: `npm install -D vitest @vitest/ui jsdom`
2. Utwórz `vitest.config.ts` (patrz sekcja 7.1)
3. Zmień scripts w `package.json`: `"test": "vitest"`
4. Rename `jest.config.js` → archiwizuj
5. Update imports: nie wymaga zmian (API compatible)
6. Run: `npm test` - większość testów powinna działać od razu

**Z Cypress na Playwright:**
1. Zainstaluj: `npm install -D @playwright/test`
2. Init: `npx playwright install`
3. Przepisz testy (API jest podobne):
   - `cy.visit()` → `page.goto()`
   - `cy.get()` → `page.locator()`
   - `cy.click()` → `locator.click()`
4. Run: `npx playwright test`

### 9.6 Estimated ROI (Return on Investment)

**Oszczędności czasu przy Vitest:**
- Unit tests: 10-50x szybsze wykonanie
- Średni suite 100 testów: 30s → 2-3s
- Rocznie: ~100 godzin zaoszczędzone (dla zespołu 3 deweloperów)

**Oszczędności czasu przy Playwright:**
- E2E tests: 2-3x szybsze niż Cypress
- Better debugging: 50% mniej czasu na fixing flaky tests
- Rocznie: ~40 godzin zaoszczędzone

**Total estimated savings: ~140 godzin/rok = ~$14,000 (przy $100/h)**

---

## 10. Checklist implementacji

### Faza Setup ✅

- [ ] Zainstalować Vitest, @vitest/ui, jsdom
- [ ] Zainstalować Playwright i browsers
- [ ] Zainstalować MSW, RTL, user-event
- [ ] Zainstalować Axe-core i axe-playwright
- [ ] Skonfigurować vitest.config.ts
- [ ] Skonfigurować playwright.config.ts
- [ ] Utworzyć strukturę katalogów testowych
- [ ] Setup MSW handlers w tests/fixtures
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Skonfigurować coverage reporting

### Faza Unit Tests ✅

- [ ] Testy walidacji (auth, flashcards, generations)
- [ ] Testy serwisów (flashcards, openrouter, generations)
- [ ] Testy utility functions
- [ ] Testy komponentów React (auth forms)
- [ ] Testy hooks (useFlashcards, useWindowSize)

### Faza Integration Tests ✅

- [ ] API endpoints (/api/auth/*, /api/flashcards, /api/generations)
- [ ] Middleware i auth guards
- [ ] Supabase integration
- [ ] Component + API integration

### Faza E2E Tests ✅

- [ ] Auth flow (login, register, logout, password reset)
- [ ] Flashcards CRUD (add, edit, delete, view)
- [ ] Generate flow (AI flashcards generation)
- [ ] Navigation (mobile, desktop, theme toggle)
- [ ] Responsive design (mobile, tablet, desktop)

### Faza A11y & Performance ✅

- [ ] Axe scans dla wszystkich kluczowych widoków
- [ ] Keyboard navigation tests
- [ ] Lighthouse CI setup
- [ ] Performance budgets
- [ ] Core Web Vitals monitoring

### Faza Documentation & Review ✅

- [ ] README z instrukcjami uruchamiania testów
- [ ] Test coverage report review
- [ ] Flaky tests fixing
- [ ] Team training session
- [ ] Final sign-off

---

**Dokument zaktualizowany:** 14 stycznia 2026  
**Wersja:** 2.0  
**Status:** Ready for Implementation

