# Rules — src/pages/**/*.ts

These rules apply whenever writing or editing any file under `src/pages/`.

---

## Class structure

Every page class MUST:

1. Extend `BasePage` from `@pages/base.page`
2. Call `super(page, config)` in the constructor (if constructor is defined)
3. Declare all locators as `readonly Locator` properties on the class
4. Only expose methods that represent **user actions or data retrieval** — never assertions

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ExamplePage extends BasePage {
  // All locators declared as readonly properties
  readonly heroHeading: Locator = this.page.locator('h1').first();
  readonly ctaButton: Locator = this.page.getByRole('link', { name: /get started/i });

  // Methods return data or perform actions — never call expect()
  async getHeroHeadingText(): Promise<string> {
    return (await this.heroHeading.textContent())?.trim() ?? '';
  }

  async clickCta(): Promise<void> {
    await this.ctaButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

---

## Prohibited patterns

- `expect()` calls inside any page object method — assertions belong in spec files
- `any` type without an explicit inline justification comment
- Methods that return `void` when they could return meaningful data
- Locators constructed inside method bodies instead of as class properties
- `page.waitForTimeout()` > 500ms — use Playwright auto-waiting

---

## TypeScript requirements

- All async methods MUST declare an explicit return type:
  - `Promise<void>` for actions
  - `Promise<string>` for text getters
  - `Promise<boolean>` for presence checks
  - `Promise<Locator | null>` when a locator may not be found
- No implicit `any`
- Use path alias `@pages/` for cross-page imports

---

## Naming conventions

- Class name: `PascalCase` ending in `Page` (e.g., `ServicePage`, `AboutPage`)
- File name: `kebab-case.page.ts` matching the class (e.g., `service.page.ts`)
- Locator properties: camelCase descriptive noun (e.g., `heroHeading`, `submitButton`)
- Action methods: camelCase verb phrase (e.g., `clickCta`, `fillEmailField`)
- Getter methods: camelCase `get*` prefix (e.g., `getMainHeading`, `getFooterLinks`)
- Boolean checks: camelCase `is*` or `has*` prefix (e.g., `isNavVisible`, `hasEmailField`)

---

## After creating a new page class

Register it as a fixture in `src/fixtures/site.fixture.ts`:

```typescript
import { ExamplePage } from '@pages/example.page';

export interface Fixtures {
  examplePage: ExamplePage;
}

export const test = base.extend<Fixtures>({
  examplePage: async ({ page, siteConfig }, use) => {
    await use(new ExamplePage(page, siteConfig));
  },
});
```
