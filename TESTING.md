# Testing Guide for 10x-cards

This document provides a comprehensive guide to testing in the 10x-cards project.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Unit Tests (Vitest)](#unit-tests-vitest)
- [E2E Tests (Playwright)](#e2e-tests-playwright)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

This project uses a comprehensive testing strategy:

- **Unit Tests**: Vitest + React Testing Library for component and function testing
- **Integration Tests**: Vitest + MSW for API integration testing
- **E2E Tests**: Playwright for end-to-end user flow testing

## Setup

### Prerequisites

Before running tests, you need to install dependencies. First, fix npm permissions if needed:

```bash
sudo chown -R $(whoami) ~/.npm
```

Then install testing dependencies:

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  msw @playwright/test @vitejs/plugin-react
```

For Playwright, also run:

```bash
npx playwright install chromium
```

### Project Structure

```
/
├── tests/                      # Unit and integration tests
│   ├── setup/                  # Test setup files
│   │   ├── vitest.setup.ts    # Global test configuration
│   │   └── msw.setup.ts       # MSW server configuration
│   ├── utils/                  # Test utilities
│   │   └── test-utils.tsx     # Custom render functions
│   ├── unit/                   # Unit tests
│   │   ├── utils.test.ts
│   │   ├── validations.test.ts
│   │   └── Button.test.tsx
│   └── integration/            # Integration tests
│       └── flashcards.service.test.ts
├── e2e/                        # E2E tests
│   ├── fixtures/               # Test data
│   │   └── test-data.ts
│   ├── pages/                  # Page Object Models
│   │   └── LoginPage.ts
│   ├── auth.spec.ts
│   └── navigation.spec.ts
├── vitest.config.ts            # Vitest configuration
└── playwright.config.ts        # Playwright configuration
```

## Unit Tests (Vitest)

### Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with UI (visual test runner)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Unit Tests

#### Testing Pure Functions

```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

#### Testing React Components

```typescript
// tests/unit/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

#### Testing with Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Component with callbacks', () => {
  it('should call callback on click', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests with MSW

MSW (Mock Service Worker) allows you to mock API requests at the network level.

```typescript
// tests/integration/api.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../setup/msw.setup';
import { http, HttpResponse } from 'msw';

describe('API Integration', () => {
  it('should fetch data successfully', async () => {
    const result = await myApiCall();
    expect(result).toBeDefined();
  });

  it('should handle errors', async () => {
    // Override handler for this test
    server.use(
      http.get('/api/endpoint', () => {
        return HttpResponse.json({ error: 'Error' }, { status: 500 });
      })
    );

    await expect(myApiCall()).rejects.toThrow();
  });
});
```

## E2E Tests (Playwright)

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (visual test runner)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Generate tests with codegen
npm run test:e2e:codegen

# View test report
npm run test:e2e:report
```

### Writing E2E Tests

#### Using Page Object Model

```typescript
// e2e/pages/MyPage.ts
import { Page, Locator } from '@playwright/test';

export class MyPage {
  readonly page: Page;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole('button', { name: /submit/i });
  }

  async goto() {
    await this.page.goto('/my-page');
  }

  async submit() {
    await this.submitButton.click();
  }
}
```

#### Writing Tests

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';
import { MyPage } from './pages/MyPage';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    const myPage = new MyPage(page);
    await myPage.goto();
    
    await myPage.submit();
    
    await expect(page).toHaveURL(/.*success/);
  });
});
```

#### Testing API Endpoints

```typescript
test('should return correct data from API', async ({ request }) => {
  const response = await request.get('/api/flashcards');
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(data.flashcards).toBeDefined();
});
```

#### Visual Regression Testing

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## Best Practices

### Unit Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Test behavior, not implementation**: Focus on what the code does, not how
3. **Use descriptive test names**: `it('should show error when email is invalid')`
4. **Keep tests isolated**: Each test should be independent
5. **Mock external dependencies**: Use `vi.mock()` for modules, `vi.fn()` for functions
6. **Test edge cases**: Empty inputs, null values, errors
7. **Use Testing Library queries**: Prefer `getByRole` over `getByTestId`

### E2E Tests

1. **Use Page Object Model**: Encapsulate selectors and actions
2. **Use semantic locators**: Prefer `getByRole`, `getByLabel` over CSS selectors
3. **Wait for elements properly**: Use built-in waiting mechanisms
4. **Test critical user flows**: Focus on the most important features
5. **Isolate test data**: Use fixtures and test databases
6. **Run tests in parallel**: Configure workers for faster execution
7. **Use descriptive test names**: Describe the user scenario

### General

1. **Don't test third-party code**: Focus on your own code
2. **Avoid testing implementation details**: Test the public API
3. **Keep tests simple**: One assertion per test when possible
4. **Use factories for test data**: Create reusable data generators
5. **Clean up after tests**: Use `afterEach` hooks
6. **Run tests before committing**: Integrate with git hooks
7. **Maintain test coverage**: Aim for >80% on critical code

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Vitest Issues

- **Tests not found**: Check file naming (must end with `.test.ts` or `.spec.ts`)
- **Module not found**: Check path aliases in `vitest.config.ts`
- **DOM not available**: Ensure `environment: 'jsdom'` is set

### Playwright Issues

- **Browser not found**: Run `npx playwright install chromium`
- **Test timeout**: Increase timeout in `playwright.config.ts`
- **Element not found**: Use `await expect(element).toBeVisible()` instead of `toExist()`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

---

For questions or issues, please refer to the main project README or open an issue.
