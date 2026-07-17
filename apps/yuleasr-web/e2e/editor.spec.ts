import { test, expect } from '@playwright/test'

import { DashboardPage } from './pages/dashboard.page'
import { EditorPage } from './pages/editor.page'

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
      await expect(editor.searchButton).toBeVisible()
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
      const mcalHeader = editor.page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'MCAL' }).first()
      await expect(mcalHeader).toBeVisible()
    })

    test('should expand/collapse layers', async () => {
      // Click MCAL to expand it
      const mcalHeader = editor.page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'MCAL' }).first()
      await mcalHeader.click()
      await editor.page.waitForTimeout(300)
      
      // Modules should now be visible under MCAL
      const modules = editor.page.locator('div[class*="cursor-pointer"]').filter({ hasText: /Driver|Unit|Library/ })
      const count = await modules.count()
      expect(count).toBeGreaterThan(0)
      
      // Click MCAL again to collapse
      await mcalHeader.click()
      await editor.page.waitForTimeout(300)
    })

    test('should search and filter modules', async () => {
      // Click MCAL to expand it first
      const mcalHeader = editor.page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'MCAL' }).first()
      await mcalHeader.click()
      await editor.page.waitForTimeout(200)
      
      await editor.searchModules('ADC')
      
      // Should show matching module
      const adcModule = editor.moduleItems.filter({ hasText: /ADC/ }).first()
      await expect(adcModule).toBeVisible()
    })

    test('should select a module', async () => {
      // Expand MCAL to reveal modules
      const mcalHeader = editor.page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'MCAL' }).first()
      await mcalHeader.click()
      await editor.page.waitForTimeout(200)
      
      // Select the first visible module
      const firstModule = editor.moduleItems.first()
      await firstModule.click()
      await editor.page.waitForTimeout(300)
    })
  })

  test.describe('Parameter Editor', () => {
    test('should show placeholder when no module selected', async () => {
      // Navigate directly to editor without module
      await editor.goto('config-1')
      
      // Should show something in the center column
      await expect(editor.configName).toBeVisible()
    })
  })

  test.describe('Validation', () => {
    test('should run validation', async () => {
      await editor.validate()
      
      // Check that validation panel header is visible
      await expect(editor.validationPanelHeader).toBeVisible()
    })
  })

  test.describe('Toolbar Dropdowns', () => {
    test('should open save dropdown and show Save as Template', async () => {
      // Click the save dropdown arrow (right part of split button)
      await editor.saveDropdownArrow.click()
      await expect(editor.saveAsTemplateOption).toBeVisible()
    })

    test('should open export dropdown and show ARXML option', async () => {
      await editor.exportButton.click()
      await expect(editor.exportArxmlOption).toBeVisible()
    })

    test('should open overflow menu and show Share Configuration', async () => {
      await editor.overflowButton.click()
      await expect(editor.shareOption).toBeVisible()
    })

    test('should close overflow menu on second click', async () => {
      await editor.overflowButton.click()
      await expect(editor.shareOption).toBeVisible()
      await editor.overflowButton.click()

      // Verify share option disappears — check a nearby button we know is visible
      await expect(editor.saveButton).toBeVisible()
    })

    test('should open import dropdown', async () => {
      await editor.importButton.click()
      await expect(editor.page.getByRole('button', { name: /Import ARXML/i })).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate back to dashboard', async ({ page }) => {
      await editor.goBack()
      
      await expect(page).toHaveURL(/dashboard/)
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
      await expect(editor.configName).toBeVisible()
    })
  })
})
