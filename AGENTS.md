# Agent Instructions — Convergent EDM QA Suite

This file is the **cross-tool agent specification** for this repository. It applies to all AI coding agents: GitHub Copilot, Cursor, Devin, Claude Code, and others.

Claude Code reads `CLAUDE.md`, which imports this file via `@AGENTS.md`. Other tools read this file directly.

---

## Repository Purpose

This is a **Playwright + TypeScript regression test suite** for [Convergent EDM](http://convergentedm.com/), a document and imaging management software company. It tests the public-facing marketing website without creating accounts or submitting forms.

**Tech stack:** Node.js 18+, TypeScript (strict), Playwright, Page Object Model (POM), OOP design

---

## Golden Rules — Never Violate

1. **Never submit a form.** Test field interactions and HTML5 validation only. Do not click submit buttons in a way that sends real HTTP POST requests.
2. **Never create accounts or log in** unless `auth.required: true` in `site.config.json`.
3. **Never hardcode a URL in tests.** Always use `baseURL` from Playwright config, which reads `site.config.json`.
4. **No `expect()` calls inside page object methods.** Assertions live in spec files only.
5. **No `page.waitForTimeout()` with values > 500ms.** Use Playwright's built-in auto-waiting.
6. **No `any` type** without an explicit inline justification comment.
7. **Run `npx tsc --noEmit` before finishing.** TypeScript must compile with zero errors.

---

## Architecture

### Page Object Model (OOP)

```
src/pages/
├── base.page.ts        # BasePage — all POM classes extend this
├── home.page.ts        # HomePage
├── navigation.page.ts  # NavigationPage
└── contact.page.ts     # ContactFormPage
```

- One class per page or major section
- Locators: `readonly` Playwright `Locator` properties declared on the class
- Methods: user actions only (navigate, click, fill, scroll)
- **Never call `expect()` inside a page object method**
- All page classes use `super(page, config)` in their constructor

OOP principles:
- **Inheritance:** all pages extend `BasePage` for shared helpers
- **Encapsulation:** locators and interaction logic are private to each class
- **Single Responsibility:** each class owns exactly one page or section

### Test Fixtures

All tests import `{ test, expect }` from `src/fixtures/site.fixture.ts`.

```typescript
// Always import from here:
import { test, expect } from '@fixtures/site.fixture';

// Never import directly from:
import { test } from '@playwright/test'; // WRONG
```

### Test Suites

```
tests/
├── smoke/         # @smoke — site availability, HTTPS, title, JS errors
├── navigation/    # @navigation — nav links, mobile menu, routing
├── forms/         # @forms — form fields, validation, no submission
├── functional/    # @functional — content, CTA, headings, footer, SEO
├── visual/        # @visual — screenshot regression at 3 viewports
└── responsive/    # @responsive — layout at mobile/tablet/desktop
```

---

## Writing Tests

1. Read `site.config.json` to understand the target site's URL and feature flags
2. Fetch the live site with a browser or fetch tool before writing any selectors
3. Base selectors on actual DOM — never write invented/placeholder selectors
4. Create or update the matching page object before writing the spec
5. Tag every `test()` with at least one: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive`
6. Use `test.skip()` with a descriptive reason when a feature is unavailable

---

## Selector Priority

Use selectors in this order (most semantic first):

1. `page.getByRole()` — ARIA roles (`button`, `link`, `heading`, etc.)
2. `page.getByLabel()` — form field labels
3. `page.getByText()` — visible text content
4. `page.locator('[data-testid="..."]')` — test IDs if present
5. `page.locator('[aria-label="..."]')` — ARIA labels
6. `page.locator('input[name="..."]')` — semantic HTML attributes
7. CSS class selectors — only as last resort

---

## TypeScript Rules

- Strict mode is enforced (`tsconfig.json`)
- No implicit `any`
- All page object properties must have explicit types
- All async methods must declare a return type (`Promise<void>`, `Promise<boolean>`, etc.)
- Path aliases: `@pages/*`, `@fixtures/*`, `@utils/*`, `@site-types/*`

---

## npm Commands

```bash
npm test                 # All tests
npm run test:smoke       # @smoke only
npm run test:navigation  # @navigation only
npm run test:forms       # @forms only
npm run test:visual      # @visual only
npm run test:responsive  # @responsive only
npm run baseline         # Update visual snapshots
npm run typecheck        # npx tsc --noEmit
npm run lint             # ESLint
```

---

## Key Files

| File | Purpose |
|------|---------|
| `site.config.json` | Target URL, feature flags, nav items |
| `playwright.config.ts` | Browser projects, timeouts, reporters |
| `src/fixtures/site.fixture.ts` | Custom test fixtures |
| `src/types/site-config.types.ts` | SiteConfig TypeScript interface |
| `src/pages/base.page.ts` | BasePage class all POMs extend |

---

## Available Sub-Agents (Claude Code)

| Agent | File | When to use |
|-------|------|-------------|
| `site-analyzer` | `.claude/agents/site-analyzer.md` | Crawl a live site and populate `site.config.json` |
| `test-generator` | `.claude/agents/test-generator.md` | Generate site-specific custom spec files |

---

## What NOT to Do

- Do not commit credentials or real auth tokens
- Do not push baseline snapshots without reviewing them visually
- Do not use `test.only()` — it silently skips all other tests
- Do not write tests that depend on test execution order
- Do not use `page.waitForTimeout()` for synchronization
- Do not create `tests/custom/` files without tagging them `@custom` in addition to another tag
