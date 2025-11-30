# 10x Cards

[![Node.js 22.14.0](https://img.shields.io/badge/node-22.14.0-43853d.svg)](https://nodejs.org/) [![Astro 5](https://img.shields.io/badge/astro-5.13-ff5d01.svg)](https://astro.build/) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An AI-assisted flashcard workflow that turns pasted study material into spaced-repetition-ready decks in minutes.

## Table of Contents
- [1. Project name](#1-project-name)
- [2. Project description](#2-project-description)
- [3. Tech stack](#3-tech-stack)
- [4. Getting started locally](#4-getting-started-locally)
- [5. Available scripts](#5-available-scripts)
- [6. Project scope](#6-project-scope)
- [7. Project status](#7-project-status)
- [8. License](#8-license)

## 1. Project name
**10x Cards** – a focused tooling suite for turning lengthy study notes into high-quality flashcards with guardrails that keep every session fast, accurate, and ready for SRS export.

## 2. Project description
10x Cards addresses the slow, manual process of writing flashcards by letting learners paste up to 20 000 characters of source material, generate up to 50 AI-curated cards per session, and review everything in a single flow. Inline validation enforces per-side character limits (200 front / 500 back), manual additions share the same constraints, and sessions conclude with a single export to the existing spaced-repetition library. Authentication, password resets (self-service + admin), and detailed logging keep the system trustworthy for both learners and operators. See `.ai/prd.md` for the full Product Requirements Document.

## 3. Tech stack
**Frontend**
- Astro 5 with React 19 islands for interactive surfaces.
- TypeScript 5 for type-safe authoring.
- Tailwind CSS 4 plus shadcn/ui, `class-variance-authority`, `clsx`, and `tailwind-merge` for composable design systems.

**Backend & data**
- Supabase (PostgreSQL, Auth, storage, and real-time SDK) as the managed backend-as-a-service.
- Astro Node adapter for server-side rendering and API routes.

**AI**
- Openrouter.ai for model federation (OpenAI, Anthropic, Google, etc.) with per-key usage limits to control costs.

**CI/CD & hosting**
- GitHub Actions for pipelines and automated linting/formatting (ESLint 9 + Prettier).
- DigitalOcean hosting via Docker images for predictable deployments.

> A condensed stack overview is available in `.ai/tech-stack.md`.

## 4. Getting started locally
### Prerequisites
- Node.js `22.14.0` (see `.nvmrc`)
- npm 10+ (ships with Node)
- Access credentials for Supabase (URL + anon/service keys) and Openrouter (API key)

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-org>/10x-cards.git
   cd 10x-cards
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   Create `.env` (or update `.env.local`) with the keys required by the Astro/Supabase clients:
   ```bash
   cp .env.example .env        # if the template exists
   ```
   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=public-anon-key
   OPENROUTER_API_KEY=sk-your-key
   SESSION_LIMITS_MAX_AI_CARDS=50
   SESSION_LIMITS_MAX_TOTAL_CARDS=100
   INPUT_MAX_CHARACTERS=20000
   ```
4. **Run the development server**
   ```bash
   npm run dev
   ```
5. **Preview and build**
   ```bash
   npm run build    # production build
   npm run preview  # serve the build locally
   ```

Linting (`npm run lint`) and formatting (`npm run format`) are enforced through Husky + lint-staged during commits.

## 5. Available scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Start the Astro dev server with hot module reload. |
| `npm run build` | Generate an optimized production build. |
| `npm run preview` | Serve the production build locally for smoke tests. |
| `npm run astro` | Run arbitrary Astro CLI commands (e.g., `astro check`). |
| `npm run lint` | Execute ESLint (Astro, React, TypeScript rules). |
| `npm run lint:fix` | Autofix lint issues when possible. |
| `npm run format` | Format the codebase with Prettier (Astro plugin included). |

## 6. Project scope
**Included in MVP**
- AI generation of flashcards from pasted text (20 k char cap, up to 50 cards/session, server-side logging of usage metrics).
- Manual creation/editing with the same validations plus centralized limit management that propagates to client and server.
- Unified review UI with accept/edit/reject actions, locking during edits, and per-card states feeding session summaries.
- Session lifecycle management: IDs, active/closed states, guardrails that disable finishing when no cards qualify, and a single export step into the Supabase-backed SRS library.
- Authentication flows (sign-up, login, password reset) plus admin overrides with action logging.
- Library management after export: browse, filter, edit, and delete stored cards; maintain history and log deletions.
- Reporting for product owners covering generation logs (user/session, card counts, acceptance mix).

**Out of scope for MVP**
- Building a bespoke SRS algorithm (leverages an existing open-source engine).
- File import/export (PDF, DOCX, CSV) and advanced formatting of card content.
- Tagging, categorization, collaboration, or shared decks.
- Native mobile apps; only responsive web is planned.
- Deep analytics dashboards beyond log exports; automated tests beyond smoke coverage.

Refer to `.ai/prd.md` for the canonical backlog and guardrails around limits.

## 7. Project status
- **Status:** MVP in active development – requirements captured in the PRD, implementation in progress.
- **Upcoming milestones:** deliver the AI/manual creation flow, finish session export, and wire the Supabase auth/admin tooling.
- **Success metrics (from PRD):**
  - ≥75% of AI-generated cards are accepted or edited into the SRS library.
  - ≥75% of all cards originate from AI generation.
  - 80% of users complete sessions (paste → export) in under 10 minutes.

Progress is tracked via session logs and generation analytics once the instrumentation layer ships.

## 8. License
Distributed under the [MIT](LICENSE) license. Contributions should follow the coding guidelines defined in `.cursor/rules/`.
