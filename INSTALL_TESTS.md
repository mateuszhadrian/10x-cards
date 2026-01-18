# Instrukcja instalacji środowiska testowego

## Problem z uprawnieniami npm

Jeśli podczas instalacji zależności napotkasz błąd związany z uprawnieniami npm cache:

```
npm error Your cache folder contains root-owned files
```

Wykonaj poniższą komendę, aby naprawić uprawnienia:

```bash
sudo chown -R $(whoami) ~/.npm
```

Lub w przypadku konkretnego błędu z komunikatu npm:

```bash
sudo chown -R 501:20 "/Users/mhadrian-macwro/.npm"
```

## Instalacja zależności

Po naprawieniu uprawnień, zainstaluj wszystkie wymagane zależności testowe:

### 1. Zainstaluj zależności Vitest i Testing Library

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  msw @vitejs/plugin-react
```

### 2. Zainstaluj Playwright

```bash
npm install -D @playwright/test
```

### 3. Zainstaluj przeglądarki dla Playwright

```bash
npx playwright install chromium
```

Jeśli chcesz zainstalować wszystkie przeglądarki (Chrome, Firefox, Safari):

```bash
npx playwright install
```

## Weryfikacja instalacji

Sprawdź, czy wszystko zostało poprawnie zainstalowane:

```bash
# Sprawdź wersję Vitest
npx vitest --version

# Sprawdź wersję Playwright
npx playwright --version

# Wyświetl zainstalowane przeglądarki Playwright
npx playwright list-browsers
```

## Uruchomienie pierwszych testów

### Testy jednostkowe (Vitest)

```bash
# Uruchom testy w trybie watch
npm run test:watch

# Uruchom testy z UI
npm run test:ui

# Uruchom wszystkie testy jednostkowe
npm run test:unit
```

### Testy E2E (Playwright)

```bash
# Uruchom testy E2E
npm run test:e2e

# Uruchom testy w trybie UI
npm run test:e2e:ui

# Uruchom testy w trybie debug
npm run test:e2e:debug
```

## Struktura projektu testowego

Po instalacji, struktura testowa projektu wygląda następująco:

```
/
├── tests/
│   ├── setup/
│   │   ├── vitest.setup.ts    # Konfiguracja globalna Vitest
│   │   └── msw.setup.ts       # Konfiguracja Mock Service Worker
│   ├── utils/
│   │   └── test-utils.tsx     # Pomocnicze funkcje testowe
│   ├── unit/                  # Testy jednostkowe
│   └── integration/           # Testy integracyjne
├── e2e/
│   ├── fixtures/              # Dane testowe
│   ├── pages/                 # Page Object Models
│   └── *.spec.ts              # Pliki testów E2E
├── vitest.config.ts           # Konfiguracja Vitest
└── playwright.config.ts       # Konfiguracja Playwright
```

## Przykładowe testy

W projekcie zostały utworzone przykładowe testy demonstrujące najlepsze praktyki:

- `tests/unit/utils.test.ts` - Testy funkcji pomocniczych
- `tests/unit/validations.test.ts` - Testy walidacji
- `tests/unit/Button.test.tsx` - Testy komponentu React
- `tests/integration/flashcards.service.test.ts` - Testy integracyjne z MSW
- `e2e/auth.spec.ts` - Testy E2E autentykacji
- `e2e/navigation.spec.ts` - Testy E2E nawigacji

## Pokrycie kodu (Coverage)

Aby wygenerować raport pokrycia kodu:

```bash
npm run test:coverage
```

Raport zostanie wygenerowany w folderze `coverage/` i możesz go otworzyć w przeglądarce:

```bash
open coverage/index.html
```

## Debugowanie testów

### Vitest

```bash
# Uruchom konkretny test
npm run test -- Button.test.tsx

# Uruchom testy z filtrem
npm run test -- -t "should render"

# Uruchom testy w trybie UI dla lepszego debugowania
npm run test:ui
```

### Playwright

```bash
# Uruchom w trybie debug z inspektorem
npm run test:e2e:debug

# Wygeneruj testy za pomocą codegen
npm run test:e2e:codegen

# Zobacz raport z ostatniego uruchomienia
npm run test:e2e:report
```

## Integracja z IDE

### VS Code

Zainstaluj rozszerzenia:

1. **Vitest** (`vitest.explorer`) - Runner testów Vitest w VS Code
2. **Playwright Test for VSCode** (`ms-playwright.playwright`) - Runner testów Playwright

### Cursor

Cursor automatycznie wykryje testy i pozwoli je uruchamiać bezpośrednio z edytora.

## Dalsze kroki

1. Przeczytaj pełną dokumentację w pliku `TESTING.md`
2. Zapoznaj się z przykładowymi testami
3. Napisz pierwsze testy dla swojego kodu
4. Skonfiguruj CI/CD pipeline (patrz `TESTING.md`)

## Wsparcie

W razie problemów:

1. Sprawdź plik `TESTING.md` - sekcja "Troubleshooting"
2. Sprawdź oficjalną dokumentację:
   - [Vitest](https://vitest.dev/)
   - [Playwright](https://playwright.dev/)
   - [Testing Library](https://testing-library.com/)
3. Otwórz issue w repozytorium projektu

---

Środowisko testowe jest gotowe do użycia! 🚀
