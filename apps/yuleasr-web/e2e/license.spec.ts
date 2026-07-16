import { test, expect } from '@playwright/test'

test.describe('License Page', () => {
  test('should load the license page and display the title', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should display current plan Free badge', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    await expect(page.locator('text=Free').first()).toBeVisible()
  })

  test('should display license key activation input', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    const input = page.locator('input[placeholder*="YULE"]')
    await expect(input).toBeVisible()
  })

  test('should display pricing options', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    // Pricing has ¥299 and ¥2,999 amounts
    await expect(page.locator('text=¥').first()).toBeVisible()
  })

  test('should display feature comparison table', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    await expect(page.locator('table')).toBeVisible()
  })

  test('should have an activate button', async ({ page }) => {
    await page.goto('/configurator/settings/license')
    const btn = page.locator('button').filter({ hasText: /激活|Activate/i })
    await expect(btn).toBeVisible()
  })
})
