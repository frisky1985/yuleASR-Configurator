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
  readonly lastModified: Locator
  
  // Toolbar buttons
  readonly validateButton: Locator
  readonly saveButton: Locator
  readonly syncButton: Locator
  readonly downloadButton: Locator
  readonly moreButton: Locator
  
  // Module Tree (Left sidebar)
  readonly moduleTree: Locator
  readonly moduleTreeHeader: Locator
  readonly moduleSearchInput: Locator
  readonly filterButton: Locator
  readonly expandAllButton: Locator
  readonly collapseAllButton: Locator
  readonly layerHeaders: Locator
  readonly moduleItems: Locator
  readonly moduleToggleButtons: Locator
  
  // Parameter Editor (Center)
  readonly parameterEditor: Locator
  readonly parameterEditorHeader: Locator
  readonly parameterSearchInput: Locator
  readonly parameterCount: Locator
  readonly parameterList: Locator
  readonly noModuleSelected: Locator
  readonly disabledModuleWarning: Locator
  
  // Validation Panel (Right sidebar)
  readonly validationPanel: Locator
  readonly validationPanelHeader: Locator
  readonly autoValidationToggle: Locator
  readonly validateNowButton: Locator
  readonly validationStatus: Locator
  readonly errorCount: Locator
  readonly warningCount: Locator
  
  // Module Info Card
  readonly moduleInfoCard: Locator
  
  constructor(page: Page) {
    this.page = page
    
    // Header
    this.backButton = page.locator('button', { has: page.locator('[class*="ArrowLeft"]') })
    this.configName = page.locator('h1[class*="text-xl font-bold"]')
    this.statusBadge = page.locator('span', { hasText: /Saved|Unsaved/ })
    this.lastModified = page.getByText(/Last modified:/)
    
    // Toolbar
    this.validateButton = page.getByRole('button', { name: /Validate/i })
    this.saveButton = page.getByRole('button', { name: /Save$/, exact: false })
    this.syncButton = page.getByRole('button', { name: /Sync/i })
    this.downloadButton = page.locator('button', { has: page.locator('[class*="Download"]') })
    this.moreButton = page.locator('button', { has: page.locator('[class*="MoreVertical"]') })
    
    // Module Tree
    this.moduleTree = page.locator('.bg-white.rounded-lg.border').first()
    this.moduleTreeHeader = page.getByText('Modules')
    this.moduleSearchInput = page.locator('input[placeholder="Search modules..."]')
    this.filterButton = page.getByRole('button', { name: /Filter/i })
    this.expandAllButton = page.getByText('Expand all')
    this.collapseAllButton = page.getByText('Collapse')
    this.layerHeaders = page.locator('button', { hasText: /MCAL|ECUAL|Service|RTE|ASW/ })
    this.moduleItems = page.locator('[class*="flex-1 text-left"]').filter({ hasText: /Mcu|Port|Dio|Can|Eth/ })
    this.moduleToggleButtons = page.locator('button[title="Disable module"], button[title="Enable module"]')
    
    // Parameter Editor
    this.parameterEditor = page.locator('.bg-white.rounded-lg.border').nth(1)
    this.parameterEditorHeader = page.locator('h3', { hasText: /Configuration$|Select a Module/ })
    this.parameterSearchInput = page.locator('input[placeholder="Filter params..."]')
    this.parameterCount = page.getByText(/\\d+ params/)
    this.parameterList = page.locator('[class*="space-y-6"]').first()
    this.noModuleSelected = page.getByText('Select a module from the sidebar')
    this.disabledModuleWarning = page.getByText('This module is currently disabled')
    
    // Validation Panel
    this.validationPanel = page.locator('.bg-white.rounded-lg.border', { hasText: /Validation|No validation results/ })
    this.validationPanelHeader = page.getByText('Validation', { exact: true })
    this.autoValidationToggle = page.locator('input[type="checkbox"]', { has: page.locator('..') })
    this.validateNowButton = page.getByRole('button', { name: /Validate Now/i })
    this.validationStatus = page.locator('h3', { hasText: /Validation Passed|Issue|No validation/ })
    this.errorCount = page.getByText(/\\d+ error/i)
    this.warningCount = page.getByText(/\\d+ warning/i)
    
    // Module Info
    this.moduleInfoCard = page.locator('.bg-white.rounded-lg.border', { hasText: 'Module Info' })
  }

  /**
   * Navigate to the editor page for a specific configuration
   */
  async goto(configId: string, moduleId?: string) {
    const url = moduleId 
      ? `/editor/${configId}/${moduleId}`
      : `/editor/${configId}`
    await this.page.goto(url)
    await this.waitForLoad()
  }

  /**
   * Wait for the editor to fully load
   */
  async waitForLoad() {
    await expect(this.moduleTree).toBeVisible()
    await expect(this.parameterEditor).toBeVisible()
  }

  /**
   * Go back to the dashboard
   */
  async goBack() {
    await this.backButton.click()
    await this.page.waitForURL('**/dashboard')
  }

  /**
   * Select a module by name
   */
  async selectModule(moduleName: string) {
    const moduleButton = this.page.getByRole('button', { name: moduleName })
    await moduleButton.click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Toggle a module's enabled/disabled state
   */
  async toggleModule(moduleName: string) {
    const moduleRow = this.page.locator('div', { 
      has: this.page.getByRole('button', { name: moduleName })
    }).first()
    const toggleButton = moduleRow.locator('button[title="Disable module"], button[title="Enable module"]')
    await toggleButton.click()
    await this.page.waitForTimeout(200)
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
    await this.expandAllButton.click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Collapse all layers in the module tree
   */
  async collapseAllLayers() {
    await this.collapseAllButton.click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Search for parameters in the editor
   */
  async searchParameters(query: string) {
    await this.parameterSearchInput.fill(query)
    await this.page.waitForTimeout(300)
  }

  /**
   * Get the current parameter count displayed
   */
  async getParameterCount(): Promise<number> {
    const text = await this.parameterCount.textContent()
    const match = text?.match(/(\\d+) params/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Update a parameter value
   */
  async updateParameter(paramName: string, value: string | number) {
    const paramRow = this.page.locator('div', { 
      has: this.page.locator('label', { hasText: paramName })
    }).first()
    
    const input = paramRow.locator('input').first()
    await input.fill(String(value))
    await input.blur()
    await this.page.waitForTimeout(200)
  }

  /**
   * Update a numeric parameter value
   */
  async updateNumericParameter(paramName: string, value: number) {
    const paramRow = this.page.locator('div', { 
      has: this.page.locator('label', { hasText: paramName })
    }).first()
    
    const input = paramRow.locator('input[type="number"]').first()
    await input.fill(String(value))
    await input.blur()
    await this.page.waitForTimeout(200)
  }

  /**
   * Select an enum parameter option
   */
  async selectEnumParameter(paramName: string, option: string) {
    const paramRow = this.page.locator('div', { 
      has: this.page.locator('label', { hasText: paramName })
    }).first()
    
    const select = paramRow.locator('select').first()
    await select.selectOption(option)
    await this.page.waitForTimeout(200)
  }

  /**
   * Toggle a boolean parameter
   */
  async toggleBooleanParameter(paramName: string) {
    const paramRow = this.page.locator('div', { 
      has: this.page.locator('label', { hasText: paramName })
    }).first()
    
    const toggle = paramRow.locator('button[role="switch"], button[class*="rounded-full"]').first()
    await toggle.click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Save the configuration
   */
  async saveConfig() {
    await this.saveButton.click()
    await this.page.waitForTimeout(500)
    await expect(this.page.getByText('Saved')).toBeVisible()
  }

  /**
   * Run validation
   */
  async validate() {
    await this.validateButton.click()
    await this.page.waitForTimeout(1000)
  }

  /**
   * Toggle auto validation
   */
  async toggleAutoValidation() {
    const toggle = this.page.locator('label:has-text("Auto") input[type="checkbox"]')
    await toggle.click()
    await this.page.waitForTimeout(200)
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
    const text = await this.errorCount.textContent().catch(() => '0')
    const match = text.match(/(\\d+) error/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Get validation warnings count
   */
  async getWarningCount(): Promise<number> {
    const text = await this.warningCount.textContent().catch(() => '0')
    const match = text.match(/(\\d+) warning/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Check if validation passed
   */
  async isValidationPassed(): Promise<boolean> {
    return await this.page.getByText('Validation Passed').isVisible().catch(() => false)
  }
}
