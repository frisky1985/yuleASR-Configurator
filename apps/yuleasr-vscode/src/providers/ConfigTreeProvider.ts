import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

/**
 * Represents a configuration module layer (MCAL, ECUAL, Service)
 */
export type ModuleLayer = 'MCAL' | 'ECUAL' | 'Service' | 'RTE' | 'ASW' | 'OS' | 'Integration' | 'Unknown';

/**
 * Tree item representing a yuleASR configuration node
 */
export class ConfigTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'layer' | 'module' | 'config',
        public readonly layer?: ModuleLayer,
        public readonly filePath?: string,
        public readonly moduleName?: string
    ) {
        super(label, collapsibleState);
        
        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.iconPath = this.getIconPath();
        this.contextValue = type;

        if (type === 'config' && filePath) {
            this.command = {
                command: 'yuleasr.openConfig',
                title: 'Open Configuration',
                arguments: [filePath]
            };
            this.resourceUri = vscode.Uri.file(filePath);
        }
    }

    private getTooltip(): string | vscode.MarkdownString {
        switch (this.type) {
            case 'layer':
                return `${this.label} Layer`;
            case 'module':
                return `${this.moduleName} Module (${this.layer})`;
            case 'config':
                return this.filePath || 'Configuration file';
            default:
                return this.label;
        }
    }

    private getDescription(): string {
        switch (this.type) {
            case 'layer':
                return '';
            case 'module':
                return this.layer || '';
            case 'config':
                return path.basename(this.filePath || '');
            default:
                return '';
        }
    }

    private getIconPath(): vscode.ThemeIcon | undefined {
        switch (this.type) {
            case 'layer':
                return new vscode.ThemeIcon('folder');
            case 'module':
                return this.getModuleIcon();
            case 'config':
                return new vscode.ThemeIcon('file-code');
            default:
                return undefined;
        }
    }

    private getModuleIcon(): vscode.ThemeIcon {
        switch (this.layer) {
            case 'MCAL':
                return new vscode.ThemeIcon('chip', new vscode.ThemeColor('symbolIcon.classForeground'));
            case 'ECUAL':
                return new vscode.ThemeIcon('layers', new vscode.ThemeColor('symbolIcon.interfaceForeground'));
            case 'Service':
                return new vscode.ThemeIcon('gear', new vscode.ThemeColor('symbolIcon.methodForeground'));
            case 'RTE':
                return new vscode.ThemeIcon('plug', new vscode.ThemeColor('symbolIcon.variableForeground'));
            case 'ASW':
                return new vscode.ThemeIcon('apps', new vscode.ThemeColor('symbolIcon.fieldForeground'));
            case 'OS':
                return new vscode.ThemeIcon('server-process', new vscode.ThemeColor('symbolIcon.namespaceForeground'));
            default:
                return new vscode.ThemeIcon('symbol-misc');
        }
    }
}

/**
 * Tree data provider for yuleASR configuration explorer
 */
export class ConfigTreeProvider implements vscode.TreeDataProvider<ConfigTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ConfigTreeItem | undefined | null | void> = 
        new vscode.EventEmitter<ConfigTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ConfigTreeItem | undefined | null | void> = 
        this._onDidChangeTreeData.event;

    // Module layer mappings
    private readonly layerModules: Record<ModuleLayer, string[]> = {
        'MCAL': ['Mcu', 'Port', 'Dio', 'Can', 'Spi', 'I2c', 'Pwm', 'Adc', 'Gpt', 'Wdg'],
        'ECUAL': ['CanIf', 'CanTp', 'PduR', 'Com', 'Dcm', 'Dem', 'Nvm', 'Fee', 'Ea'],
        'Service': ['BswM', 'EcuM', 'ComM', 'Nm', 'CanNm'],
        'RTE': ['Rte'],
        'ASW': ['Application', 'Swc'],
        'OS': ['Os'],
        'Integration': ['Ecu'],
        'Unknown': []
    };

    constructor(private workspaceRoot: string | undefined) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ConfigTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ConfigTreeItem): Promise<ConfigTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No workspace folder open');
            return [];
        }

        if (!element) {
            // Root level - return layers
            return this.getLayers();
        }

        switch (element.type) {
            case 'layer':
                return this.getModulesForLayer(element.layer as ModuleLayer);
            case 'module':
                return this.getConfigsForModule(element.moduleName!, element.layer as ModuleLayer);
            default:
                return [];
        }
    }

    private async getLayers(): Promise<ConfigTreeItem[]> {
        const layers: ConfigTreeItem[] = [];
        const layerOrder: ModuleLayer[] = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];

        for (const layer of layerOrder) {
            const hasModules = await this.hasModulesInLayer(layer);
            if (hasModules) {
                layers.push(new ConfigTreeItem(
                    layer,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'layer',
                    layer
                ));
            }
        }

        return layers;
    }

    private async getModulesForLayer(layer: ModuleLayer): Promise<ConfigTreeItem[]> {
        const modules: ConfigTreeItem[] = [];
        const moduleNames = this.layerModules[layer];

        for (const moduleName of moduleNames) {
            const hasConfig = await this.hasModuleConfig(moduleName, layer);
            if (hasConfig) {
                modules.push(new ConfigTreeItem(
                    moduleName,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'module',
                    layer,
                    undefined,
                    moduleName
                ));
            }
        }

        // Sort alphabetically
        modules.sort((a, b) => a.label.localeCompare(b.label));
        return modules;
    }

    private async getConfigsForModule(moduleName: string, layer: ModuleLayer): Promise<ConfigTreeItem[]> {
        const configs: ConfigTreeItem[] = [];
        const configPath = await this.findModuleConfigPath(moduleName, layer);

        if (configPath) {
            // Check for different config file formats
            const extensions = ['.yule.json', '.json', '.xdm', '.arxml'];
            
            for (const ext of extensions) {
                const filePath = path.join(configPath, `${moduleName}${ext}`);
                if (fs.existsSync(filePath)) {
                    configs.push(new ConfigTreeItem(
                        `${moduleName} Configuration`,
                        vscode.TreeItemCollapsibleState.None,
                        'config',
                        layer,
                        filePath,
                        moduleName
                    ));
                }
            }

            // Also look for any other config files in the directory
            if (fs.existsSync(configPath)) {
                const files = fs.readdirSync(configPath);
                for (const file of files) {
                    const fullPath = path.join(configPath, file);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isFile() && !configs.some(c => c.filePath === fullPath)) {
                        const ext = path.extname(file);
                        if (['.json', '.xdm', '.arxml'].includes(ext) || file.endsWith('.yule.json')) {
                            configs.push(new ConfigTreeItem(
                                path.basename(file),
                                vscode.TreeItemCollapsibleState.None,
                                'config',
                                layer,
                                fullPath,
                                moduleName
                            ));
                        }
                    }
                }
            }
        }

        return configs;
    }

    private async hasModulesInLayer(layer: ModuleLayer): Promise<boolean> {
        const moduleNames = this.layerModules[layer];
        for (const moduleName of moduleNames) {
            if (await this.hasModuleConfig(moduleName, layer)) {
                return true;
            }
        }
        return false;
    }

    private async hasModuleConfig(moduleName: string, layer: ModuleLayer): Promise<boolean> {
        const configPath = await this.findModuleConfigPath(moduleName, layer);
        return configPath !== undefined && fs.existsSync(configPath);
    }

    private async findModuleConfigPath(moduleName: string, layer: ModuleLayer): Promise<string | undefined> {
        if (!this.workspaceRoot) {
            return undefined;
        }

        // Possible config locations
        const possiblePaths = [
            path.join(this.workspaceRoot, 'config', moduleName),
            path.join(this.workspaceRoot, 'configs', moduleName),
            path.join(this.workspaceRoot, layer, moduleName),
            path.join(this.workspaceRoot, moduleName),
        ];

        // Check if yuleASR path is configured
        const config = vscode.workspace.getConfiguration('yuleasr');
        const yuleASRPath = config.get<string>('yuleASRPath');
        
        if (yuleASRPath) {
            possiblePaths.push(
                path.join(yuleASRPath, 'config', moduleName),
                path.join(yuleASRPath, 'src', layer.toLowerCase(), moduleName, 'config')
            );
        }

        for (const configPath of possiblePaths) {
            if (fs.existsSync(configPath)) {
                return configPath;
            }
        }

        return undefined;
    }

    /**
     * Find a module by name
     */
    async findModule(moduleName: string): Promise<ConfigTreeItem | undefined> {
        const layers: ModuleLayer[] = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];
        
        for (const layer of layers) {
            const hasConfig = await this.hasModuleConfig(moduleName, layer);
            if (hasConfig) {
                return new ConfigTreeItem(
                    moduleName,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'module',
                    layer,
                    undefined,
                    moduleName
                );
            }
        }

        return undefined;
    }

    /**
     * Get all modules
     */
    async getAllModules(): Promise<ConfigTreeItem[]> {
        const allModules: ConfigTreeItem[] = [];
        const layers: ModuleLayer[] = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];
        
        for (const layer of layers) {
            const modules = await this.getModulesForLayer(layer);
            allModules.push(...modules);
        }

        return allModules;
    }
}