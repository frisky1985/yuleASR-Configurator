import { test, expect } from '@playwright/test'
import { DashboardPage } from './pages/dashboard.page'
import { EditorPage } from './pages/editor.page'
import { generateConfigName, acceptDialog } from './utils/test-helpers'

/**
 * End-to-end workflow tests
 * Tests complete user journeys through the application
 */

test.describe('End-to-End Workflows', () => {
  test('complete configuration workflow - create, edit, validate, save', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const editor = new EditorPage(page)
    const configName = generateConfigName('Workflow')
    
    // Step 1: Create new configuration
    await dashboard.goto()
    await dashboard.createConfig(configName, 'E2E workflow test config')
    
    // Verify config appears in list
    expect(await dashboard.hasConfig(configName)).toBe(true)
    
    // Step 2: Open the configuration in editor
    await dashboard.openConfig(configName)
    await editor.waitForLoad()
    
    // Step 3: Navigate to a module and edit parameters
    await editor.expandAllLayers()
    await editor.selectModule('Mcu')
    
    // Edit a parameter
    await editor.updateNumericParameter('McuClockSetting', 12000000)
    
    // Verify save button is enabled (dirty state)
    await expect(editor.saveButton).toBeEnabled()
    
    // Step 4: Validate the configuration
    await editor.validate()
    await expect(editor.validationStatus).toBeVisible()
    
    // Step 5: Save the configuration
    await editor.saveConfig()
    await expect(page.getByText('Saved')).toBeVisible()
    
    // Step 6: Go back to dashboard
    await editor.goBack()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('configuration lifecycle - create, modify multiple modules, save, delete', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const editor = new EditorPage(page)
    const configName = generateConfigName('Lifecycle')
    
    // Create configuration
    await dashboard.goto()
    await dashboard.createConfig(configName)
    await dashboard.openConfig(configName)
    await editor.waitForLoad()
    
    // Modify multiple modules
    await editor.expandAllLayers()
    
    // Edit Mcu module
    await editor.selectModule('Mcu')
    await editor.updateNumericParameter('McuClockSetting', 8000000)
    
    // Edit Can module
    await editor.selectModule('Can')
    await editor.selectEnumParameter('CanBaudrate', '250K')
    
    // Save changes
    await editor.saveConfig()
    await expect(page.getByText('Saved')).toBeVisible()
    
    // Navigate back and delete
    await editor.goBack()
    acceptDialog(page)
    await dashboard.deleteConfig(configName)
    
    // Verify deletion
    await page.waitForTimeout(1000)
    expect(await dashboard.hasConfig(configName)).toBe(false)
  })

  test('module enable/disable workflow', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const editor = new EditorPage(page)
    
    await dashboard.goto()
    await dashboard.configItems.first().click()
    await editor.waitForLoad()
    
    await editor.expandAllLayers()
    
    // Get initial enabled count
    const initialEnabled = await page.locator('button[title="Disable module"]').count()
    
    // Disable a module
    await editor.toggleModule('Dio')
    await page.waitForTimeout(500)
    
    // Verify module is disabled
    const newEnabled = await page.locator('button[title="Disable module"]').count()
    expect(newEnabled).toBeLessThan(initialEnabled)
    
    // Select the disabled module
    await editor.selectModule('Dio')
    
    // Should show disabled warning
    await expect(editor.disabledModuleWarning).toBeVisible()
    
    // Re-enable the module
    await editor.toggleModule('Dio')
    await page.waitForTimeout(500)
    
    // Verify module is enabled again
    const reEnabled = await page.locator('button[title="Disable module"]').count()
    expect(reEnabled).toBe(initialEnabled)
  })

  test('search and filter workflow', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const editor = new EditorPage(page)
    
    await dashboard.goto()
    await dashboard.configItems.first().click()
    await editor.waitForLoad()
    
    // Expand all to see modules
    await editor.expandAllLayers()
    
    // Search for specific module
    await editor.searchModules('Can')
    
    // Should filter to show only matching module
    const canModule = page.getByRole('button', { name: 'Can', exact: false })
    await expect(canModule).toBeVisible()
    
    // Clear search
    await editor.searchModules('')
    
    // All modules should be visible again
    const allModules = await editor.moduleItems.count()
    expect(allModules).toBeGreaterThan(1)
  })

  test('validation workflow with errors', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const editor = new EditorPage(page)
    
    await dashboard.goto()
    await dashboard.configItems.first().click()
    await editor.waitForLoad()
    
    await editor.expandAllLayers()
    await editor.selectModule('Mcu')
    
    // Set an invalid value (below minimum)
    await editor.updateNumericParameter('McuClockSetting', 500000)
    
    // Run validation
    await editor.validate()
    await page.waitForTimeout(1000)
    
    // Should have errors
    const errorCount = await editor.getErrorCount()
    expect(errorCount).toBeGreaterThan(0)
    
    // Fix the value
    await editor.updateNumericParameter('McuClockSetting', 16000000)
    
    // Run validation again
    await editor.validate()
    await page.waitForTimeout(1000)
    
    // Should have no errors
    const newErrorCount = await editor.getErrorCount()
    expect(newErrorCount).toBe(0)
  })

  test('real-time validation toggle workflow', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const editor = new EditorPage(page)
    
    await dashboard.goto()
    await dashboard.configItems.first().click()
    await editor.waitForLoad()
    
    // Enable auto validation
    await editor.toggleAutoValidation()
    
    // Check for real-time indicator
    const indicator = page.getByText(/Real-time validation/)
    await expect(indicator).toBeVisible()
    
    // Edit a parameter
    await editor.expandAllLayers()
    await editor.selectModule('Mcu')
    await editor.updateNumericParameter('McuClockSetting', 8000000)
    
    // Wait for auto validation
    await page.waitForTimeout(1500)
    
    // Validation should have run automatically
    await expect(editor.validationStatus).toBeVisible()
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
    }
    
    // Verify all exist
    for (const name of configNames) {
      expect(await dashboard.hasConfig(name)).toBe(true)
    }
    
    // Delete all created configs
    for (const name of configNames) {
      acceptDialog(page)
      await dashboard.deleteConfig(name)
      await page.waitForTimeout(500)
    }
    
    // Verify all deleted
    for (const name of configNames) {
      expect(await dashboard.hasConfig(name)).toBe(false)
    }
  })

  test('parameter reset workflow', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const editor = new EditorPage(page)
    
    await dashboard.goto()
    await dashboard.configItems.first().click()
    await editor.waitForLoad()
    
    await editor.expandAllLayers()
    await editor.selectModule('Mcu')
    
    // Get initial value
    const input = page.locator('label:has-text("McuClockSetting") + div input')
    const initialValue = await input.inputValue()
    
    // Change value
    await editor.updateNumericParameter('McuClockSetting', 8000000)
    
    // Verify save button is enabled
    await expect(editor.saveButton).toBeEnabled()
    
    // Click reset button
    const resetButton = page.getByRole('button', { name: /Reset/i }).first()
    await resetButton.click()
    await page.waitForTimeout(300)
    
    // Value should be restored
    const resetValue = await input.inputValue()
    expect(resetValue).toBe(initialValue)
  })
})
