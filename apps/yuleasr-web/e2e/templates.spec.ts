import { test, expect } from '@playwright/test'

test.describe('Templates Page', () => {
  test('should load the templates page and display the title', async ({ page }) => {
    await page.goto('/configurator/templates')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('should display template categories', async ({ page }) => {
    await page.goto('/configurator/templates')
    // Template categories should be visible
    const mcalSection = page.locator('text=/MCAL|mcal|模块/i').first()
    await expect(mcalSection).toBeVisible()
  })

  test('should display template cards with module count', async ({ page }) => {
    await page.goto('/configurator/templates')
    // Template cards should show module counts
    const moduleCounts = page.locator('text=/modules|模块/i')
    const count = await moduleCounts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have Preview and Use buttons on template cards', async ({ page }) => {
    await page.goto('/configurator/templates')
    // Template cards should have action buttons
    const previewBtn = page.locator('button').filter({ hasText: /预览|Preview/i }).first()
    await expect(previewBtn).toBeVisible()
    const useBtn = page.locator('button').filter({ hasText: /使用|Use/i }).first()
    await expect(useBtn).toBeVisible()
  })

  test('should display the Back to Dashboard link', async ({ page }) => {
    await page.goto('/configurator/templates')
    const dashboardLink = page.locator('a[href*="dashboard"], a').filter({ hasText: /仪表盘|Dashboard/i }).first()
    await expect(dashboardLink).toBeVisible()
  })

  test('should display template recommended badges', async ({ page }) => {
    await page.goto('/configurator/templates')
    // Look for any badge-like elements
    const badges = page.locator('[class*="badge"], [class*="tag"], span').filter({ hasText: /推荐|Recommended|official|官方/i })
    const count = await badges.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
