# 10x Cards

## Overview

10x Cards is an interactive web application designed to simplify the process of generating, managing, and reviewing flashcards. The application leverages artificial intelligence (AI) to automatically generate flashcards from a given text (1000 - 10000 characters), while also allowing users to create flashcards manually. The system provides a seamless learning experience by combining AI-driven content with user input, ensuring both efficiency and customization.

## Key Features

- **AI-driven Flashcard Generation**: Input text is processed with AI to generate flashcards. Each generated card includes a front (1-200 characters) and a back (1-500 characters). Cards can be generated in two modes: `ai-full` (unmodified) and `ai-edited` (manually refined).
- **Manual Flashcard Creation**: Users can create and edit flashcards manually through an intuitive interface.
- **Flashcard Review & Management**: Users review flashcards before they are permanently saved in the database, ensuring quality and accuracy.
- **User Authentication**: Managed via Supabase Auth, enabling secure registration and login.
- **Comprehensive Data & Logging**: Detailed logging of AI generation including model used, generation duration, and input text hash is maintained. This supports robust tracking for performance and error diagnostics.

## Technical Architecture

### Tech Stack

- **Frontend**: Astro v5, React v19, Tailwind CSS v4, and Shadcn/ui
- **Backend**: TypeScript v5 with Supabase for database and authentication

_See [./.ai/tech-stack.md](./.ai/tech-stack.md) for more details about the tech stack._

### Database Schema

The database schema is designed to be efficient, scalable, and compliant with modern best practices. Key design aspects include:

- **Users**: Managed via Supabase Auth with `BIGSERIAL` identifiers.
- **Flashcards**: Stores both AI-generated and manually created flashcards, with validations for text lengths and a source field limited to `ai-full`, `ai-edited`, and `manual`.
- **Generations**: Tracks AI generation metadata using a hash of the input text, its length, generation duration (in milliseconds), and the AI model used. The original full input text is not stored in MVP to optimize storage.
- **Generations Errors**: Logs errors encountered during AI processing, associated with the corresponding AI model.

_See [./.ai/db-plan.md](./.ai/db-plan.md) for the full database schema._

### Product Requirements

The product requirements ensure that 10x Cards meets the needs of a modern learning tool:

- Flashcards are generated and reviewed efficiently.
- At least 75% of flashcards stored in the database should be generated via AI (either `ai-full` or `ai-edited`).
- Input validation is enforced at multiple levels: UI, API, and database (RLS policies via Supabase).

_See [./.ai/prd.md](./.ai/prd.md) for the complete product requirements document._

## Getting Started

### Prerequisites

- Node.js (ensure you are using the version specified in `.nvmrc`)
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mateuszhadrian/10x-cards.git
   cd 10x-cards
   ```

2. **Install dependencies**

   ```bash
   nvm use
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Start the production server**

   ```bash
   npm start
   ```

## Available Scripts

- `npm run dev` - Runs the app in development mode.
- `npm run build` - Builds the app for production.
- `npm start` - Runs the built production app.

## License

This project is licensed under the [MIT License](LICENSE).
