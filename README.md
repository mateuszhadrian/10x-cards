# 10x-cards

[![version](https://img.shields.io/badge/version-0.0.1-blue.svg)](./package.json)
[![status](https://img.shields.io/badge/status-WIP-orange.svg)](#7-project-status)
[![node](https://img.shields.io/badge/node-22.14.0-339933.svg?logo=node.js&logoColor=white)](.nvmrc)
[![astro](https://img.shields.io/badge/Astro-5-ff5d01.svg?logo=astro&logoColor=white)](https://docs.astro.build)
[![react](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![license](https://img.shields.io/badge/license-TBD-lightgrey.svg)](#8-license)

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

10x-cards

## 2. Project description

10x-cards helps learners turn pasted text into high‑quality flashcards with AI. Users paste 1,000–10,000 characters of text, trigger a single AI generation (up to 30 cards), then quickly review, edit, accept, or reject each card. Only accepted cards are saved to the user’s single default deck. After review, users may add manual cards to reach a per‑session total of 50. 

- Audience: self‑learners using spaced repetition who want to reduce the time cost of creating flashcards.
- Value: faster creation, quality control via review/edit, single place for accepted cards.

See additional docs:
- Product Requirements (PRD): [./.ai/prd.md](./.ai/prd.md)
- Tech Stack: [./.ai/tech-stack.md](./.ai/tech-stack.md)

## 3. Tech stack

- Frontend: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, RLS)
- AI: Openrouter.ai (access to multiple model providers)
- Tooling: ESLint, Prettier
- CI/CD & Hosting: GitHub Actions (planned), DigitalOcean via Docker (planned)

## 4. Getting started locally

Prerequisites:
- Node.js 22.14.0 (see `.nvmrc`)
- npm (project uses `package-lock.json`)

Setup:

```bash
# Clone the repo
git clone https://github.com/mateuszhadrian/10x-cards.git
cd 10x-cards

# Use the recommended Node version
nvm use

# Install dependencies
npm install

# Start the dev server (Astro default: http://localhost:4321)
npm run dev
```

Notes:
- No environment variables are required to run the base UI locally.
- Supabase (Auth/Postgres) and Openrouter integration will be wired in during MVP implementation. When required, environment variables and setup steps will be documented.

## 5. Available scripts

```bash
# Start the development server
npm run dev

# Build the production bundle
npm run build

# Preview the production build locally
npm run preview

# Run Astro CLI directly
npm run astro

# Lint the project
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format with Prettier
npm run format
```

## 6. Project scope

MVP essentials (summary):
- AI generation from pasted text (1,000–10,000 chars), single generation per session, up to 30 AI cards.
- Review flow with Accept / Reject / Edit; editing allowed only during review.
- Save only accepted cards; accepted AI cards recorded as `ai_full` or `ai_edited`.
- After review, allow manual card creation to reach a maximum of 50 accepted cards per session.
- Single default deck per user (library is read‑only in MVP).
- Telemetry: generation status, duration_ms, error_code; session‑level metrics including AI share.

Key constraints:
- Global generation timeout: ≤ 60s; 0‑result retry allowed exactly once.
- Per‑card limits: `front ≤ 200` chars; `back ≤ 500` chars (validated in UI and API/RLS).
- Session limit: at most 50 accepted cards (AI + manual). Reject writes beyond limit.
- No bulk actions in review (no “accept all”).

Out of scope (MVP):
- Advanced SRS algorithms (e.g., SuperMemo/Anki).
- Multi‑format imports (PDF/DOCX/etc.), sharing sets, external integrations.
- Mobile apps, bulk review actions, editing/deleting cards in the library.

Data model (high‑level):
- `sessions`: tracks counts, timings, status, error codes, input hash/length.
- `flashcards`: `front`, `back`, `source (ai_full|ai_edited|manual)`, timestamps, `session_id`.
- `generations`: LLM metadata (model, params, tokens, cost), status and timings per session.

## 7. Project status

Work in progress (v0.0.1). MVP implementation underway, starting with the generation → review → acceptance flow and the read‑only library. Weekly AI‑share metric (target ≥ 75%) will be surfaced at session start once telemetry is connected.

## 8. License

TBD. No license file is present yet; all rights reserved by default. If you plan to use or contribute, please open an issue to discuss licensing (e.g., MIT/Apache‑2.0).


