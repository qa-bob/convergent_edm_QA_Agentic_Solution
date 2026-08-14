# Skills Reference — QA Agentic Solution

This document describes all Claude Code slash commands (skills) available in this repository. Run these inside a Claude Code session.

---

## `/analyze-site`

**File:** `.claude/commands/analyze-site.md`

**Purpose:** Inspect a live website and produce a fully-populated `site.config.json`.

**Usage:**
```
/analyze-site
/analyze-site https://example.com
```

**What it does:**
1. Navigates to the site URL (from `site.config.json` or an overriding URL argument)
2. Extracts: page title, meta description, primary nav items (text + href), H1 content
3. Finds contact forms by checking the homepage, `/contact`, `/contact-us`, `/get-in-touch`
4. Checks: HTTPS, meta viewport tag, favicon, image alt attributes
5. Outputs a complete `site.config.json` JSON block plus an "Issues found" checklist

**When to use:**
- Onboarding this framework onto a new company's site
- Verifying that `site.config.json` is still accurate after a site redesign
- Before running `/generate-full-suite` for the first time

**Edge cases handled:**
- SPAs: waits for `networkidle` before inspecting DOM
- Cookie banners: dismissed before extracting nav structure
- Auth-gated sites: sets `auth.required: true`, skips form/visual flags

---

## `/generate-full-suite`

**File:** `.claude/commands/generate-full-suite.md`

**Purpose:** Analyze the target website and generate a complete Page Object Model + test suite from scratch.

**Usage:**
```
/generate-full-suite
```

**What it does:**
1. Reads `site.config.json` for URL and feature flags
2. Fetches the live site to discover all pages, sections, forms, and interactive elements
3. Creates or updates page object classes in `src/pages/` based on actual DOM
4. Generates spec files across all suites: smoke, navigation, forms, functional, visual, responsive
5. Tags every test appropriately
6. Runs `npx tsc --noEmit` to verify TypeScript compiles cleanly
7. Reports which files were created and which tests were generated

**When to use:**
- Initial test suite generation for a new site
- After a major site redesign that invalidates existing selectors
- When test coverage has large gaps across multiple categories

**Important:** Always run `/analyze-site` first to ensure `site.config.json` is accurate.

---

## `/run-smoke`

**File:** `.claude/commands/run-smoke.md`

**Purpose:** Run the `@smoke` test suite and display a formatted pass/fail summary.

**Usage:**
```
/run-smoke
```

**What it does:**
1. Runs `npm run test:smoke`
2. Parses `test-results/results.json`
3. Displays a table: test name, status (PASS/FAIL/WARN), duration
4. For failures: shows error message and a suggested fix
5. Mirrors the underlying exit code (0 = all pass, 1 = any failure)

**When to use:**
- Quick confidence check that the site is up and tests are healthy
- After deploying a site change
- As a first step before running the full suite

**Suggested fixes by failure type:**

| Failure | Suggestion |
|---------|-----------|
| HTTP 4xx/5xx | Site may be down; check hosting/DNS |
| Load time > 10s | Audit with Lighthouse; check large images/blocking JS |
| Console errors | Open DevTools on the live site to inspect errors |
| Not HTTPS | Configure SSL cert; update `url` in `site.config.json` |
| Missing meta description | Add `<meta name="description">` to site `<head>` |

---

## `/update-baseline`

**File:** `.claude/commands/update-baseline.md`

**Purpose:** Re-capture visual regression baseline screenshots.

**Usage:**
```
/update-baseline
```

**What it does:**
1. Runs `npm run baseline` (Playwright with `--update-snapshots` flag)
2. Reports which baseline images were created or updated
3. Lists the snapshot paths for review
4. Reminds you to commit the updated `__snapshots__/` files

**When to use:**
- After intentional design changes that would cause `@visual` tests to fail
- After a site redesign or brand refresh
- When setting up the framework on a new machine

**Important:** Always visually review the generated screenshots before committing. Do not update baselines just to make failing tests green — investigate why the visual changed first.

---

## `/generate-report`

**File:** `.claude/commands/generate-report.md`

**Purpose:** Generate a human-readable summary of the most recent test run.

**Usage:**
```
/generate-report
```

**What it does:**
1. Reads `test-results/results.json` (runs tests first if no results file exists)
2. Produces a markdown summary: total/pass/fail/skip counts by suite
3. Lists all failures with their error context and location
4. Shows overall duration and browser project coverage

**When to use:**
- After a full test run to review results or prepare a status update
- When sharing QA results with stakeholders
- To identify which suites have the most failures

---

## Sub-Agents

These agents are invoked automatically by Claude Code when a task matches their description. You do not call them directly with a slash command.

### `site-analyzer`

**File:** `.claude/agents/site-analyzer.md`

Crawls a live website using a headless browser context to produce a fully-populated `site.config.json`. Handles SPAs, auth-gated content, cookie banners, and redirect chains. Invoked by `/analyze-site` and during initial onboarding.

### `test-generator`

**File:** `.claude/agents/test-generator.md`

Reads `site.config.json` and generates site-specific Playwright TypeScript test files in `tests/custom/`. Used for scenarios that aren't covered by the generic shared test suite — custom business logic, unique interactive elements, or regression tests for specific bugs. Invoked by `/generate-full-suite` for the site-specific layer.

---

## Adding a New Skill

1. Create `.claude/commands/<skill-name>.md`
2. Open with `# /<skill-name>`
3. Include these sections: **Purpose**, **Usage** (code block), **What it does** (numbered steps), edge case handling
4. Add an entry to this `SKILLS.md` file
5. Add an entry to the **Slash Commands** table in `CLAUDE.md`
6. If the skill uses a sub-agent, create `.claude/agents/<agent-name>.md`
