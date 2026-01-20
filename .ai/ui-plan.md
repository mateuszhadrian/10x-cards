# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Aplikacja 10x-cards to narzędzie umożliwiające automatyczną generację fiszek edukacyjnych z użyciem AI, zintegrowane z ręcznym tworzeniem oraz przeglądaniem fiszek. Główny interfejs po zalogowaniu prezentuje widok generowania fiszek, natomiast pozostałe widoki (lista fiszek, panel użytkownika, sesje nauki) są dostępne poprzez przejrzyste górne menu. Interfejs został zaprojektowany z użyciem Tailwind CSS oraz komponentów Shadcn/ui, aby zapewnić responsywność, dostępność i bezpieczeństwo.

## 2. Lista widoków

### Widok Logowania

- **Ścieżka widoku:** `/login`
- **Główny cel:** Umożliwić użytkownikowi uwierzytelnienie się za pomocą email i hasła przy jednoczesnej walidacji inline.
- **Kluczowe informacje do wyświetlenia:** Formularz logowania, komunikaty o błędach (np. nieprawidłowe dane), link do rejestracji.
- **Kluczowe komponenty widoku:** Formularz, pola input, przyciski, walidatory, elementy komunikatów błędów.
- **UX, dostępność i bezpieczeństwo:** Interaktywna walidacja inline, czytelne etykiety, zabezpieczenie przed wstrzyknięciem kodu oraz odpowiednie komunikaty przy błędach autoryzacji.

### Widok Rejestracji

- **Ścieżka widoku:** `/register`
- **Główny cel:** Pozwolić użytkownikowi utworzyć nowe konto zgodnie z procedurą Supabase.
- **Kluczowe informacje do wyświetlenia:** Formularz rejestracyjny, podpowiedzi dotyczące hasła, komunikaty walidacyjne.
- **Kluczowe komponenty widoku:** Formularz, pola input, przyciski, mechanizm walidacji i komunikatów błędów.
- **UX, dostępność i bezpieczeństwo:** Prezentacja błędów inline, obsługa czytników ekranu, ochrona danych.

### Widok Generowania Fiszek

- **Ścieżka widoku:** `/generate`
- **Główny cel:** Pozwolić użytkownikowi wprowadzić tekst wejściowy i generować propozycje fiszek przy użyciu AI.
- **Kluczowe informacje do wyświetlenia:** Edytor tekstu z natychmiastową walidacją liczby znaków (1000–10000), podpowiedzi dotyczące limitów, sekcja z propozycjami fiszek.
- **Kluczowe komponenty widoku:** Edytor tekstu, moduł walidacji, lista fiszek z opcjami zatwierdzania, edycji i odrzucenia, przycisk do zbiorczego zatwierdzania.
- **UX, dostępność i bezpieczeństwo:** Dynamiczna walidacja, responsywny design, szybka informacja zwrotna oraz ograniczenie widoczności danych do bieżącego użytkownika.

### Widok Ręcznego Dodawania Fiszek

- **Ścieżka widoku:** `/add-manually`
- **Główny cel:** Pozwolić użytkownikowi ręcznie dodać fiszki bez wsparcia AI.
- **Kluczowe informacje do wyświetlenia:** Formularz umożliwiający wprowadzenie treści fiszki (np. pola front i back) oraz opcjonalne metadane.
- **Kluczowe komponenty widoku:** Formularz z polami input, przyciski zapisu, moduł walidacji oraz mechanizmy zapisu danych.
- **UX, dostępność i bezpieczeństwo:** Natychmiastowa walidacja danych, przyjazny i responsywny interfejs, oraz komunikaty błędów. Widok korzysta z tego samego endpointa co widok generowania fiszek, jednak wysyłany parametr `source` ma wartość `manual` zamiast `ai-full` lub `ai-edited`.

### Widok Listy Fiszek

- **Ścieżka widoku:** `/flashcards`
- **Główny cel:** Umożliwić przegląd i usuwanie zapisanych fiszek.
- **Kluczowe informacje do wyświetlenia:** Lista fiszek (pola front, back, źródło), opcje usuwania, paginacja.
- **Kluczowe komponenty widoku:** Tabela lub lista fiszek, przyciski akcji, mechanizm paginacji.
- **UX, dostępność i bezpieczeństwo:** Łatwa nawigacja, potwierdzenie akcji (np. usunięcia), czytelne oznaczenia przycisków, zgodność z wytycznymi dostępności.

### Widok Panelu Użytkownika

- **Ścieżka widoku:** `/profile`
- **Główny cel:** Prezentacja danych użytkownika i umożliwienie zarządzania kontem.
- **Kluczowe informacje do wyświetlenia:** Informacje profilu, ustawienia konta, historia generacji fiszek, opcje zmiany hasła.
- **Kluczowe komponenty widoku:** Formularze, sekcje informacyjne, przyciski edycji, system nawigacji wewnętrznej.
- **UX, dostępność i bezpieczeństwo:** Przejrzysty interfejs, ochrona danych osobowych, intuicyjne zarządzanie kontem.

### Widok Sesji Nauki

- **Ścieżka widoku:** `/sessions`
- **Główny cel:** Umożliwić użytkownikowi interaktywne sesje nauki na podstawie zapisanych fiszek.
- **Kluczowe informacje do wyświetlenia:** Wyświetlenie przodu fiszki oraz przycisk do odsłonięcia tylnej strony.
- **Kluczowe komponenty widoku:** Komponent prezentujący fiszki, przyciski interakcji (np. „Pokaż odpowiedź”, opcje oceny), licznik postępów sesji.
- **UX, dostępność i bezpieczeństwo:** Intuicyjny design sprzyjający efektywnej nauce, responsywność oraz możliwość łatwego cofnięcia każdej akcji.

## 3. Mapa podróży użytkownika

1. Użytkownik zaczyna od ekranu logowania lub rejestracji.
2. Po udanej autoryzacji następuje automatyczne przekierowanie do widoku generowania fiszek.
3. W widoku generowania użytkownik wprowadza tekst, a system waliduje liczbę znaków.
4. Po poprawnej walidacji system wywołuje endpoint POST `/api/generations`, generując propozycje fiszek.
5. Użytkownik przegląda wygenerowane fiszki, dokonując ewentualnych edycji lub zatwierdzając/odrzucając poszczególne fiszki.
6. Po zatwierdzeniu użytkownik przesyła dane do endpointu POST `/api/flashcards`, aby zapisać fiszki w bazie.
7. Użytkownik może przejść do widoku listy fiszek, aby je przeglądać, edytować lub usuwać.
8. Dodatkowo użytkownik ma dostęp do panelu użytkownika (profilu) oraz widoku sesji nauki, gdzie kontynuuje proces recenzji i nauki.

## 4. Układ i struktura nawigacji

Nawigacja aplikacji zostanie umieszczona na górze ekranu i będzie miała charakter "sticky" na urządzeniach desktopowych, dzięki czemu zawsze pozostanie widoczna podczas przewijania. Na urządzeniach mobilnych nawigacja przekształci się w hamburger menu, umożliwiające oszczędność miejsca, z możliwością rozwinięcia po kliknięciu.

- **Lewa strona nawigacji (dla zalogowanego użytkownika):**
  - **Home:** Link do widoku `@src/components/Welcome.astro`
  - **Generate:** Link do widoku `@src/pages/generate.astro`
  - **Flashcards:** Link do widoku `@src/pages/flashcards.astro`
  - **Learning Sessions:** Element nieaktywny (funkcjonalność w budowie)
  - **User Profile:** Element nieaktywny (funkcjonalność w budowie)
- **Prawa strona nawigacji:**
  - Przycisk logowania oraz przyciski rejestracji lub wylogowywania, w zależności od stanu autoryzacji użytkownika.
- **Dodatkowe cechy:**
  - Na desktopie, pasek nawigacji jest "sticky" u góry ekranu.
  - Na urządzeniach mobilnych, nawigacja jest dostępna poprzez hamburger menu, które po kliknięciu rozwija pełną listę opcji nawigacyjnych.

## 5. Kluczowe komponenty

- **Formularze logowania i rejestracji:** Z walidacją inline, zapewniające natychmiastowy feedback przy błędach autoryzacyjnych.
- **Edytor tekstu:** Z dynamiczną walidacją liczby znaków oraz podpowiedziami dotyczącymi limitów (1000–10000 znaków).
- **Lista fiszek:** Komponent prezentujący fiszki z opcjami interakcji (zatwierdzanie, edycja, usuwanie) oraz funkcją paginacji.
- **Modal edycji:** Umożliwia szczegółową edycję wybranych fiszek bez konieczności opuszczania bieżącego widoku.
- **Komponenty nawigacyjne:** Pasek menu, breadcrumbs oraz hamburger menu, zapewniające pełną responsywność.
- **Komunikaty o błędach:** Wyświetlane inline, zawierające informację o ewentualnych problemach z autoryzacją lub błędach API, z opcjami retry/refresh.
