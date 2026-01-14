# Plan implementacji widoku Ręcznego Dodawania Fiszek

## 1. Przegląd
Widok Ręcznego Dodawania Fiszek umożliwia użytkownikowi ręczne wprowadzenie danych nowej fiszki poprzez formularz z polami `front` oraz `back`. Fiszka zostanie zapisana przy użyciu tego samego mechanizmu, jak w widoku generowania fiszek, z tą różnicą, że pole `source` będzie miało wartość `manual`.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką:
- `/add-manually`

## 3. Struktura komponentów
Proponowana hierarchia:
1. **AddManuallyLayout** – główny kontener widoku, odpowiada za layout oraz integrację z API.
2. **ManualInputForm** – formularz do ręcznego wprowadzania danych fiszki.
3. **SaveButton** – przycisk wywołujący zapis fiszki.
4. **ValidationMessage** – komponent wyświetlający komunikaty walidacyjne (opcjonalnie).

Przykładowa struktura:

- `AddManuallyLayout`
  - `ManualInputForm`
    - Pole `Input` dla `front`
    - Pole `Textarea` dla `back`
    - `SaveButton`
  - (Opcjonalnie) `ValidationMessage` wyświetlający błędy

## 4. Szczegóły komponentów
### AddManuallyLayout
- **Opis:** Główny kontener widoku, który opakowuje formularz ręcznego wprowadzania fiszek oraz obsługuje logikę integracji z API.
- **Elementy:** Nagłówek widoku, komponent `ManualInputForm`.
- **Interakcje:** Przekazywanie danych z formularza do funkcji zapisującej fiszkę; obsługa komunikatów sukcesu lub błędów.
- **Propsy:** Brak.

### ManualInputForm
- **Opis:** Formularz umożliwiający użytkownikowi wpisanie pól `front` oraz `back` dla nowej fiszki.
- **Elementy:** 
  - Komponent `Input` dla `front`
  - Komponent `Textarea` dla `back`
  - Komponent `SaveButton` do wysyłki formularza
  - (Opcjonalnie) `ValidationMessage` do wyświetlania błędów walidacji
- **Interakcje:** 
  - Walidacja w czasie rzeczywistym pól (długość: `front` 1–200 znaków, `back` 1–500 znaków).
  - Obsługa zdarzenia `onSubmit` inicjującego zapis danych do API.
- **Typy:** Dane formularza mapowane są na model widoku `CreateFlashcardsCommandViewModelDTO` z wartością pola `source` ustawioną na `manual` oraz domyślnymi wartościami `accepted = false` oraz `edited = false`.
- **Propsy:** Opcjonalny callback informujący o powodzeniu zapisu.

### SaveButton
- **Opis:** Przycisk, który uruchamia proces zapisu fiszki.
- **Elementy:** Przycisk w stylu Shadcn/ui, który może być zablokowany, jeśli dane są błędne lub trwają operacje zapisu.
- **Interakcje:** 
  - `onClick` wywołuje zapis danych.
- **Propsy:** 
  - `disabled: boolean` – kontroluje aktywność przycisku.
  - `onSave(): void` – wywołanie zapisu danych do API.

### ValidationMessage (opcjonalnie)
- **Opis:** Komponent do prezentacji komunikatów błędów walidacyjnych.
- **Elementy:** Tekst błędu, stylizowany odpowiednio (np. kolor czerwony).
- **Propsy:** 
  - `message: string`
  - (Opcjonalnie) `type: string` dla różnicowania rodzaju błędu

## 5. Typy
W widoku używamy zunifikowanego modelu widoku, tak jak w widoku generowania fiszek:

- **CreateFlashcardsCommandViewModelDTO** (dla widoku Ręcznego Dodawania Fiszek):
  - `front: string` – tekst fiszki (1–200 znaków)
  - `back: string` – tekst fiszki (1–500 znaków)
  - `source: "manual"` – stała wartość, określająca, że fiszka została dodana ręcznie
  - `accepted: boolean` – flaga decydująca, czy fiszka została zaakceptowana do zapisu (domyślnie `false`)
  - `edited: boolean` – flaga informująca, czy użytkownik dokonał edycji fiszki (domyślnie `false`)

Przy zapisie do API model `CreateFlashcardsCommandViewModelDTO` zostanie zmodyfikowany (mapowany) na `CreateFlashcardsCommandDTO`, gdzie zachowane są warunki walidacji pól, a jedyna zmiana dotyczy wartości pola `source`.

## 6. Zarządzanie stanem
- Stan lokalny formularza będzie zarządzany przy użyciu hooka `useState`:
  - Stany dla pól tekstowych `front` i `back`.
  - Stany dla komunikatów walidacyjnych dla każdego pola.
  - Stan ładowania, błędów globalnych oraz status zapisu.
- Opcjonalnie można wykorzystać customowy hook, np. `useManualFlashcardForm`, dla centralizacji logiki walidacji i zapisu.

## 7. Integracja API
- **Endpoint:** `POST /api/flashcards`
- **Payload:** Model widoku (`CreateFlashcardsCommandViewModelDTO`) mapowany na `CreateFlashcardsCommandDTO`, gdzie `source` ma wartość `manual`.
- **Logika:**
  - Po kliknięciu przycisku zapisu, dane z formularza są walidowane, a następnie wysyłane do API.
  - W przypadku sukcesu formularz jest czyszczony, a użytkownik otrzymuje komunikat potwierdzający zapis.
  - W przypadku wystąpienia błędu wyświetlany jest odpowiedni komunikat (np. przy użyciu komponentu `ErrorNotification`).

## 8. Interakcje użytkownika
1. Użytkownik wprowadza dane w polach `front` oraz `back` formularza.
2. Formularz waliduje dane w czasie rzeczywistym – pola muszą mieć odpowiednią długość (front: 1–200, back: 1–500 znaków).
3. Po uzupełnieniu danych przycisk `SaveButton` staje się aktywny.
4. Kliknięcie przycisku uruchamia zapis danych do API.
5. Po poprawnym zapisie formularz jest resetowany, a użytkownik otrzymuje potwierdzenie.
6. W przypadku błędów walidacji lub problemów z API, użytkownik widzi komunikaty błędów.

## 9. Warunki i walidacja
- **Walidacja pól:**
  - `front`: długość między 1 a 200 znaków
  - `back`: długość między 1 a 500 znaków
- **Walidacja API:** Endpoint sprawdza przestrzeganie powyższych reguł oraz wartość pola `source`.
- Formularz blokuje wysyłkę, jeśli jakiekolwiek pole jest niepoprawne.

## 10. Obsługa błędów
- Błędy walidacji są prezentowane bezpośrednio w formularzu, np. poprzez komponent `ValidationMessage`.
- W przypadku błędów zwróconych przez API (np. 400, 401) użytkownik otrzymuje stosowny komunikat, a stan błędu jest aktualizowany.

## 11. Kroki implementacji
1. Utwórz komponent `AddManuallyLayout` i przypisz do niego trasę `/add-manually`.
2. Zaimplementuj komponent `ManualInputForm`:
   - Utwórz pola `Input` dla `front` i `Textarea` dla `back` z walidacją długości.
   - Dodaj logikę walidacji w czasie rzeczywistym oraz komunikaty błędów.
3. Utwórz komponent `SaveButton` z obsługą zdarzenia `onClick`, który:
   - Sprawdza poprawność danych formularza
   - Wywołuje funkcję zapisującą fiszkę (poprzez integrację z API)
4. Zaimplementuj integrację z API:
   - Funkcja asynchroniczna wysyłająca `POST /api/flashcards` z payloadem opartym na `CreateFlashcardsCommandViewModelDTO` (przy mapowaniu ustaw `source` jako `manual`).
5. Zarządź stanem formularza i wyników zapisu, korzystając z hooka `useState` (ewentualnie customowy hook `useManualFlashcardForm`).
6. Przetestuj widok:
   - Walidację pól
   - Interakcje użytkownika (aktywny przycisk, reset formularza po sukcesie)
   - Obsługę błędów API
7. Dokonaj przeglądu i refaktoryzacji kodu zgodnie z wytycznymi projektu.
