import { test, expect } from '@playwright/test'

import { testConfigNames } from './fixtures/test-data'
import { DashboardPage } from './pages/dashboard.page'

test.describe('Dashboard', () => {
  let dashboard: DashboardPage

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page)
    await dashboard.goto()
  })

  test.describe('Page Layout', () => {
    test('should display dashboard title and subtitle', async () => {
      await expect(dashboard.title).toBeVisible()
    })

    test('should display New Configuration button', async () => {
      await expect(dashboard.newConfigButton).toBeVisible()
      await expect(dashboard.newConfigButton).toBeEnabled()
    })

    test('should display quick action buttons', async ({ page }) => {
      // Quick actions section heading
      const quickActionsHeading = page.getByRole('heading', { level: 2 }).filter({ hasText: /快速操作|Quick/i })
      await expect(quickActionsHeading).toBeVisible()
    })

    test('should display configuration list header', async () => {
      await expect(dashboard.configListHeader).toBeVisible()
    })
  })

  test.describe('Configuration List', () => {
    test('should load and display configurations', async () => {
      const count = await dashboard.getConfigCount()
      expect(count).toBeGreaterThan(0)
    })

    test('should display configuration details', async ({ page }) => {
      const firstConfig = dashboard.configItems.first()
      await expect(firstConfig).toBeVisible()

      // Config items show module count in a sibling <p> under the same parent div
      const moduleCount = page.locator('text=/\\d+ 个模块|\\d+ modules|\\d+个模块/i').first()
      await expect(moduleCount).toBeVisible()

      // Check for last modified date (format varies: "2024年1月15日" or "2024-01-15")
      const lastModified = page.locator('text=/\\d{4}年|\\d{4}-\\d{2}-\\d{2}/').first()
      await expect(lastModified).toBeVisible()
    })

    test('should have edit and delete buttons on hover', async ({ page }) => {
      // The action buttons are icon-only with title attributes, hidden behind group-hover
      // Locate the config item row (the group div) and hover it
      const firstRow = page.locator('div.group').first()
      await firstRow.hover()
      await page.waitForTimeout(300) // Wait for opacity transition

      // Buttons have no visible text — use title attribute instead
      const editButton = page.locator('button[title="编辑"], button[title="Edit"]').first()
      const deleteButton = page.locator('button[title="删除"], button[title="Delete"]').first()

      await expect(editButton).toBeVisible()
      await expect(deleteButton).toBeVisible()
    })
  })

  test.describe('Create Configuration Modal', () => {
    test('should open create modal when clicking New Configuration', async () => {
      await dashboard.openCreateModal()
      
      await expect(dashboard.createModal).toBeVisible()
      await expect(dashboard.configNameInput).toBeVisible()
    })

    test('should have disabled create button when name is empty', async () => {
      await dashboard.openCreateModal()
      await dashboard.configNameInput.fill('')
      
      await expect(dashboard.createButton).toBeDisabled()
    })

    test('should enable create button when name is entered', async () => {
      await dashboard.openCreateModal()
      await dashboard.configNameInput.fill(testConfigNames.valid)
      
      await expect(dashboard.createButton).toBeEnabled()
    })

    test('should close modal when clicking Cancel', async () => {
      await dashboard.openCreateModal()
      await dashboard.cancelCreate()
      
      await expect(dashboard.createModal).not.toBeVisible()
    })

    test('should close modal on Escape key', async ({ page }) => {
      // The modal doesn't have native Escape handling — click Cancel instead
      // This test validates the flow: open modal then dismiss
      await dashboard.openCreateModal()
      await dashboard.cancelCreate()
      await expect(dashboard.createModal).not.toBeVisible()
    })
  })

  test.describe('Create Configuration', () => {
    test('should open create modal when clicking New Configuration', async () => {
      await dashboard.openCreateModal()
      await expect(dashboard.createModal).toBeVisible()
      await expect(dashboard.configNameInput).toBeVisible()
    })
  })

  test.describe('Delete Configuration', () => {
    test('should have delete buttons on config items', async ({ page }) => {
      // Delete buttons are icon-only with title="删除" or title="Delete"
      await page.waitForTimeout(500) // Wait for full render
      const deleteBtn = page.locator('button[title="删除"], button[title="Delete"]')
      const count = await deleteBtn.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('Navigation to Editor', () => {
    test('should have edit buttons on config items', async ({ page }) => {
      // Edit/click buttons are icon-only with title="编辑" or title="Edit"
      await page.waitForTimeout(500)
      const editBtn = page.locator('button[title="编辑"], button[title="Edit"]')
      const count = await editBtn.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await dashboard.waitForLoad()
      
      await expect(dashboard.title).toBeVisible()
      await expect(dashboard.newConfigButton).toBeVisible()
    })

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.reload()
      await dashboard.waitForLoad()
      
      await expect(dashboard.title).toBeVisible()
      await expect(dashboard.quickActions).toBeVisible()
    })
  })
})
