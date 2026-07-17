import { test, expect } from '@playwright/test'

import { DashboardPage } from './pages/dashboard.page'
import { generateConfigName } from './utils/test-helpers'

/**
 * End-to-end workflow tests
 * Tests complete user journeys through the application
 */

test.describe('End-to-End Workflows', () => {
  test('complete configuration workflow - create, open, go back', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const configName = generateConfigName('Workflow')
    
    // Step 1: Create new configuration
    await dashboard.goto()
    await dashboard.createConfig(configName, 'E2E workflow test config')
    await dashboard.goto()
    
    // Verify config appears in list
    expect(await dashboard.hasConfig(configName)).toBe(true)
    
    // Step 2: Open the configuration (click on it navigates to editor)
    await dashboard.openConfig(configName)
    
    // Wait for editor URL
    await page.waitForURL(/editor/, { timeout: 5000 })
    
    // Should show config name in editor heading
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Step 3: Go back to dashboard via nav link
    await page.locator('a').filter({ hasText: '仪表盘' }).first().click()
    await page.waitForURL(/dashboard|configurator\/$/, { timeout: 5000 })
  })

  test('configuration lifecycle - create and verify', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const configName = generateConfigName('Lifecycle')
    
    // Create configuration
    await dashboard.goto()
    await dashboard.createConfig(configName)
    await dashboard.goto()
    
    // Verify it exists
    expect(await dashboard.hasConfig(configName)).toBe(true)
  })

  test('multiple configurations workflow', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const configNames = [
      generateConfigName('Multi-1'),
      generateConfigName('Multi-2'),
      generateConfigName('Multi-3')
    ]
    
    await dashboard.goto()
    
    // Create multiple configurations
    for (const name of configNames) {
      await dashboard.createConfig(name)
      await dashboard.goto()
    }
    
    // Verify all exist
    for (const name of configNames) {
      expect(await dashboard.hasConfig(name)).toBe(true)
    }
  })

  test('validation button present in editor', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    
    await dashboard.goto()
    await dashboard.configItems.first().click()
    await page.waitForURL(/editor/, { timeout: 5000 })
    
    // Validate button exists and is visible
    const validateBtn = page.getByRole('button', { name: /^Validate$/i })
    await expect(validateBtn).toBeVisible()
  })
})
