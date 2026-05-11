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
    
    // Header
    this.header = page.locator('h1:has-text("Configurations")')
    this.title = page.getByRole('heading', { name: 'Configurations', level: 1 })
    this.subtitle = page.getByText('Manage your yuleASR configurations')
    this.newConfigButton = page.getByRole('button', { name: /New Configuration/i })
    
    // Quick actions
    this.quickActions = page.locator('.grid-cols-1.md\\:grid-cols-3')
    this.openExistingButton = page.getByRole('button', { name: /Open Existing/i })
    this.importConfigButton = page.getByRole('button', { name: /Import Config/i })
    this.templatesButton = page.getByRole('button', { name: /Templates/i })
    
    // Config list
    this.configListContainer = page.locator('.bg-white.border.border-gray-200')
    this.configListHeader = page.getByRole('heading', { name: 'Recent Configurations', level: 2 })
    this.configItems = page.locator('[class*="divide-y"] > div')
    this.loadingSpinner = page.locator('.animate-spin')
    this.emptyState = page.getByText('No configurations yet')
    
    // Create modal
    this.createModal = page.locator('.fixed.inset-0.bg-black\\/50')
    this.configNameInput = page.locator('input[placeholder="My Configuration"]')
    this.configDescInput = page.locator('textarea[placeholder="Optional description..."]')
    this.cancelButton = page.locator('.fixed >> button:has-text("Cancel")')
    this.createButton = page.locator('.fixed >> button:has-text("Create")')
  }

  /**
   * Navigate to the dashboard page
   */
  async goto() {
    await this.page.goto('/')
    await this.waitForLoad()
  }

  /**
   * Wait for the dashboard to fully load
   */
  async waitForLoad() {
    await expect(this.title).toBeVisible()
    await this.loadingSpinner.waitFor({ state: 'detached', timeout: 10000 })
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
    await expect(this.createModal).toBeVisible()
    await expect(this.configNameInput).toBeVisible()
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
    await this.createModal.waitFor({ state: 'detached' })
    await this.page.waitForTimeout(500) // Wait for list refresh
  }

  /**
   * Open a configuration by clicking on it
   */
  async openConfig(configName: string) {
    const configItem = this.page.locator('div', { has: this.page.getByText(configName) }).first()
    await configItem.click()
  }

  /**
   * Delete a configuration by name
   */
  async deleteConfig(configName: string) {
    const configItem = this.page.locator('div', { 
      has: this.page.getByText(configName) 
    }).filter({ has: this.page.locator('button[title="Delete"]') })
    
    const deleteButton = configItem.locator('button[title="Delete"]')
    
    // Use expect with a custom message to handle the confirmation dialog
    this.page.on('dialog', async dialog => {
      await dialog.accept()
    })
    
    await deleteButton.click()
    await this.page.waitForTimeout(500) // Wait for deletion
  }

  /**
   * Cancel the create configuration modal
   */
  async cancelCreate() {
    await this.cancelButton.click()
    await this.createModal.waitFor({ state: 'detached' })
  }

  /**
   * Check if a configuration exists in the list
   */
  async hasConfig(name: string): Promise<boolean> {
    const configItem = this.page.getByText(name).first()
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
