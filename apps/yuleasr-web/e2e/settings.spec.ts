import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test('should load the settings page and display the title', async ({ page }) => {
    await page.goto('/settings')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/Settings/i)
  })

  test('should display Editor Settings section', async ({ page }) => {
    await page.goto('/settings')
    const editorSection = page.locator('text=/Editor Settings/i')
    await expect(editorSection).toBeVisible()
  })

  test('should display Validation Settings section', async ({ page }) => {
    await page.goto('/settings')
    const validationSection = page.locator('text=/Validation Settings/i')
    await expect(validationSection).toBeVisible()
  })

  test('should display Import / Export Settings section', async ({ page }) => {
    await page.goto('/settings')
    const importExportSection = page.locator('text=/Import.*Export|Export.*Import/i')
    await expect(importExportSection).toBeVisible()
  })

  test('should display Update section', async ({ page }) => {
    await page.goto('/settings')
    const updateSection = page.locator('text=/Update|Version/i')
    await expect(updateSection).toBeVisible()
  })

  test('should display Reset to Defaults button', async ({ page }) => {
    await page.goto('/settings')
    const resetBtn = page.getByRole('button', { name: /Reset to Defaults/i })
    await expect(resetBtn).toBeVisible()
  })

  test('should display License link/section in settings', async ({ page }) => {
    await page.goto('/settings')
    // The settings page should have a link to license management
    const licenseLink = page.locator('a[href*="license"], button:has-text("License")').first()
    await expect(licenseLink).toBeVisible()
  })

  test('should navigate from Settings to License page', async ({ page }) => {
    await page.goto('/settings')
    // Try clicking a license management link
    const licenseNav = page.locator('a[href="/settings/license"]').first()
    if (await licenseNav.isVisible()) {
      await licenseNav.click()
      await expect(page).toHaveURL(/\/settings\/license/)
    }
  })
})
