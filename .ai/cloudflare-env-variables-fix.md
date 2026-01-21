# Cloudflare Pages - Konfiguracja Zmiennych Środowiskowych

## Problem

Strona pokazuje HTTP 500 z powodu nieprawidłowej konfiguracji zmiennych środowiskowych.

## Przyczyna

1. **Kod próbował użyć `import.meta.env` w runtime** - `supabaseClient` był inicjalizowany podczas importu modułu, co powodowało błąd w Cloudflare Pages runtime gdzie `import.meta.env` jest undefined
2. **Zmienne w Dashboard były ustawione jako "Plaintext"** - w Cloudflare Pages, zmienne Plaintext są dostępne TYLKO podczas buildu, NIE w runtime

## Rozwiązanie

### ✅ Krok 1: Naprawiono Kod (ZROBIONE)

Commit: `30d38f8` - "Fix: Remove unused browser client that caused runtime errors in Cloudflare Pages"

Usunięto:
- `createSupabaseBrowserClient()` - nieużywana funkcja
- `supabaseClient` - nieużywana zmienna inicjalizowana w module scope

Skutek: Kod nie próbuje już używać `import.meta.env` w module scope.

### 🔧 Krok 2: Konfiguracja Cloudflare Dashboard (DO ZROBIENIA)

#### A. Przejdź do Cloudflare Dashboard

1. Otwórz: https://dash.cloudflare.com
2. Przejdź do: **Workers & Pages** → **10x-cards** → **Settings** → **Variables and Secrets**

#### B. Usuń Zmienne Plaintext (jeśli istnieją)

Usuń następujące zmienne **PLAINTEXT** (jeśli są):
- ❌ `SUPABASE_URL` (Plaintext)
- ❌ `SUPABASE_KEY` (Plaintext)
- ❌ `OPENROUTER_API_KEY` (Plaintext)

**UWAGA:** `SUPABASE_URL` NIE POWINIEN być w Dashboard! Jest już w `wrangler.toml` jako public variable.

#### C. Dodaj Zmienne Secret (Encrypted)

Dodaj następujące zmienne jako **Type: Secret (Encrypted)**:

1. **SUPABASE_KEY**
   - Type: **Secret (Encrypted)**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (klucz anon/public z Supabase Dashboard)
   - Environment: **Production**

2. **OPENROUTER_API_KEY**
   - Type: **Secret (Encrypted)**
   - Value: `sk-or-v1-...` (klucz API z OpenRouter Dashboard)
   - Environment: **Production**

#### D. Zapisz i Poczekaj na Redeploy

Po dodaniu zmiennych:
- GitHub Actions automatycznie wykona nowy deployment (2-3 minuty)
- **LUB** w Cloudflare Dashboard: **Deployments** → najnowszy → **"Retry deployment"**

## Jak To Działa Teraz

### Build Time (GitHub Actions)
```
├─ Używa GitHub Environment Secrets
├─ import.meta.env.SUPABASE_URL ✅
├─ import.meta.env.SUPABASE_KEY ✅
└─ import.meta.env.OPENROUTER_API_KEY ✅
```

### Runtime (Cloudflare Pages)
```
├─ locals.runtime.env.SUPABASE_URL ✅ (z wrangler.toml [vars])
├─ locals.runtime.env.SUPABASE_KEY ✅ (z Dashboard Secret)
└─ locals.runtime.env.OPENROUTER_API_KEY ✅ (z Dashboard Secret)
```

## Weryfikacja

Po zakończeniu deploymentu:

1. **Sprawdź URL deploymentu** w GitHub Actions:
   - Przejdź do: https://github.com/mateuszhadrian/10x-cards/actions
   - Otwórz najnowszy workflow "Deploy to Cloudflare Pages"
   - Znajdź URL w output'cie job'a "deploy"

2. **Otwórz stronę w przeglądarce**:
   - Powinna załadować się strona logowania
   - **Brak błędu HTTP 500** ✅

3. **Sprawdź logi w Cloudflare Dashboard** (jeśli nadal są błędy):
   - Cloudflare Dashboard → Workers & Pages → 10x-cards → Deployments
   - Kliknij najnowszy deployment → Functions tab
   - Sprawdź Real-time Logs

## Kluczowe Różnice: Plaintext vs Secret

| Typ | Build Time | Runtime | Użycie |
|-----|-----------|---------|--------|
| **Plaintext** | ✅ Dostępne | ❌ **NIE** dostępne | Public config (URLs, flags) |
| **Secret (Encrypted)** | ❌ NIE dostępne | ✅ **Dostępne** | API keys, passwords |
| **wrangler.toml [vars]** | ✅ Dostępne | ✅ Dostępne | Public runtime config |

## Troubleshooting

### Nadal HTTP 500?

1. **Sprawdź logi w Cloudflare Dashboard** (Real-time Logs)
2. **Sprawdź czy zmienne są ustawione jako Secret** (nie Plaintext!)
3. **Sprawdź czy są w Production environment**
4. **Retry deployment** w Cloudflare Dashboard
5. **Sprawdź wartości zmiennych** (czy nie mają białych znaków na początku/końcu)

### Jak dostać klucze API?

**SUPABASE_KEY:**
- Supabase Dashboard → Project → Settings → API
- **Skopiuj: "anon public" key** (NIE service_role!)

**OPENROUTER_API_KEY:**
- OpenRouter Dashboard → Keys
- **Skopiuj: API Key** (format: `sk-or-v1-...`)

## Podsumowanie

1. ✅ **Kod naprawiony** - usunięto problematyczne użycia `import.meta.env`
2. 🔧 **DO ZROBIENIA** - skonfiguruj zmienne Secret w Cloudflare Dashboard
3. ⏳ **Poczekaj 2-3 minuty** na auto-deployment
4. 🎉 **Strona powinna działać!**
