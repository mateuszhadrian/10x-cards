# OpenRouter Service Implementation Plan

This document provides a comprehensive guide for implementing the OpenRouter service to supplement LLM-powered chats. The plan is tailored to the existing tech stack of Astro 5, TypeScript 5, React 19, Tailwind 4, and Shadcn/ui, and follows the best engineering principles outlined for the project.

---

## 1. Opis usługi

**Cel:**

Usługa OpenRouter odpowiedzialna jest za integrację z interfejsem API OpenRouter. Jej głównym zadaniem jest uzupełnienie czatów opartych na LLM poprzez wysyłanie komunikatów systemowych i użytkownika oraz odbieranie ustrukturyzowanych odpowiedzi opartych o schemat JSON.

**Kluczowe komponenty:**

1. **Moduł API Client** - komunikuje się z interfejsem API OpenRouter, realizując wysyłkę żądań i odbiór odpowiedzi.
2. **Menedżer sesji czatu** - zarządza stanem sesji, przechowując historię komunikatów oraz ustawienia kontekstu dla rozmowy.
3. **Message Formatter** - odpowiedzialny za formatowanie komunikatów (systemowych, użytkownika) oraz przygotowanie właściwego `response_format`.
4. **Handler Błędów** - centralny mechanizm zarządzania błędami, odpowiada za logowanie błędów i informowanie systemu o nieudanych operacjach.

---

## 2. Opis konstruktora

Konstruktor usługi powinien inicjalizować podstawowe zależności:

- Konfigurację połączenia do OpenRouter API (klucze API, adres endpointu, model domyślny).
- Inicjalizację stanu sesji czatu.
- Ustawienia domyślne dla komunikatów systemowych i użytkownika.
- Mechanizm logowania i obsługi błędów.

---

## 3. Publiczne metody i pola

### Metody

1. **sendMessage(message: string, type: 'system' | 'user'): Promise<Response>**
   - Wysyła komunikat do OpenRouter API, gdzie `type` określa czy komunikat pochodzi od systemu czy użytkownika.
2. **setResponseFormat(format: { type: string, json_schema: { name: string, strict: boolean, schema: object } }): void**
   - Konfiguruje format odpowiedzi, wymagany do ustrukturyzowanych danych.
3. **configureModel(options: { modelName: string, parameters: object }): void**
   - Ustawia nazwę modelu i jego parametry (np. temperatura, max_tokens, itd.).
4. **getSessionHistory(): Array<Message>**
   - Zwraca historię komunikatów w bieżącej sesji.

### Pola

1. **apiEndpoint: string** - Adres endpointu OpenRouter API.
2. **apiKey: string** - Klucz autoryzacji do korzystania z API.
3. **sessionHistory: Array<Message>** - Lista komunikatów wysłanych i otrzymanych podczas sesji.
4. **responseFormat: object** - Aktualnie skonfigurowany format odpowiedzi.
5. **modelConfig: object** - Konfiguracja modelu (nazwa, parametry).

---

## 4. Prywatne metody i pola

### Metody

1. **_formatMessage(message: string, type: 'system' | 'user'): object**
   - Prywatna metoda formatująca komunikat do API.
2. **_handleApiResponse(response: any): Response**
   - Prywatna metoda odpowiedzialna za wstępną walidację i przetwarzanie odpowiedzi z API.
3. **_logError(error: Error): void**
   - Prywatna metoda do logowania błędów, która umożliwia dalszą analizę przyczyn problemów.

### Pola

1. **_httpClient: HttpClient** - Prywatny klient HTTP wykorzystywany do komunikacji z API.
2. **_config: object** - Wewnętrzne ustawienia konfiguracyjne dla sesji.

---

## 5. Obsługa błędów

### Scenariusze błędów:

1. **Błąd autoryzacji** - Nieprawidłowy lub wygasły klucz API.
2. **Błąd połączenia** - Problemy z siecią lub endpointem API (timeout, niedostępność).
3. **Nieprawidłowy format odpowiedzi** - Otrzymanie odpowiedzi niezgodnej z oczekiwanym schematem.
4. **Błąd formatu komunikatu** - Błędna strukturalizacja wysyłanych danych, np. brak wymaganego `response_format`.

### Rozwiązania:

1. **Retry Mechanism** - Automatyczna ponowna próba połączenia przy błędach połączeniowych.
2. **Fallback Procedures** - Alternatywne ścieżki obsługi gdy odpowiedź jest niezgodna ze schematem.
3. **Centralne Logowanie** - Wszystkie błędy są zapisywane i analizowane przez centralny system logowania.
4. **Input Validation** - Walidacja danych wysyłanych do API, aby zapobiegać błędom formatu.

---

## 6. Kwestie bezpieczeństwa

1. **Przechowywanie Klucza API**:
   - Używanie bezpiecznych mechanizmów przechowywania sekretów (np. zmienne środowiskowe, usługi vault).
2. **Komunikacja Szyfrowana**:
   - Korzystanie z HTTPS dla wszystkich połączeń z API.
3. **Ograniczenie Uprawnień**:
   - Minimalizacja zakresu uprawnień klucza API do niezbędnych operacji.

---

## 7. Plan wdrożenia krok po kroku

1. **Inicjalizacja projektu**
   - Dodanie konfiguracji OpenRouter API do plików konfiguracyjnych aplikacji (np. `.env`).
   - Weryfikacja połączenia z API poprzez prosty testowy request.

2. **Implementacja Modułu API Client**
   - Stworzenie modułu odpowiedzialnego za autoryzację i komunikację z OpenRouter API.
   - Zaimplementowanie metody `sendMessage`, wykorzystującej _httpClient do wysłania danych.

3. **Implementacja Menedżera Sesji Czatów**
   - Utworzenie mechanizmu przechowywania historii wiadomości oraz ich formatowania.
   - Integracja z front-endem, aby zarządzać sesjami na poziomie użytkownika.

4. **Konfiguracja Komponentu Message Formatter**
   - Opracowanie metod do formatowania komunikatów:
     - Komunikat systemowy (np. "Witaj, oto konfiguracja systemowa...").
     - Komunikat użytkownika (przekazywany bezpośrednio od użytkownika).
     - Przygotowywanie `response_format`:
       - Przykład: `{ type: 'json_schema', json_schema: { name: 'openrouter_response', strict: true, schema: { result: 'string', details: 'object' } } }`
     - Ustawienie nazwy modelu (np. `gpt-4`) oraz parametrów (np. `{ temperature: 0.7, max_tokens: 500 }`).

5. **Implementacja Centralnego Handlera Błędów**
   - Wdrożenie globalnego mechanizmu logowania błędów.
   - Dodanie procedury fallback dla krytycznych błędów, zapewniającej powiadomienie i ponowną próbę połączenia.

---

**Konfiguracja elementów OpenRouter API:**

1. **Komunikat systemowy**
   - Sposób: Wstępne ustawienie komunikatu inicjującego konwersację, np. "System: Inicjalizacja sesji z OpenRouter.".
2. **Komunikat użytkownika**
   - Sposób: Przekazywanie wiadomości użytkownika bezpośrednio do metody `sendMessage`.
3. **Response_format**
   - Sposób: Konfiguracja formatów odpowiedzi zgodnie z przykładem:

     ```json
     { "type": "json_schema", "json_schema": { "name": "openrouter_response", "strict": true, "schema": { "result": "string", "details": "object" } } }
     ```

4. **Nazwa modelu**
   - Sposób: Ustawienie pola `modelConfig.modelName` na przykład `gpt-4`.
5. **Parametry modelu**
   - Sposób: Konfiguracja dodatkowych parametrów, takich jak `temperature`, `max_tokens`, które będą przekazywane przy każdym żądaniu do API.

---

## Podsumowanie

Plan wdrożenia usługi OpenRouter obejmuje kompletne wdrożenie kluczowych komponentów: od modułu API Client, przez sesje czatu, formatowanie komunikatów, aż po centralną obsługę błędów. Podejście to uwzględnia specyfikę technologii wykorzystywanych w projekcie oraz najlepsze praktyki w zakresie bezpieczeństwa i niezawodności.

Każdy krok wdrożenia został zaprojektowany tak, aby można go było łatwo zintegrować z istniejącym stosowaną architekturą oraz zapewnić spójną, stabilną i skalowalną komunikację z OpenRouter API.

