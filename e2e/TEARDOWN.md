# Global Teardown - Database Cleanup

## Overview

Global teardown automatycznie czyści bazę danych z testowych danych po zakończeniu wszystkich testów E2E.

## Jak Działa

### Kiedy Się Uruchamia

Teardown uruchamia się **raz** po zakończeniu wszystkich testów, niezależnie od tego czy testy przeszły czy nie.

```
Setup (raz) → Wszystkie testy → Teardown (raz)
    ↓              ↓                  ↓
  Login      Test 1, 2, 3...    Cleanup DB
```

### Co Czyści

Teardown usuwa **wszystkie dane** należące do testowego użytkownika:

1. **Flashcards** - wszystkie fiszki utworzone podczas testów
2. **Generations** - wszystkie generacje AI utworzone podczas testów
3. **Generation Errors** - wszystkie błędy generacji (jeśli istnieją)

### Jak Identyfikuje Testowe Dane

Używa `E2E_USERNAME_ID` z `.env.test` aby zidentyfikować użytkownika testowego:

```bash
E2E_USERNAME_ID=cbf4435a-693d-4051-9f6c-fab4a4c37229
```

Wszystkie dane z `user_id` równym tej wartości są usuwane.

## Implementacja

### Plik Teardown

**Lokalizacja:** `e2e/global.teardown.ts`

```typescript
async function globalTeardown() {
  // 1. Połącz się z Supabase
  const supabase = createClient(url, key);
  
  // 2. Zaloguj jako test user (bypass RLS)
  await supabase.auth.signInWithPassword({ email, password });
  
  // 3. Usuń flashcards
  await supabase.from('flashcards')
    .delete()
    .eq('user_id', testUserId);
  
  // 4. Usuń generations
  await supabase.from('generations')
    .delete()
    .eq('user_id', testUserId);
  
  // 5. Usuń generation errors
  await supabase.from('generations_errors')
    .delete()
    .eq('user_id', testUserId);
  
  // 6. Wyloguj
  await supabase.auth.signOut();
}
```

### Konfiguracja

**Lokalizacja:** `playwright.config.ts`

```typescript
export default defineConfig({
  globalTeardown: './e2e/global.teardown.ts',
  // ... rest of config
});
```

## Korzyści

### 1. Czysta Baza po Każdym Uruchomieniu

Testy zawsze zaczynają od czystego stanu, bez "brudnych danych" z poprzednich uruchomień.

### 2. Idempotencja Testów

Testy mogą być uruchamiane wielokrotnie bez akumulacji danych:

```bash
# Pierwsze uruchomienie
npm run test:e2e  # Tworzy 50 flashcards → Teardown usuwa

# Drugie uruchomienie
npm run test:e2e  # Znowu tworzy 50 flashcards → Teardown usuwa

# Baza danych zawsze czysta!
```

### 3. Nie Zaśmieca Produkcji

Jeśli przypadkowo uruchomisz testy na produkcyjnej bazie (NIE RÓB TEGO!), teardown automatycznie wyczyści testowe dane.

### 4. Łatwiejsze Debugowanie

Możesz ręcznie sprawdzić bazę podczas testów, a teardown wyczyści za Ciebie:

```bash
# Uruchom testy
npm run test:e2e

# Sprawdź bazę (dane testowe są tam)
# ...

# Testy się kończą
# → Teardown automatycznie czyści

# Baza jest czysta!
```

## Logi

Teardown pokazuje szczegółowe logi w konsoli:

```bash
🧹 Starting global teardown - cleaning test data...

✓ Authenticated as test user
✓ Deleted 15 flashcard(s)
✓ Deleted 3 generation(s)
✓ Signed out test user

✅ Global teardown completed successfully
```

## Troubleshooting

### ⚠️ "E2E_USERNAME_ID not set"

**Problem:** Brak zmiennych środowiskowych

**Rozwiązanie:** Upewnij się że `.env.test` istnieje i zawiera:

```bash
E2E_USERNAME_ID=your-test-user-uuid
E2E_USERNAME=test@example.com
E2E_PASSWORD=password123
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLIC_KEY=your-public-key
```

### ❌ "Failed to authenticate for teardown"

**Problem:** Niepoprawne credentials lub użytkownik nie istnieje

**Rozwiązanie:** Sprawdź credentials w `.env.test`:

```bash
# Test login manually
curl -X POST https://your-project.supabase.co/auth/v1/token \
  -H "apikey: your-public-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### ❌ "Failed to delete flashcards"

**Przyczyny:**
1. RLS policies blokują usuwanie
2. Użytkownik nie jest właścicielem danych
3. Foreign key constraints

**Rozwiązanie:** Sprawdź RLS policies w Supabase:

```sql
-- Powinna być policy zezwalająca na DELETE
SELECT * FROM pg_policies WHERE tablename = 'flashcards';
```

### ℹ️ Teardown się pominął (warnings)

To normalne! Teardown nie failuje testów jeśli nie może wyczyścić bazy.

Pokazuje warnings ale kontynuuje:

```bash
⚠️  Warning: SUPABASE_URL not set, skipping teardown
```

## Wyłączenie Teardown

Jeśli chcesz **wyłączyć** teardown (np. do debugowania):

### Opcja 1: Zakomentuj w config

```typescript
export default defineConfig({
  // globalTeardown: './e2e/global.teardown.ts', // Commented out
  // ...
});
```

### Opcja 2: Usuń zmienne środowiskowe

```bash
# Tymczasowo zmień nazwę .env.test
mv .env.test .env.test.backup

# Uruchom testy (teardown się pominie)
npm run test:e2e

# Przywróć
mv .env.test.backup .env.test
```

## Ręczne Czyszczenie

Możesz też wyczyścić bazę ręcznie:

```bash
# Uruchom tylko teardown
npx tsx e2e/global.teardown.ts
```

Lub w Supabase SQL Editor:

```sql
-- UWAGA: To usunie WSZYSTKIE dane testowego użytkownika!
DELETE FROM flashcards WHERE user_id = 'cbf4435a-693d-4051-9f6c-fab4a4c37229';
DELETE FROM generations WHERE user_id = 'cbf4435a-693d-4051-9f6c-fab4a4c37229';
DELETE FROM generations_errors WHERE user_id = 'cbf4435a-693d-4051-9f6c-fab4a4c37229';
```

## Best Practices

### 1. Osobny Użytkownik Testowy

**ZAWSZE** używaj dedykowanego użytkownika testowego:

```bash
# ✅ Good
E2E_USERNAME=e2e-test@example.com

# ❌ Bad - NIE używaj prawdziwego konta!
E2E_USERNAME=my-real-account@gmail.com
```

### 2. Oddzielna Baza dla Testów

Najlepiej mieć osobną instancję Supabase dla testów:

```bash
# Production
SUPABASE_URL=https://prod.supabase.co

# Testing
SUPABASE_URL=https://test.supabase.co  # .env.test
```

### 3. Nie Commituj Credentials

`.env.test` jest w `.gitignore` - trzymaj credentials lokalnie!

### 4. CI/CD

W CI/CD użyj secrets dla testowych credentials:

```yaml
# GitHub Actions
env:
  E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
  E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
  E2E_USERNAME_ID: ${{ secrets.E2E_USERNAME_ID }}
```

## Podsumowanie

✅ **Setup** - Loguje użytkownika raz przed testami  
✅ **Tests** - Tworzą dane testowe  
✅ **Teardown** - Czyści dane po testach  

Rezultat: **Czysta baza, idempotentne testy, łatwe debugowanie!** 🎉
