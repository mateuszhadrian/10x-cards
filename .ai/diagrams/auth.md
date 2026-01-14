<authentication_analysis>
1.  **Przepływy autentykacji:**
    *   Logowanie email/hasło.
    *   Rejestracja z potwierdzeniem email.
    *   Synchronizacja sesji klienta z serwerem (Cookie Management).
    *   Ochrona tras (Middleware).
    *   Wylogowanie.

2.  **Aktorzy:**
    *   **User/Browser:** Interfejs użytkownika, formularze.
    *   **Supabase Client (Browser):** Biblioteka JS w przeglądarce.
    *   **Astro API (`/api/auth`):** Endpointy do ustawiania ciasteczek.
    *   **Middleware:** Warstwa pośrednia Astro na serwerze.
    *   **Supabase Auth:** Zewnętrzna usługa autentykacji.

3.  **Weryfikacja i Odświeżanie:**
    *   Tokeny Access i Refresh są przechowywane w ciasteczkach.
    *   Middleware sprawdza ważność Access Tokena przy każdym żądaniu do chronionej trasy.
    *   Supabase Client (Server) automatycznie odświeża tokeny używając Refresh Tokena jeśli Access Token wygasł.

4.  **Opis kroków (skrót):**
    *   Użytkownik wypełnia formularz -> Supabase zwraca sesję -> Frontend wysyła sesję do API -> API ustawia ciasteczka -> Następuje przekierowanie lub przeładowanie -> Middleware widzi ciasteczka i wpuszcza użytkownika.
</authentication_analysis>

```mermaid
sequenceDiagram
    autonumber
    participant User as Użytkownik (Przeglądarka)
    participant Client as Supabase Client (JS)
    participant API as Astro API (/api/auth)
    participant Middleware as Astro Middleware
    participant Auth as Supabase Auth Service

    Note over User, Auth: Proces Logowania

    User->>Client: 1. Wprowadza Email/Hasło (signInWithPassword)
    activate Client
    Client->>Auth: 2. Weryfikacja danych
    activate Auth
    Auth-->>Client: 3. Zwraca Session (Access Token, Refresh Token)
    deactivate Auth
    
    alt Logowanie poprawne
        Client->>API: 4. POST /api/auth/signin (Tokens)
        activate API
        API-->>User: 5. Set-Cookie (sb-access-token, sb-refresh-token)
        deactivate API
        Client-->>User: 6. Przekierowanie na /generate
        deactivate Client
    else Błąd logowania
        Client-->>User: Wyświetl błąd
    end

    Note over User, Auth: Dostęp do strony chronionej (SSR)

    User->>Middleware: 7. GET /generate (z Ciasteczkami)
    activate Middleware
    Middleware->>Auth: 8. getUser(token) - weryfikacja
    activate Auth
    
    alt Token ważny
        Auth-->>Middleware: 9. Dane użytkownika
        Middleware->>User: 10. Renderuj stronę (200 OK)
    else Token nieważny / Brak tokena
        Auth-->>Middleware: Błąd / Brak sesji
        
        par Próba odświeżenia (opcjonalnie w tle przez SDK)
            Middleware->>Auth: Refresh Token Flow
        end

        alt Odświeżenie nieudane
            Middleware-->>User: 11. Przekierowanie na /login (302 Found)
        end
    end
    deactivate Auth
    deactivate Middleware

    Note over User, Auth: Proces Wylogowania

    User->>Client: 12. Klik "Wyloguj"
    activate Client
    Client->>Auth: 13. Invalidate Session
    Client->>API: 14. GET /api/auth/signout
    activate API
    API-->>User: 15. Clear Cookies
    deactivate API
    Client-->>User: 16. Przekierowanie na /
    deactivate Client
```
