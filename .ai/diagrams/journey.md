<user_journey_analysis>

1.  **Ścieżki użytkownika (z PRD i Auth Spec):**
    - Wejście na stronę jako gość.
    - Rejestracja nowego konta.
    - Logowanie do istniejącego konta.
    - Odzyskiwanie zapomnianego hasła.
    - Generowanie fiszek (tylko zalogowany).
    - Przeglądanie i zarządzanie fiszkami (tylko zalogowany).
    - Wylogowanie.

2.  **Główne podróże i stany:**
    - **Gość:** Landing Page, Login, Register, Forgot Password.
    - **Zalogowany:** Dashboard (Generate), My Flashcards, Settings (Logout).

3.  **Punkty decyzyjne:**
    - Czy użytkownik ma konto? (Tak -> Login, Nie -> Register).
    - Czy dane logowania poprawne?
    - Czy generowanie udane?
    - Decyzja przy recenzji fiszki (Akceptuj/Odrzuć/Edytuj).

4.  **Cel stanów:**
    _ **Landing Page:** Zachęta do rejestracji/logowania.
    _ **Login/Register:** Uzyskanie dostępu.
    _ **Generate View:** Główna wartość (tworzenie).
    _ **Review:** Kontrola jakości. \* **Saved List:** Przechowywanie wiedzy.
    </user_journey_analysis>

<mermaid_diagram>

```mermaid
stateDiagram-v2
    [*] --> Gosc: Wejście na stronę

    state "Użytkownik Niezalogowany (Gość)" as Gosc {
        [*] --> LandingPage

        state "Logowanie" as Logowanie {
            FormularzLogowania --> WalidacjaLogowania
            WalidacjaLogowania --> BłądLogowania: Błędne dane
            BłądLogowania --> FormularzLogowania
        }

        state "Rejestracja" as Rejestracja {
            FormularzRejestracji --> WalidacjaRejestracji
            WalidacjaRejestracji --> WysłanieMaila: Dane poprawne
            WysłanieMaila --> OczekiwanieNaPotwierdzenie
        }

        state "Odzyskiwanie Hasła" as ResetHasla {
            PodanieEmail --> WysłanieLinku
            WysłanieLinku --> ZmianaHasła: Kliknięcie w link
        }

        LandingPage --> Logowanie: Klik "Zaloguj"
        LandingPage --> Rejestracja: Klik "Zarejestruj"
        FormularzLogowania --> ResetHasla: Zapomniałem hasła
    }

    state "Użytkownik Zalogowany" as Zalogowany {
        [*] --> Dashboard: Po zalogowaniu

        state "Generowanie Fiszek" as Generowanie {
            WprowadzenieTekstu --> GeneracjaAI
            GeneracjaAI --> RecenzjaFiszek: Sukces (1-30 fiszek)
            GeneracjaAI --> BłądGeneracji: Błąd/0 fiszek

            state "Recenzja" as RecenzjaFiszek {
                [*] --> ListaWygenerowanych
                ListaWygenerowanych --> Edycja: Klik "Edytuj"
                Edycja --> ListaWygenerowanych: Zapisz zmiany
                ListaWygenerowanych --> Zapisanie: Klik "Akceptuj"
                ListaWygenerowanych --> Odrzucenie: Klik "Odrzuć"
            }
        }

        state "Zarządzanie Fiszkami" as Lista {
            PrzeglądanieListy --> UsuwanieFiszki
        }

        Dashboard --> Generowanie: Menu "Generate"
        Dashboard --> Lista: Menu "Flashcards"
    }

    WalidacjaLogowania --> Zalogowany: Sukces
    OczekiwanieNaPotwierdzenie --> Logowanie: Potwierdzenie email
    ZmianaHasła --> Logowanie: Hasło zmienione

    Zalogowany --> Gosc: Wylogowanie

    note right of Generowanie
        Kluczowa funkcjonalność:
        Tekst 1000-10000 znaków
    end note

    note left of RecenzjaFiszek
        Użytkownik decyduje
        o jakości materiału
    end note
```
