import * as vscode from 'vscode';

import { registerCommands } from './commands';
import { ConfigTreeProvider, ConfigTreeItem } from './providers/ConfigTreeProvider';
import { ConfigEditorPanel } from './panels/ConfigEditorPanel';

export function activate(context: vscode.ExtensionContext): void {
    console.log('yuleASR Configurator extension is now active');

    // Initialize tree view provider
    const treeProvider = new ConfigTreeProvider(vscode.workspace.rootPath);
    
    // Register tree view
    const treeView = vscode.window.createTreeView('yuleasrExplorer', {
        treeDataProvider: treeProvider,
        showCollapseAll: true,
        canSelectMany: false
    });

    // Register all commands
    registerCommands(context, treeProvider);

    // Register command: Open Dashboard (full web configurator)
    const openDashboardCmd = vscode.commands.registerCommand(
        'yuleasr.openDashboard',
        () => {
            ConfigEditorPanel.createOrShow(context.extensionUri);
        }
    );
    context.subscriptions.push(openDashboardCmd);

    // Add to subscriptions
    context.subscriptions.push(treeView);

    // Watch for configuration file changes
    setupFileWatchers(context, treeProvider);

    // Set workspace context if yuleASR config exists
    checkYuleASRWorkspace();
}

export function deactivate(): void {
    console.log('yuleASR Configurator extension is now deactivated');
}

function setupFileWatchers(
    context: vscode.ExtensionContext,
    treeProvider: ConfigTreeProvider
): void {
    // Watch for yuleASR config files
    const configWatcher = vscode.workspace.createFileSystemWatcher(
        '**/*.{yule.json,xdm,arxml}'
    );

    configWatcher.onDidCreate(() => treeProvider.refresh());
    configWatcher.onDidDelete(() => treeProvider.refresh());
    configWatcher.onDidChange(() => treeProvider.refresh());

    context.subscriptions.push(configWatcher);

    // Watch for workspace configuration
    const workspaceWatcher = vscode.workspace.createFileSystemWatcher(
        '**/yuleasr.config.json'
    );

    workspaceWatcher.onDidCreate(() => {
        vscode.commands.executeCommand('setContext', 'workspaceHasYuleASR', true);
        treeProvider.refresh();
    });

    workspaceWatcher.onDidDelete(() => {
        vscode.commands.executeCommand('setContext', 'workspaceHasYuleASR', false);
    });

    context.subscriptions.push(workspaceWatcher);
}

async function checkYuleASRWorkspace(): Promise<void> {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }

    const hasYuleASR = await Promise.any(
        vscode.workspace.workspaceFolders.map(async (folder) => {
            const pattern = new vscode.RelativePattern(folder, '**/yuleasr.config.json');
            const files = await vscode.workspace.findFiles(pattern, null, 1);
            return files.length > 0;
        })
    ).catch(() => false);

    vscode.commands.executeCommand('setContext', 'workspaceHasYuleASR', hasYuleASR);
}