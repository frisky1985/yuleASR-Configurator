import { test, expect } from '@playwright/test'

test.describe('Home / Dashboard Page', () => {
  test('should load the dashboard and display the app name', async ({ page }) => {
    await page.goto('/dashboard')
    // The app name should be visible in the header
    const appName = page.locator('text=/yuleASR|Configurator/i').first()
    await expect(appName).toBeVisible()
  })

  test('should display the dashboard title', async ({ page }) => {
    await page.goto('/dashboard')
    // Dashboard should have a title heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/dashboard')
    // The nav should contain key navigation items
    // The sidebar/header nav should be visible
    const navLinks = page.locator('nav a, header a, [role="navigation"] a')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display the New Configuration button', async ({ page }) => {
    await page.goto('/dashboard')
    const newConfigBtn = page.getByRole('button', { name: /New Configuration/i })
    await expect(newConfigBtn).toBeVisible()
  })

  test('should have a logo in the header', async ({ page }) => {
    await page.goto('/dashboard')
    // The logo is a link to "/" with "YL" text
    const logo = page.locator('a[href="/"]')
    await expect(logo).toBeVisible()
  })

  test('should navigate to settings when clicking Settings nav link', async ({ page }) => {
    await page.goto('/dashboard')
    // Click on Settings in nav
    const settingsLink = page.locator('nav a:has-text("Settings"), a[href="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await expect(page).toHaveURL(/\/settings/)
    }
  })
})
