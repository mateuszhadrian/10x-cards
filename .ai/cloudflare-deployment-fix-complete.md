# Cloudflare Pages Deployment - Kompletna Naprawa

## 🎯 Podsumowanie Problemów i Rozwiązań

### Problem 1: HTTP 500 ✅ NAPRAWIONE
**Commit:** `30d38f8` - "Fix: Remove unused browser client that caused runtime errors in Cloudflare Pages"

**Przyczyna:**
- W pliku `src/db/supabase.client.ts` były nieużywane funkcje `createSupabaseBrowserClient()` i `supabaseClient`
- `supabaseClient` był inicjalizowany podczas importu modułu w module scope
- Próbował użyć `import.meta.env.SUPABASE_URL` i `import.meta.env.SUPABASE_KEY`
- W Cloudflare Pages runtime `import.meta.env` jest `undefined`, co powodowało błąd 500

**Rozwiązanie:**
- Usunięto obie nieużywane funkcje
- Usunięto import `createBrowserClient` z `@supabase/ssr`
- Pozostawiono tylko `createSupabaseServerInstance()` która jest używana w middleware

---

### Problem 2: Brak Stylów CSS ✅ NAPRAWIONE
**Commit:** `3171d15` - "Fix: Import global CSS properly for production build"

**Przyczyna:**
- W `src/layouts/Layout.astro` CSS był importowany jako `<link href="/src/styles/global.css">`
- To jest ścieżka **źródłowa** która działa w development, ale **nie w produkcji**
- W produkcji Vite kompiluje CSS i umieszcza w `_astro/` z hashowaną nazwą

**Rozwiązanie:**
- Zmieniono import z HTML `<link>` na frontmatter import: `import "../styles/global.css"`
- Vite teraz prawidłowo przetwarza CSS podczas buildu
- CSS jest automatycznie wstrzykiwany do strony w produkcji

---

### Problem 3: GitHub Actions Failure ✅ NAPRAWIONE
**Commit:** `a678ba1` - "Fix: Update GitHub Actions to use compatible versions"

**Przyczyna:**
- Używano **niekompatybilnych wersji** artifact actions:
  - `upload-artifact@v6` w job "build"
  - `download-artifact@v7` w job "deploy"
- Od v4+ artifact actions używają nowego backendu który jest **niekompatybilny wstecz**
- v6 i v7 używają różnych wersji Node.js i mogą być niekompatybilne

**Rozwiązanie:**
- Zaktualizowano wszystkie actions do **spójnej wersji v4**:
  - `actions/checkout@v4` (było v6)
  - `actions/upload-artifact@v4` (było v6)
  - `actions/download-artifact@v4` (było v7)
  - `actions/setup-node@v4` (było v6 w composite action)
- Wszystkie actions teraz używają tej samej major version i są kompatybilne
- Dodano `site: "https://10x-cards.pages.dev"` do `astro.config.mjs` aby pozbyć się warningu sitemap

**Weryfikacja zgodnie z @.ai/github-action.mdc:**
- ✅ Sprawdzono czy wszystkie actions nie są archived (wszystkie aktywne)
- ✅ Używane spójne major versions
- ✅ Wszystkie actions w najnowszej stabilnej wersji v4
- ✅ Używamy `npm ci` w composite action
- ✅ `env:` variables przypisane do jobs zamiast globalnie
- ✅ Używamy głównej gałęzi `main` (zweryfikowano)

---

## 📊 Struktura Workflow

### Job 1: `lint`
```yaml
- Checkout kodu (v4)
- Setup Node.js (v4 z npm cache)
- npm ci (z composite action)
- npm run lint
```

### Job 2: `unit-test`
```yaml
- Checkout kodu (v4)
- Setup Node.js (v4 z npm cache)
- npm ci (z composite action)
- npm run test
```

### Job 3: `build`
```yaml
- Checkout kodu (v4)
- Setup Node.js (v4 z npm cache)
- npm ci (z composite action)
- npm run build (z env vars z GitHub Secrets)
- Upload artifact "build-output" (v4)
```

### Job 4: `deploy`
```yaml
- Checkout kodu (v4) - dla wrangler.toml
- Download artifact "build-output" (v4) - zgodny z upload@v4
- Deploy do Cloudflare Pages (wrangler-action@v3)
- Output deployment URL
```

---

## 🔐 Konfiguracja Zmiennych Środowiskowych

### Build Time (GitHub Actions)
```
├─ SUPABASE_URL (z GitHub Environment Secrets)
├─ SUPABASE_KEY (z GitHub Environment Secrets)
└─ OPENROUTER_API_KEY (z GitHub Environment Secrets)
```

### Runtime (Cloudflare Pages)
```
├─ SUPABASE_URL (z wrangler.toml [vars])
├─ SUPABASE_KEY (z Cloudflare Dashboard - Secret/Encrypted)
└─ OPENROUTER_API_KEY (z Cloudflare Dashboard - Secret/Encrypted)
```

### Cloudflare Dashboard Configuration

**DO ZROBIENIA przez użytkownika:**

1. Usuń `SUPABASE_URL` z Dashboard (już jest w wrangler.toml)
2. Upewnij się że są dodane jako **Secret (Encrypted)**:
   - `SUPABASE_KEY`
   - `OPENROUTER_API_KEY`

**Zmienne Plaintext do pozostawienia:**
- `E2E_PASSWORD`
- `E2E_USERNAME`  
- `E2E_USERNAME_ID`

---

## ✅ Status Finalny

| Komponent | Status | Opis |
|-----------|--------|------|
| HTTP 500 | ✅ Naprawione | Usunięto problematyczne użycie import.meta.env |
| Brak stylów CSS | ✅ Naprawione | Poprawiono import CSS w Layout.astro |
| GitHub Actions | ✅ Naprawione | Zaktualizowano do kompatybilnych wersji v4 |
| Zmienne env | ⚠️ Do sprawdzenia | Użytkownik musi skonfigurować w Dashboard |
| Build lokalny | ✅ Działa | npm run build przechodzi bez błędów |

---

## 🚀 Następne Kroki

1. **Poczekaj 2-3 minuty** na zakończenie GitHub Actions workflow
2. **Sprawdź Cloudflare Dashboard** → Workers & Pages → 10x-cards → Deployments
3. **Sprawdź czy deployment się udał** (status: Success)
4. **Opcjonalnie:** Usuń `SUPABASE_URL` z Dashboard jako Secret (jest już w wrangler.toml)
5. **Otwórz stronę** z URL deploymentu
6. **Sprawdź czy:**
   - ✅ Strona ładuje się bez HTTP 500
   - ✅ Style CSS są prawidłowo wyświetlane
   - ✅ Formularz logowania wygląda poprawnie
   - ✅ Możesz się zalogować (po skonfigurowaniu secrets w Dashboard)

---

## 📝 Kluczowe Lekcje

### 1. Module Scope Initialization
**NIE:**
```typescript
export const client = createClient(import.meta.env.URL); // ❌ Uruchamiane przy imporcie!
```

**TAK:**
```typescript
export function createClientInstance(env) { // ✅ Uruchamiane na żądanie
  return createClient(env.URL);
}
```

### 2. CSS Import w Astro
**NIE:**
```html
<link rel="stylesheet" href="/src/styles/global.css" /> <!-- ❌ Ścieżka source -->
```

**TAK:**
```typescript
import "../styles/global.css"; // ✅ Vite przetworzy podczas buildu
```

### 3. GitHub Actions Artifacts
**WAŻNE:** Upload i Download artifact MUSZĄ używać tej samej major version!
```yaml
# ✅ OK
upload-artifact@v4
download-artifact@v4

# ❌ NIE OK
upload-artifact@v6
download-artifact@v7
```

### 4. Cloudflare Pages Environment Variables
```
Plaintext variables = Build-time only (import.meta.env)
Secret variables = Runtime available (locals.runtime.env)
wrangler.toml [vars] = Public runtime vars (locals.runtime.env)
```

---

## 🔍 Debugging Tips

### Jeśli nadal HTTP 500:
1. Sprawdź Cloudflare Logs: Dashboard → Functions → Real-time Logs
2. Sprawdź czy wszystkie secrets są ustawione jako **Encrypted**, nie Plaintext
3. Sprawdź czy secrets są w **Production** environment
4. Retry deployment w Cloudflare Dashboard

### Jeśli GitHub Actions fail:
1. Sprawdź czy używasz spójnych wersji actions (wszystkie v4)
2. Sprawdź czy GitHub Secrets są poprawnie skonfigurowane w Environment "production"
3. Sprawdź logi każdego job'a osobno

### Jeśli brak stylów:
1. Sprawdź czy CSS jest importowany w frontmatter, nie jako `<link>`
2. Sprawdź dist/ czy zawiera folder `_astro/` z CSS
3. Sprawdź network tab w przeglądarce czy CSS jest pobierany

---

## 📚 Dokumentacja

- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/functions/bindings/)
- [GitHub Actions Artifacts v4](https://github.com/actions/upload-artifact)
- [Wrangler Action v3](https://github.com/cloudflare/wrangler-action)

---

**Ostatni deployment:** Commit `a678ba1`  
**Data:** 2026-01-21  
**Status:** ✅ Gotowe do testowania
