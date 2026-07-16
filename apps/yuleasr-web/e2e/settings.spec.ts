import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test('should load the settings page and display the title', async ({ page }) => {
    await page.goto('/configurator/settings')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display settings sections', async ({ page }) => {
    await page.goto('/configurator/settings')
    // Settings has multiple sections with h2 headings (English UI)
    const sections = page.locator('h2')
    const count = await sections.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should have functional form controls', async ({ page }) => {
    await page.goto('/configurator/settings')
    // Should have at least one input, select or switch
    const controls = page.locator('input, select, button, [role="switch"]')
    const count = await controls.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display navigation from settings', async ({ page }) => {
    await page.goto('/configurator/settings')
    // Can navigate back via nav
    const dashboardNav = page.locator('nav a').filter({ hasText: /仪表盘|Dashboard/i })
    await expect(dashboardNav).toBeVisible()
  })
})
