# API Endpoint Implementation Plan: Create Flashcards Endpoint

## 1. Przegląd punktu końcowego

Endpoint będzie wykorzystywany do tworzenia fiszek. Obsługuje zarówno ręczne tworzenie, jak i zatwierdzanie propozycji fiszek wygenerowanych przez sztuczną inteligencję. Endpoint zapisze nowe rekordy do tabeli `flashcards` i odpowiednio ustawi wartość pola `source`:

- `manual` dla ręcznie utworzonych fiszek
- `ai-full` lub `ai-edited` dla fiszek wygenerowanych przez AI (wymagane jest podanie `generation_id`)

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Ścieżka URL:** `/api/flashcards`
- **Parametry:**
  - Żaden parametr query nie jest wymagany.
- **Request Body:**

  Oczekiwany payload zawiera właściwość `flashcards`, która jest listą obiektów z następującymi polami:
  - `front` (string, wymagane): Tekst przodu fiszki (długość: 1 - 200 znaków).
  - `back` (string, wymagane): Tekst tyłu fiszki (długość: 1 - 500 znaków).
  - `source` (string, wymagane): Wartość określająca źródło. Dozwolone wartości to `manual`, `ai-full` oraz `ai-edited`.
  - `generation_id` (number, wymagane dla fiszek AI): Numer identyfikatora powiązanej generacji; powinien być obecny przy `source` równym `ai-full` lub `ai-edited`.

Przykładowy payload:

```json
{
  "flashcards": [
    {
      "front": "What is REST?",
      "back": "A software architectural style for building APIs.",
      "source": "manual",
      "generation_id": null
    },
    {
      "front": "What is GraphQL?",
      "back": "A query language for APIs.",
      "source": "ai-full",
      "generation_id": 5
    },
    {
      "front": "What is AI?",
      "back": "A branch of computer science dealing with intelligent behavior.",
      "source": "ai-edited",
      "generation_id": 5
    }
  ]
}
```

## 3. Wykorzystywane typy

- **CreateFlashcardCommandDTO**: Definiuje strukturę danych przyjmowanych przez endpoint przy tworzeniu fiszki. (Definicja znajduje się w `src/types.ts`.)
- **FlashcardRow / FlashcardInsert / FlashcardUpdate**: Typy reprezentujące strukturę danych przechowywanych w tabeli `flashcards`.

## 4. Szczegóły odpowiedzi

W przypadku poprawnego przetworzenia żądania endpoint zwróci:

- **Status:** 201 Created
- **Body:** Obiekt zawierający komunikat potwierdzający powodzenie operacji oraz listę zapisanych fiszek. Przykładowa struktura:

```json
{
  "message": "Flashcards saved successfully",
  "flashcards": [
    { "id": 10, "front": "...", "back": "...", "source": "manual", "created_at": "..." },
    { "id": 11, "front": "...", "back": "...", "source": "ai-full", "generation_id": 5, "created_at": "..." }
  ]
}
```

W przypadku błędu:

- 400 Bad Request – nieprawidłowe dane wejściowe lub brak wymaganych pól (np. `generation_id` przy fiszce AI).
- 401 Unauthorized – żądanie wykonane przez użytkownika nieautoryzowanego lub brak sesji.
- 500 Internal Server Error – błąd po stronie serwera (np. problemy z bazą danych).

## 5. Przepływ danych

1. Klient wysyła żądanie POST do `/api/flashcards` z listą obiektów fiszek.
2. Na serwerze następuje walidacja danych wejściowych (np. długości tekstu, poprawność pola `source` oraz obecność `generation_id` dla fiszek AI) – wykorzystanie narzędzi walidacyjnych (np. Zod) zgodnie z zasadami projektu.
3. Po pozytywnej weryfikacji wywoływana jest warstwa serwisowa odpowiedzialna za logikę biznesową, która:
   - Przeprowadza operację wstawiania rekordów do tabeli `flashcards` (bulk insert) z wykorzystaniem klienta Supabase.
   - W przypadku operacji na fiszkach AI – dodatkowo weryfikuje istnienie podanego `generation_id`.
4. W razie potrzeby, w przypadku wystąpienia błędów podczas operacji w bazie danych, błędy są logowane przy użyciu mechanizmu zapisu błędów (np. wpis do tabeli `generations_errors` jeśli dotyczy kontekstu generacji).
5. Zwrócona zostaje odpowiedź do klienta.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie i autoryzacja:** Weryfikacja sesji użytkownika przed przetwarzaniem żądania. Endpoint powinien być zabezpieczony przed dostępem przez nieautoryzowanych użytkowników.
- **Walidacja danych:** Użycie Zod (lub innego narzędzia walidacyjnego) do skrupulatnej walidacji danych wejściowych zgodnie z wymaganiami (np. długość tekstów, wartości `source`).

## 7. Obsługa błędów

- **Błędy walidacji:** Zwróć kod 400 z informacją o błędzie, jeśli dane wejściowe nie spełniają wymagań (np. brak `generation_id` dla fiszki AI, niewłaściwa długość `front` lub `back`).
- **Błędy autoryzacji:** Zwróć kod 401, jeżeli użytkownik nie jest zalogowany lub nie ma dostępu do zasobu.
- **Błędy serwera:** W przypadku nieoczekiwanych błędów zwróć kod 500 z odpowiednim komunikatem.

## 8. Rozważania dotyczące wydajności

- **Bulk Insert:** Upewnij się, że operacja wstawiania wielu rekordów jest zoptymalizowana, szczególnie przy większej liczbie fiszek.
- **Indeksowanie:** Sprawdź, czy tabele bazy danych posiadają indeksy na często wyszukiwanych kolumnach (np. `user_id`, `generation_id`).
- **Sprawdzanie integralności:** Walidacja dostępności `generation_id` dla fiszek AI przed wstawieniem, aby nie wykonywać zbędnych operacji na bazie.

## 9. Etapy wdrożenia

1. **Tworzenie schematu endpointu:**
   - Utwórz plik endpointu w `src/pages/api/flashcards.ts`.
   - Skonfiguruj routing oraz zabezpieczenia (sprawdzenie autoryzacji użytkownika).

2. **Implementacja walidacji:**
   - Zaimplementuj walidację danych wejściowych za pomocą Zod, sprawdzając parametry `front`, `back`, `source` oraz (dla fiszek AI) `generation_id`.

3. **Integracja z warstwą serwisową:**
   - Wyodrębnij logikę biznesową do dedykowanego serwisu (np. `flashcards.service.ts` w `src/lib/services`).
   - Serwis powinien odpowiadać za operacje na bazie danych przy użyciu klienta Supabase.

4. **Obsługa operacji bazy danych:**
   - Wstawianie rekordów do tabeli `flashcards`.
   - Weryfikacja istnienia `generation_id` dla fiszek AI oraz ewentualne logowanie błędów do tabeli `generations_errors`.
