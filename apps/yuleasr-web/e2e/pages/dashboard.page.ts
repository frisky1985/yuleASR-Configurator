import { Page, Locator, expect } from '@playwright/test'

/**
 * Dashboard Page Object Model
 * Represents the main dashboard where users can manage configurations
 */
export class DashboardPage {
  readonly page: Page
  
  // Header elements
  readonly header: Locator
  readonly title: Locator
  readonly subtitle: Locator
  readonly newConfigButton: Locator
  
  // Quick actions
  readonly quickActions: Locator
  readonly openExistingButton: Locator
  readonly importConfigButton: Locator
  readonly templatesButton: Locator
  
  // Config list
  readonly configListContainer: Locator
  readonly configListHeader: Locator
  readonly configItems: Locator
  readonly loadingSpinner: Locator
  readonly emptyState: Locator
  
  // Create modal
  readonly createModal: Locator
  readonly configNameInput: Locator
  readonly configDescInput: Locator
  readonly cancelButton: Locator
  readonly createButton: Locator

  constructor(page: Page) {
    this.page = page
    
    // Header — Chinese UI: "配置管理"
    this.header = page.locator('h1')
    this.title = page.getByRole('heading', { level: 1 })
    this.subtitle = page.getByRole('heading', { level: 2 }).filter({ hasText: /快速操作|Quick/i })
    this.newConfigButton = page.locator('button').filter({ hasText: /新建|New/i }).first()
    
    // Quick actions — Chinese button text
    this.quickActions = page.locator('section, div').filter({ hasText: /快速操作|Quick/i }).first()
    this.openExistingButton = page.locator('button').filter({ hasText: /打开现有|Open/i }).first()
    this.importConfigButton = page.locator('button').filter({ hasText: /导入|Import/i }).first()
    this.templatesButton = page.locator('button').filter({ hasText: /模板|Template/i }).first()
    
    // Config list
    this.configListContainer = page.locator('section, div').filter({ hasText: /最近配置|Recent/i }).first()
    this.configListHeader = page.locator('h2, h3').filter({ hasText: /最近配置|Recent/i }).first()
    this.configItems = page.locator('h3').filter({ hasText: /Configuration|Config/i })
    this.loadingSpinner = page.locator('.animate-spin, [class*="spinner"]')
    this.emptyState = page.getByText(/还没有配置|No configurations/i)
    
    // Create modal — Chinese UI
    this.createModal = page.locator('h3:has-text("新建配置"), [role="dialog"]').first()
    this.configNameInput = page.locator('input[placeholder*="我的配置"], input[placeholder*="配置名称"]').first()
    this.configDescInput = page.locator('textarea[placeholder*="可选描述"], textarea[placeholder*="description"]').first()
    this.cancelButton = page.locator('button').filter({ hasText: /取消|Cancel/i }).first()
    this.createButton = page.locator('button').filter({ hasText: /创建|Create/i }).first()
  }

  /**
   * Navigate to the dashboard page
   */
  async goto() {
    await this.page.goto('/configurator/')
    await this.waitForLoad()
  }

  /**
   * Wait for the dashboard to fully load
   */
  async waitForLoad() {
    await expect(this.title).toBeVisible({ timeout: 10000 })
  }

  /**
   * Get the count of configuration items in the list
   */
  async getConfigCount(): Promise<number> {
    return await this.configItems.count()
  }

  /**
   * Open the create configuration modal
   */
  async openCreateModal() {
    await this.newConfigButton.click()
    await expect(this.createModal).toBeVisible({ timeout: 5000 })
    await expect(this.configNameInput).toBeVisible({ timeout: 5000 })
  }

  /**
   * Create a new configuration with the given name and description
   */
  async createConfig(name: string, description: string = '') {
    await this.openCreateModal()
    await this.configNameInput.fill(name)
    if (description) {
      await this.configDescInput.fill(description)
    }
    await this.createButton.click()
    await this.createModal.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
    await this.page.waitForTimeout(500)
  }

  /**
   * Open a configuration by clicking on it
   */
  async openConfig(configName: string) {
    const configItem = this.page.locator('h3').filter({ hasText: configName }).first()
    await configItem.click()
  }

  /**
   * Delete a configuration by name
   */
  async deleteConfig(configName: string) {
    this.page.on('dialog', async dialog => {
      await dialog.accept()
    })
    
    const configItem = this.page.locator('h3').filter({ hasText: configName }).first()
    // Find the delete button in the config row. Dashboard buttons have visible text "删除".
    const row = configItem.locator('xpath=../..')
    // Delete button is icon-only with title="删除" (no visible text)
    const deleteButton = row.locator('button[title*="删除"], button[title*="Delete"]').first()
    await deleteButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Cancel the create configuration modal
   */
  async cancelCreate() {
    await this.cancelButton.click()
    await this.createModal.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
  }

  /**
   * Check if a configuration exists in the list
   */
  async hasConfig(name: string): Promise<boolean> {
    const configItem = this.page.locator('h3').filter({ hasText: name }).first()
    return await configItem.isVisible().catch(() => false)
  }

  /**
   * Get config item by index
   */
  async getConfigByIndex(index: number) {
    const items = await this.configItems.all()
    if (index >= items.length) return null
    return items[index]
  }
}
