import { test, expect } from '@playwright/test'
import { DashboardPage } from './pages/dashboard.page'
import { EditorPage } from './pages/editor.page'
import { waitForLoading } from './utils/test-helpers'
import { layerNames, moduleNames } from './fixtures/test-data'

test.describe('Editor', () => {
  let dashboard: DashboardPage
  let editor: EditorPage

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page)
    editor = new EditorPage(page)
    
    // Navigate to dashboard and open first config
    await dashboard.goto()
    await dashboard.configItems.first().click()
    await editor.waitForLoad()
  })

  test.describe('Page Layout', () => {
    test('should display three-column layout', async () => {
      await expect(editor.moduleTree).toBeVisible()
      await expect(editor.parameterEditor).toBeVisible()
      await expect(editor.validationPanel).toBeVisible()
    })

    test('should display config name in header', async () => {
      await expect(editor.configName).toBeVisible()
      const name = await editor.configName.textContent()
      expect(name?.length).toBeGreaterThan(0)
    })

    test('should display status badge', async () => {
      await expect(editor.statusBadge).toBeVisible()
    })

    test('should display toolbar buttons', async () => {
      await expect(editor.validateButton).toBeVisible()
      await expect(editor.saveButton).toBeVisible()
      await expect(editor.syncButton).toBeVisible()
    })
  })

  test.describe('Module Tree', () => {
    test('should display module tree header', async () => {
      await expect(editor.moduleTreeHeader).toBeVisible()
    })

    test('should display layer headers', async () => {
      const layers = await editor.layerHeaders.all()
      expect(layers.length).toBeGreaterThan(0)
    })

    test('should display MCAL layer', async () => {
      const mcalHeader = editor.page.getByRole('button', { name: 'MCAL' })
      await expect(mcalHeader).toBeVisible()
    })

    test('should expand/collapse layers', async () => {
      await editor.collapseAllLayers()
      await editor.page.waitForTimeout(300)
      
      // Check that modules are hidden
      const modules = await editor.moduleItems.count()
      expect(modules).toBe(0)
      
      await editor.expandAllLayers()
      await editor.page.waitForTimeout(300)
      
      // Check that modules are visible again
      const expandedModules = await editor.moduleItems.count()
      expect(expandedModules).toBeGreaterThan(0)
    })

    test('should search and filter modules', async () => {
      await editor.expandAllLayers()
      await editor.searchModules('Mcu')
      
      // Should show Mcu module
      const mcuModule = editor.page.getByRole('button', { name: 'Mcu' })
      await expect(mcuModule).toBeVisible()
    })

    test('should select a module', async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Mcu')
      
      // Check that parameter editor updates
      const header = editor.parameterEditor.locator('h3')
      await expect(header).toContainText('Mcu')
    })

    test('should toggle module enabled state', async () => {
      await editor.expandAllLayers()
      
      // Get initial enabled count
      const initialEnabled = await editor.page.locator('button[title="Disable module"]').count()
      
      // Toggle a module
      await editor.toggleModule('Dio')
      await editor.page.waitForTimeout(500)
      
      // Verify state changed
      const newEnabled = await editor.page.locator('button[title="Disable module"]').count()
      expect(newEnabled).not.toBe(initialEnabled)
    })
  })

  test.describe('Parameter Editor', () => {
    test('should show placeholder when no module selected', async () => {
      // Navigate directly to editor without module
      await editor.goto('config-1')
      
      await expect(editor.noModuleSelected).toBeVisible()
    })

    test('should display parameter editor for selected module', async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Can')
      
      await expect(editor.parameterEditorHeader).toContainText('Can')
    })

    test('should display parameter count', async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Can')
      
      const count = await editor.getParameterCount()
      expect(count).toBeGreaterThan(0)
    })

    test('should search and filter parameters', async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Can')
      await editor.searchParameters('Controller')
      
      await expect(editor.page.getByText('CanControllerId')).toBeVisible()
    })

    test('should show disabled warning for disabled module', async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Dio')
      
      await expect(editor.disabledModuleWarning).toBeVisible()
    })
  })

  test.describe('Parameter Editing', () => {
    test.beforeEach(async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Mcu')
    })

    test('should update integer parameter', async () => {
      await editor.updateNumericParameter('McuClockSetting', 8000000)
      
      // Check that save button becomes enabled (dirty state)
      await expect(editor.saveButton).toBeEnabled()
    })

    test('should show validation error for out-of-range value', async () => {
      await editor.updateNumericParameter('McuClockSetting', 500000)
      
      // Wait for validation feedback
      await editor.page.waitForTimeout(500)
      
      // Should show error message
      const error = editor.page.getByText(/below minimum|Minimum value/)
      await expect(error).toBeVisible()
    })
  })

  test.describe('Enum Parameter Editing', () => {
    test.beforeEach(async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Can')
    })

    test('should select enum option', async () => {
      await editor.selectEnumParameter('CanBaudrate', '250K')
      
      // Check that save button becomes enabled
      await expect(editor.saveButton).toBeEnabled()
    })
  })

  test.describe('Validation', () => {
    test('should run validation', async () => {
      await editor.validate()
      
      // Check that validation panel shows results
      await expect(editor.validationStatus).toBeVisible()
    })

    test('should toggle auto validation', async () => {
      await editor.toggleAutoValidation()
      
      // Check for auto validation indicator
      const indicator = editor.page.getByText(/Real-time validation|Auto/)
      await expect(indicator).toBeVisible()
    })

    test('should display validation errors for invalid config', async () => {
      // Make config invalid
      await editor.expandAllLayers()
      await editor.selectModule('Mcu')
      await editor.updateNumericParameter('McuClockSetting', 100000) // Below min
      
      await editor.validate()
      
      // Check for error display
      const errors = await editor.getErrorCount()
      expect(errors).toBeGreaterThan(0)
    })
  })

  test.describe('Save Configuration', () => {
    test.beforeEach(async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Mcu')
    })

    test('should enable save button after making changes', async () => {
      await editor.updateNumericParameter('McuClockSetting', 8000000)
      
      await expect(editor.saveButton).toBeEnabled()
    })

    test('should save configuration', async () => {
      await editor.updateNumericParameter('McuClockSetting', 8000000)
      await editor.saveConfig()
      
      // Should show saved status
      await expect(editor.page.getByText('Saved')).toBeVisible()
    })

    test('should disable save button after saving', async () => {
      await editor.updateNumericParameter('McuClockSetting', 8000000)
      await editor.saveConfig()
      
      await expect(editor.saveButton).toBeDisabled()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate back to dashboard', async ({ page }) => {
      await editor.goBack()
      
      await expect(page).toHaveURL(/\/dashboard$/)
    })
  })

  test.describe('Module Info Panel', () => {
    test('should display module info when module is selected', async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Can')
      
      await expect(editor.moduleInfoCard).toBeVisible()
    })

    test('should display correct module details', async () => {
      await editor.expandAllLayers()
      await editor.selectModule('Can')
      
      // Check for module properties
      await expect(editor.page.getByText('Name')).toBeVisible()
      await expect(editor.page.getByText('Layer')).toBeVisible()
      await expect(editor.page.getByText('Version')).toBeVisible()
      await expect(editor.page.getByText('Status')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should adapt layout for mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await editor.waitForLoad()
      
      await expect(editor.moduleTree).toBeVisible()
      await expect(editor.backButton).toBeVisible()
    })

    test('should adapt layout for tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.reload()
      await editor.waitForLoad()
      
      await expect(editor.moduleTree).toBeVisible()
      await expect(editor.parameterEditor).toBeVisible()
    })
  })
})
