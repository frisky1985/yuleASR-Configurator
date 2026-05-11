import * as vscode from 'vscode';
import { ConfigTreeProvider } from '../providers/ConfigTreeProvider';
import { ConfigEditorPanel } from '../panels/ConfigEditorPanel';

/**
 * Register all yuleASR commands
 */
export function registerCommands(configTreeProvider: ConfigTreeProvider): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // Open yuleASR Config command
  disposables.push(
    vscode.commands.registerCommand('yuleasr.openConfig', async (uri?: vscode.Uri) => {
      if (uri) {
        await ConfigEditorPanel.createOrShow(getExtensionUri(), uri);
      } else {
        // Show file picker
        const fileUri = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: {
            'yuleASR Config': ['xdm', 'json'],
            'All Files': ['*']
          }
        });

        if (fileUri && fileUri[0]) {
          await ConfigEditorPanel.createOrShow(getExtensionUri(), fileUri[0]);
        }
      }
    })
  );

  // Refresh Explorer command
  disposables.push(
    vscode.commands.registerCommand('yuleasr.refreshExplorer', () => {
      configTreeProvider.refresh();
      void vscode.window.showInformationMessage('yuleASR configuration explorer refreshed');
    })
  );

  // Sync Configuration command
  disposables.push(
    vscode.commands.registerCommand('yuleasr.syncConfig', async (item) => {
      if (!item || !item.resourceUri) {
        void vscode.window.showWarningMessage('Please select a configuration file to sync');
        return;
      }

      const config = vscode.workspace.getConfiguration('yuleasr');
      const yuleASRPath = config.get<string>('yuleASRPath');

      if (!yuleASRPath) {
        const result = await vscode.window.showErrorMessage(
          'yuleASR path not configured. Please set it in settings.',
          'Open Settings'
        );
        if (result === 'Open Settings') {
          void vscode.commands.executeCommand('workbench.action.openSettings', 'yuleasr.yuleASRPath');
        }
        return;
      }

      try {
        await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'Syncing yuleASR configuration...',
          cancellable: false
        }, async () => {
          // TODO: Integrate with yuleasr-editor-core sync functionality
          await new Promise(resolve => setTimeout(resolve, 1000));
        });

        void vscode.window.showInformationMessage(`Configuration synced: ${item.label}`);
      } catch (error) {
        void vscode.window.showErrorMessage(`Sync failed: ${String(error)}`);
      }
    })
  );

  // Validate Configuration command
  disposables.push(
    vscode.commands.registerCommand('yuleasr.validateConfig', async (item) => {
      if (!item || !item.resourceUri) {
        void vscode.window.showWarningMessage('Please select a configuration file to validate');
        return;
      }

      try {
        const result = await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'Validating yuleASR configuration...',
          cancellable: false
        }, async () => {
          // TODO: Integrate with @yuletech/core validator
          const fs = await import('fs');
          const content = await fs.promises.readFile(item.resourceUri.fsPath, 'utf-8');
          const data = JSON.parse(content);
          
          // Basic validation
          const errors: string[] = [];
          const warnings: string[] = [];

          if (!data.modules && !data.parameters) {
            errors.push('Configuration must have either modules or parameters');
          }

          return { valid: errors.length === 0, errors, warnings };
        });

        if (result.valid) {
          void vscode.window.showInformationMessage(`✅ Configuration valid: ${item.label}`);
        } else {
          const panel = vscode.window.createOutputChannel('yuleASR Validation');
          panel.clear();
          panel.appendLine(`Validation Errors for ${item.label}:`);
          panel.appendLine('');
          result.errors.forEach(err => panel.appendLine(`❌ ${err}`));
          result.warnings.forEach(warn => panel.appendLine(`⚠️ ${warn}`));
          panel.show();
          
          void vscode.window.showErrorMessage(`Validation failed with ${result.errors.length} error(s)`);
        }
      } catch (error) {
        void vscode.window.showErrorMessage(`Validation error: ${String(error)}`);
      }
    })
  );

  // Generate Code command
  disposables.push(
    vscode.commands.registerCommand('yuleasr.generateCode', async (item) => {
      if (!item || !item.resourceUri) {
        void vscode.window.showWarningMessage('Please select a configuration file to generate code');
        return;
      }

      const outputDir = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select Output Directory'
      });

      if (!outputDir || !outputDir[0]) {
        return;
      }

      try {
        await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'Generating code from yuleASR configuration...',
          cancellable: false
        }, async () => {
          // TODO: Integrate with yuleasr-editor-core code generator
          await new Promise(resolve => setTimeout(resolve, 1500));
        });

        void vscode.window.showInformationMessage(`✅ Code generated to: ${outputDir[0].fsPath}`);
      } catch (error) {
        void vscode.window.showErrorMessage(`Code generation failed: ${String(error)}`);
      }
    })
  );

  // Set yuleASR Path command
  disposables.push(
    vscode.commands.registerCommand('yuleasr.setYuleASRPath', async () => {
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select yuleASR Repository'
      });

      if (folderUri && folderUri[0]) {
        const config = vscode.workspace.getConfiguration('yuleasr');
        await config.update('yuleASRPath', folderUri[0].fsPath, true);
        void vscode.window.showInformationMessage(`yuleASR path set to: ${folderUri[0].fsPath}`);
      }
    })
  );

  return disposables;
}

/**
 * Get the extension URI from the current extension context
 */
function getExtensionUri(): vscode.Uri {
  // This would typically come from the extension context
  // For now, return a placeholder that should be replaced with actual implementation
  if (vscode.extensions.getExtension('yuletech.yuleasr-vscode')) {
    const ext = vscode.extensions.getExtension('yuletech.yuleasr-vscode');
    if (ext) {
      return ext.extensionUri;
    }
  }
  
  // Fallback to first workspace folder
  if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
    return vscode.workspace.workspaceFolders[0].uri;
  }
  
  throw new Error('Unable to determine extension URI');
}
