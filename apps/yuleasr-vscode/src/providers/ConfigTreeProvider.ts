import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Tree item types for yuleASR configuration explorer
 */
export enum ConfigItemType {
  Workspace = 'workspace',
  Module = 'module',
  Config = 'config',
  Category = 'category'
}

/**
 * Tree item representing a yuleASR configuration element
 */
export class ConfigTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: ConfigItemType,
    public readonly resourceUri?: vscode.Uri,
    public readonly contextValue?: string
  ) {
    super(label, collapsibleState);
    
    // Set icon based on item type
    switch (itemType) {
      case ConfigItemType.Workspace:
        this.iconPath = new vscode.ThemeIcon('folder-opened');
        break;
      case ConfigItemType.Module:
        this.iconPath = new vscode.ThemeIcon('package');
        break;
      case ConfigItemType.Config:
        this.iconPath = new vscode.ThemeIcon('file-code');
        this.command = {
          command: 'yuleasr.openConfigEditor',
          title: 'Open Config',
          arguments: [resourceUri]
        };
        break;
      case ConfigItemType.Category:
        this.iconPath = new vscode.ThemeIcon('list-tree');
        break;
    }

    // Set tooltip
    this.tooltip = resourceUri ? resourceUri.fsPath : label;
    
    // Set description for configs
    if (itemType === ConfigItemType.Config && resourceUri) {
      this.description = path.basename(path.dirname(resourceUri.fsPath));
    }

    // Set context value for menu contributions
    this.contextValue = contextValue || itemType;
  }
}

/**
 * Tree data provider for yuleASR configuration explorer
 */
export class ConfigTreeProvider implements vscode.TreeDataProvider<ConfigTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ConfigTreeItem | undefined | void> = new vscode.EventEmitter<ConfigTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ConfigTreeItem | undefined | void> = this._onDidChangeTreeData.event;

  private configCache: Map<string, ConfigTreeItem[]> = new Map();

  refresh(): void {
    this.configCache.clear();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ConfigTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ConfigTreeItem): Promise<ConfigTreeItem[]> {
    if (!element) {
      // Root level - return workspaces
      return this.getWorkspaceItems();
    }

    switch (element.itemType) {
      case ConfigItemType.Workspace:
        return this.getModuleCategories(element.resourceUri!);
      case ConfigItemType.Category:
        return this.getConfigsInCategory(element.resourceUri!, element.label);
      case ConfigItemType.Module:
        return this.getConfigsForModule(element.resourceUri!);
      default:
        return [];
    }
  }

  private async getWorkspaceItems(): Promise<ConfigTreeItem[]> {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }

    const items: ConfigTreeItem[] = [];

    for (const folder of vscode.workspace.workspaceFolders) {
      const hasConfig = await this.hasYuleasrConfig(folder.uri);
      if (hasConfig) {
        items.push(new ConfigTreeItem(
          folder.name,
          vscode.TreeItemCollapsibleState.Expanded,
          ConfigItemType.Workspace,
          folder.uri
        ));
      }
    }

    return items;
  }

  private async getModuleCategories(workspaceUri: vscode.Uri): Promise<ConfigTreeItem[]> {
    const cacheKey = `${workspaceUri.fsPath}:categories`;
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey)!;
    }

    const categories = [
      { name: 'MCAL', label: 'Microcontroller Drivers (MCAL)' },
      { name: 'ECUAL', label: 'ECU Abstraction Layer (ECUAL)' },
      { name: 'Service', label: 'Services' },
      { name: 'RTE', label: 'Runtime Environment (RTE)' },
      { name: 'ASW', label: 'Application Software (ASW)' },
      { name: 'Other', label: 'Other Configurations' }
    ];

    const items: ConfigTreeItem[] = categories.map(cat => 
      new ConfigTreeItem(
        cat.label,
        vscode.TreeItemCollapsibleState.Collapsed,
        ConfigItemType.Category,
        workspaceUri,
        'category'
      )
    );

    this.configCache.set(cacheKey, items);
    return items;
  }

  private async getConfigsInCategory(workspaceUri: vscode.Uri, category: string): Promise<ConfigTreeItem[]> {
    const cacheKey = `${workspaceUri.fsPath}:${category}`;
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey)!;
    }

    const items: ConfigTreeItem[] = [];
    
    try {
      // Find config files in the workspace
      const pattern = new vscode.RelativePattern(workspaceUri, '**/config/**/*.{xdm,json}');
      const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');

      for (const file of files) {
        const moduleName = this.extractModuleName(file);
        const layer = this.detectLayer(moduleName);
        
        if (this.matchesCategory(layer, category)) {
          items.push(new ConfigTreeItem(
            path.basename(file.fsPath),
            vscode.TreeItemCollapsibleState.None,
            ConfigItemType.Config,
            file,
            'config'
          ));
        }
      }
    } catch (error) {
      console.error('Error loading configs:', error);
    }

    this.configCache.set(cacheKey, items);
    return items;
  }

  private async getConfigsForModule(moduleUri: vscode.Uri): Promise<ConfigTreeItem[]> {
    const items: ConfigTreeItem[] = [];
    
    try {
      const pattern = new vscode.RelativePattern(moduleUri, '*.{xdm,json}');
      const files = await vscode.workspace.findFiles(pattern);

      for (const file of files) {
        items.push(new ConfigTreeItem(
          path.basename(file.fsPath),
          vscode.TreeItemCollapsibleState.None,
          ConfigItemType.Config,
          file,
          'config'
        ));
      }
    } catch (error) {
      console.error('Error loading module configs:', error);
    }

    return items;
  }

  private async hasYuleasrConfig(folderUri: vscode.Uri): Promise<boolean> {
    try {
      // Check for config directory
      const configPattern = new vscode.RelativePattern(folderUri, '**/config/**/*.{xdm,json}');
      const files = await vscode.workspace.findFiles(configPattern, null, 1);
      return files.length > 0;
    } catch {
      return false;
    }
  }

  private extractModuleName(fileUri: vscode.Uri): string {
    const parts = fileUri.fsPath.split(path.sep);
    const configIndex = parts.indexOf('config');
    if (configIndex >= 0 && configIndex < parts.length - 1) {
      return parts[configIndex + 1];
    }
    return path.basename(path.dirname(fileUri.fsPath));
  }

  private detectLayer(moduleName: string): string {
    const mcalModules = ['Mcu', 'Port', 'Dio', 'Adc', 'Pwm', 'Icu', 'Spi', 'Can', 'Lin', 'Fls'];
    const ecualModules = ['CanIf', 'CanTp', 'PduR', 'Com', 'Dcm', 'Dem', 'Nm', 'BswM', 'EcuM'];
    const serviceModules = ['Nm', 'ComM', 'Dcm', 'Dem', 'BswM', 'EcuM', 'WdgM', 'FiM'];

    if (mcalModules.includes(moduleName)) return 'MCAL';
    if (ecualModules.includes(moduleName)) return 'ECUAL';
    if (serviceModules.includes(moduleName)) return 'Service';
    if (moduleName.toLowerCase().includes('rte')) return 'RTE';
    if (moduleName.toLowerCase().includes('asw') || moduleName.startsWith('App')) return 'ASW';
    
    return 'Other';
  }

  private matchesCategory(layer: string, category: string): boolean {
    const categoryMap: Record<string, string> = {
      'Microcontroller Drivers (MCAL)': 'MCAL',
      'ECU Abstraction Layer (ECUAL)': 'ECUAL',
      'Services': 'Service',
      'Runtime Environment (RTE)': 'RTE',
      'Application Software (ASW)': 'ASW',
      'Other Configurations': 'Other'
    };

    return layer === categoryMap[category];
  }
}
