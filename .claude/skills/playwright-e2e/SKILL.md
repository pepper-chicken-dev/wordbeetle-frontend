---
name: playwright-e2e
description: Write and run Playwright E2E tests. Follow these conventions when creating or modifying E2E test files.
allowed-tools: Bash(pnpm test:e2e*), Bash(npx playwright*)
---

# E2E Testing with Playwright

## Test file conventions

- All E2E tests live in `e2e/` at the project root
- Use `*.spec.ts` suffix
- Group by feature: `e2e/auth.spec.ts`, `e2e/wordbook.spec.ts`, `e2e/word.spec.ts`, etc.
- Use kebab-case filenames (consistent with the project)

## Running tests

```bash
pnpm test:e2e                           # run all tests headless
pnpm test:e2e -- e2e/auth.spec.ts       # run a specific test file
pnpm test:e2e -- --grep "login"         # run tests matching a pattern
pnpm test:e2e:headed                    # run with visible browser
pnpm test:e2e:ui                        # interactive UI mode
```

## Test structure

```ts
import { expect, test } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.getByRole('heading', { name: 'Title' })).toBeVisible();
  });
});
```

## Authentication in tests

The app supports Guest login (no external OAuth needed):

1. Navigate to `/auth`
2. Click the Guest login button
3. Wait for redirect to `/dashboard`
4. Save storage state to `e2e/.auth/` for reuse

```ts
// e2e/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  // Use authenticated page
  page: async ({ page }, use) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: /guest/i }).click();
    await page.waitForURL('/dashboard');
    await use(page);
  },
});
```

## Selector strategy

Prefer accessible selectors over CSS selectors:

```ts
// Good
page.getByRole('button', { name: 'Save' })
page.getByText('WordBeetle')
page.getByLabel('Wordbook name')
page.getByPlaceholder('Search words...')

// Avoid
page.locator('.btn-primary')
page.locator('#submit-button')
```

## Debugging failed tests

- Check `playwright-report/` for HTML report with traces
- Use `--trace on` to capture full trace: `pnpm test:e2e -- --trace on`
- Use Playwright CLI interactively: `playwright-cli open http://localhost:3000` + `snapshot`
- Check `test-results/` for failure screenshots

## Writing new tests workflow

1. Use Playwright CLI interactively to explore the page structure (`open`, `goto`, `snapshot`)
2. Convert the interactive exploration into a test file
3. Run the test to verify
4. Add assertions for expected state
