## Schemat Bazy Danych - 10x-cards

### 1. Tabele i kolumny

#### a) `users`
- `id` - BIGSERIAL PRIMARY KEY
- `email` - VARCHAR(255) NOT NULL UNIQUE
- `password_hash` - VARCHAR NOT NULL
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at` - TIMESTAMP WITH TIME ZONE

#### b) `flashcards`
- `id` - BIGSERIAL PRIMARY KEY
- `user_id` - INTEGER NOT NULL
  - FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- `front` - VARCHAR(200) NOT NULL
  - CHECK (LENGTH(front) BETWEEN 1 AND 200)
- `back` - VARCHAR(500) NOT NULL
  - CHECK (LENGTH(back) BETWEEN 1 AND 500)
- `source` - VARCHAR(255) CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- `generation_id` - INTEGER
  - FOREIGN KEY (`generation_id`) REFERENCES `generations`(`id`) ON DELETE SET NULL
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at` - TIMESTAMP WITH TIME ZONE
- `is_deleted` - BOOLEAN NOT NULL DEFAULT FALSE

#### c) `generations`
- `id` - BIGSERIAL PRIMARY KEY
- `user_id` - INTEGER NOT NULL
  - FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- `source_text_hash` - VARCHAR(64)
- `source_text_length` - INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- `generation_duration` - INTEGER NOT NULL
- `model` - VARCHAR(100)
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at` - TIMESTAMP WITH TIME ZONE

#### d) `generations_errors`
- `id` - SERIAL PRIMARY KEY
- `generation_id` - INTEGER NOT NULL
  - FOREIGN KEY (`generation_id`) REFERENCES `generations`(`id`) ON DELETE CASCADE
- `error_message` - TEXT NOT NULL
- `model` - VARCHAR(100)
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

### 2. Relacje między tabelami

- **Użytkownicy a Fiszki**: Relacja jeden-do-wielu. Każdy rekord w tabeli `users` może posiadać wiele rekordów w tabeli `flashcards` (przez `user_id`).
- **Użytkownicy a Generations**: Relacja jeden-do-wielu. Każdy rekord w tabeli `users` może posiadać wiele rekordów w tabeli `generations` (przez `user_id`).
- **Generations a Flashcards**: Opcjonalna relacja. Fiszka (`flashcards`) może być powiązana z rekordem w tabeli `generations` (przez `generation_id`).
- **Generations a Generations_Errors**: Relacja jeden-do-wielu. Każdy proces generacji (`generations`) może mieć wiele błędów zapisanych w tabeli `generations_errors`.

### 3. Indeksy

- Indeks na kolumnie `user_id` w tabeli `flashcards` dla przyspieszenia zapytań filtrowanych po użytkowniku.
- Indeks na kolumnie `user_id` w tabeli `generations`.
- Dodatkowy indeks na `generation_id` w tabeli `flashcards`.
- Indeksy na kolumnach unikalnych lub często używanych w filtracji (np. `email` w tabeli `users`).

### 4. Zasady PostgreSQL (RLS)

Dla tabel `flashcards` i `generations` wdrożyć mechanizm Row Level Security (RLS), aby użytkownicy mieli dostęp tylko do swoich danych. Przykładowe zasady:

- Włączenie RLS:
  ```sql
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
  ```

- Polityka przykładowa (do dostosowania w zależności od sposobu uwierzytelnienia):
  ```sql
  CREATE POLICY user_policy ON flashcards
    USING (user_id = current_setting('app.current_user_id')::INTEGER);

  CREATE POLICY user_policy ON generations
    USING (user_id = current_setting('app.current_user_id')::INTEGER);
  ```

*Uwaga*: Mechanizm `current_setting('app.current_user_id')` wymaga ustawienia tego parametru przy każdej sesji. Dostosować polityki w zależności od implementacji autoryzacji.

### 5. Dodatkowe Uwagi

- Schemat baza danych jest zaprojektowany zgodnie z zasadami 3NF, z odpowiednimi ograniczeniami i indeksami dla wydajności.
- Ograniczenia CHECK zapewniają walidację długości danych wejściowych zgodnie z wymaganiami (np. `front`, `back`, `input_text`).
- Uwzględniono kolumny pomocnicze (`created_at`, `updated_at`, `is_deleted`) do audytu i zarządzania danymi.
- Strategia indeksowania będzie rozwijana w przyszłości wraz z potrzebami filtrowania słów kluczowych na poziomie aplikacji.
- Tabela `users` jest obsługiwana przez Supabase Auth, co umożliwia zarządzanie rejestracją i logowaniem przez Supabase.

---

Schemat ten stanowi podstawę do tworzenia migracji bazy danych w projekcie 10x-cards i może być rozszerzany o dodatkowe funkcjonalności w miarę rozwoju systemu.
