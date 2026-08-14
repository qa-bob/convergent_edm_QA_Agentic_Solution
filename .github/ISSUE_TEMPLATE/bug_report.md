---
name: Bug report
about: Report a failing test or unexpected test behavior
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the bug

<!-- A clear, concise description of what is wrong with the test -->

## Test file and test name

<!-- e.g., tests/smoke/site-availability.spec.ts — "site homepage loads successfully @smoke" -->

**File:**
**Test name:**

## Steps to reproduce

1. Run `npm run test:<suite>` (replace `<suite>` with the failing suite)
2. See error

## Expected behavior

<!-- What should happen -->

## Actual behavior

<!-- What actually happens; paste the Playwright error message below -->

## Error output

```
<!-- Paste the full error here -->
```

## Environment

| Field | Value |
|-------|-------|
| OS | |
| Node version (`node --version`) | |
| Playwright version (`npx playwright --version`) | |
| Browser | Chromium / Firefox / WebKit |
| Site URL being tested | |

## Artifacts

<!-- Attach `playwright-report/` screenshots or `.zip` trace files if available -->
