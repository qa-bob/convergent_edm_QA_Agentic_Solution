## Summary

<!-- What does this PR change? Why? -->

## Type of change

- [ ] New test coverage (new spec file or page object)
- [ ] Updated existing test (selector fix, assertion update, refactor)
- [ ] New page object class (`src/pages/`)
- [ ] Infrastructure / config change (playwright.config.ts, tsconfig.json, etc.)
- [ ] Documentation update

## Test files added or changed

<!-- List each file that was added or modified -->

| File | What changed |
|------|-------------|
| | |

## QA checklist

### Tests
- [ ] Every new `test()` has at least one tag: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- [ ] No `test.only()` left in any spec file
- [ ] No form is submitted (no real HTTP POST triggered)
- [ ] No URL hardcoded in test body — `baseURL` or `siteConfig.url` is used

### Page Objects
- [ ] New page classes extend `BasePage`
- [ ] Locators are `readonly Locator` properties on the class
- [ ] No `expect()` calls inside page object methods
- [ ] New page objects registered in `src/fixtures/site.fixture.ts`

### TypeScript & quality
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] No `any` type without explicit justification
- [ ] No `page.waitForTimeout()` > 500ms

### Visual regression (if applicable)
- [ ] `npm run baseline` run to update snapshots after intentional design changes
- [ ] Updated `__snapshots__/` files reviewed visually and committed

## Related issues

<!-- Closes # -->
