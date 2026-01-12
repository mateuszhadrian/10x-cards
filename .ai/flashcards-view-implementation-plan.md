# Plan implementacji widoku Listy Fiszek

## 1. Przegląd
Widok umożliwia przeglądanie zapisanych fiszek użytkownika wraz z możliwością ich usunięcia. Użytkownik widzi listę fiszek z kluczowymi informacjami (pola front, back, źródło) oraz mechanizmem paginacji. Widok zapewnia również informację o stanie ładowania danych przy użyciu komponentu szkieletowego, co zwiększa spójność z innymi widokami aplikacji.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/flashcards`.

## 3. Struktura komponentów
- **FlashcardsReviewList** – główny kontener pobierający dane z API oraz renderujący listę fiszek. W trakcie ładowania danych wyświetla komponent LoadingSkeleton.
- **FlashcardsReviewListHeader** – nagłówek widoku, zawierający ewentualne informacje o paginacji oraz filtry.
- **FlashcardReviewItem** – pojedynczy element listy, prezentujący dane fiszki oraz przycisk do usunięcia.
- **ConfirmationModal** – modal do potwierdzania operacji usunięcia fiszki.
- **PaginationControl** – komponent służący do paginacji wyników.
- **LoadingSkeleton** – komponent wyświetlający placeholder (skeleton) w trakcie ładowania listy, zgodny z podejściem używanym w widoku generowania fiszek.

## 4. Szczegóły komponentów
### FlashcardsReviewList
- **Opis:** Główny komponent odpowiedzialny za pobieranie danych (flashcards oraz informacje paginacyjne) oraz renderowanie listy. W trakcie pobierania danych renderuje `LoadingSkeleton`.
- **Elementy:** Lista elementów `FlashcardReviewItem`, komponent `PaginationControl`, komponent `LoadingSkeleton`, komunikat o błędzie, jeżeli wystąpi problem z pobieraniem danych.
- **Obsługiwane interakcje:** Inicjowanie usunięcia fiszki, zmiana strony paginacji, automatyczne odświeżanie widoku po operacjach usunięcia lub błędzie.
- **Walidacja:** Weryfikacja struktury danych z API, zwłaszcza obecności wymaganych pól.
- **Typy:** ViewModel zawierający listę fiszek, obiekt paginacji, flagę ładowania i potencjalny komunikat błędu.
- **Propsy:** Opcjonalne callbacki dla globalnych zdarzeń (np. refresh) przekazywane z poziomu strony.

### FlashcardReviewItem
- **Opis:** Komponent renderujący pojedynczą fiszkę zawierającą pola: front, back, źródło oraz przycisk inicjujący proces usunięcia.
- **Elementy:** Tekst fiszki, przycisk usunięcia, ewentualny wskaźnik ładowania dla tej konkretnej operacji.
- **Obsługiwane interakcje:** Kliknięcie przycisku usunięcia, które wyświetla `ConfirmationModal` do potwierdzenia.
- **Walidacja:** Sprawdzenie kompletności danych przed renderowaniem elementu.
- **Typy:** Typ `Flashcard` z polami: `id`, `front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`.
- **Propsy:** Obiekt typu `Flashcard` oraz callback do inicjowania usunięcia.

### ConfirmationModal
- **Opis:** Modal umożliwiający potwierdzenie lub anulowanie operacji usunięcia.
- **Elementy:** Treść komunikatu potwierdzającego, przyciski "Tak" i "Nie".
- **Obsługiwane interakcje:** Kliknięcie przycisku potwierdzenia (wywołanie funkcji usuwającej) lub anulowania (zamknięcie modala).
- **Walidacja:** Brak wymagań walidacyjnych – jedynie przekierowanie wyboru użytkownika.
- **Typy:** Prosty typ konfiguracyjny dla modala (widoczność, komunikat, callbacki).
- **Propsy:** Flaga widoczności, tekst komunikatu, funkcje `onConfirm` i `onCancel`.

### PaginationControl
- **Opis:** Komponent umożliwiający zmianę stron wyników listy fiszek.
- **Elementy:** Przyciski lub wskaźniki stron, informacja o aktualnej stronie.
- **Obsługiwane interakcje:** Zmiana strony wywołująca odpowiedni callback w celu pobrania danych dla nowej strony.
- **Walidacja:** Sprawdzenie zakresu stron wg danych z API.
- **Typy:** Model paginacji zawierający: `currentPage`, `totalPages`, `limit`, `totalItems`.
- **Propsy:** Aktualny stan paginacji oraz callback do zmiany strony.

### LoadingSkeleton
- **Opis:** Komponent wyświetlający placeholder w trakcie ładowania danych, bazujący na komponencie `Skeleton` z biblioteki Shadcn/ui.
- **Elementy:** Grafika lub animowane bloki, imitujące strukturę zawartości listy.
- **Obsługiwane interakcje:** Brak interakcji – wyłącznie wizualny efekt informujący o ładowaniu.
- **Walidacja:** Brak – komponent wyłącznie wizualny.
- **Typy:** Brak dedykowanego DTO, komponent prezentacyjny.
- **Propsy:** Opcjonalnie konfiguracja liczby bloków, klasa CSS dla stylizacji.

## 5. Typy
- **Flashcard (DTO):**
  - `id`: number
  - `front`: string
  - `back`: string
  - `source`: string
  - `generation_id`: number | null
  - `created_at`: string
  - `updated_at`: string

- **Pagination:**
  - `total`: number
  - `page`: number
  - `limit`: number

- **FlashcardsResponse:**
  - `flashcards`: Flashcard[]
  - `pagination`: Pagination

- **ViewModel:**
  - `flashcards`: Flashcard[]
  - `isLoading`: boolean
  - `error`: string | null
  - `currentPage`: number

## 6. Zarządzanie stanem
- Użycie hooków `useState` i `useEffect` w komponencie `FlashcardsReviewList` do zarządzania stanem ładowania, przechowywania listy fiszek i obsługi błędów.
- Stworzenie customowego hooka `useFlashcards`, który obsłuży logikę pobierania danych, aktualizację stanu oraz operację usuwania.
- Stan komponentu zawiera flagę `isLoading`, która determinuje wyświetlenie `LoadingSkeleton` podczas pobierania danych.

## 7. Integracja API
- **Pobieranie listy fiszek:**
  - Metoda: GET `/api/flashcards`
  - Oczekiwany response: obiekt zawierający `flashcards` oraz `pagination`
  - Typy: `FlashcardsResponse`

- **Usuwanie fiszki:**
  - Metoda: DELETE `/api/flashcards/:id`
  - Oczekiwany response: `{ "message": "Flashcard deleted successfully" }`
  - Po usunięciu dane muszą zostać odświeżone przez ponowne wywołanie GET.

## 8. Interakcje użytkownika
- Kliknięcie przycisku usunięcia w komponencie `FlashcardReviewItem` wyświetla modal `ConfirmationModal`.
- Po potwierdzeniu w modal, wywoływane jest API do usunięcia fiszki, a widok aktualizuje się, usuwając dany element.
- Użytkownik może zmieniać strony przy użyciu komponentu `PaginationControl`; wybrana strona powoduje ponowne pobranie danych.
- W trakcie pobierania danych wyświetlany jest `LoadingSkeleton`.

## 9. Warunki i walidacja
- Weryfikacja struktury danych zwracanych przez API, w tym obecność wszystkich wymaganych pól w obiektach typu `Flashcard`.
- Sprawdzanie poprawności numeru strony w paginacji oraz zakresu dostępnych stron.
- Przed usunięciem, potwierdzenie operacji przez użytkownika poprzez modal.

## 10. Obsługa błędów
- Wyświetlenie komunikatu o błędzie przy niepowodzeniu pobierania danych lub operacji usuwania.
- Mechanizm retry w przypadku błędów sieciowych.
- Odpowiednie logowanie błędów w konsoli (dla deweloperów) oraz informowanie użytkownika w UI.

## 11. Kroki implementacji
1. Utworzenie nowej strony w Astro dostępnej pod adresem `/flashcards`.
2. Implementacja komponentu `FlashcardsReviewList` z logiką pobierania danych za pomocą customowego hooka `useFlashcards`.
3. Dodanie logiki renderowania stanu ładowania przy użyciu komponentu `LoadingSkeleton`.
4. Implementacja komponentu `FlashcardReviewItem` do wyświetlania pojedynczych fiszek wraz z przyciskiem usunięcia.
5. Utworzenie komponentu `ConfirmationModal` do potwierdzania operacji usunięcia.
6. Implementacja komponentu `PaginationControl` umożliwiającego zmianę stron oraz odpowiednią walidację.
7. Integracja komponentów z API (GET oraz DELETE) i zapewnienie automatycznego odświeżania widoku po każdej operacji.
8. Dodanie walidacji danych i obsługi błędów: wyświetlanie komunikatów, retry mechanizmu i logowanie.
9. Przeprowadzenie testów funkcjonalnych i responsywności widoku.
10. Code review oraz dodanie komentarzy w krytycznych miejscach.
