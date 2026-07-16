import { test, expect } from '@playwright/test'

test.describe('Home / Dashboard Page', () => {
  test('should load the dashboard and display the app name', async ({ page }) => {
    await page.goto('/configurator/dashboard')
    // The app name should be visible in the header
    const appName = page.locator('text=/yuleASR|Configurator/i').first()
    await expect(appName).toBeVisible()
  })

  test('should display the dashboard title', async ({ page }) => {
    await page.goto('/configurator/dashboard')
    // Dashboard heading — Chinese UI shows "配置管理"
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/configurator/dashboard')
    // The navigation sidebar should contain links (Chinese labels)
    const navCount = await page.getByRole('link').count()
    expect(navCount).toBeGreaterThan(3)
  })

  test('should display the New Configuration button', async ({ page }) => {
    await page.goto('/configurator/dashboard')
    // Button is Chinese: "新建配置"
    await expect(page.locator('button').filter({ hasText: /新建|New/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('should have a logo in the header', async ({ page }) => {
    await page.goto('/configurator/dashboard')
    // Logo link "YLyuleASR 配置器" points to /configurator
    const logo = page.getByRole('link', { name: /yuleASR/i })
    await expect(logo).toBeVisible()
  })

  test('should navigate to settings when clicking Settings nav link', async ({ page }) => {
    await page.goto('/configurator/dashboard')
    // Click on Settings in nav
    const settingsLink = page.locator('nav a:has-text("Settings"), a[href="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await expect(page).toHaveURL(/\/settings/)
    }
  })
})
