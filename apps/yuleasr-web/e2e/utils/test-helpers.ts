import { Page, expect, Locator } from '@playwright/test'

/**
 * Test helper utilities for yuleASR Configurator E2E tests
 */

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoading(page: Page, timeout = 10000) {
  const spinner = page.locator('.animate-spin')
  await spinner.waitFor({ state: 'detached', timeout })
}

/**
 * Wait for any network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Check if an element exists and is visible
 */
export async function isVisible(locator: Locator): Promise<boolean> {
  return await locator.isVisible().catch(() => false)
}

/**
 * Wait for toast/notification to appear and disappear
 */
export async function waitForToast(page: Page, text?: string, timeout = 5000) {
  const toast = text
    ? page.getByText(text)
    : page.locator('[class*="toast"], [role="status"]')
  
  await toast.waitFor({ state: 'visible', timeout })
  await toast.waitFor({ state: 'detached', timeout })
}

/**
 * Accept a browser confirmation dialog
 */
export function acceptDialog(page: Page) {
  page.on('dialog', async dialog => {
    await dialog.accept()
  })
}

/**
 * Dismiss a browser confirmation dialog
 */
export function dismissDialog(page: Page) {
  page.on('dialog', async dialog => {
    await dialog.dismiss()
  })
}

/**
 * Get text content of an element safely
 */
export async function getText(locator: Locator): Promise<string> {
  return await locator.textContent().catch(() => '')
}

/**
 * Wait for element to have specific text
 */
export async function waitForText(
  locator: Locator,
  text: string | RegExp,
  timeout = 5000
) {
  await expect(locator).toHaveText(text, { timeout })
}

/**
 * Retry an action multiple times
 */
export async function retry<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  delay = 500
): Promise<T> {
  let lastError: Error | undefined
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  })
}

/**
 * Mock the config list API response
 */
export async function mockConfigList(page: Page, configs: any[]) {
  await page.route('**/api/configs', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(configs)
    })
  })
}

/**
 * Mock the config detail API response
 */
export async function mockConfigDetail(page: Page, configId: string, config: any) {
  await page.route(`**/api/configs/${configId}`, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(config)
    })
  })
}

/**
 * Generate a unique test config name
 */
export function generateConfigName(prefix = 'Test'): string {
  return `${prefix} Config ${Date.now()}`
}

/**
 * Clear all local storage and session storage
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/**
 * Wait for element to be stable (not moving)
 */
export async function waitForStable(
  locator: Locator,
  timeout = 5000
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout })
  // Small delay to ensure element is stable
  await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Press escape key to close modals/overlays
 */
export async function pressEscape(page: Page) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
}

/**
 * Check if element has a specific class
 */
export async function hasClass(
  locator: Locator,
  className: string
): Promise<boolean> {
  const classes = await locator.evaluate(el => el.className)
  return classes.includes(className)
}

/**
 * Get all text contents of elements matching selector
 */
export async function getAllTextContents(locator: Locator): Promise<string[]> {
  const elements = await locator.all()
  const texts: string[] = []
  for (const el of elements) {
    const text = await el.textContent()
    if (text) texts.push(text.trim())
  }
  return texts
}

/**
 * Wait for URL to match pattern
 */
export async function waitForURL(page: Page, pattern: RegExp | string, timeout = 5000) {
  await page.waitForURL(pattern, { timeout, waitUntil: 'domcontentloaded' })
}

/**
 * Hover over element and wait
 */
export async function hoverAndWait(locator: Locator, waitMs = 300) {
  await locator.hover()
  await new Promise(resolve => setTimeout(resolve, waitMs))
}

/**
 * Fill input and wait for debounced operations
 */
export async function fillAndWait(
  locator: Locator,
  value: string,
  waitMs = 500
) {
  await locator.fill(value)
  await new Promise(resolve => setTimeout(resolve, waitMs))
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(locator: Locator) {
  await locator.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  await new Promise(resolve => setTimeout(resolve, 300))
}
