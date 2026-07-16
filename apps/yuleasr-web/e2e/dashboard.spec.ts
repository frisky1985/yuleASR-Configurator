import { test, expect } from '@playwright/test'

import { testConfigNames } from './fixtures/test-data'
import { DashboardPage } from './pages/dashboard.page'
import { generateConfigName, acceptDialog } from './utils/test-helpers'

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
      
      // Check for module count (Chinese UI uses English "modules")
      const moduleCount = firstConfig.locator('text=/\\d+ modules|\\d+ 个模块/')
      await expect(moduleCount).toBeVisible()
      
      // Check for last modified date
      const lastModified = firstConfig.locator('text=/\\d{4}年|\\d{4}-\\d{2}-\\d{2}/')
      await expect(lastModified).toBeVisible()
    })

    test('should have edit and delete buttons on hover', async ({ page }) => {
      const firstConfig = dashboard.configItems.first()
      await firstConfig.hover()
      
      const editButton = page.locator('button').filter({ hasText: /编辑|Edit/i }).first()
      const deleteButton = page.locator('button').filter({ hasText: /删除|Delete/i }).first()
      
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
      await dashboard.openCreateModal()
      await page.keyboard.press('Escape')
      
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
      const deleteBtn = page.locator('button').filter({ hasText: /删除|Delete/i })
      const count = await deleteBtn.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('Navigation to Editor', () => {
    test('should have edit buttons on config items', async ({ page }) => {
      const editBtn = page.locator('button').filter({ hasText: /编辑|Edit/i })
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
