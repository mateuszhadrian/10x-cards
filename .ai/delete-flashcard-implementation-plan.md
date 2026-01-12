# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Endpoint służy do usunięcia fiszki z systemu. Klient wysyła żądanie HTTP DELETE na określony identyfikator fiszki i otrzymuje potwierdzenie usunięcia w postaci komunikatu. Operacja powinna walidować uprawnienia użytkownika oraz sprawdzać, czy fiszka istnieje.

## 2. Szczegóły żądania
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/flashcards/:id`
- **Parametry**:
  - **Wymagane**: `id` – identyfikator fiszki podany w ścieżce URL
  - **Opcjonalne**: Brak
- **Request Body**: Nie dotyczy

## 3. Wykorzystywane typy
- **DTO/Command Model**: 
  - Model komendy do usunięcia fiszki, zawierający pole `id` (typ liczbowy lub ciąg znaków zgodnie z definicją w `/src/types.ts`).
  - (Opcjonalnie) Inne pola związane z uwierzytelnianiem (np. token) obsługiwane przez middleware.

## 4. Szczegóły odpowiedzi
- Sukces:
  - **Kod statusu**: 200 OK
  - **Payload**: `{ "message": "Flashcard deleted successfully" }`
- Błędy:
  - **401 Unauthorized** – użytkownik nieuprawniony do wykonania operacji
  - **404 Not Found** – fiszka o podanym `id` nie została znaleziona
  - **500 Internal Server Error** – niespodziewany błąd serwera

## 5. Przepływ danych
1. Żądanie trafia do endpointu `/api/flashcards/:id` metodą DELETE.
2. Middleware uwierzytelniające weryfikuje token i uprawnienia użytkownika.
3. Schemat walidacji (np. z wykorzystaniem Zod) sprawdza poprawność parametru `id`.
4. Logika usunięcia (w serwisie, np. `src/lib/services/flashcards.service.ts`):
   - Sprawdzenie istnienia fiszki w bazie danych (tabela `flashcards` z odpowiednimi kolumnami, m.in. `id`, `is_deleted`).
   - Weryfikacja powiązań (np. zgodność `user_id` z bieżącym użytkownikiem).
   - Usunięcie fiszki (może to być fizyczne usunięcie lub oznaczenie jako usunięta poprzez ustawienie flagi `is_deleted`).
5. Odpowiedź - w przypadku sukcesu zwracany jest komunikat o poprawnym usunięciu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja**: Endpoint musi być chroniony, dostęp tylko dla zalogowanych użytkowników, a operacja usunięcia musi być wykonywana tylko przez właściciela fiszki.
- **Walidacja danych**: Użycie Zod do walidacji parametru `id` i innych danych wejściowych (np. sprawdzenie poprawności formatu identyfikatora).

## 7. Obsługa błędów
- **Błąd walidacji**: Zwrócenie 400 w przypadku nieprawidłowego formatu `id`.
- **Brak autoryzacji**: Zwrócenie 401, jeśli użytkownik nie jest uwierzytelniony.
- **Fiszka nie znaleziona**: Zwrócenie 404 w przypadku, gdy fiszka o podanym `id` nie istnieje lub nie należy do użytkownika.
- **Błąd serwera**: Zwrócenie 500 w przypadku nieoczekiwanych problemów oraz logowanie błędu.

## 8. Rozważania dotyczące wydajności
- Operacja usunięcia to pojedyncze zapytanie do bazy danych – optymalizacja polega głównie na indeksowaniu kolumny `id`.
- Rozważenie użycia mechanizmu soft delete (użycie flagi `is_deleted`) dla celów audytu i potencjalnej możliwości przywrócenia danych.

## 9. Etapy wdrożenia
1. **Implementacja endpointu**: Dodanie obsługi metody DELETE w pliku `/src/pages/api/flashcards.ts`.
2. **Weryfikacja autoryzacji**: Upewnienie się, że middleware poprawnie weryfikuje token i uprawnienia użytkownika.
3. **Walidacja danych**: Utworzenie schematu walidacji dla parametru `id` z wykorzystaniem Zod.
4. **Logika usunięcia**: Implementacja lub rozszerzenie funkcji w serwisie (`src/lib/services/flashcards.service.ts`) do wykonania operacji usunięcia (soft delete lub fizyczne usunięcie).
5. **Obsługa błędów**: Dodanie logiki do obsługi przypadków błędów (nieprawidłowy identyfikator, brak fiszki, błędy bazy danych).
