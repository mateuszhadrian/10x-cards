# Specyfikacja Techniczna Modułu Autentykacji (10x-cards)

## Wstęp
Niniejszy dokument definiuje architekturę techniczną dla modułu rejestracji, logowania i odzyskiwania hasła zgodnie z wymaganiami US-001 i US-007. Rozwiązanie opiera się na integracji Astro (SSR) z Supabase Auth, wykorzystując React do obsługi interaktywnych formularzy po stronie klienta.

## 1. Architektura Interfejsu Użytkownika (UI)

### 1.1. Nowe strony i routing
W katalogu `src/pages` zostaną utworzone dedykowane strony obsługujące procesy autentykacji. Strony te będą renderowane po stronie serwera (SSR), ale będą zawierać interaktywne komponenty React ("islands").

*   **`src/pages/login.astro`**: Strona logowania.
    *   Dostęp: Publiczny (dla niezalogowanych).
    *   Przekierowanie: Jeśli użytkownik jest już zalogowany, przekierowanie na stronę główną lub dashboard (`/flashcards`).
*   **`src/pages/register.astro`**: Strona rejestracji.
    *   Dostęp: Publiczny.
*   **`src/pages/forgot-password.astro`**: Strona inicjowania resetu hasła.
    *   Dostęp: Publiczny.
*   **`src/pages/auth/callback.ts`**: Endpoint API (lub strona) do obsługi powrotów z linków potwierdzających email lub resetujących hasło.

### 1.2. Layouty
*   **Rozszerzenie `src/layouts/Layout.astro`**:
    *   Layout musi przyjmować informację o stanie zalogowania (np. obiekt `user` lub `session`) przekazywaną z middleware/locals.
    *   Na podstawie stanu zalogowania, komponenty nawigacyjne (`NavigationBar`, `LeftNavigation`) będą renderować odpowiednie przyciski (Login/Register vs Logout).
*   **Opcjonalny `AuthLayout`**:
    *   Uproszczony layout dla stron logowania/rejestracji (np. wycentrowana karta, brak pełnego paska bocznego), aby skupić uwagę użytkownika na formularzu.

### 1.3. Komponenty React (Client-Side)
Komponenty te będą umieszczone w `src/components/auth/` i będą korzystać z biblioteki `shadcn/ui` (Form, Input, Button, Alert).

1.  **`LoginForm.tsx`**:
    *   Pola: Email, Hasło.
    *   Akcja: `supabase.auth.signInWithPassword`.
    *   Po sukcesie: Wywołanie wewnętrznego API (`/api/auth/signin`) w celu ustawienia ciasteczek sesyjnych dla Astro SSR, następnie przekierowanie.
2.  **`RegisterForm.tsx`**:
    *   Pola: Email, Hasło, Potwierdź hasło.
    *   Akcja: `supabase.auth.signUp`.
    *   Obsługa: Wyświetlenie komunikatu o konieczności potwierdzenia adresu email (jeśli włączone w Supabase).
3.  **`ForgotPasswordForm.tsx`**:
    *   Pola: Email.
    *   Akcja: `supabase.auth.resetPasswordForEmail`.
4.  **`ResetPasswordForm.tsx`** (dla widoku po kliknięciu w link z maila):
    *   Pola: Nowe hasło, Potwierdź hasło.
    *   Akcja: `supabase.auth.updateUser`.

### 1.4. Walidacja i Obsługa Błędów
*   **Biblioteki**: `zod` do definicji schematów walidacji oraz `react-hook-form` do obsługi formularzy.
*   **Scenariusze walidacji**:
    *   Format emaila.
    *   Minimalna długość hasła (min. 6 znaków, zgodnie z domyślną polityką Supabase).
    *   Zgodność haseł (przy rejestracji i zmianie).
*   **Komunikaty**:
    *   Błędy walidacji wyświetlane bezpośrednio pod polami input (Inline validation).
    *   Błędy API (np. "Nieprawidłowe dane logowania") wyświetlane w komponencie `Alert` nad formularzem.

## 2. Logika Backendowa (Astro + SSR)

### 2.1. Aktualizacja Stacku
Rekomendowane jest dodanie biblioteki **`@supabase/ssr`** do projektu, która jest oficjalnym i rekomendowanym sposobem obsługi autentykacji w frameworkach SSR takich jak Astro. Ułatwia ona zarządzanie ciasteczkami w porównaniu do czystego `supabase-js`.

### 2.2. Middleware (`src/middleware/index.ts`)
Middleware będzie kluczowym elementem ochrony tras i zarządzania sesją.

*   **Zadania middleware**:
    1.  Tworzenie klienta Supabase Server Client przy każdym żądaniu.
    2.  Odświeżanie sesji (zarządzanie tokenami w ciasteczkach).
    3.  Wstrzykiwanie obiektu `user` i `supabase` do `context.locals`, aby były dostępne w stronach `.astro`.
    4.  **Ochrona tras**: Sprawdzanie, czy żądana ścieżka wymaga autoryzacji (np. `/generate`, `/flashcards`). Jeśli brak sesji -> przekierowanie na `/login` z kodem 302.

### 2.3. Endpointy API (`src/pages/api/auth/*`)
Niezbędne do synchronizacji stanu między klientem a serwerem (setting cookies).

*   **`POST /api/auth/signin`**:
    *   Przyjmuje `access_token` i `refresh_token` z klienta (po udanym logowaniu JS).
    *   Ustawia ciasteczka sesyjne (HttpOnly, Secure) dostępne dla serwera Astro.
    *   Alternatywnie (z `@supabase/ssr`): Endpoint ten może służyć do obsługi wymiany kodu Auth Code Flow (PKCE), co jest bezpieczniejszym podejściem.
*   **`GET /api/auth/signout`**:
    *   Usuwa ciasteczka sesyjne.
    *   Przekierowuje na stronę główną lub logowania.
*   **`GET /api/auth/callback`**:
    *   Obsługuje powrót z zewnętrznych providerów (nie dotyczy US-001, ale wymagane dla Magic Links/Email Confirmation).
    *   Wymienia `code` na sesję i ustawia ciasteczka.

### 2.4. Modele Danych
Wykorzystanie istniejących typów z `src/db/database.types.ts`. Nowe interfejsy TypeScript będą potrzebne jedynie dla propsów komponentów (np. `UserSession`).

## 3. System Autentykacji (Supabase)

### 3.1. Konfiguracja Klienta
Należy rozdzielić logikę tworzenia klienta Supabase na:
*   **Browser Client**: Singleton do użycia w komponentach React (`src/lib/supabase/client.ts`).
*   **Server Client**: Tworzony per-request w middleware lub API routes (`src/lib/supabase/server.ts`) z dostępem do cookies.

### 3.2. Scenariusze
*   **Rejestracja**:
    *   Frontend: `signUp({ email, password })`.
    *   Backend (Supabase): Tworzy wpis w `auth.users`. Trigger (jeśli istnieje) może tworzyć wpis w `public.profiles` (opcjonalne, zależne od potrzeb aplikacji).
*   **Logowanie**:
    *   Frontend: `signInWithPassword`.
    *   Synchronizacja: Po sukcesie wywołanie API do ustawienia ciasteczek, aby kolejne odświeżenie strony (SSR) widziało użytkownika.
*   **Wylogowanie**:
    *   Frontend: `signOut`.
    *   Synchronizacja: Wywołanie API `/api/auth/signout` usuwającego ciasteczka.
*   **Reset Hasła**:
    *   Krok 1: `resetPasswordForEmail(email, { redirectTo: '.../auth/callback?next=/update-password' })`.
    *   Krok 2: Użytkownik klika w link, trafia na callback, sesja jest ustawiana.
    *   Krok 3: Przekierowanie do formularza zmiany hasła.
    *   Krok 4: `updateUser({ password: newPassword })`.

## 4. Wnioski i Plan Wdrożenia
1.  Instalacja `@supabase/ssr`.
2.  Konfiguracja helperów klienta Supabase (browser/server).
3.  Rozbudowa `src/middleware/index.ts` o obsługę sesji.
4.  Stworzenie endpointów API `/api/auth/*`.
5.  Implementacja komponentów formularzy w React (`shadcn/ui` + `zod`).
6.  Implementacja stron Astro (`login`, `register`, `forgot-password`).
7.  Dostosowanie nawigacji w `Layout.astro`.
