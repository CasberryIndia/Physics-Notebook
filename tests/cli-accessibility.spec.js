const { test, expect } = require('@playwright/test');

async function tabToLocator(page, locator, maxTabs = 12) {
    for (let i = 0; i < maxTabs; i += 1) {
        if (await locator.evaluate((element) => element === document.activeElement)) {
            return;
        }

        await page.keyboard.press('Tab');
    }

    throw new Error('Failed to move keyboard focus to the requested element.');
}

function parseHexColor(color) {
    const value = color.replace('#', '');
    const expanded = value.length === 3
        ? value.split('').map((char) => char + char).join('')
        : value;

    return [
        parseInt(expanded.slice(0, 2), 16),
        parseInt(expanded.slice(2, 4), 16),
        parseInt(expanded.slice(4, 6), 16)
    ];
}

function relativeLuminance([red, green, blue]) {
    const normalize = (channel) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };

    const [r, g, b] = [red, green, blue].map(normalize);
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function contrastRatio(foreground, background) {
    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
    return (lighter + 0.05) / (darker + 0.05);
}

function parseCssColor(color) {
    const match = color.match(/rgba?\(([^)]+)\)/i);
    if (!match) {
        return parseHexColor(color);
    }

    const [red, green, blue, alpha = '1'] = match[1].split(',').map((part) => part.trim());
    return [Number(red), Number(green), Number(blue), Number(alpha)];
}

function blendColor(foreground, background) {
    const [fr, fg, fb, fa = 1] = foreground;
    const [br, bg, bb] = background;
    const alpha = Number(fa);

    return [
        Math.round((fr * alpha) + (br * (1 - alpha))),
        Math.round((fg * alpha) + (bg * (1 - alpha))),
        Math.round((fb * alpha) + (bb * (1 - alpha)))
    ];
}

async function cssVars(page) {
    return page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
            bg: styles.getPropertyValue('--bg-color').trim(),
            textMain: styles.getPropertyValue('--text-main').trim(),
            textMuted: styles.getPropertyValue('--text-muted').trim()
        };
    });
}

async function locatorContrast(locator) {
    return locator.evaluate((element) => {
        const styles = getComputedStyle(element);
        const docStyles = getComputedStyle(document.documentElement);
        return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            pageBackground: docStyles.getPropertyValue('--bg-color').trim()
        };
    });
}

test('library cards stay keyboard reachable and open with Enter', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute('href', 'Concepts/simple-oscillations.html');

    await tabToLocator(page, firstCard);
    await expect(firstCard).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/Concepts\/simple-oscillations\.html$/);
});

test('AI buttons expose accessible names in the browser accessibility tree', async ({ page }) => {
    await page.goto('/Concepts/newtons-laws-of-motion.html');

    const aiButtons = page.locator('.ai-btn');
    await expect(aiButtons.first()).toHaveAccessibleName('Ask Claude');
    await expect(aiButtons.nth(1)).toHaveAccessibleName('Ask Gemini');
    await expect(aiButtons.nth(2)).toHaveAccessibleName('Ask ChatGPT');
    await expect(aiButtons.nth(3)).toHaveAccessibleName('Ask Grok');
    await expect(aiButtons.nth(4)).toHaveAccessibleName('Ask Perplexity');
});

test('concept canvases expose meaningful accessible names', async ({ page }) => {
    await page.goto('/Concepts/newtons-laws-of-motion.html');

    const canvases = page.locator('.visual-col canvas');
    await expect(canvases.first()).toHaveAccessibleName('Objects at Rest or in Motion visualization');
    await expect(canvases.nth(1)).toHaveAccessibleName('Force and Acceleration visualization');
    await expect(canvases.nth(2)).toHaveAccessibleName('Equal and Opposite visualization');
});

test('slider interactions update accessible value text and simulation status', async ({ page }) => {
    await page.goto('/Concepts/gravitational-waves.html');

    const slider = page.locator('#merger-sep');
    await expect(slider).toHaveAttribute('aria-label', 'Initial Separation');
    await expect(slider).toHaveAttribute('aria-valuetext', '120 km');

    await slider.fill('150');
    await expect(slider).toHaveAttribute('aria-valuetext', '150 km');

    const status = page.locator('#canvas-mergers-status');
    await expect(status).toContainText('Initial Separation: 150 km');

    const describedBy = await page.locator('#canvas-mergers').getAttribute('aria-describedby');
    expect(describedBy).toBe('canvas-mergers-status');
});

test('button-driven simulation controls announce their activation state', async ({ page }) => {
    await page.goto('/Concepts/projectile-motion.html');

    await page.locator('#btn-fire').click();
    await expect(page.locator('#canvas-projectile-status')).toContainText('Fire Projectile');
});

test('sample pages stay free of console and page errors', async ({ page }) => {
    const failures = [];
    page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
        if (message.type() === 'error') {
            failures.push(`console: ${message.text()}`);
        }
    });

    await page.goto('/');
    await page.waitForTimeout(500);
    await page.goto('/Concepts/newtons-laws-of-motion.html');
    await page.waitForTimeout(500);

    expect(failures).toEqual([]);
});

test('core text contrast stays above WCAG AA in light and dark themes', async ({ page }) => {
    await page.goto('/');

    const light = await cssVars(page);
    const lightBg = parseHexColor(light.bg);
    expect(contrastRatio(parseHexColor(light.textMain), lightBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseHexColor(light.textMuted), lightBg)).toBeGreaterThanOrEqual(4.5);

    await page.locator('#themeBtn').click();

    const dark = await cssVars(page);
    const darkBg = parseHexColor(dark.bg);
    expect(contrastRatio(parseHexColor(dark.textMain), darkBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseHexColor(dark.textMuted), darkBg)).toBeGreaterThanOrEqual(4.5);
});

test('key UI labels stay above WCAG AA contrast on home and concept pages', async ({ page }) => {
    await page.goto('/');

    const homeChecks = [
        '.card-tag',
        '.github-btn',
        '.filter-chip.active'
    ];

    for (const selector of homeChecks) {
        const colors = await locatorContrast(page.locator(selector).first());
        const foreground = parseCssColor(colors.color);
        const background = colors.backgroundColor === 'rgba(0, 0, 0, 0)'
            ? parseHexColor(colors.pageBackground)
            : blendColor(parseCssColor(colors.backgroundColor), parseHexColor(colors.pageBackground));
        expect(contrastRatio(foreground.slice(0, 3), background)).toBeGreaterThanOrEqual(4.5);
    }

    await page.goto('/Concepts/newtons-laws-of-motion.html');

    const conceptChecks = [
        '.etu-tag',
        '.ai-label',
        '.slider-group label'
    ];

    for (const selector of conceptChecks) {
        const colors = await locatorContrast(page.locator(selector).first());
        const foreground = parseCssColor(colors.color);
        const background = colors.backgroundColor === 'rgba(0, 0, 0, 0)'
            ? parseHexColor(colors.pageBackground)
            : blendColor(parseCssColor(colors.backgroundColor), parseHexColor(colors.pageBackground));
        expect(contrastRatio(foreground.slice(0, 3), background)).toBeGreaterThanOrEqual(4.5);
    }
});
