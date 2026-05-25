import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

/**
 * Panel for editing yuleASR configuration files
 */
export class ConfigEditorPanel {
    public static currentPanel: ConfigEditorPanel | undefined;
    public static readonly viewType = 'yuleasrConfigEditor';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _configFilePath: string;
    private _disposables: vscode.Disposable[] = [];
    private _configData: unknown;

    public static createOrShow(
        extensionUri: vscode.Uri,
        configFilePath: string
    ): ConfigEditorPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ConfigEditorPanel.currentPanel) {
            ConfigEditorPanel.currentPanel._panel.reveal(column);
            ConfigEditorPanel.currentPanel.loadConfig(configFilePath);
            return ConfigEditorPanel.currentPanel;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            ConfigEditorPanel.viewType,
            `yuleASR: ${path.basename(configFilePath)}`,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out')
                ]
            }
        );

        ConfigEditorPanel.currentPanel = new ConfigEditorPanel(
            panel,
            extensionUri,
            configFilePath
        );

        return ConfigEditorPanel.currentPanel;
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        configFilePath: string
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._configFilePath = configFilePath;

        // Set the webview's initial html content
        this._update();

        // Load config data
        this.loadConfig(configFilePath);

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            () => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'ready':
                        // Webview is ready, send initial config data
                        this.sendConfigToWebview();
                        break;

                    case 'save':
                        await this.saveConfig(message.data);
                        break;

                    case 'cancel':
                        this.loadConfig(this._configFilePath);
                        break;

                    case 'validate':
                        await this.validateConfig(message.data);
                        break;

                    case 'generate':
                        await this.generateCode();
                        break;

                    case 'getSchema':
                        await this.sendSchema(message.moduleName);
                        break;

                    case 'error':
                        vscode.window.showErrorMessage(message.error);
                        break;

                    case 'info':
                        vscode.window.showInformationMessage(message.info);
                        break;

                    default:
                        console.log('Unknown message:', message);
                }
            },
            null,
            this._disposables
        );
    }

    public loadConfig(configFilePath: string): void {
        this._configFilePath = configFilePath;

        try {
            if (fs.existsSync(configFilePath)) {
                const content = fs.readFileSync(configFilePath, 'utf8');
                this._configData = JSON.parse(content);
                this._panel.title = `yuleASR: ${path.basename(configFilePath)}`;
                this.sendConfigToWebview();
            } else {
                vscode.window.showErrorMessage(`Configuration file not found: ${configFilePath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load configuration: ${error}`);
        }
    }

    private sendConfigToWebview(): void {
        this._panel.webview.postMessage({
            type: 'configData',
            data: this._configData,
            filePath: this._configFilePath,
            fileName: path.basename(this._configFilePath)
        });
    }

    private async sendSchema(moduleName: string): Promise<void> {
        try {
            // Try to load schema from different locations
            const schemaPaths = [
                path.join(this._extensionUri.fsPath, 'schemas', `${moduleName}.schema.json`),
                path.join(this._extensionUri.fsPath, 'media', 'schemas', `${moduleName}.schema.json`)
            ];

            let schemaData = null;

            for (const schemaPath of schemaPaths) {
                if (fs.existsSync(schemaPath)) {
                    const content = fs.readFileSync(schemaPath, 'utf8');
                    schemaData = JSON.parse(content);
                    break;
                }
            }

            this._panel.webview.postMessage({
                type: 'schemaData',
                moduleName,
                schema: schemaData
            });
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'schemaData',
                moduleName,
                schema: null,
                error: String(error)
            });
        }
    }

    private async saveConfig(data: unknown): Promise<void> {
        try {
            const content = JSON.stringify(data, null, 2);
            fs.writeFileSync(this._configFilePath, content, 'utf8');
            this._configData = data;

            vscode.window.showInformationMessage('Configuration saved successfully');
            this._panel.webview.postMessage({ type: 'saveSuccess' });

            // Validate on save if enabled
            const config = vscode.workspace.getConfiguration('yuleasr');
            if (config.get<boolean>('validateOnSave', true)) {
                await this.validateConfig(data);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save configuration: ${error}`);
            this._panel.webview.postMessage({ type: 'saveError', error: String(error) });
        }
    }

    private async validateConfig(data: unknown): Promise<void> {
        try {
            // Basic JSON schema validation
            const validationResult = await this.performValidation(data);
            
            this._panel.webview.postMessage({
                type: 'validationResult',
                result: validationResult
            });

            if (validationResult.valid) {
                vscode.window.showInformationMessage('Configuration is valid');
            } else {
                const errorCount = validationResult.errors?.length || 0;
                vscode.window.showWarningMessage(
                    `Configuration has ${errorCount} validation issue(s)`
                );
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Validation failed: ${error}`);
        }
    }

    private async performValidation(data: unknown): Promise<ValidationResult> {
        // This would integrate with @yuletech/core validator
        // For now, return basic validation
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        if (!data || typeof data !== 'object') {
            errors.push({
                path: '',
                message: 'Configuration must be a valid JSON object',
                severity: 'error'
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    private async generateCode(): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('yuleasr');
            const yuleASRPath = config.get<string>('yuleASRPath');

            if (!yuleASRPath) {
                vscode.window.showErrorMessage(
                    'yuleASR path not configured. Please set yuleasr.yuleASRPath in settings.'
                );
                return;
            }

            // Trigger code generation
            vscode.window.showInformationMessage('Generating code...');
            
            // This would integrate with yuleASR generator
            // For now, simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const showPreview = config.get<boolean>('showGeneratedCode', true);
            if (showPreview) {
                // Show generated code preview
                this.showGeneratedCodePreview();
            }

            vscode.window.showInformationMessage('Code generated successfully');
        } catch (error) {
            vscode.window.showErrorMessage(`Code generation failed: ${error}`);
        }
    }

    private showGeneratedCodePreview(): void {
        // Create a new document with generated code preview
        const previewContent = `// Generated code preview for ${path.basename(this._configFilePath)}
// This is a placeholder for the actual generated code

#include "Std_Types.h"
#include "${path.basename(this._configFilePath, '.json')}.h"

// Configuration would be generated here
`;

        vscode.workspace.openTextDocument({
            content: previewContent,
            language: 'c'
        }).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        });
    }

    private _update(): void {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get path to resource on disk
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css')
        );

        // Use a nonce to only allow a specific script to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <link href="${styleUri}" rel="stylesheet">
    <title>yuleASR Configuration Editor</title>
</head>
<body>
    <div id="root">
        <div class="loading">
            <h1>yuleASR Configuration Editor</h1>
            <p>Loading...</p>
        </div>
    </div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    public dispose(): void {
        ConfigEditorPanel.currentPanel = undefined;

        // Clean up our resources
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

interface ValidationError {
    path: string;
    message: string;
    severity: 'error' | 'warning';
}

interface ValidationWarning {
    path: string;
    message: string;
}

interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
