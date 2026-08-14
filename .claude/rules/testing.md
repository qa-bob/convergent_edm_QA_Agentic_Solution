# Rules — tests/**/*.spec.ts

These rules apply whenever writing or editing any file under `tests/`.

---

## Imports

Always import from the custom fixture, never from `@playwright/test` directly:

```typescript
// Correct
import { test, expect } from '@fixtures/site.fixture';

// Wrong — never do this in a spec file
import { test, expect } from '@playwright/test';
```

---

## Test tagging

Every `test()` call MUST include at least one tag in the test name string:

| Tag | When to use |
|-----|------------|
| `@smoke` | Site loads, title present, no critical JS errors |
| `@navigation` | Nav links, routing, menus, mobile menu |
| `@forms` | Form fields, HTML5 validation, accessibility |
| `@functional` | Business logic, content sections, CTAs, SEO, footer |
| `@visual` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | Viewport-specific layout checks |

```typescript
// Tag appears in BOTH the describe block and the test name
test.describe('Homepage @functional', () => {
  test('H1 heading is present @functional', async ({ homePage }) => { ... });
});
```

---

## Prohibited patterns

- `import { test } from '@playwright/test'` — use the fixture instead
- `page.waitForTimeout()` > 500ms — use Playwright auto-waiting
- `test.only()` — silently skips all other tests in CI
- Hardcoded URLs — always use `baseURL` from config or `siteConfig.url`
- Form submission — test validation only, never trigger a real HTTP POST
- `expect()` inside page object methods — assertions belong in spec files only
- Test order dependencies — every test must pass when run in isolation

---

## Skipping unavailable features

Use `test.skip()` with a descriptive reason rather than deleting or commenting out tests:

```typescript
test.skip(!siteConfig.hasContactForm, 'Contact form not present on this site');
```

---

## Selector priority (in tests that use `page.locator` directly)

1. `getByRole()` — ARIA roles
2. `getByLabel()` — form field labels
3. `getByText()` — visible text content
4. `locator('[data-testid="..."]')` — test IDs if present
5. `locator('[aria-label="..."]')` — ARIA labels
6. `locator('input[name="..."]')` — semantic HTML attributes
7. CSS class selectors — only as last resort

---

## File naming

- One spec file per feature area: `tests/<suite>/<feature>.spec.ts`
- Describe block: `'Feature Description @tag'`
- Test name: `'specific behavior being tested @tag'`
