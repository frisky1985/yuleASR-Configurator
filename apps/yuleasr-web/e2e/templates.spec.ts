import { test, expect } from '@playwright/test'

test.describe('Templates Page', () => {
  test('should load the templates page and display the title', async ({ page }) => {
    await page.goto('/templates')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/Template/i)
  })

  test('should display template categories', async ({ page }) => {
    await page.goto('/templates')
    // Template categories should be visible
    const mcalSection = page.locator('text=/MCAL Base/i')
    await expect(mcalSection).toBeVisible()
  })

  test('should display template cards with module count', async ({ page }) => {
    await page.goto('/templates')
    // Template cards should show module counts
    const moduleCounts = page.locator('text=/modules/i')
    const count = await moduleCounts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have Preview and Use buttons on template cards', async ({ page }) => {
    await page.goto('/templates')
    // Template cards should have action buttons
    const previewBtn = page.getByRole('button', { name: /Preview/i }).first()
    await expect(previewBtn).toBeVisible()
    const useBtn = page.getByRole('button', { name: /Use/i }).first()
    await expect(useBtn).toBeVisible()
  })

  test('should display the Back to Dashboard link', async ({ page }) => {
    await page.goto('/templates')
    const backBtn = page.getByRole('button', { name: /Back to Dashboard/i })
    await expect(backBtn).toBeVisible()
  })

  test('should display template recommended badges', async ({ page }) => {
    await page.goto('/templates')
    // Some templates should have "Recommended" badges
    const recommendedBadges = page.locator('text=/Recommended/i')
    const count = await recommendedBadges.count()
    expect(count).toBeGreaterThan(0)
  })
})
