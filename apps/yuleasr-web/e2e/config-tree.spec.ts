import { test, expect } from '@playwright/test'

test.describe('Configuration Tree / Module Navigation', () => {
  test('should render the dashboard with configuration list area', async ({ page }) => {
    await page.goto('/dashboard')
    // Dashboard should have a configuration list area or empty state
    const configSection = page.locator('text=/Recent Configurations|Create your first|No configurations/i')
    await expect(configSection).toBeVisible()
  })

  test('should display Quick Actions panel', async ({ page }) => {
    await page.goto('/dashboard')
    // The quick actions section should be visible
    const quickActions = page.locator('text=/Quick Actions/i')
    await expect(quickActions).toBeVisible()
  })

  test('should display stat cards', async ({ page }) => {
    await page.goto('/dashboard')
    // Dashboard should have stats cards (Total Configurations, Total Modules, etc.)
    const statCards = page.locator('.stat-card, [class*="stat"]')
    const count = await statCards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should display dependency graph button', async ({ page }) => {
    await page.goto('/dashboard')
    // The dependency graph quick action button
    const depGraphBtn = page.getByRole('button', { name: /Dependency Graph/i })
    await expect(depGraphBtn).toBeVisible()
  })

  test('should display Module Wizard button', async ({ page }) => {
    await page.goto('/dashboard')
    const moduleWizardBtn = page.getByRole('button', { name: /Module Wizard/i })
    await expect(moduleWizardBtn).toBeVisible()
  })

  test('should display Import Config button', async ({ page }) => {
    await page.goto('/dashboard')
    const importBtn = page.getByRole('button', { name: /Import/i })
    await expect(importBtn).toBeVisible()
  })
})
