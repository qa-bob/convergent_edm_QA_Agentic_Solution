# Contributing to the Convergent EDM QA Suite

Thank you for contributing to this test suite. This guide covers everything you need to know before opening a PR.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development setup](#development-setup)
3. [Architecture overview](#architecture-overview)
4. [Writing tests](#writing-tests)
5. [Writing page objects](#writing-page-objects)
6. [Golden rules — never violate](#golden-rules--never-violate)
7. [Selector guidelines](#selector-guidelines)
8. [TypeScript rules](#typescript-rules)
9. [Running tests locally](#running-tests-locally)
10. [Visual regression baselines](#visual-regression-baselines)
11. [Claude Code and AI tooling](#claude-code-and-ai-tooling)
12. [PR checklist](#pr-checklist)

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x LTS |
| npm | 9.x |
| Git | any |

---

## Development setup

```bash
# 1. Clone the repo
git clone https://github.com/<org>/convergent_edm_QA_Agentic_Solution.git
cd convergent_edm_QA_Agentic_Solution

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (Chromium is sufficient for most local work)
npx playwright install --with-deps chromium

# 4. Verify TypeScript compiles
npm run typecheck

# 5. Run smoke tests to confirm the setup works
npm run test:smoke
```

---

## Architecture overview

This suite follows the **Page Object Model (POM)** design pattern with OOP principles.

```
BasePage
├── HomePage           — src/pages/home.page.ts
├── NavigationPage     — src/pages/navigation.page.ts
├── ContactFormPage    — src/pages/contact.page.ts
└── <YourPage>         — src/pages/<name>.page.ts
```

**OOP principles applied:**

| Principle | How it applies here |
|-----------|-------------------|
| Inheritance | All pages extend `BasePage` for shared `navigate()`, `getTitle()`, etc. |
| Encapsulation | Locators and interaction logic are private to each page class |
| Single Responsibility | Each class owns exactly one page or major section |

---

## Writing tests

### Test file location

| Suite | Directory | Tag |
|-------|-----------|-----|
| Smoke | `tests/smoke/` | `@smoke` |
| Navigation | `tests/navigation/` | `@navigation` |
| Forms | `tests/forms/` | `@forms` |
| Functional | `tests/functional/` | `@functional` |
| Visual | `tests/visual/` | `@visual` |
| Responsive | `tests/responsive/` | `@responsive` |

### Always import from the fixture, never from Playwright directly

```typescript
// Correct
import { test, expect } from '@fixtures/site.fixture';

// Wrong — do NOT do this
import { test, expect } from '@playwright/test';
```

### Tag every test

```typescript
test.describe('Homepage @functional', () => {
  test('H1 heading is present and non-empty @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(heading.length).toBeGreaterThan(0);
  });
});
```

### Skip unavailable features with a clear reason

```typescript
test('live chat widget is present @functional', async ({ page, siteConfig }) => {
  test.skip(!siteConfig.hasLiveChat, 'Live chat not configured for this site');
  // ...
});
```

---

## Writing page objects

### Template

```typescript
// src/pages/example.page.ts
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ExamplePage extends BasePage {
  // Declare all locators as readonly properties
  readonly heading: Locator = this.page.locator('h1').first();
  readonly ctaButton: Locator = this.page.getByRole('link', { name: /get started/i });

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent())?.trim() ?? '';
  }

  async clickCta(): Promise<void> {
    await this.ctaButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

### Register the new page in `src/fixtures/site.fixture.ts`

```typescript
import { ExamplePage } from '@pages/example.page';

export interface Fixtures {
  // ...existing fixtures...
  examplePage: ExamplePage;
}

export const test = base.extend<Fixtures>({
  // ...existing fixtures...
  examplePage: async ({ page, siteConfig }, use) => {
    await use(new ExamplePage(page, siteConfig));
  },
});
```

---

## Golden rules — never violate

| Rule | Reason |
|------|--------|
| **Never submit a form** | Prevents spam reaching the client's real inbox |
| **Never hardcode a URL in tests** | Tests must work across environments via `baseURL` |
| **No `expect()` inside page objects** | POMs are action-only; assertions belong in specs |
| **Tag every test** | Enables targeted CI runs (`--grep @smoke`) |
| **Run `npm run typecheck` before pushing** | TypeScript strict mode must pass |
| **No `page.waitForTimeout()` > 500ms** | Prevents flaky tests from arbitrary sleeps |
| **No `any` type** | Use explicit TypeScript types throughout |
| **No `test.only()`** | It silently skips all other tests in CI |
| **No test-order dependencies** | Tests must pass in any order |

---

## Selector guidelines

Use selectors in this priority order (most robust and accessible first):

1. `page.getByRole('button', { name: 'Submit' })` — ARIA roles
2. `page.getByLabel('Email address')` — form labels
3. `page.getByText('Learn more')` — visible text
4. `page.locator('[data-testid="hero"]')` — test IDs (if present)
5. `page.locator('[aria-label="Open menu"]')` — ARIA labels
6. `page.locator('input[name="email"]')` — semantic HTML attributes
7. `page.locator('.btn-primary')` — CSS classes (last resort)

---

## TypeScript rules

- Strict mode is enforced (`tsconfig.json`)
- No implicit `any`
- All page object properties must have explicit types
- All async methods must declare a return type
- Path aliases: `@pages/*`, `@fixtures/*`, `@utils/*`, `@site-types/*`

---

## Running tests locally

```bash
# All tests
npm test

# By suite
npm run test:smoke
npm run test:navigation
npm run test:forms
npm run test:functional
npm run test:visual
npm run test:responsive

# With browser visible
npm run test:headed

# Single file
npx playwright test tests/smoke/site-availability.spec.ts

# Matching a pattern
npx playwright test --grep "homepage"

# Open HTML report
npm run report
```

---

## Visual regression baselines

Screenshot tests compare against committed baseline images in `__snapshots__/`.

```bash
# First time — capture baselines
npm run baseline

# After intentional design changes — re-capture and commit
npm run baseline
git add __snapshots__/
git commit -m "chore: update visual baselines after redesign"
```

**Important:** Always visually review screenshots before committing. Do not update baselines just to make failing tests green — investigate the visual change first.

---

## Claude Code and AI tooling

This repository is instrumented for **Claude Code** (and any AI agent that reads `AGENTS.md`).

### Available slash commands

Run these inside a Claude Code session:

| Command | What it does |
|---------|-------------|
| `/analyze-site` | Inspects the live site and updates `site.config.json` |
| `/generate-full-suite` | Generates a complete POM + tests from scratch |
| `/run-smoke` | Runs smoke tests and shows formatted results |
| `/update-baseline` | Re-captures visual regression baselines |
| `/generate-report` | Summarizes the most recent test run |

### Key configuration files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Claude Code project instructions (read every session) |
| `AGENTS.md` | Cross-tool agent spec (Copilot, Cursor, Devin, Claude Code) |
| `SKILLS.md` | Slash command and sub-agent documentation |
| `.claude/commands/` | Slash command definitions |
| `.claude/agents/` | Sub-agent definitions |
| `.claude/rules/` | Path-scoped instruction files imported by CLAUDE.md |

---

## PR checklist

Before opening a PR, verify:

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Tests are tagged with at least one `@tag`
- [ ] No `test.only()` remains
- [ ] No form is submitted in any test
- [ ] No URL is hardcoded
- [ ] Visual baselines updated if needed and committed
- [ ] PR description uses the template (`.github/pull_request_template.md`)
