# Page Object Model (POM) - Documentation

This directory contains Page Object Model classes for E2E testing with Playwright.

## Overview

The Page Object Model (POM) is a design pattern that creates an abstraction layer between test code and page-specific details. This approach improves test maintainability and reduces code duplication.

## Structure

```
e2e/
├── pages/
│   ├── LoginPage.ts              # Login page interactions
│   ├── GenerateFlashcardsPage.ts # Generate flashcards workflow
│   ├── FlashcardReviewItem.ts    # Individual flashcard item
│   └── README.md                 # This file
├── fixtures/
│   └── test-data.ts              # Reusable test data
└── *.spec.ts                     # Test files
```

## Page Object Classes

### GenerateFlashcardsPage

Main page class for the complete flashcard generation workflow.

**Key Features:**

- Text input and validation
- Generation process management
- Flashcard review list operations
- Save operations

**Example Usage:**

```typescript
import { GenerateFlashcardsPage } from "./pages/GenerateFlashcardsPage";
import { testGenerations } from "./fixtures/test-data";

test("should generate and save flashcards", async ({ page }) => {
  const generatePage = new GenerateFlashcardsPage(page);
  await generatePage.goto();

  // Step 1: Enter text
  await generatePage.enterText(testGenerations.validInput);

  // Step 2: Generate
  await generatePage.clickGenerate();
  await generatePage.waitForGenerationComplete();

  // Step 3: Review and select
  await generatePage.selectAllFlashcards();

  // Step 4: Save
  await generatePage.saveAcceptedFlashcards();
  await generatePage.waitForSaveComplete();
});
```

**Workflow Methods:**

```typescript
// Complete workflows (combines multiple steps)
await generatePage.generateFlashcards(text);
await generatePage.generateAndSaveAll(text);
await generatePage.generateAndSaveSelected(text, [0, 1, 2]);
```

### FlashcardReviewItem

Helper class for individual flashcard operations in the review list.

**Key Features:**

- Accept/unaccept flashcards
- Edit flashcard content
- Reject flashcards
- View flashcard content

**Example Usage:**

```typescript
// Get a specific flashcard
const flashcard = generatePage.getFlashcardItem(0);

// Accept the flashcard
await flashcard.accept();

// Edit content
await flashcard.editAndSave("New Question", "New Answer");

// Check status
const isAccepted = await flashcard.isAccepted();
const isEdited = await flashcard.isEdited();

// Reject (remove) flashcard
await flashcard.reject();
```

### LoginPage

Page class for authentication operations.

**Example Usage:**

```typescript
import { LoginPage } from "./pages/LoginPage";

test("should login successfully", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("user@example.com", "password123");

  const success = await loginPage.isLoginSuccessful();
  expect(success).toBe(true);
});
```

## Test Data Fixtures

Reusable test data is stored in `fixtures/test-data.ts`:

```typescript
import { testGenerations } from "./fixtures/test-data";

// Valid text for generation (1000-10000 chars)
testGenerations.validInput;

// Text that's too short
testGenerations.shortInput;

// Text that's too long
testGenerations.tooLongInput;
```

## Element Locator Strategy

All page objects use `data-testid` attributes for reliable element selection:

```typescript
// Primary strategy: data-testid
this.generateButton = page.getByTestId("generate-flashcards-button");

// Secondary strategy: ARIA roles
this.submitButton = page.getByRole("button", { name: /submit/i });

// Text content (for labels)
this.errorMessage = page.locator("text=/error/i");
```

## Test ID Naming Convention

Test IDs follow a consistent pattern:

**Format:** `{component}-{element}-{action/type}[-{index}]`

**Examples:**

- `generate-input-text` - Main text input
- `generate-flashcards-button` - Generate button
- `flashcard-checkbox-0` - Checkbox for flashcard at index 0
- `flashcard-edit-button-2` - Edit button for flashcard at index 2
- `save-accepted-flashcards-button` - Save accepted button

## Best Practices

### 1. Encapsulation

Keep selectors and page-specific logic within page objects:

```typescript
// ✅ Good
await generatePage.saveAllFlashcards();

// ❌ Bad
await page.getByTestId("save-all-flashcards-button").click();
```

### 2. Readable Methods

Create methods that describe user actions:

```typescript
// ✅ Good
await flashcard.editAndSave("Question", "Answer");

// ❌ Bad
await flashcard.frontInput.fill("Question");
await flashcard.backTextarea.fill("Answer");
await flashcard.saveEditButton.click();
```

### 3. Wait for State Changes

Always wait for state changes to complete:

```typescript
// ✅ Good
await generatePage.clickGenerate();
await generatePage.waitForGenerationComplete();

// ❌ Bad
await generatePage.clickGenerate();
// No wait - test might continue before generation completes
```

### 4. Workflow Methods

Provide high-level workflow methods for common scenarios:

```typescript
// ✅ Good - one method does it all
await generatePage.generateAndSaveAll(text);

// ❌ Acceptable but verbose
await generatePage.enterText(text);
await generatePage.clickGenerate();
await generatePage.waitForGenerationComplete();
await generatePage.saveAllFlashcards();
await generatePage.waitForSaveComplete();
```

### 5. Index-Based Access

Use index-based access for list items:

```typescript
// ✅ Good - works with dynamic content
const flashcard = generatePage.getFlashcardItem(0);
await flashcard.accept();

// ✅ Good - loop through all items
const items = await generatePage.getFlashcardItems();
for (const item of items) {
  await item.accept();
}
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test generate-flashcards.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with debug mode
npx playwright test --debug

# Generate test code
npx playwright codegen http://localhost:4321
```

## Debugging

### Trace Viewer

When tests fail, use the trace viewer:

```bash
npx playwright show-trace test-results/*/trace.zip
```

### Screenshots

Add screenshots for debugging:

```typescript
await page.screenshot({ path: "screenshot.png", fullPage: true });
```

### Pause Execution

Pause test execution to inspect:

```typescript
await page.pause();
```

## Adding New Pages

When adding a new page object:

1. Create a new file in `e2e/pages/`
2. Follow the existing naming convention
3. Document all public methods
4. Use `data-testid` for selectors
5. Add corresponding test file
6. Update this README

**Template:**

```typescript
import { Page, Locator } from "@playwright/test";

export class NewPage {
  readonly page: Page;
  readonly element: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.getByTestId("element-id");
  }

  async goto() {
    await this.page.goto("/path");
  }

  async performAction() {
    await this.element.click();
  }
}
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Locators](https://playwright.dev/docs/locators)
