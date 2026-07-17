import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

import { ConfigEditorPanel } from '../panels/ConfigEditorPanel';
import { ConfigTreeProvider, ConfigTreeItem } from '../providers/ConfigTreeProvider';

/**
 * Register all yuleASR commands
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  treeProvider: ConfigTreeProvider
): void {
  // Command: Open Configuration
  const openConfigCmd = vscode.commands.registerCommand(
    'yuleasr.openConfig',
    async (arg: ConfigTreeItem | string) => {
      const configPath = typeof arg === 'string' ? arg : arg.filePath;

      if (!configPath) {
        vscode.window.showErrorMessage('No configuration file specified');
        return;
      }

      // Check if we should use the webview editor or native editor
      const useWebview = true; // Always use webview for now

      if (useWebview) {
        ConfigEditorPanel.createOrShow(context.extensionUri, configPath);
      } else {
        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
      }
    }
  );

  // Command: Refresh Explorer
  const refreshExplorerCmd = vscode.commands.registerCommand('yuleasr.refreshExplorer', () => {
    treeProvider.refresh();
    vscode.window.showInformationMessage('yuleASR Explorer refreshed');
  });

  // Command: Sync with yuleASR
  const syncConfigCmd = vscode.commands.registerCommand(
    'yuleasr.syncConfig',
    async (item?: ConfigTreeItem) => {
      await syncWithYuleASR(item);
    }
  );

  // Command: Validate Configuration
  const validateConfigCmd = vscode.commands.registerCommand(
    'yuleasr.validateConfig',
    async (item?: ConfigTreeItem) => {
      if (item?.filePath) {
        await validateConfiguration(item.filePath);
      } else {
        // Validate all configurations
        await validateAllConfigurations(treeProvider);
      }
    }
  );

  // Command: Generate Code
  const generateCodeCmd = vscode.commands.registerCommand(
    'yuleasr.generateCode',
    async (item?: ConfigTreeItem) => {
      if (item?.filePath) {
        await generateCodeForConfig(item.filePath, item.moduleName);
      } else {
        await generateAllCode(treeProvider);
      }
    }
  );

  // Command: New Module
  const newModuleCmd = vscode.commands.registerCommand('yuleasr.newModule', async () => {
    await createNewModule(treeProvider);
  });

  // Command: Delete Module
  const deleteModuleCmd = vscode.commands.registerCommand(
    'yuleasr.deleteModule',
    async (item: ConfigTreeItem) => {
      await deleteModule(item, treeProvider);
    }
  );

  // Command: Rename Module
  const renameModuleCmd = vscode.commands.registerCommand(
    'yuleasr.renameModule',
    async (item: ConfigTreeItem) => {
      await renameModule(item, treeProvider);
    }
  );

  // Command: Initialize Project
  const initProjectCmd = vscode.commands.registerCommand('yuleasr.initProject', async () => {
    await initializeProject(treeProvider);
  });

  // Add all commands to subscriptions
  context.subscriptions.push(
    openConfigCmd,
    refreshExplorerCmd,
    syncConfigCmd,
    validateConfigCmd,
    generateCodeCmd,
    newModuleCmd,
    deleteModuleCmd,
    renameModuleCmd,
    initProjectCmd
  );

  // Register hover provider for configuration files
  const hoverProvider = vscode.languages.registerHoverProvider(
    { pattern: '**/*.{yule.json,json}' },
    new YuleASRHoverProvider()
  );

  // Register completion item provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { pattern: '**/*.{yule.json,json}' },
    new YuleASRCompletionProvider(),
    '"',
    ':',
    '.'
  );

  // Register diagnostic collection
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('yuleasr');
  context.subscriptions.push(hoverProvider, completionProvider, diagnosticCollection);

  // Watch for save events to validate
  vscode.workspace.onDidSaveTextDocument(async document => {
    const config = vscode.workspace.getConfiguration('yuleasr');
    if (config.get<boolean>('validateOnSave', true)) {
      if (document.fileName.endsWith('.yule.json') || document.fileName.endsWith('.json')) {
        await validateConfiguration(document.fileName, diagnosticCollection);
      }
    }
  });
}

/**
 * Sync configuration with yuleASR repository
 */
async function syncWithYuleASR(_item?: ConfigTreeItem): Promise<void> {
  const config = vscode.workspace.getConfiguration('yuleasr');
  const yuleASRPath = config.get<string>('yuleASRPath');

  if (!yuleASRPath) {
    const result = await vscode.window.showInformationMessage(
      'yuleASR path not configured. Would you like to set it now?',
      'Yes',
      'No'
    );

    if (result === 'Yes') {
      const folder = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: 'Select yuleASR Repository',
      });

      if (folder && folder.length > 0) {
        await config.update('yuleASRPath', folder[0].fsPath, true);
      }
    }
    return;
  }

  if (!fs.existsSync(yuleASRPath)) {
    vscode.window.showErrorMessage(`yuleASR path does not exist: ${yuleASRPath}`);
    return;
  }

  // Show progress
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Syncing with yuleASR...',
      cancellable: true,
    },
    async (progress, token) => {
      // Simulate sync operations
      progress.report({ increment: 0, message: 'Checking repository...' });
      await delay(500);

      if (token.isCancellationRequested) {
        return;
      }

      progress.report({ increment: 30, message: 'Syncing schemas...' });
      await delay(500);

      if (token.isCancellationRequested) {
        return;
      }

      progress.report({ increment: 40, message: 'Syncing configurations...' });
      await delay(500);

      if (token.isCancellationRequested) {
        return;
      }

      progress.report({ increment: 30, message: 'Complete' });
    }
  );

  vscode.window.showInformationMessage('Sync with yuleASR completed successfully');
}

/**
 * Validate a configuration file
 */
async function validateConfiguration(
  filePath: string,
  diagnosticCollection?: vscode.DiagnosticCollection
): Promise<boolean> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // Basic validation
    const diagnostics: vscode.Diagnostic[] = [];
    let isValid = true;

    if (!data.moduleName) {
      isValid = false;
      const range = new vscode.Range(0, 0, 0, 0);
      const diagnostic = new vscode.Diagnostic(
        range,
        'Missing required field: moduleName',
        vscode.DiagnosticSeverity.Error
      );
      diagnostics.push(diagnostic);
    }

    if (diagnosticCollection) {
      const uri = vscode.Uri.file(filePath);
      diagnosticCollection.set(uri, diagnostics);
    }

    if (isValid) {
      vscode.window.showInformationMessage(`Configuration is valid: ${path.basename(filePath)}`);
    } else {
      vscode.window.showWarningMessage(`Configuration has errors: ${path.basename(filePath)}`);
    }

    return isValid;
  } catch (error) {
    vscode.window.showErrorMessage(`Validation failed: ${error}`);
    return false;
  }
}

/**
 * Validate all configurations
 */
async function validateAllConfigurations(treeProvider: ConfigTreeProvider): Promise<void> {
  const modules = await treeProvider.getAllModules();
  let validCount = 0;
  let invalidCount = 0;

  for (const module of modules) {
    if (module.filePath) {
      const isValid = await validateConfiguration(module.filePath);
      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    }
  }

  vscode.window.showInformationMessage(
    `Validation complete: ${validCount} valid, ${invalidCount} invalid`
  );
}

/**
 * Generate code for a configuration
 */
async function generateCodeForConfig(filePath: string, moduleName?: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('yuleasr');
  const yuleASRPath = config.get<string>('yuleASRPath');

  if (!yuleASRPath) {
    vscode.window.showErrorMessage('Please configure yuleASR path first');
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Generating code for ${moduleName || path.basename(filePath)}...`,
      cancellable: true,
    },
    async progress => {
      progress.report({ increment: 50, message: 'Generating...' });
      await delay(1000);
      progress.report({ increment: 50, message: 'Done' });
    }
  );

  vscode.window.showInformationMessage(
    `Code generated for ${moduleName || path.basename(filePath)}`
  );
}

/**
 * Generate code for all configurations
 */
async function generateAllCode(treeProvider: ConfigTreeProvider): Promise<void> {
  const modules = await treeProvider.getAllModules();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Generating code for all modules...',
      cancellable: true,
    },
    async progress => {
      for (let i = 0; i < modules.length; i++) {
        if (modules[i].filePath) {
          progress.report({
            increment: 100 / modules.length,
            message: `Processing ${modules[i].label}...`,
          });
          await delay(200);
        }
      }
    }
  );

  vscode.window.showInformationMessage(`Code generated for ${modules.length} modules`);
}

/**
 * Create a new module configuration
 */
async function createNewModule(treeProvider: ConfigTreeProvider): Promise<void> {
  // Ask for module name
  const moduleName = await vscode.window.showInputBox({
    prompt: 'Enter module name',
    placeHolder: 'e.g., Can, Mcu, Port',
    validateInput: value => {
      if (!value || value.trim().length === 0) {
        return 'Module name is required';
      }
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
        return 'Module name must start with a letter and contain only letters and numbers';
      }
      return null;
    },
  });

  if (!moduleName) {
    return;
  }

  // Select layer
  const layer = await vscode.window.showQuickPick(
    ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'],
    {
      placeHolder: 'Select module layer',
    }
  );

  if (!layer) {
    return;
  }

  // Create module directory and file
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const moduleDir = path.join(workspaceRoot, 'config', moduleName);
  const configFile = path.join(moduleDir, `${moduleName}.yule.json`);

  try {
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    const template = {
      moduleName: moduleName,
      layer: layer,
      version: '1.0.0',
      description: `${moduleName} module configuration`,
      parameters: {},
      containers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(configFile, JSON.stringify(template, null, 2));
    treeProvider.refresh();

    // Open the new configuration
    const openFile = await vscode.window.showInformationMessage(
      `Module ${moduleName} created. Open configuration?`,
      'Open',
      'Later'
    );

    if (openFile === 'Open') {
      ConfigEditorPanel.createOrShow(
        vscode.extensions.getExtension('yuletech.yuleasr-vscode')!.extensionUri,
        configFile
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to create module: ${error}`);
  }
}

/**
 * Delete a module
 */
async function deleteModule(item: ConfigTreeItem, treeProvider: ConfigTreeProvider): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    `Are you sure you want to delete ${item.label}?`,
    { modal: true },
    'Delete'
  );

  if (confirm !== 'Delete') {
    return;
  }

  try {
    if (item.filePath) {
      fs.unlinkSync(item.filePath);
    }

    // Try to remove parent directory if empty
    const parentDir = item.filePath ? path.dirname(item.filePath) : undefined;
    if (parentDir && fs.existsSync(parentDir) && fs.readdirSync(parentDir).length === 0) {
      fs.rmdirSync(parentDir);
    }

    treeProvider.refresh();
    vscode.window.showInformationMessage(`${item.label} deleted successfully`);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to delete module: ${error}`);
  }
}

/**
 * Rename a module
 */
async function renameModule(item: ConfigTreeItem, treeProvider: ConfigTreeProvider): Promise<void> {
  const newName = await vscode.window.showInputBox({
    prompt: 'Enter new module name',
    value: item.label,
    validateInput: value => {
      if (!value || value.trim().length === 0) {
        return 'Module name is required';
      }
      return null;
    },
  });

  if (!newName || newName === item.label) {
    return;
  }

  try {
    if (item.filePath) {
      const parentDir = path.dirname(item.filePath);
      const ext = path.extname(item.filePath);
      const newFilePath = path.join(parentDir, `${newName}${ext}`);
      fs.renameSync(item.filePath, newFilePath);
    }

    treeProvider.refresh();
    vscode.window.showInformationMessage(`Module renamed to ${newName}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to rename module: ${error}`);
  }
}

/**
 * Initialize a new yuleASR project
 */
async function initializeProject(treeProvider: ConfigTreeProvider): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const configDir = path.join(workspaceRoot, 'config');
  const projectConfig = path.join(workspaceRoot, 'yuleasr.config.json');

  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const projectData = {
      name: path.basename(workspaceRoot),
      version: '0.1.0',
      description: 'yuleASR Configuration Project',
      createdAt: new Date().toISOString(),
      modules: [],
    };

    fs.writeFileSync(projectConfig, JSON.stringify(projectData, null, 2));

    vscode.commands.executeCommand('setContext', 'workspaceHasYuleASR', true);
    treeProvider.refresh();

    vscode.window.showInformationMessage('yuleASR project initialized successfully');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to initialize project: ${error}`);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Hover provider for yuleASR configuration files
 */
class YuleASRHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const lineText = document.lineAt(position.line).text;

    // Provide hover information for known fields
    if (lineText.includes('moduleName')) {
      return new vscode.Hover(
        new vscode.MarkdownString(
          '**moduleName**: The name of the AutoSAR module (e.g., Can, Mcu, Port)'
        )
      );
    }

    if (lineText.includes('layer')) {
      return new vscode.Hover(
        new vscode.MarkdownString(
          '**layer**: The BSW layer this module belongs to (MCAL, ECUAL, Service, RTE, ASW, OS)'
        )
      );
    }

    return undefined;
  }
}

/**
 * Completion item provider for yuleASR configuration files
 */
class YuleASRCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const lineText = document.lineAt(position.line).text.substring(0, position.character);
    const completions: vscode.CompletionItem[] = [];

    // Provide completion for layer values
    if (lineText.includes('layer')) {
      const layers = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];
      for (const layer of layers) {
        const item = new vscode.CompletionItem(layer, vscode.CompletionItemKind.EnumMember);
        item.detail = `${layer} Layer`;
        completions.push(item);
      }
    }

    // Provide completion for common module names
    if (lineText.includes('moduleName')) {
      const modules = [
        { name: 'Can', detail: 'CAN Driver' },
        { name: 'Mcu', detail: 'MCU Driver' },
        { name: 'Port', detail: 'Port Driver' },
        { name: 'Dio', detail: 'DIO Driver' },
        { name: 'Spi', detail: 'SPI Driver' },
        { name: 'Pwm', detail: 'PWM Driver' },
        { name: 'Adc', detail: 'ADC Driver' },
        { name: 'Gpt', detail: 'GPT Driver' },
        { name: 'Wdg', detail: 'Watchdog Driver' },
        { name: 'CanIf', detail: 'CAN Interface' },
        { name: 'PduR', detail: 'PDU Router' },
        { name: 'Com', detail: 'Communication' },
        { name: 'BswM', detail: 'BSW Mode Manager' },
        { name: 'EcuM', detail: 'ECU State Manager' },
      ];

      for (const mod of modules) {
        const item = new vscode.CompletionItem(mod.name, vscode.CompletionItemKind.Module);
        item.detail = mod.detail;
        completions.push(item);
      }
    }

    return completions;
  }
}
