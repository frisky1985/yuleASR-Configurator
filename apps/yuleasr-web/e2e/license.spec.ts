import { test, expect } from '@playwright/test'

test.describe('License Page', () => {
  test('should load the license page and display the title', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/License|Subscription/i)
  })

  test('should display the current plan section (Free tier)', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    // The current plan section should show Free or Pro badge
    const planBadge = page.locator('text=/Free|Pro/i').first()
    await expect(planBadge).toBeVisible()
  })

  test('should display Free badge in the header', async ({ page }) => {
    await page.goto('/configurator')
    // The LicenseBadge component shows "Free" in the header
    const freeBadge = page.locator('button:has-text("Free"), span:has-text("Free")').first()
    await expect(freeBadge).toBeVisible()
  })

  test('should display the activation key input field', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    // The license activation section should have an input for License Key
    const keyInput = page.locator('input[placeholder*="YULE"], input[placeholder*="License"]')
    await expect(keyInput).toBeVisible()
  })

  test('should display the activate button', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    const activateBtn = page.getByRole('button', { name: /激活|Activate/i })
    await expect(activateBtn).toBeVisible()
  })

  test('should display subscription options (monthly/yearly)', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    // Subscription pricing options should be visible
    const monthlyOption = page.locator('text=/月|monthly|Monthly/i')
    await expect(monthlyOption).toBeVisible()
  })

  test('should display feature comparison table', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    // Feature comparison table should have Free vs Pro columns
    const featureTable = page.locator('table')
    await expect(featureTable).toBeVisible()
    await expect(page.locator('th:has-text("Free")')).toBeVisible()
    await expect(page.locator('th:has-text("Pro")')).toBeVisible()
  })
})
