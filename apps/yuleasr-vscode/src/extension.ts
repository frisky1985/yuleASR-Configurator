import * as vscode from 'vscode';
import { ConfigTreeProvider } from './providers/ConfigTreeProvider';
import { ConfigEditorPanel } from './panels/ConfigEditorPanel';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext): void {
  console.log('yuleASR Configurator extension is now active');

  // Initialize tree data provider
  const configTreeProvider = new ConfigTreeProvider();
  
  // Register tree view
  const treeView = vscode.window.createTreeView('yuleasr.configExplorer', {
    treeDataProvider: configTreeProvider,
    showCollapseAll: true
  });

  // Set context variable based on workspace
  void detectYuleasrWorkspace().then(hasConfig => {
    void vscode.commands.executeCommand('setContext', 'workspaceHasYuleasrConfig', hasConfig);
  });

  // Register all commands
  const commands = registerCommands(configTreeProvider);
  context.subscriptions.push(...commands);

  // Register tree view
  context.subscriptions.push(treeView);

  // Register file system watcher for config files
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.{xdm,json}');
  watcher.onDidCreate(() => configTreeProvider.refresh());
  watcher.onDidDelete(() => configTreeProvider.refresh());
  watcher.onDidChange(() => configTreeProvider.refresh());
  context.subscriptions.push(watcher);

  // Register text editor command for opening configs
  context.subscriptions.push(
    vscode.commands.registerCommand('yuleasr.openConfigEditor', (uri: vscode.Uri) => {
      void ConfigEditorPanel.createOrShow(context.extensionUri, uri);
    })
  );

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('yuleasr')) {
        configTreeProvider.refresh();
      }
    })
  );
}

export function deactivate(): void {
  console.log('yuleASR Configurator extension is now deactivated');
}

async function detectYuleasrWorkspace(): Promise<boolean> {
  if (!vscode.workspace.workspaceFolders) {
    return false;
  }

  for (const folder of vscode.workspace.workspaceFolders) {
    try {
      // Check for yuleASR config directory or typical config files
      const configPattern = new vscode.RelativePattern(folder, '**/config/**/*.{xdm,json}');
      const files = await vscode.workspace.findFiles(configPattern, null, 1);
      if (files.length > 0) {
        return true;
      }

      // Check for yuleASR specific markers
      const markerPattern = new vscode.RelativePattern(folder, '**/yuleASR*');
      const markers = await vscode.workspace.findFiles(markerPattern, null, 1);
      if (markers.length > 0) {
        return true;
      }
    } catch {
      // Continue checking other folders
    }
  }

  return false;
}
