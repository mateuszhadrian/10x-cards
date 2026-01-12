# API Endpoint Implementation Plan: Flashcards List

## 1. Przegląd punktu końcowego
Endpoint ma za zadanie pobranie listy fiszek dla zalogowanego użytkownika. Punkt końcowy umożliwia filtrowanie i paginację wyników, a także zwraca podstawowe informacje o każdej fiszce, takie jak identyfikator, treść przodu, tyłu, źródło oraz daty utworzenia i aktualizacji.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards`
- **Parametry**:
  - **Wymagane**:
    - Token autoryzacyjny w nagłówku (Authorization: Bearer <token>)
  - **Opcjonalne**:
    - `page` (numer strony, dla paginacji)
    - `limit` (ilość elementów na stronę)
    - Filtr (np. `is_deleted` lub wyszukiwanie po polu `front`)
- **Request Body**: Brak

## 3. Wykorzystywane typy i modele
- **DTOs**:
  - `FlashcardDTO`: zawiera pola takie jak `id`, `user_id`, `front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`, `is_deleted`.
- **Command Modele**:
  - Model zapytania walidujący parametry paginacji oraz filtry wejściowe (np. przy użyciu Zod).

## 4. Szczegóły odpowiedzi
- **Sukces**:
  - Kod: 200 OK
  - Body: JSON zawierający listę fiszek oraz metadane paginacji (np. `total`, `page`, `limit`).
- **Błędy**:
  - 400: Nieprawidłowe dane wejściowe (np. błędny format parametrów)
  - 401: Nieautoryzowany dostęp (brak lub nieprawidłowy token)
  - 404: Brak zasobów (np. użytkownik nie posiada fiszek)
  - 500: Błąd serwera (wystąpił problem w backendzie)

## 5. Przepływ danych
1. Żądanie przychodzi do warstwy API w folderze `src/pages/api/flashcards.ts`.
2. Middleware weryfikuje token i autentykację użytkownika.
3. Parametry zapytania są walidowane przy pomocy Zod (lub innej biblioteki) zgodnie z modelami zdefiniowanymi w `src/types.ts`.
4. Żądanie trafia do warstwy serwisowej `flashcards.service` (umieszczonej w `src/lib/services/flashcards.service.ts` lub zaktualizowanej, jeśli już istnieje funkcja) w celu pobrania danych z bazy danych (Supabase).
5. Wyniki są mapowane do DTO i zwracane w odpowiedzi JSON.

## 6. Względy bezpieczeństwa
- Weryfikacja tokena i autoryzacja użytkownika.
- Walidacja wszystkich parametrów wejściowych aby zapobiec atakom typu injection.
- Ograniczenie dostępu tylko do danych należących do zalogowanego użytkownika.

## 7. Obsługa błędów
- **400 Bad Request**: Zwracane gdy walidacja danych wejściowych nie powiedzie się.
- **401 Unauthorized**: Gdy użytkownik nie posiada ważnego tokena lub nie jest zalogowany.
- **404 Not Found**: Gdy nie znaleziono fiszek dla użytkownika.
- **500 Internal Server Error**: W przypadku wyjątków lub błędów po stronie serwera. Dodatkowo błędy krytyczne mogą być rejestrowane w osobnej tabeli błędów w bazie danych (generations_errors) dla późniejszej analizy.

## 8. Rozważania dotyczące wydajności
- Implementacja paginacji oraz opcjonalnych filtrów, aby ograniczyć ilość zwracanych danych przy dużej liczbie zasobów.
- Indeksowanie kluczowych kolumn w tabeli `flashcards` (np. `user_id`, `is_deleted`), aby przyspieszyć zapytania.
- Korzystanie z mechanizmów cache tam, gdzie to możliwe, np. cache'owanie wyników zapytań w krótkim okresie.

## 9. Etapy wdrożenia
1. **Walidacja wejścia**: Zdefiniowanie modeli walidacyjnych przy użyciu Zod oraz uzupełnienie konfiguracji w API.
2. **Autoryzacja i uwierzytelnianie**: Weryfikacja tokena w middleware i przekazanie danych użytkownika do warstwy serwisowej.
3. **Logika serwisowa**: Implementacja lub aktualizacja funkcji w `flashcards.service` do pobierania fiszek z bazy danych Supabase:
   - Zbudowanie zapytania SQL z uwzględnieniem paginacji oraz filtrów.
4. **Implementacja API**: Utworzenie/aktualizacja endpointa w `src/pages/api/flashcards.ts`:
   - Odbiór i walidacja parametrów
   - Wywołanie funkcji serwisowej
   - Formatowanie odpowiedzi
5. **Logowanie i obsługa błędów**: Implementacja mechanizmów logowania błędów oraz rejestrowanie wyjątków w dedykowanej tabeli jeśli dotyczy.


## Podsumowanie
Plan wdrożenia skoncentrowany jest na zapewnieniu bezpieczeństwa, skalowalności oraz dobrej obsługi błędów endpointa listy fiszek, zgodnie z wytycznymi technologicznymi i implementacyjnymi dostarczonymi dla projektu.
