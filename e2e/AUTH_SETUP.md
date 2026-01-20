# Authentication Setup for E2E Tests

## Problem

Aplikacja wymaga autoryzacji dla większości ścieżek. Bez mechanizmu logowania, testy próbujące odwiedzić chronione strony (np. `/generate`, `/flashcards`) były przekierowywane do `/login`.

## Rozwiązanie

Zaimplementowano **Global Authentication Setup** używając Playwright Storage State pattern.

## Jak to działa?

### 1. Auth Setup (auth.setup.ts)

Przed uruchomieniem testów, specjalny setup test loguje użytkownika i zapisuje stan sesji:

```typescript
// e2e/auth.setup.ts
setup("authenticate", async ({ page }) => {
  // Login using credentials from .env.test
  await loginPage.login(email, password);

  // Save authenticated state
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

### 2. Test Configuration (playwright.config.ts)

Konfiguracja definiuje dwa projekty:

```typescript
projects: [
  // 1. Setup project - runs first
  {
    name: "setup",
    testMatch: /.*\.setup\.ts/,
  },

  // 2. Main project - uses authenticated state
  {
    name: "chromium",
    use: {
      storageState: "playwright/.auth/user.json",
    },
    dependencies: ["setup"],
  },
];
```

### 3. Environment Variables

Credentials są ładowane z `.env.test`:

```bash
# IMPORTANT: Use your actual test user credentials
# DO NOT commit this file to version control!
E2E_USERNAME=your-test-user@example.com
E2E_PASSWORD=YourSecurePassword123!
```

## Storage State

Storage state to plik JSON zawierający:

- Cookies (session token)
- Local storage
- Session storage
- IndexedDB (opcjonalnie)

Plik jest zapisany w `playwright/.auth/user.json` i reużywany przez wszystkie testy.

## Korzyści

### 1. Szybkość

- **Login raz** zamiast przed każdym testem
- Testy startują już zalogowane
- Oszczędność czasu: ~2-3s na test

### 2. Niezawodność

- Konsystentny stan autoryzacji
- Brak flaky tests związanych z logowaniem
- Mniej network requests

### 3. Developer Experience

- Testy skupiają się na funkcjonalności, nie na auth
- Łatwiejsze debugowanie
- Czytelniejszy kod testowy

## Struktura Plików

```
e2e/
├── auth.setup.ts              # Global auth setup
├── pages/
│   ├── LoginPage.ts           # Used by auth.setup
│   ├── GenerateFlashcardsPage.ts
│   └── ...
├── generate-flashcards.spec.ts # Tests use authenticated state
└── ...

playwright/
└── .auth/
    └── user.json              # Saved session state (gitignored)

.env.test                       # E2E credentials (gitignored)
playwright.config.ts            # Loads .env.test and configures projects
```

## Użycie w Testach

### Automatyczne (Domyślne)

Wszystkie testy w projekcie `chromium` automatycznie używają authenticated state:

```typescript
test("should generate flashcards", async ({ page }) => {
  // Already authenticated! No login needed
  await page.goto("/generate");

  // Test functionality...
});
```

### Testy Bez Autoryzacji

Jeśli test potrzebuje testować funkcjonalność bez logowania:

```typescript
test.use({ storageState: { cookies: [], origins: [] } });

test("should show login page for unauthenticated user", async ({ page }) => {
  await page.goto("/generate");

  // Should redirect to /login
  await expect(page).toHaveURL("/login");
});
```

### Testy Różnych Użytkowników

Można stworzyć dodatkowe setup files dla różnych użytkowników:

```typescript
// e2e/auth-admin.setup.ts
setup("authenticate as admin", async ({ page }) => {
  await loginPage.login(adminEmail, adminPassword);
  await page.context().storageState({ path: "playwright/.auth/admin.json" });
});

// playwright.config.ts
projects: [
  {
    name: "chromium-admin",
    use: {
      storageState: "playwright/.auth/admin.json",
    },
    dependencies: ["setup-admin"],
  },
];
```

## Debugowanie

### Sprawdź Storage State

```bash
cat playwright/.auth/user.json
```

Powinien zawierać cookies z supabase session token.

### Sprawdź Zmienne Środowiskowe

```typescript
console.log("E2E_USERNAME:", process.env.E2E_USERNAME);
console.log("E2E_PASSWORD:", process.env.E2E_PASSWORD ? "***" : "NOT SET");
```

### Wymuszenie Ponownego Logowania

Usuń storage state aby wymusić ponowne logowanie:

```bash
rm -rf playwright/.auth/
npm run test:e2e
```

### UI Mode

Użyj UI mode żeby zobaczyć stan auth:

```bash
npm run test:e2e:ui
```

Kliknij w test i sprawdź zakładkę "Console" oraz "Network" aby zobaczyć czy cookies są wysyłane.

## Uruchamianie Testów

### Wszystkie testy (z auth setup)

```bash
npm run test:e2e
```

Setup project uruchomi się automatycznie przed testami głównego projektu.

### UI Mode (interaktywny)

```bash
npm run test:e2e:ui
```

### Debug Mode

```bash
npm run test:e2e:debug
```

### Tylko Setup

```bash
npx playwright test --project=setup
```

## Troubleshooting

### Problem: "E2E_USERNAME and E2E_PASSWORD must be set"

**Rozwiązanie:** Upewnij się że `.env.test` istnieje z poprawnymi zmiennymi:

```bash
# .env.test
E2E_USERNAME=your-email@example.com
E2E_PASSWORD=your-password
```

### Problem: "Authentication failed"

**Przyczyny:**

1. Niepoprawne credentials w `.env.test`
2. Użytkownik nie istnieje w bazie
3. Supabase nie działa

**Rozwiązanie:**

- Sprawdź credentials
- Upewnij się że dev server działa (`npm run dev`)
- Sprawdź Supabase connection

### Problem: Testy przekierowują do /login mimo auth setup

**Przyczyny:**

1. Storage state nie został utworzony
2. Plik `playwright/.auth/user.json` jest pusty/błędny
3. Session wygasła

**Rozwiązanie:**

```bash
# Usuń stary state i wygeneruj nowy
rm -rf playwright/.auth/
npm run test:e2e
```

### Problem: Sesja wygasa podczas testów

**Rozwiązanie:** Supabase session powinien być ważny przez 1h. Jeśli testy trwają dłużej, rozważ:

- Refresh token w beforeEach
- Lub uruchom auth.setup częściej

## Best Practices

### 1. Jeden Setup Project na Rolę Użytkownika

```typescript
// auth-user.setup.ts - regular user
// auth-admin.setup.ts - admin user
// auth-guest.setup.ts - guest user
```

### 2. Zweryfikuj Autoryzację w Setup

```typescript
setup("authenticate", async ({ page }) => {
  await loginPage.login(email, password);

  // Verify authentication worked
  await page.goto("/generate");
  await expect(page).toHaveURL("/generate"); // Not redirected to /login

  await page.context().storageState({ path: authFile });
});
```

### 3. Używaj Meaningful Credentials

W `.env.test` użyj rzeczywistego testowego użytkownika:

```bash
# ❌ Bad
E2E_USERNAME=test@test.com
E2E_PASSWORD=password

# ✅ Good
E2E_USERNAME=e2e-test-user@example.com
E2E_PASSWORD=SecureTestPassword123!
```

### 4. Dokumentuj Auth Requirements

W każdym teście który wymaga specjalnych uprawnień:

```typescript
test("should access admin panel", async ({ page }) => {
  // Requires: Admin user authentication
  // Setup: auth-admin.setup.ts

  await page.goto("/admin");
  // ...
});
```

## Więcej Informacji

- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [Storage State API](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [Global Setup and Teardown](https://playwright.dev/docs/test-global-setup-teardown)

## Podsumowanie

✅ **Przed:** Każdy test musiał się logować ręcznie
✅ **Teraz:** Login raz, reużyj w wszystkich testach
✅ **Rezultat:** Szybsze, bardziej niezawodne testy
