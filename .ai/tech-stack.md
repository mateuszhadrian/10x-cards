Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker

Testowanie:

1. Testy jednostkowe i integracyjne:
   - Vitest - Framework testowy zbudowany na Vite, oferujący 10-50x lepszą wydajność niż Jest
   - React Testing Library - Do testowania komponentów React z perspektywy użytkownika
   - @testing-library/user-event - Do symulacji realistycznych interakcji użytkownika
   - MSW (Mock Service Worker) - Do mockowania requestów HTTP na poziomie sieci
   - jsdom - Środowisko DOM dla testów jednostkowych

2. Testy end-to-end (E2E):
   - Playwright - Nowoczesne narzędzie E2E od Microsoft, standard branżowy w 2026
   - Wspiera wiele przeglądarek (Chrome, Firefox, Safari, Edge)
   - Zaawansowane narzędzia debugowania (trace viewer, UI mode, codegen)

3. Testy dostępności (opcjonalnie):
   - Axe-core / axe-playwright - Automatyczne wykrywanie problemów z dostępnością WCAG 2.1/2.2

4. Testy wydajnościowe (opcjonalnie):
   - Lighthouse CI - Automatyczne audyty wydajności, SEO i dostępności w CI/CD
   - Artillery - Testy obciążeniowe dla API
   - WebPageTest - Szczegółowa analiza wydajności i Core Web Vitals
