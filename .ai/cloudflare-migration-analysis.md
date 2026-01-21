# Analiza Migracji: Astro Node.js → Cloudflare Pages

**Data analizy:** 2026-01-21  
**Wersja aplikacji:** 0.0.1  
**Aktualny adapter:** `@astrojs/node` (standalone mode)  
**Docelowy adapter:** `@astrojs/cloudflare`

---

## 📊 Podsumowanie Wykonawcze

Aplikacja **10x-cards** jest **bardzo blisko** gotowości na Cloudflare Workers Runtime. Analiza kodu wykazała **tylko jedną krytyczną zależność** od Node.js runtime (`crypto` module) oraz kilka drobnych zmian w konfiguracji.

**Ocena złożoności migracji:** 🟢 **NISKA** (szacowany czas: ~1 godzina + testing)

---

## 🎯 Analiza Głównego Frameworka

### Aktualny Stan

**Framework:** Astro 5  
**Adapter:** `@astrojs/node` (standalone mode)  
**Model operacyjny:** Server-Side Rendering (SSR)

```javascript
// astro.config.mjs (linia 17-19)
adapter: node({
  mode: "standalone",
}),
```

**Implikacje:**
- Aplikacja wymaga aktywnego środowiska Node.js do obsługi żądań
- Renderowanie dynamicznych komponentów React
- Obsługa sesji użytkowników (Supabase Auth)
- API endpoints dla komunikacji z bazą danych i OpenRouter

---

## 🔍 Audyt Kompatybilności

### ✅ Komponenty Kompatybilne z Cloudflare Workers

| Komponent | Status | Uwagi |
|-----------|--------|-------|
| **@supabase/ssr** | ✅ Pełna kompatybilność | Używa standardowych Web APIs |
| **Fetch API** | ✅ Natywnie wspierane | OpenRouter service będzie działać bez zmian |
| **setTimeout/setInterval** | ✅ Wspierane | Używane w retry logic |
| **AbortController** | ✅ Wspierane | Używane w timeout mechanizmie |
| **JSON.parse/stringify** | ✅ Standard JavaScript | Bez problemów |
| **Headers API** | ✅ Web Standard | Pełna kompatybilność |
| **Cookies API** | ✅ Web Standard | Supabase cookie handling będzie działać |
| **Environment Variables** | ✅ Wspierane | Dostępne przez `import.meta.env` |
| **React 19** | ✅ Pełna kompatybilność | Client-side JavaScript |
| **Tailwind CSS** | ✅ Pełna kompatybilność | CSS/Build time |

### ❌ Komponenty Wymagające Migracji

| Komponent | Lokalizacja | Problem | Rozwiązanie |
|-----------|-------------|---------|-------------|
| **Node.js `crypto`** | `src/lib/services/generations.service.ts:1` | Moduł niedostępny w Workers | Web Crypto API |

---

## 🛠️ Wymagane Zmiany

### 1. Instalacja Adaptera Cloudflare

```bash
# Instalacja nowego adaptera
npm install @astrojs/cloudflare

# Usunięcie starego adaptera
npm uninstall @astrojs/node
```

**Zależności:**
- `@astrojs/cloudflare` - oficjalny adapter dla Cloudflare Pages/Workers
- Kompatybilny z Astro 5.x

---

### 2. Modyfikacja Konfiguracji Astro

**Plik:** `astro.config.mjs`

**Obecna konfiguracja (linie 7, 17-19):**

```javascript
import node from "@astrojs/node";

// ...

adapter: node({
  mode: "standalone",
}),
```

**Nowa konfiguracja:**

```javascript
import cloudflare from '@astrojs/cloudflare';

// ...

adapter: cloudflare({
  mode: 'directory', // lub 'advanced' dla większej kontroli
  imageService: 'cloudflare', // opcjonalnie: optymalizacja obrazów
  functionPerRoute: false, // pojedyncza funkcja dla całej aplikacji (tańsze)
}),
```

**Opcje konfiguracji:**

- **`mode: 'directory'`** - Standardowy tryb (rekomendowany dla większości projektów)
- **`mode: 'advanced'`** - Większa kontrola nad output directory
- **`imageService: 'cloudflare'`** - Wykorzystanie Cloudflare Image Resizing (wymaga płatnego planu)
- **`functionPerRoute`** - `false` = jedna Worker function dla całej aplikacji (tańsze, limity per-app)

---

### 3. ⚠️ KRYTYCZNA ZMIANA: Migracja Node.js `crypto` → Web Crypto API

**Plik:** `src/lib/services/generations.service.ts`

#### Obecny Kod (linie 1, 24-26)

```typescript
import { createHash } from "crypto";

// ...

function generateTextHash(text: string): string {
  return createHash("md5").update(text, "utf8").digest("hex");
}
```

**Problem:**
- Cloudflare Workers **nie wspiera** modułu `crypto` z Node.js
- Jest to jedyna zależność od Node.js runtime w całej aplikacji

#### Rozwiązanie: Web Crypto API

**Opcja A: SHA-256 (REKOMENDOWANE)**

```typescript
/**
 * Generates a SHA-256 hash of the input text for deduplication.
 * Uses Web Crypto API (compatible with Cloudflare Workers)
 * 
 * SHA-256 is more secure than MD5 and provides excellent deduplication.
 * Note: Migrating from MD5 to SHA-256 means existing hashes won't match.
 * 
 * @param text - The text to hash
 * @returns A 64-character hex string representation of the SHA-256 hash
 */
async function generateTextHash(text: string): Promise<string> {
  // Encode text as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Generate SHA-256 hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
```

**Opcja B: MD5 w Pure JavaScript (jeśli wymagana kompatybilność wstecz)**

```typescript
// Wymagana instalacja: npm install js-md5
import md5 from 'js-md5';

function generateTextHash(text: string): string {
  return md5(text);
}
```

**Porównanie:**

| Aspekt | SHA-256 (Web Crypto) | MD5 (js-md5) |
|--------|---------------------|--------------|
| Bezpieczeństwo | ✅ Bardzo wysokie | ⚠️ Niskie (kolizje) |
| Wydajność | ✅ Natywna (szybsza) | ⚠️ JavaScript (wolniejsza) |
| Rozmiar hashu | 64 znaki | 32 znaki |
| Kompatybilność z istniejącymi | ❌ Nie | ✅ Tak |
| Dodatkowe zależności | ❌ Nie | ✅ Tak (js-md5) |

**Rekomendacja:** Użyj **SHA-256**, chyba że w produkcji są już dane z MD5 hashami.

---

### 4. Aktualizacja Wywołań `generateTextHash`

**Plik:** `src/lib/services/generations.service.ts` (linia 137)

#### Jeśli używasz SHA-256 (async)

**Obecny kod:**

```typescript
// Generate hash of the input text for deduplication (checksum)
const textHash = generateTextHash(inputText);
```

**Nowy kod:**

```typescript
// Generate hash of the input text for deduplication (checksum)
const textHash = await generateTextHash(inputText);
```

#### Jeśli używasz js-md5 (sync)

Kod pozostaje bez zmian (synchroniczny).

---

### 5. Migracja Bazy Danych (jeśli zmiana algorytmu hash)

**Sytuacja:** Jeśli zmienisz z MD5 na SHA-256, istniejące hashe w bazie danych nie będą pasować.

#### Opcja A: Reset Danych (dla aplikacji w fazie MVP)

```sql
-- Usuń wszystkie generations (wraz z powiązanymi flashcards przez CASCADE)
TRUNCATE TABLE generations CASCADE;
```

**Kiedy użyć:** Aplikacja nie ma jeszcze produkcyjnych użytkowników.

#### Opcja B: Dodanie Kolumny `hash_algorithm`

```sql
-- Dodaj kolumnę identyfikującą algorytm
ALTER TABLE generations 
ADD COLUMN hash_algorithm VARCHAR(10) DEFAULT 'md5';

-- Zaktualizuj wszystkie istniejące rekordy
UPDATE generations SET hash_algorithm = 'md5';

-- Dla nowych rekordów będzie używany 'sha256'
```

**Kod w aplikacji:**

```typescript
// Przy tworzeniu nowego generation
.insert({
  user_id: userId,
  model: "openai/gpt-4o-mini",
  source_text_length: inputText.length,
  source_text_hash: textHash,
  hash_algorithm: 'sha256', // <-- dodaj to pole
  generation_duration: 0,
})
```

#### Opcja C: Zmiana Kolumny na Nullable (akceptacja obu)

```sql
-- Pozwól na NULL dla starych rekordów
ALTER TABLE generations 
ALTER COLUMN source_text_hash DROP NOT NULL;
```

**Kod w aplikacji:**

```typescript
// Przy sprawdzaniu duplikatów (jeśli to implementujesz)
const { data: existing } = await supabase
  .from('generations')
  .select('id')
  .eq('source_text_hash', textHash)
  .eq('hash_algorithm', 'sha256') // <-- filtruj po algorytmie
  .single();
```

**Rekomendacja:** Dla projektu pobocznego: **Opcja A (reset)**. Dla startupu: **Opcja B**.

---

### 6. Konfiguracja Zmiennych Środowiskowych

#### Opcja A: Plik `wrangler.toml` (dla `wrangler dev`)

Utwórz plik `wrangler.toml` w głównym katalogu projektu:

```toml
name = "10x-cards"
compatibility_date = "2024-01-01"

# Public variables (non-sensitive)
[vars]
PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"

# Secrets (set via CLI):
# npx wrangler secret put SUPABASE_KEY
# npx wrangler secret put OPENROUTER_API_KEY
```

**Ustawienie sekretów:**

```bash
npx wrangler secret put SUPABASE_KEY
# Wklej wartość z .env

npx wrangler secret put OPENROUTER_API_KEY
# Wklej wartość z .env
```

#### Opcja B: Cloudflare Dashboard (dla produkcji)

1. Przejdź do: **Cloudflare Dashboard** → **Pages** → **10x-cards** → **Settings** → **Environment variables**
2. Dodaj:
   - `SUPABASE_URL` (public)
   - `SUPABASE_KEY` (encrypted)
   - `OPENROUTER_API_KEY` (encrypted)

**Dostęp w kodzie:**

```typescript
// Cloudflare automatycznie wstrzykuje zmienne do import.meta.env
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;
```

---

## 🧪 Testowanie Lokalne

### Krok 1: Build aplikacji

```bash
npm run build
```

**Oczekiwany output:**
- Folder `dist/` z plikami statycznymi
- Folder `dist/_worker.js/` z kodem Workers

### Krok 2: Test z Wrangler

```bash
# Instalacja Wrangler (jeśli nie masz)
npm install -D wrangler

# Uruchomienie lokalnego serwera Workers
npx wrangler pages dev ./dist
```

**Oczekiwany output:**

```
🚀 Starting local development server...
✨ Parsed wrangler.toml
⎔ Starting local server at http://localhost:8788
```

### Krok 3: Test Endpointów

```bash
# Test autentykacji
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test generowania fiszek
curl -X POST http://localhost:8788/api/generations \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{"input_text":"Lorem ipsum dolor sit amet..."}'
```

---

## 📋 Checklist Migracji

### Przygotowanie

- [ ] Stwórz branch: `git checkout -b feat/cloudflare-migration`
- [ ] Backup bazy danych (jeśli są produkcyjne dane)
- [ ] Zanotuj obecne wartości hash dla testów regresji

### Instalacja

- [ ] `npm install @astrojs/cloudflare`
- [ ] `npm uninstall @astrojs/node`
- [ ] `npm install -D wrangler` (opcjonalnie, dla lokalnych testów)

### Zmiany w Kodzie

- [ ] Zaktualizuj `astro.config.mjs` (zmiana adaptera)
- [ ] Usuń `import { createHash } from "crypto";` z `generations.service.ts`
- [ ] Dodaj funkcję `generateTextHash` z Web Crypto API
- [ ] Zaktualizuj wywołanie na `await generateTextHash(inputText)`
- [ ] (Opcjonalnie) Zaktualizuj migrację bazy danych

### Konfiguracja

- [ ] Utwórz `wrangler.toml`
- [ ] Ustaw sekrety: `npx wrangler secret put SUPABASE_KEY`
- [ ] Ustaw sekrety: `npx wrangler secret put OPENROUTER_API_KEY`

### Testowanie

- [ ] `npm run build` - weryfikacja buildu
- [ ] `npx wrangler pages dev ./dist` - test lokalny
- [ ] Test endpoint: `/api/auth/login`
- [ ] Test endpoint: `/api/auth/register`
- [ ] Test endpoint: `/api/generations` (kluczowy!)
- [ ] Test endpoint: `/api/flashcards` (GET i POST)
- [ ] Test endpoint: `/api/flashcards/[id]` (DELETE)
- [ ] Test UI: Logowanie
- [ ] Test UI: Generowanie fiszek
- [ ] Test UI: Przeglądanie fiszek

### Wdrożenie

- [ ] Commit zmian: `git commit -m "feat: migrate to Cloudflare adapter"`
- [ ] Push branch: `git push origin feat/cloudflare-migration`
- [ ] Połącz Cloudflare Pages z repozytorium GitHub
- [ ] Skonfiguruj zmienne środowiskowe w Cloudflare Dashboard
- [ ] Deploy preview branch
- [ ] Weryfikacja na preview URL
- [ ] Merge do `main`
- [ ] Weryfikacja produkcji

---

## 🚨 Potencjalne Problemy i Rozwiązania

### Problem 1: Limity CPU Time

**Opis:** Cloudflare Workers ma limity czasu wykonania:
- **Free Plan:** 10ms CPU time
- **Workers Paid ($5/mc):** 50ms CPU time  
- **Workers Unbound:** 30 sekund CPU time (dodatkowe $0.02/million requests)

**Ryzyko:** Wywołanie OpenRouter API może przekroczyć 10ms (Free Plan).

**Rozwiązania:**

1. **Workers Paid Plan** ($5/mc) - 50ms powinno wystarczyć dla większości requestów
2. **Workers Unbound** - dla długich wywołań AI (30s limit)
3. **Optymalizacja timeoutów** w `openrouter.service.ts`:

```typescript
// Zmniejsz timeout dla szybszego failowania
this.timeout = config.timeout || 20000; // 20s zamiast 30s
```

### Problem 2: Cold Starts

**Opis:** Pierwsze wywołanie po okresie nieaktywności może być wolniejsze.

**Mitigacja:**
- Cloudflare Workers mają **minimalny** cold start (~1-2ms)
- Jest to znacznie szybsze niż Vercel Serverless Functions (~200-500ms)
- OpenRouter API jest zewnętrznym czynnikiem (nie zależy od platformy)

**Rozwiązanie:** Brak wymaganego działania - to jest normalne.

### Problem 3: Wielkość Bundle

**Opis:** Workers ma limit 1MB dla spakowanego kodu.

**Obecny stan aplikacji:**
- Astro + React + Supabase Client + OpenRouter ≈ 300-400KB (po kompresji)
- **Ryzyko:** Niskie

**Monitoring:**

```bash
# Sprawdź rozmiar bundle po buildzie
ls -lh dist/_worker.js/
```

**Jeśli przekroczysz limit:**
- Użyj dynamic imports dla dużych bibliotek
- Wyłącz source maps w produkcji
- Rozważ code splitting

### Problem 4: Brak Dostępu do Filesystem

**Opis:** Workers nie mają dostępu do systemu plików (brak `fs`, `path`).

**Obecny stan aplikacji:** ✅ Nie używasz `fs` - brak problemu.

### Problem 5: WebSocket Support

**Opis:** Workers wspierają WebSockets, ale z ograniczeniami.

**Obecny stan aplikacji:** ✅ Nie używasz WebSockets - brak problemu.

---

## 💰 Analiza Kosztów: Cloudflare vs Obecny Stack

### Cloudflare Pages + Workers Pricing

**Free Plan:**
- 100,000 requests/dzień (~3M/mc)
- 10ms CPU time per request
- Unlimited bandwidth
- Unlimited static requests
- **Koszt:** $0/mc

**Workers Paid:**
- 10M requests/mc (włączone)
- 50ms CPU time per request
- $0.50 per million requests (powyżej limitu)
- **Koszt:** $5/mc

**Workers Unbound (dla długich AI calls):**
- 30s CPU time per request
- **Koszt:** $5/mc (base) + $0.02/million requests + $12.50/million GB-s

### Przykładowy Koszt dla Startupu (10k użytkowników, 100k requestów/dzień)

**Miesięczne zużycie:**
- Requesty: 3M/mc
- Workers Paid: $5/mc (base) + 0 (w limicie)
- Bandwidth: $0 (unlimited)
- **SUMA:** $5/mc

**Dla porównania - Vercel Pro:**
- Plan: $20/mc per członka zespołu
- Function executions: 1M/mc (włączone, potem $40/1M)
- Bandwidth: 1TB (potem $40/100GB)
- **SUMA:** $20-60/mc (dla 1 developera)

**Oszczędność:** ~$15-55/mc

---

## 📈 Ocena Złożoności i Ryzyka

### Złożoność Komponentów

| Aspekt | Złożoność | Czas | Ryzyko | Uwagi |
|--------|-----------|------|--------|-------|
| Zmiana adaptera | 🟢 Niska | 5 min | Minimalne | Jedna linijka w configu |
| Instalacja pakietu | 🟢 Niska | 2 min | Brak | `npm install` |
| Zmiana `crypto` → Web Crypto | 🟡 Średnia | 15 min | Średnie | Wymaga zmiany na async |
| Migracja bazy (hash) | 🟢 Niska | 10 min | Niskie | Tylko dla starych danych |
| Konfiguracja zmiennych | 🟢 Niska | 10 min | Minimalne | Dashboard lub CLI |
| Testy lokalne | 🟡 Średnia | 30 min | Średnie | Weryfikacja wszystkich endpointów |
| Wdrożenie | 🟢 Niska | 10 min | Niskie | Auto-deploy z GitHub |
| **SUMA** | **🟢 Niska** | **~1.5h** | **Niskie** | Bardzo nieinwazyjna migracja |

### Mapa Ryzyk

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitigacja |
|--------|-------------------|-------|-----------|
| Przekroczenie CPU time (Free) | 🟡 Średnie | 🔴 Wysokie | Upgrade do Workers Paid ($5/mc) |
| Problemy z Web Crypto API | 🟢 Niskie | 🟡 Średnie | Web Crypto jest standardem, dobrze wspierane |
| Rozbieżność hashów (MD5→SHA256) | 🟡 Średnie | 🟢 Niskie | Reset bazy lub kolumna `hash_algorithm` |
| Problemy z Supabase cookies | 🟢 Bardzo niskie | 🔴 Wysokie | `@supabase/ssr` jest zgodne z Web Standards |
| Awaria podczas wdrożenia | 🟢 Bardzo niskie | 🟡 Średnie | Git rollback + Cloudflare instant rollback |

**Ogólna ocena ryzyka:** 🟢 **NISKIE**

---

## 🎯 Rekomendacje

### Priorytet 1: Wykonaj Migrację

**Uzasadnienie:**
1. **Bardzo niska złożoność** - tylko jedna zależność do zmiany
2. **Korzyści finansowe** - oszczędność $15-55/mc vs Vercel
3. **Lepsza wydajność** - szybsze cold starts, globalny CDN
4. **Przyszłościowe** - łatwiejsza skalowalność bez vendor lock-in

### Priorytet 2: Wybierz SHA-256 zamiast MD5

**Uzasadnienie:**
1. **Bezpieczeństwo** - SHA-256 jest standardem w 2026
2. **Wydajność** - natywna implementacja w Web Crypto API
3. **Brak dodatkowych zależności** - nie trzeba instalować `js-md5`
4. **Rozmiar hashu** - 64 znaki (więcej entropii, mniej kolizji)

### Priorytet 3: Zacznij od Workers Paid ($5/mc)

**Uzasadnienie:**
1. **50ms CPU time** - wystarczy dla wywołań OpenRouter
2. **10M requestów/mc** - w zupełności wystarczy na początek
3. **Koszt** - tylko $5/mc (vs $20/mc Vercel Pro)
4. **Upgrade path** - łatwy upgrade do Unbound jeśli trzeba

### Priorytet 4: Monitoruj Metryki

**Po wdrożeniu monitoruj:**
1. **CPU time usage** - czy nie zbliżasz się do limitu 50ms
2. **Request count** - czy nie przekraczasz 10M/mc
3. **Error rate** - szczególnie timeout errors w OpenRouter
4. **P95/P99 latency** - dla optymalizacji user experience

**Narzędzia:**
- Cloudflare Analytics (wbudowane)
- Cloudflare Workers Logpush (logi w czasie rzeczywistym)
- Sentry (dla error tracking)

---

## 📚 Dodatkowe Zasoby

### Dokumentacja

- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Web Crypto API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

### Community Support

- [Astro Discord](https://astro.build/chat) - #adapters channel
- [Cloudflare Developers Discord](https://discord.cloudflare.com)
- [Stack Overflow: cloudflare-workers](https://stackoverflow.com/questions/tagged/cloudflare-workers)

### Przykłady

- [Astro + Cloudflare Template](https://github.com/withastro/astro/tree/main/examples/with-cloudflare)
- [Supabase + Cloudflare Workers](https://supabase.com/docs/guides/auth/server-side/cloudflare-workers)

---

## ✅ Wnioski

### Główne Zalety Migracji

1. ✅ **Bardzo niski koszt i effort migracji** - ~1.5h pracy
2. ✅ **Znaczące oszczędności finansowe** - $5/mc vs $20+/mc
3. ✅ **Lepsza wydajność** - globalny CDN, szybkie cold starts
4. ✅ **Prostota wdrożenia** - auto-deploy z GitHub
5. ✅ **Skalowalność** - bez limitów bandwidth, tanie skalowanie

### Główne Wyzwania

1. ⚠️ Zmiana z MD5 na SHA-256 (lub instalacja js-md5)
2. ⚠️ Potrzeba Workers Paid ($5/mc) dla 50ms CPU time
3. ⚠️ Brak filesystem (ale nie jest używany)

### Rekomendacja Końcowa

**Migracja jest WYSOCE ZALECANA** ze względu na:
- Minimalny koszt i ryzyko
- Znaczące korzyści finansowe i wydajnościowe
- Długoterminowa strategia (brak vendor lock-in)
- Bardzo prosta implementacja

**Sugerowane podejście:**
1. Stwórz branch `feat/cloudflare-migration`
2. Wykonaj zmiany (1-2h)
3. Przetestuj lokalnie z `wrangler pages dev`
4. Wdróż na Cloudflare Pages Preview
5. Po weryfikacji: merge do `main`

**Czas do produkcji:** 1 dzień (z testami)  
**ROI:** Zwrot w pierwszym miesiącu ($15+ oszczędności)

---

**Autor analizy:** AI Assistant  
**Data:** 2026-01-21  
**Wersja dokumentu:** 1.0
