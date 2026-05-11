import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Manages the yuleASR configuration editor webview panel
 */
export class ConfigEditorPanel {
  public static currentPanel: ConfigEditorPanel | undefined;
  public static readonly viewType = 'yuleasr.configEditor';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _configUri: vscode.Uri;
  private _configData: unknown;

  public static async createOrShow(extensionUri: vscode.Uri, configUri: vscode.Uri): Promise<ConfigEditorPanel> {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (ConfigEditorPanel.currentPanel) {
      ConfigEditorPanel.currentPanel._panel.reveal(column);
      await ConfigEditorPanel.currentPanel.loadConfig(configUri);
      return ConfigEditorPanel.currentPanel;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      ConfigEditorPanel.viewType,
      'yuleASR Config Editor',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'dist')
        ]
      }
    );

    ConfigEditorPanel.currentPanel = new ConfigEditorPanel(panel, extensionUri, configUri);
    return ConfigEditorPanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    configUri: vscode.Uri
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._configUri = configUri;

    // Set the webview's initial html content
    void this.loadConfig(configUri);

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async message => {
        switch (message.type) {
          case 'save':
            await this.saveConfig(message.data);
            break;
          case 'validate':
            await this.validateConfig(message.data);
            break;
          case 'generate':
            await this.generateCode(message.data);
            break;
          case 'ready':
            // Webview is ready, send initial data
            void this.sendConfigToWebview();
            break;
        }
      },
      null,
      this._disposables
    );

    // Watch for file changes
    const watcher = vscode.workspace.createFileSystemWatcher(configUri.fsPath);
    watcher.onDidChange(() => {
      void this.loadConfig(configUri);
    }, null, this._disposables);
    this._disposables.push(watcher);
  }

  private async loadConfig(configUri: vscode.Uri): Promise<void> {
    this._configUri = configUri;
    
    try {
      const content = await fs.promises.readFile(configUri.fsPath, 'utf-8');
      this._configData = JSON.parse(content);
      
      // Update panel title
      this._panel.title = `yuleASR: ${path.basename(configUri.fsPath)}`;
      
      // Send to webview
      await this.sendConfigToWebview();
    } catch (error) {
      void vscode.window.showErrorMessage(`Failed to load config: ${String(error)}`);
    }
  }

  private async sendConfigToWebview(): Promise<void> {
    await this._panel.webview.postMessage({
      type: 'configLoaded',
      data: this._configData,
      uri: this._configUri.toString()
    });
  }

  private async saveConfig(data: unknown): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(this._configUri.fsPath, content, 'utf-8');
      
      await this._panel.webview.postMessage({
        type: 'saveSuccess'
      });
      
      void vscode.window.showInformationMessage('Configuration saved successfully');
    } catch (error) {
      await this._panel.webview.postMessage({
        type: 'saveError',
        error: String(error)
      });
      
      void vscode.window.showErrorMessage(`Failed to save config: ${String(error)}`);
    }
  }

  private async validateConfig(data: unknown): Promise<void> {
    try {
      // TODO: Integrate with @yuletech/core validator
      const result = {
        valid: true,
        errors: [] as string[],
        warnings: [] as string[]
      };

      await this._panel.webview.postMessage({
        type: 'validationResult',
        result
      });
    } catch (error) {
      await this._panel.webview.postMessage({
        type: 'validationError',
        error: String(error)
      });
    }
  }

  private async generateCode(data: unknown): Promise<void> {
    try {
      // TODO: Integrate with yuleasr-editor-core code generator
      await this._panel.webview.postMessage({
        type: 'generateResult',
        success: true
      });
      
      void vscode.window.showInformationMessage('Code generated successfully');
    } catch (error) {
      await this._panel.webview.postMessage({
        type: 'generateError',
        error: String(error)
      });
      
      void vscode.window.showErrorMessage(`Failed to generate code: ${String(error)}`);
    }
  }

  private _getHtmlForWebview(): string {
    const webview = this._panel.webview;
    
    // Local path to main script and css
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css')
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <link href="${styleUri}" rel="stylesheet">
    <title>yuleASR Config Editor</title>
</head>
<body>
    <div id="root">
        <div class="loading">Loading yuleASR Config Editor...</div>
    </div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  public dispose(): void {
    ConfigEditorPanel.currentPanel = undefined;

    // Clean up resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
