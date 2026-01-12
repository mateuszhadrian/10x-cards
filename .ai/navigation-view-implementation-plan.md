# Plan implementacji widoku Nawigacja

## 1. Przegląd
Widok Nawigacji odpowiada za prezentację górnego paska nawigacyjnego, który umożliwia użytkownikowi łatwe przechodzenie między głównymi sekcjami aplikacji. Po stronie lewej znajdują się linki do widoków takich jak Home, Generate, Flashcards, Learning Sessions oraz User Profile (te dwa ostatnie jako elementy nieaktywne), a po stronie prawej przyciski logowania, rejestracji oraz wylogowywania. Na desktopie pasek jest "sticky", natomiast na urządzeniach mobilnych dostęp do opcji odbywa się poprzez hamburger menu.

## 2. Routing widoku
Widok będzie dostępny na stałej ścieżce, dostosowanej do układu całej aplikacji. Przykładowo, główny pasek nawigacyjny będzie renderowany na każdej stronie, natomiast wybrane opcje (np. widok "Flashcards") będą miały swoje dedykowane ścieżki (np. `/flashcards`).

## 3. Struktura komponentów
- `NavigationBar` – główny komponent nawigacji
  - `LeftNavigation` – lewa strona z linkami do widoków
  - `RightNavigation` – prawa strona z przyciskami autoryzacyjnymi
  - `HamburgerMenu` – widoczny tylko na urządzeniach mobilnych do rozwijania pełnej listy opcji

## 4. Szczegóły komponentów

### NavigationBar
- Opis: Komponent opakowujący całą nawigację, odpowiedzialny za układ oraz zachowanie "sticky".
- Główne elementy: Lewa sekcja (`LeftNavigation`), prawa sekcja (`RightNavigation`), warunkowo `HamburgerMenu` dla urządzeń mobilnych.
- Obsługiwane interakcje: Reakcja na zmiany rozmiaru okna, przechwytywanie akcji kliknięcia w linki i przyciski.
- Walidacja: Sprawdzenie, czy wymagane propsy (np. stan użytkownika) zostały przekazane.
- Typy: `NavigationProps`, ewentualny `UserStatus`.
- Propsy: Informacja o stanie autoryzacji użytkownika oraz funkcje przełączające widok w przypadku kliknięcia w hamburger menu.

### LeftNavigation
- Opis: Komponent zawierający linki do widoków: Home, Generate, Flashcards, Learning Sessions, User Profile.
- Główne elementy: Lista linków z odpowiednimi ścieżkami, oznaczenie elementów nieaktywnych.
- Obsługiwane interakcje: Kliknięcia na linki przenoszące do odpowiednich widoków.
- Walidacja: Status aktywnego widoku oraz poprawność URL-i.
- Typy: `NavLink`, `LeftNavigationProps`.
- Propsy: Aktualnie aktywny widok, funkcja zmiany widoku.

### RightNavigation
- Opis: Komponent wyświetlający przyciski logowania, rejestracji lub wylogowywania w zależności od stanu autoryzacji.
- Główne elementy: Przycisk logowania, rejestracji lub wylogowywania.
- Obsługiwane interakcje: Kliknięcia, które inicjują akcje autoryzacyjne (np. otwarcie modala logowania).
- Walidacja: Sprawdzenie obecności autoryzacji użytkownika.
- Typy: `AuthButtonProps`.
- Propsy: Stan autoryzacji, funkcje obsługujące akcje (logowanie, wylogowywanie, rejestracja).

### HamburgerMenu
- Opis: Komponent wyświetlany na urządzeniach mobilnych, umożliwiający rozwijanie pełnej listy opcji nawigacyjnych.
- Główne elementy: Ikona hamburger menu, lista rozwijana z opcjami nawigacyjnymi identycznymi jak w `LeftNavigation` i `RightNavigation`.
- Obsługiwane interakcje: Kliknięcie w ikonę rozwija lub zwija menu.
- Walidacja: Brak szczególnych wymagań poza poprawną obsługą akcji kliknięcia.
- Typy: `HamburgerMenuProps`.
- Propsy: Funkcje obsługujące rozwinięcie/zwiniecie menu.

## 5. Typy
- `NavigationProps`: zawiera informacje o stanie autoryzacji oraz ewentualne callbacki do zmiany widoku.
- `NavLink`: model danych dla pojedynczego linku, np. `{ label: string; path: string; isActive?: boolean; isDisabled?: boolean }`.
- `UserStatus`: typ określający, czy użytkownik jest zalogowany, niezalogowany lub w trakcie ładowania.
- Typy dla przycisków autoryzacyjnych (np. `AuthButtonProps`) zawierają właściwości takie jak tekst przycisku, akcja onClick, typ przycisku (primary, secondary itd.).

## 6. Zarządzanie stanem
- W widoku warto wykorzystać globalny store lub context, który będzie przechowywał informacje o stanie autoryzacji użytkownika.
- Dodatkowo komponent `NavigationBar` może używać customowego hooka (np. `useWindowSize`) do nasłuchiwania zmiany rozmiaru okna i warunkowego renderowania hamburger menu.

## 7. Integracja API
- Choć widok Nawigacji zasadniczo renderuje statyczne linki, integracja z API może dotyczyć wywołań związanych z logowaniem/wylogowywaniem użytkownika. 
- Typ żądania: POST dla logowania/wylogowywania.
- Odpowiedź: Obiekt zawierający status autoryzacji, ewentualne tokeny lub komunikaty błędów.

## 8. Interakcje użytkownika
- Kliknięcie w link w `LeftNavigation` przekierowuje do odpowiedniego widoku i aktualizuje stan aktywnego elementu nawigacji.
- Kliknięcie w przyciski w `RightNavigation` otwiera modale logowania/rejestracji lub wykonuje akcję wylogowania.
- Na urządzeniach mobilnych kliknięcie w `HamburgerMenu` rozwija lub zwija listę opcji.

## 9. Warunki i walidacja
- Sprawdzanie, czy użytkownik jest autoryzowany wpływa na sposób prezentacji przycisków w `RightNavigation`.
- Walidacja linków: upewnienie się, że każdy link posiada poprawną ścieżkę oraz właściwy status (aktywny/nieaktywny).
- Dla formularzy logowania/rejestracji: wstępna walidacja poprawności danych przed wysłaniem zapytania do API.

## 10. Obsługa błędów
- W przypadku błędów API (np. nieudane logowanie), widok powinien wyświetlić komunikat informujący użytkownika o problemie i umożliwić ponowną próbę.
- Na poziomie widoku: fallback UI w przypadku problemów z ładowaniem stanu autoryzacji.

## 11. Kroki implementacji
1. Stworzenie głównego komponentu `NavigationBar` z podziałem na `LeftNavigation`, `RightNavigation` oraz warunkowym `HamburgerMenu`.
2. Definiowanie interfejsów i typów (DTO, ViewModel) niezbędnych do obsługi widoku.
3. Implementacja logiki warunkowej renderowania komponentów w zależności od stanu autoryzacji użytkownika oraz rozmiaru okna.
4. Integracja z istniejącym systemem routingu, przypisanie linków do odpowiednich widoków.
5. Implementacja customowego hooka (np. `useWindowSize`) do obsługi zmian rozmiaru przeglądarki.
6. Dodanie obsługi błędów dla akcji logowania/wylogowywania, w tym wyświetlanie komunikatów o błędach.
7. Testowanie widoku na różnych urządzeniach (desktop oraz mobile) pod kątem responsywności i poprawności działania interakcji.
8. Weryfikacja poprawności działania przez review kodu oraz testy integracyjne.

