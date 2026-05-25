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
      await expect(dashboard.subtitle).toBeVisible()
    })

    test('should display New Configuration button', async () => {
      await expect(dashboard.newConfigButton).toBeVisible()
      await expect(dashboard.newConfigButton).toBeEnabled()
    })

    test('should display quick action buttons', async () => {
      await expect(dashboard.openExistingButton).toBeVisible()
      await expect(dashboard.importConfigButton).toBeVisible()
      await expect(dashboard.templatesButton).toBeVisible()
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
      
      // Check for module count
      const moduleCount = firstConfig.getByText(/\d+ modules/)
      await expect(moduleCount).toBeVisible()
      
      // Check for last modified date
      const lastModified = firstConfig.locator('text=/\d{4}-\d{2}-\d{2}/')
      await expect(lastModified).toBeVisible()
    })

    test('should have edit and delete buttons on hover', async ({ page }) => {
      const firstConfig = dashboard.configItems.first()
      await firstConfig.hover()
      
      const editButton = firstConfig.locator('button[title="Edit"]')
      const deleteButton = firstConfig.locator('button[title="Delete"]')
      
      await expect(editButton).toBeVisible()
      await expect(deleteButton).toBeVisible()
    })
  })

  test.describe('Create Configuration Modal', () => {
    test('should open create modal when clicking New Configuration', async () => {
      await dashboard.openCreateModal()
      
      await expect(dashboard.createModal).toBeVisible()
      await expect(dashboard.configNameInput).toBeVisible()
      await expect(dashboard.configDescInput).toBeVisible()
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
    test('should create a new configuration successfully', async () => {
      const configName = generateConfigName('E2E')
      const configDesc = 'Created by E2E test'
      
      const initialCount = await dashboard.getConfigCount()
      await dashboard.createConfig(configName, configDesc)
      const newCount = await dashboard.getConfigCount()
      
      expect(newCount).toBe(initialCount + 1)
      expect(await dashboard.hasConfig(configName)).toBe(true)
    })

    test('should create configuration with special characters in name', async () => {
      const configName = generateConfigName(testConfigNames.withSpecialChars)
      
      await dashboard.createConfig(configName)
      
      expect(await dashboard.hasConfig(configName)).toBe(true)
    })

    test('should create configuration without description', async () => {
      const configName = generateConfigName('NoDesc')
      
      await dashboard.createConfig(configName)
      
      expect(await dashboard.hasConfig(configName)).toBe(true)
    })

    test('should create configuration with long name', async () => {
      const configName = generateConfigName(testConfigNames.long.slice(0, 50))
      
      await dashboard.createConfig(configName)
      
      expect(await dashboard.hasConfig(configName)).toBe(true)
    })
  })

  test.describe('Delete Configuration', () => {
    test('should delete a configuration', async ({ page }) => {
      // First create a config to delete
      const configName = generateConfigName('ToDelete')
      await dashboard.createConfig(configName)
      
      const initialCount = await dashboard.getConfigCount()
      
      // Handle confirmation dialog
      acceptDialog(page)
      
      await dashboard.deleteConfig(configName)
      await page.waitForTimeout(1000)
      
      const newCount = await dashboard.getConfigCount()
      expect(newCount).toBe(initialCount - 1)
    })
  })

  test.describe('Navigation to Editor', () => {
    test('should navigate to editor when clicking on a configuration', async ({ page }) => {
      const firstConfig = dashboard.configItems.first()
      await firstConfig.click()
      
      await expect(page).toHaveURL(/\/editor\//)
    })

    test('should navigate to editor via edit button', async ({ page }) => {
      const firstConfig = dashboard.configItems.first()
      await firstConfig.hover()
      
      const editButton = firstConfig.locator('button[title="Edit"]')
      await editButton.click()
      
      await expect(page).toHaveURL(/\/editor\//)
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
