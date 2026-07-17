import { Page, Locator, expect } from '@playwright/test'

/**
 * Editor Page Object Model
 * Represents the configuration editor where users can edit module parameters
 */
export class EditorPage {
  readonly page: Page
  
  // Header elements
  readonly backButton: Locator
  readonly configName: Locator
  readonly statusBadge: Locator
  readonly configSubtitle: Locator
  
  // Toolbar buttons
  readonly validateButton: Locator
  readonly saveButton: Locator
  readonly searchButton: Locator
  readonly shareButton: Locator
  
  // Module Tree (Left sidebar)
  readonly moduleTree: Locator
  readonly moduleTreeHeader: Locator
  readonly moduleSearchInput: Locator
  readonly filterButton: Locator
  readonly expandButton: Locator
  readonly collapseButton: Locator
  readonly layerHeaders: Locator
  readonly moduleItems: Locator
  
  // Parameter Editor (Center)
  readonly parameterEditor: Locator
  
  // Validation Panel (Right sidebar)
  readonly validationPanel: Locator
  readonly validationPanelHeader: Locator

  constructor(page: Page) {
    this.page = page
    
    // Header — h1 is config name, check for ArrowLeft icon
    this.backButton = page.locator('main button').filter({ has: page.locator('svg.lucide-arrow-left') }).first()
    this.configName = page.locator('h1').first()
    this.statusBadge = page.getByText(/Saved|Unsaved/i)
    this.configSubtitle = page.locator('header + div p, main p').filter({ hasText: /Last modified/i }).first()
    
    // Toolbar — buttons in the editor toolbar area
    this.validateButton = page.getByRole('button', { name: /^Validate$/i })
    this.saveButton = page.getByRole('button', { name: /^Save$/i })
    this.searchButton = page.getByRole('button', { name: /Search/i })
    this.shareButton = page.getByRole('button', { name: /^Share$/i })
    
    // Module Tree — section with heading "Configuration Tree"
    this.moduleTree = page.getByRole('heading', { name: /Configuration Tree/i })
    this.moduleTreeHeader = page.getByRole('heading', { name: /Configuration Tree/i })
    this.moduleSearchInput = page.getByPlaceholder(/Search modules/)
    this.filterButton = page.getByRole('button', { name: /Filter/i })
    this.expandButton = page.getByRole('button', { name: /^Expand$/ })
    this.collapseButton = page.getByRole('button', { name: /^Collapse$/ })
    this.layerHeaders = page.locator('div[class*="cursor-pointer"]').filter({ hasText: /MCAL|ECUAL|Service|RTE|ASW/ })
    this.moduleItems = page.locator('div[class*="cursor-pointer"]').filter({ hasText: /Driver|Unit|Library|\sModule/i })
    
    // Parameter Editor — center column, appears after clicking a container
    this.parameterEditor = page.locator('div').filter({ has: page.getByRole('heading', { name: /Configuration Parameters|Configuration$/i }) }).first()
    
    // Validation Panel — right sidebar
    this.validationPanel = page.locator('div').filter({ has: page.getByRole('heading', { name: /^Validation$/i }) }).first()
    this.validationPanelHeader = page.getByRole('heading', { name: /^Validation$/i })
  }

  /**
   * Navigate to the editor page for a specific configuration
   */
  async goto(configId: string, moduleId?: string) {
    const url = moduleId 
      ? `/configurator/editor/${configId}/${moduleId}`
      : `/configurator/editor/${configId}`
    await this.page.goto(url)
    await this.waitForLoad()
  }

  /**
   * Wait for the editor to fully load — module tree must be visible
   */
  async waitForLoad() {
    await expect(this.moduleTree).toBeVisible({ timeout: 10000 })
    await expect(this.configName).toBeVisible({ timeout: 5000 })
  }

  /**
   * Go back to the dashboard
   */
  async goBack() {
    await this.backButton.click()
    await this.page.waitForURL(/dashboard/, { timeout: 5000 }).catch(() => {})
  }

  /**
   * Select a module by name in the tree
   */
  async selectModule(moduleName: string) {
    const moduleItem = this.moduleItems.filter({ hasText: moduleName }).first()
    await moduleItem.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Toggle a module's enabled/disabled state
   */
  async toggleModule(moduleName: string) {
    const moduleItem = this.moduleItems.filter({ hasText: moduleName }).first()
    // The toggle button is the first button inside the module item row
    const toggle = moduleItem.locator('button').first()
    await toggle.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Search for modules in the tree
   */
  async searchModules(query: string) {
    await this.moduleSearchInput.fill(query)
    await this.page.waitForTimeout(300)
  }

  /**
   * Expand all layers in the module tree
   */
  async expandAllLayers() {
    // Click "Expand" button if visible
    if (await this.expandButton.isVisible().catch(() => false)) {
      await this.expandButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Collapse all layers in the module tree
   */
  async collapseAllLayers() {
    if (await this.collapseButton.isVisible().catch(() => false)) {
      await this.collapseButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Run validation
   */
  async validate() {
    await this.validateButton.click()
    await this.page.waitForTimeout(1000)
  }

  /**
   * Check if validation completed
   */
  async isValidated(): Promise<boolean> {
    return await this.page.getByText(/Validation Passed|Issue|No validation/).isVisible().catch(() => false)
  }

  /**
   * Save the configuration
   */
  async saveConfig() {
    await this.saveButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Toggle auto validation
   */
  async toggleAutoValidation() {
    const toggle = this.page.locator('label').filter({ hasText: /Auto/i }).locator('input[type="checkbox"]').first()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
      await this.page.waitForTimeout(200)
    }
  }

  /**
   * Check if the configuration has unsaved changes
   */
  async hasUnsavedChanges(): Promise<boolean> {
    return await this.page.getByText('Unsaved').isVisible().catch(() => false)
  }

  /**
   * Get validation errors count
   */
  async getErrorCount(): Promise<number> {
    const errorText = this.page.getByText(/\d+ error/)
    const text = await errorText.textContent().catch(() => '0 errors')
    const match = text.match(/(\d+) error/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Get validation warnings count
   */
  async getWarningCount(): Promise<number> {
    const warningText = this.page.getByText(/\d+ warning/)
    const text = await warningText.textContent().catch(() => '0 warnings')
    const match = text.match(/(\d+) warning/)
    return match ? parseInt(match[1]) : 0
  }
}
