# Convergent EDM — QA Agentic Test Suite

Automated regression test framework for [Convergent EDM](http://convergentedm.com/) built with **Playwright + TypeScript**, following the **Page Object Model (POM)** design pattern and **OOP** principles.

This repository is structured for AI-assisted test generation via **Claude Code** and human contributors to maintain and extend.

---

## What This Repo Tests

| Field | Value |
|-------|-------|
| Company | Convergent EDM |
| Industry | Document & Imaging Management Software |
| Site | `http://convergentedm.com` (configured in `site.config.json`) |
| Auth required | No |

Coverage areas:

| Suite | Tag | Description |
|-------|-----|-------------|
| Smoke | `@smoke` | Site availability, HTTPS, page load time, console errors |
| Navigation | `@navigation` | Nav links, mobile menu, routing, logo link |
| Forms | `@forms` | Contact form fields, HTML5 validation, accessibility |
| Functional | `@functional` | Content sections, CTAs, headings, footer, SEO meta |
| Visual | `@visual` | Screenshot regression across desktop/mobile/tablet |
| Responsive | `@responsive` | Layout integrity at all viewport breakpoints |

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 18.x | LTS recommended |
| npm | >= 9.x | Bundled with Node.js |
| Git | any | For version control |

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/<org>/convergent_edm_QA_Agentic_Solution.git
cd convergent_edm_QA_Agentic_Solution

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (Chromium only for CI speed)
npx playwright install --with-deps chromium

# 4. (Optional) Copy local environment file
cp .env.example .env.local

# 5. Verify TypeScript compiles cleanly
npm run typecheck
```

---

## Running Tests

```bash
npm test                    # Run all tests
npm run test:smoke          # @smoke — availability checks
npm run test:navigation     # @navigation — nav links and routing
npm run test:forms          # @forms — form field/validation tests
npm run test:functional     # @functional — content, CTA, footer, SEO
npm run test:visual         # @visual — screenshot regression
npm run test:responsive     # @responsive — layout at breakpoints
npm run test:headed         # All tests with a visible browser window
npm run baseline            # Update visual regression snapshots
npm run report              # Open the HTML test report in a browser
npm run typecheck           # TypeScript check (no emit)
npm run lint                # ESLint across src/ and tests/
```

### Run a single file

```bash
npx playwright test tests/smoke/site-availability.spec.ts
```

### Run tests matching a string

```bash
npx playwright test --grep "homepage"
```

### Override the target URL

```bash
SITE_URL=https://staging.convergentedm.com npm test
```

---

## Project Structure

```
convergent_edm_QA_Agentic_Solution/
├── site.config.json              # Target site URL and feature flags
├── playwright.config.ts          # Browser projects (desktop/mobile/tablet)
├── global-setup.ts               # Pre-run site reachability check
├── tsconfig.json                 # TypeScript strict-mode configuration
│
├── src/
│   ├── pages/                    # Page Object Model (POM) classes
│   │   ├── base.page.ts          #   BasePage — shared helpers for all pages
│   │   ├── home.page.ts          #   HomePage
│   │   ├── navigation.page.ts    #   NavigationPage
│   │   └── contact.page.ts       #   ContactFormPage
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom Playwright test fixtures
│   ├── utils/
│   │   ├── link-checker.ts       # HTTP link health utility
│   │   └── visual-helper.ts      # Cookie banner dismiss + visual helpers
│   └── types/
│       └── site-config.types.ts  # SiteConfig TypeScript interface + loader
│
├── tests/
│   ├── smoke/                    # @smoke — site loads, title, JS errors
│   ├── navigation/               # @navigation — nav links, mobile menu
│   ├── forms/                    # @forms — form fields and validation
│   ├── functional/               # @functional — content, CTA, SEO, footer
│   ├── visual/                   # @visual — screenshot regression
│   └── responsive/               # @responsive — viewport layout
│
├── .claude/
│   ├── agents/                   # Sub-agent definitions for Claude Code
│   │   ├── site-analyzer.md      #   Crawls site and populates site.config.json
│   │   └── test-generator.md     #   Generates site-specific custom tests
│   ├── commands/                 # Slash command definitions
│   │   ├── analyze-site.md       #   /analyze-site
│   │   ├── generate-full-suite.md#   /generate-full-suite
│   │   ├── run-smoke.md          #   /run-smoke
│   │   ├── update-baseline.md    #   /update-baseline
│   │   └── generate-report.md    #   /generate-report
│   └── rules/                    # Path-scoped Claude Code instruction rules
│       ├── testing.md            #   Rules for tests/**/*.spec.ts
│       └── page-objects.md       #   Rules for src/pages/**/*.ts
│
├── .github/
│   ├── workflows/
│   │   └── playwright.yml        # GitHub Actions CI pipeline
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md         # Bug report template
│   │   └── test_request.md       # New test coverage request template
│   ├── pull_request_template.md  # PR checklist template
│   └── CONTRIBUTING.md           # Detailed contributor guidelines
│
├── AGENTS.md                     # AI agent instructions (all tools)
├── SKILLS.md                     # Slash commands and skills reference
└── CLAUDE.md                     # Claude Code specific instructions
```

---

## Architecture: Page Object Model

Every page or major section has a dedicated class in `src/pages/` that extends `BasePage`.

```
BasePage
├── HomePage
├── NavigationPage
└── ContactFormPage
```

**OOP principles applied:**
- **Encapsulation** — locators and interaction logic are private to each page class
- **Inheritance** — all pages extend `BasePage` for shared `navigate()`, `getTitle()`, `isResponsive()` etc.
- **Single Responsibility** — each class owns one page or section's interactions

**Rules:**
- Locators are `readonly Locator` properties declared on the class
- Methods perform user actions — never contain `expect()` calls
- Tests import `{ test, expect }` from `@fixtures/site.fixture`, not from `@playwright/test`

### Adding a new page object

1. Create `src/pages/<name>.page.ts` extending `BasePage`
2. Register it as a fixture in `src/fixtures/site.fixture.ts`
3. Write the spec in `tests/<category>/<name>.spec.ts`
4. Tag every `test()` with at least one `@tag`
5. Run `npm run typecheck` to verify

---

## Visual Regression

Screenshot tests compare against committed baseline images.

```bash
# First time: capture baselines
npm run baseline

# Each run: compare against baselines
npm run test:visual

# After intentional design change: re-capture and commit
npm run baseline
git add __snapshots__/
git commit -m "chore: update visual baselines after redesign"
```

Baselines live in `__snapshots__/` and **must be committed** to the repo.

---

## Configuring for a Different Site

Edit `site.config.json`:

```json
{
  "name": "Company Name",
  "url": "https://example.com",
  "description": "Short description",
  "industry": "SaaS",
  "hasContactForm": true,
  "expectedNavItems": ["Home", "About", "Services", "Contact"],
  "viewports": ["desktop", "mobile", "tablet"],
  "skipVisual": false,
  "skipForms": false,
  "auth": {
    "required": false,
    "loginUrl": "",
    "username": "",
    "password": ""
  }
}
```

Then run `/analyze-site` in a Claude Code session to auto-populate `expectedNavItems` and validate all flags against the live site.

---

## CI/CD

Every push and pull request runs the test suite via GitHub Actions (`.github/workflows/playwright.yml`). The pipeline runs in three stages:

### Stage 1 — Smoke gate

Runs first on every push and PR. Subsequent stages only start if smoke passes.

### Stage 2 — Core suites (parallel)

Navigation, Forms, Functional, and Responsive suites run in parallel jobs after the smoke gate.

| Trigger | Suites |
|---------|--------|
| Push to `main` or `develop` | Smoke → Navigation + Forms + Functional + Responsive (parallel) |
| PR to `main` | Smoke → Navigation + Forms + Functional + Responsive (parallel) |
| Manual dispatch | All suites |

### Stage 3 — Visual regression

Runs only on pushes to `main` and manual dispatches (not on every PR to keep run times down).

### Artifacts

Uploaded on failure (retained for 14–30 days):
- `playwright-report/` — HTML report with traces and screenshots
- `test-results/` — raw screenshots, videos, and JSON results
- `__snapshots__/` — visual diffs (visual job only)

---

## Claude Code Initialization

This repository is fully initialized for Claude Code ([docs](https://code.claude.com/docs/en/overview)). The checklist below documents every configuration file and what it does.

### Core instruction files

| File | Description | Claude Code doc |
|------|-------------|-----------------|
| `CLAUDE.md` | Primary project instructions — read at the start of every session | [Memory](https://code.claude.com/docs/en/memory) |
| `AGENTS.md` | Cross-tool agent spec — also read by Copilot, Cursor, Devin, and others | [AGENTS.md](https://code.claude.com/docs/en/overview) |
| `SKILLS.md` | Human-readable documentation for all slash commands and sub-agents | Local convention |

### `.claude/` directory

| Path | Description |
|------|-------------|
| `.claude/commands/analyze-site.md` | `/analyze-site` slash command |
| `.claude/commands/generate-full-suite.md` | `/generate-full-suite` slash command |
| `.claude/commands/run-smoke.md` | `/run-smoke` slash command |
| `.claude/commands/update-baseline.md` | `/update-baseline` slash command |
| `.claude/commands/generate-report.md` | `/generate-report` slash command |
| `.claude/agents/site-analyzer.md` | Sub-agent: crawls the live site, populates `site.config.json` |
| `.claude/agents/test-generator.md` | Sub-agent: generates site-specific spec files |
| `.claude/rules/testing.md` | Path-scoped rules for `tests/**/*.spec.ts` (imported by CLAUDE.md) |
| `.claude/rules/page-objects.md` | Path-scoped rules for `src/pages/**/*.ts` (imported by CLAUDE.md) |
| `.claude/hooks/pre-test.sh` | Pre-test hook: checks site reachability before Playwright runs |

### `.github/` directory

| Path | Description |
|------|-------------|
| `.github/workflows/playwright.yml` | GitHub Actions CI — 3-stage pipeline (smoke → core → visual) |
| `.github/CONTRIBUTING.md` | Detailed contributor guidelines |
| `.github/pull_request_template.md` | PR checklist enforcing QA rules |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Bug report issue template |
| `.github/ISSUE_TEMPLATE/test_request.md` | New test coverage request template |

### Setting up Claude Code for this project

1. Install Claude Code: `irm https://claude.ai/install.ps1 | iex` (Windows PowerShell)
2. Open Claude Code in this directory: `claude`
3. Claude Code reads `CLAUDE.md` automatically at the start of every session
4. Run `/analyze-site` to verify `site.config.json` is current
5. Run `/run-smoke` to confirm tests are healthy

---

## Claude Code Slash Commands

Run these inside a Claude Code session:

| Command | Description |
|---------|-------------|
| `/analyze-site` | Inspect live site and produce `site.config.json` |
| `/generate-full-suite` | Generate complete POM + tests from scratch |
| `/run-smoke` | Run smoke tests and show formatted results |
| `/update-baseline` | Refresh visual regression baselines |
| `/generate-report` | Summarize latest test results |

See `SKILLS.md` for full documentation on each command.

---

## Contributor Rules

| Rule | Why |
|------|-----|
| Never submit a form | Avoid spamming the client's inbox |
| Never hardcode a URL | Tests must work across environments via `baseURL` |
| No `expect()` in page objects | POMs are actions-only; assertions belong in specs |
| Tag every test | Enables targeted CI runs (`--grep @smoke`) |
| Run `npm run typecheck` before pushing | TypeScript strict mode must pass |
| No `page.waitForTimeout()` > 500ms | Prevents flaky tests from arbitrary waits |
| No `any` type | Use explicit TypeScript types throughout |

See `.github/CONTRIBUTING.md` for detailed contribution guidelines.

---

## Troubleshooting

**Tests fail immediately — "site unreachable"**

The target site may be temporarily down or blocking automated requests. The test suite continues and collects what results it can. Check `http://convergentedm.com` manually in a browser.

**HTTPS smoke test fails**

The current `site.config.json` uses `http://`. If the site supports HTTPS, update the `url` field to `https://convergentedm.com`. If it does not, this is a finding worth reporting to the site owner.

**Visual tests fail after design changes**

Run `npm run baseline` to re-capture snapshots, review the visual diff in `playwright-report/`, then commit the updated `__snapshots__/` files.

**TypeScript errors**

Run `npm run typecheck` and fix reported errors before pushing.

**Playwright browser not found**

Run `npx playwright install --with-deps chromium` to install the required browser.

---

*Built as part of the Phoenix Startup QA Agentic Solutions project.*
