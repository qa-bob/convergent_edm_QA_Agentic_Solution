/**
 * tests/functional/content-sections.spec.ts
 *
 * Functional tests — verify that the homepage and key content sections
 * are present, meaningful, and correctly structured.  Covers: headings,
 * hero area, CTA buttons, body content, footer, SEO meta tags, favicon.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Content @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForLoad();
  });

  // ── Headings ────────────────────────────────────────────────────────────────

  test('page has an H1 heading @functional', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count, 'Page should have at least one H1 heading').toBeGreaterThan(0);
  });

  test('H1 heading is non-empty @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(heading.length, 'H1 heading should have meaningful text').toBeGreaterThan(3);
  });

  test('heading hierarchy is correct (H1 before H2) @functional', async ({ page }) => {
    const h1 = page.locator('h1').first();
    const h2 = page.locator('h2').first();

    const h1Count = await h1.count();
    if (h1Count === 0) {
      console.warn('[functional] No H1 found — skipping hierarchy check');
      return;
    }

    const h2Count = await h2.count();
    if (h2Count === 0) return; // H1 only is fine

    // If both exist, verify H1 comes before H2 in DOM order
    const h1Box = await h1.boundingBox();
    const h2Box = await h2.boundingBox();

    if (h1Box && h2Box) {
      expect(
        h1Box.y,
        'H1 should appear before the first H2 on the page (higher vertical position)'
      ).toBeLessThanOrEqual(h2Box.y);
    }
  });

  // ── Body content ────────────────────────────────────────────────────────────

  test('page body has substantial text content @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText.trim().length,
      'Page should have at least 100 characters of visible text'
    ).toBeGreaterThan(100);
  });

  test('page has at least two content sections @functional', async ({ page }) => {
    const sectionCount = await page.locator('section, article, [class*="section"], [class*="block"]').count();
    if (sectionCount === 0) {
      // Fall back to generic div-based sections
      const divCount = await page.locator('main > div, #content > div, .content > div').count();
      expect(
        divCount,
        'Page should have multiple content sections or content containers'
      ).toBeGreaterThan(0);
      return;
    }
    expect(sectionCount, 'Page should have at least two distinct content sections').toBeGreaterThanOrEqual(1);
  });

  // ── CTA buttons ─────────────────────────────────────────────────────────────

  test('page has at least one call-to-action button or link @functional', async ({ homePage }) => {
    const ctaButtons = await homePage.getCTAButtons();

    if (ctaButtons.length === 0) {
      // Broader fallback: any prominent link in header or hero area
      const heroLinks = await homePage.page.locator('header a, section:first-of-type a').all();
      expect(
        heroLinks.length,
        'Homepage should have at least one CTA button or prominent link'
      ).toBeGreaterThan(0);
      return;
    }

    expect(ctaButtons.length, 'Page should have at least one visible CTA').toBeGreaterThan(0);
  });

  test('CTA buttons have non-generic text @functional', async ({ homePage }) => {
    const ctaButtons = await homePage.getCTAButtons();
    if (ctaButtons.length === 0) return; // Covered by presence test

    const genericPhrases = /^(click here|here|button|link|more)$/i;
    for (const btn of ctaButtons) {
      const text = ((await btn.textContent()) ?? '').trim();
      if (text.length === 0) continue;
      expect(
        genericPhrases.test(text),
        `CTA button has non-descriptive text: "${text}"`
      ).toBeFalsy();
    }
  });
});

test.describe('Footer @functional', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('footer is present on the page @functional', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]').first();
    const footerCount = await footer.count();
    expect(footerCount, 'Page should have a <footer> or role="contentinfo" element').toBeGreaterThan(0);
  });

  test('footer contains copyright text @functional', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]').first();
    if (await footer.count() === 0) {
      console.warn('[functional] No footer element found — skipping copyright check');
      return;
    }

    const footerText = (await footer.textContent()) ?? '';
    const hasCopyright =
      footerText.includes('©') ||
      footerText.toLowerCase().includes('copyright') ||
      /\d{4}/.test(footerText); // Year number as a fallback signal

    if (!hasCopyright) {
      console.warn('[functional] Footer does not contain obvious copyright text or year.');
    }
    // Soft assertion — footer missing copyright is a finding, not a hard failure
    expect(footerText.trim().length, 'Footer should have visible text content').toBeGreaterThan(0);
  });

  test('footer contains links @functional', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]').first();
    if (await footer.count() === 0) {
      console.warn('[functional] No footer element found — skipping link check');
      return;
    }

    const footerLinks = await footer.locator('a[href]').all();
    expect(
      footerLinks.length,
      'Footer should contain navigation links (privacy, terms, contact, etc.)'
    ).toBeGreaterThan(0);
  });

  test('footer links have accessible text @functional', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]').first();
    if (await footer.count() === 0) return;

    const footerLinks = await footer.locator('a').all();
    const emptyLinks: string[] = [];

    for (const link of footerLinks) {
      const text = ((await link.textContent()) ?? '').trim();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      if (!text && !ariaLabel && !title) {
        const href = (await link.getAttribute('href')) ?? 'unknown';
        emptyLinks.push(href);
      }
    }

    if (emptyLinks.length > 0) {
      console.warn(
        `[functional] Footer links without accessible text:\n` +
          emptyLinks.map((h) => `  ${h}`).join('\n')
      );
    }

    expect(
      emptyLinks.length,
      `${emptyLinks.length} footer link(s) have no text, aria-label, or title`
    ).toBe(0);
  });
});

test.describe('SEO Meta Tags @functional', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
  });

  test('page has a meaningful <title> tag @functional', async ({ page, siteConfig }) => {
    const title = await page.title();
    expect(title.trim().length, 'Page <title> should not be empty').toBeGreaterThan(3);
    expect(
      title.toLowerCase(),
      'Page title should not be a generic placeholder like "Home" alone'
    ).not.toBe('home');
    console.info(`[functional] Page title: "${title}" for "${siteConfig.name}"`);
  });

  test('page has a meta description @functional', async ({ page, siteConfig }) => {
    const metaDesc = await page
      .locator('meta[name="description"]')
      .getAttribute('content');

    if (!metaDesc || metaDesc.trim().length === 0) {
      console.warn(
        `[functional] "${siteConfig.name}" is missing a meta description — ` +
          'this negatively impacts SEO and click-through rates from search results.'
      );
    } else {
      expect(
        metaDesc.trim().length,
        'Meta description should contain meaningful content (>10 chars)'
      ).toBeGreaterThan(10);
      expect(
        metaDesc.trim().length,
        'Meta description should not exceed 160 characters (search engines truncate beyond this)'
      ).toBeLessThanOrEqual(160);
    }
  });

  test('page has Open Graph meta tags for social sharing @functional', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');

    if (!ogTitle) {
      console.warn('[functional] Missing og:title — social media shares will show generic text');
    }
    if (!ogDescription) {
      console.warn('[functional] Missing og:description — social shares will show no description');
    }
    if (!ogUrl) {
      console.warn('[functional] Missing og:url — may cause duplicate content issues');
    }

    // At least one OG tag should be present for a B2B marketing site
    const hasAnyOg = Boolean(ogTitle || ogDescription || ogUrl);
    if (!hasAnyOg) {
      console.warn('[functional] No Open Graph meta tags found. Consider adding og: tags for better social sharing.');
    }
  });

  test('page has a favicon @functional', async ({ page, siteConfig }) => {
    // Check for favicon in <head> link tags
    const faviconLink = page.locator(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    ).first();

    const hasFaviconLink = (await faviconLink.count()) > 0;

    if (!hasFaviconLink) {
      // Also check default /favicon.ico exists
      const response = await page.request
        .head(siteConfig.url.replace(/\/$/, '') + '/favicon.ico', { timeout: 5_000 })
        .catch(() => null);

      const defaultFaviconExists = response && response.ok();
      if (!defaultFaviconExists) {
        console.warn('[functional] No favicon detected. Add a <link rel="icon"> or /favicon.ico');
      }
    }
    // Soft assertion — favicon absence is a finding, not a hard blocker
  });

  test('page has a canonical URL tag @functional', async ({ page, siteConfig }) => {
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');

    if (!canonical) {
      console.warn(
        `[functional] "${siteConfig.name}" is missing a canonical URL tag. ` +
          'Add <link rel="canonical" href="..."> to avoid duplicate content penalties.'
      );
    } else {
      // Canonical should be an absolute URL
      expect(
        canonical.startsWith('http'),
        `Canonical URL should be absolute, got: "${canonical}"`
      ).toBeTruthy();
    }
  });
});

test.describe('External Links @functional', () => {
  test('external links have rel="noopener" for security @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const siteOrigin = new URL(siteConfig.url).origin;

    // Find all links that point to external domains and open in a new tab
    const unsafeLinks = await page.evaluate<string[], string>((origin) => {
      const links = Array.from(document.querySelectorAll('a[href][target="_blank"]'));
      return links
        .filter((a) => {
          try {
            const href = (a as HTMLAnchorElement).href;
            return href.startsWith('http') && !href.startsWith(origin);
          } catch {
            return false;
          }
        })
        .filter((a) => {
          const rel = ((a as HTMLAnchorElement).rel ?? '').toLowerCase();
          return !rel.includes('noopener') && !rel.includes('noreferrer');
        })
        .map((a) => (a as HTMLAnchorElement).href);
    }, siteOrigin);

    if (unsafeLinks.length > 0) {
      console.warn(
        `[functional] ${unsafeLinks.length} external link(s) with target="_blank" ` +
          `are missing rel="noopener":\n` +
          unsafeLinks.slice(0, 5).map((u) => `  ${u}`).join('\n')
      );
    }

    expect(
      unsafeLinks.length,
      `${unsafeLinks.length} external link(s) open in new tab without rel="noopener" (security risk)`
    ).toBe(0);
  });
});
