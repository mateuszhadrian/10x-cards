# API Endpoint Implementation Plan: /api/generations

## 1. Przegląd endpointa

Endpoint ten inicjuje proces generowania fiszek przez usługę AI na podstawie podanego tekstu wejściowego. W procesie tym zapisywany jest rekord w tabeli `generations`, a następnie, w oparciu o wynik wywołania AI, wygenerowanie propozycji fiszek (flashcards proposals). Fiszki te nie są zapisywane w bazie danych, dopóki użytkownik ich nie zaakceptuje podczas przeglądu (review). W razie błędów generacji, zdarzenia te są logowane do tabeli `generations_errors`.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **URL:** `/api/generations`
- **Parametry:**
  - **Wymagane:**
    - `input_text`: string z treścią o długości między 1000 a 10000 znaków
  - **Opcjonalne:** brak
- **Request Body:**

```json
{
  "input_text": "<tekst o długości 1000-10000 znaków>"
}
```

## 3. Wykorzystywane typy

- **TriggerGenerationCommandDTO:** Definiowany w `src/types.ts` (linie 49-53) – reprezentuje polecenie inicjujące generowanie fiszek.
- **GenerationResponseDTO:** Zawiera rekord generacji oraz tablicę wygenerowanych fiszek.

## 4. Szczegóły odpowiedzi

- **Kod powodzenia:** 201 Created
- **Struktura odpowiedzi (przykładowo):**

```json
{
  "message": "Generation initiated",
  "generation": { "id": 5, "model": "gpt-4", "created_at": "..." },
  "flashcards_proposals": [
    /* wygenerowane fiszki */
  ]
}
```

- **Kody błędów:**
  - 400 Bad Request – w przypadku niepoprawnych danych wejściowych (np. nie spełnia wymagań długości `input_text`)
  - 500 Internal Server Error – w przypadku błędów po stronie serwera lub niepowodzenia wywołania AI

## 5. Przepływ danych

1. **Walidacja wejścia:** Użycie Zod schema do weryfikacji długości `input_text`.
2. **Zapis rekordu:** Utworzenie rekordu w tabeli `generations` z danymi o użytkowniku i metadanych dotyczących źródła tekstu.
3. **Wywołanie Generation Service:** Asynchroniczne wywołanie serwisu generującego fiszki (od 1 do 30 fiszek).
4. **Przetwarzanie wyników:** Po otrzymaniu odpowiedzi, wygenerowane propozycje fiszek (flashcards proposals) są zwracane jako część response endpointa. Żadna z propozycji nie jest zapisywana w bazie danych; pojedyncze fiszki zostaną zapisane jedynie po akceptacji przez użytkownika podczas przeglądu (review).
5. **Logowanie błędów:** W przypadku braku wygenerowanych fiszek lub wystąpienia błędów, logowanie szczegółowych informacji do tabeli `generations_errors`.

## 6. Względy bezpieczeństwa

- **Autoryzacja:** Sprawdzenie autoryzacji użytkownika (np. poprzez middleware sprawdzający sesję).
- **Walidacja wejścia:** Użycie Zod do walidacji parametrów i zabezpieczenie przed niedozwolonymi danymi.
- **Bezpieczeństwo bazy danych:** Korzystanie z Supabase i mechanizmów ochronnych bazy (np. RLS).

## 7. Obsługa błędów

- **Walidacja:** Zwracanie 400 Bad Request przy nieprawidłowej strukturze lub długości `input_text`.
- **Błędy wywołania AI:** Po nieudanym wywołaniu usługi AI zwrócenie 500 Internal Server Error oraz zapisanie błędu w tabeli `generations_errors`.
- **Brak wygenerowanych fiszek:** W przypadku, gdy AI nie wygeneruje żadnych fiszek, zwracany jest odpowiedni komunikat o błędzie oraz status 500.
- **Logowanie błędów:** Szczegółowe logowanie błędów dla celów debugowania i monitoringu.

## 8. Rozważania dotyczące wydajności

- **Asynchroniczność:** Wywołania do usługi AI i zapisy do bazy danych powinny być asynchroniczne, aby nie blokować głównego wątku.
- **Timeout dla Generation Service:** Ustalić limit 60 sekund dla wywołania serwisu generującego fiszki, po którym zapytanie zostanie anulowane.

## 9. Etapy wdrożenia

1. ✅ **Definicja walidacji:** Utworzenie Zod schema dla `input_text` z ograniczeniami długości 1000-10000 znaków.
2. ✅ **Endpoint API:** Utworzenie pliku endpointa, np. `src/pages/api/generations.ts`, implementującego logikę POST.
3. ✅ **Wyodrębnienie logiki biznesowej:** Przeniesienie logiki komunikacji z usługą AI oraz przetwarzania wyników do modułu w `src/lib/services/generations.ts`.
   3.1 ✅ **Implementacja mocka Generation Service:** Stworzenie implementacji mocka serwisu generującego fiszki, aby symulować odpowiedzi i testować API bez wywołania rzeczywistej usługi AI.
4. ✅ **Integracja z Supabase:** Implementacja zapisu danych do tabeli `generations` z wykorzystaniem Supabase. Propozycje fiszek są zwracane w odpowiedzi i nie są zapisywane w bazie danych, dopóki użytkownik ich nie zaakceptuje.
5. ✅ **Implementacja logiki błędów:** Dodanie mechanizmu logowania błędów do tabeli `generations_errors` (zapisywanie błędów będzie obsługiwane również w serwisie generations) oraz obsługi odpowiednich kodów statusu (400, 500).
