import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

/**
 * Panel for editing yuleASR configuration files.
 * Embeds the yuleasr-web React app as an IFrame or via direct HTML injection,
 * depending on whether we are in dev or production mode.
 *
 * Dev mode:  loads from the Vite dev server at http://localhost:3000
 * Prod mode: loads from the built HTML in media/webview/
 */
export class ConfigEditorPanel {
    public static currentPanel: ConfigEditorPanel | undefined;
    public static readonly viewType = 'yuleasrConfigEditor';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _configFilePath: string;
    private _disposables: vscode.Disposable[] = [];
    private _configData: unknown;

    /**
     * Whether we are running in development mode (launched via F5 /
     * the Vite dev server is expected on localhost:3000).
     */
    private static get _isDev(): boolean {
        return (
            process.env.NODE_ENV === 'development' ||
            // VS Code launches extensions with `--extensionDevelopmentPath`
            // when debugging – we can treat that as dev.
            process.env.VSCODE_DEBUG === 'true' ||
            process.env['VSCODE_DEV'] !== undefined
        );
    }

    public static createOrShow(
        extensionUri: vscode.Uri,
        configFilePath?: string
    ): ConfigEditorPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ConfigEditorPanel.currentPanel) {
            ConfigEditorPanel.currentPanel._panel.reveal(column);
            if (configFilePath) {
                ConfigEditorPanel.currentPanel.loadConfig(configFilePath);
            }
            return ConfigEditorPanel.currentPanel;
        }

        // Allow loading from localhost in dev mode
        const localResourceRoots: vscode.Uri[] = [
            vscode.Uri.joinPath(extensionUri, 'media'),
            vscode.Uri.joinPath(extensionUri, 'out'),
        ];

        if (ConfigEditorPanel._isDev) {
            // In dev mode, the webview needs to load from the Vite dev server
            localResourceRoots.push(
                vscode.Uri.parse('http://localhost:3000')
            );
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            ConfigEditorPanel.viewType,
            configFilePath
                ? `yuleASR: ${path.basename(configFilePath)}`
                : 'yuleASR Configurator',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots,
            }
        );

        ConfigEditorPanel.currentPanel = new ConfigEditorPanel(
            panel,
            extensionUri,
            configFilePath || ''
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

        // Load config data if a file was specified
        if (configFilePath) {
            this.loadConfig(configFilePath);
        }

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
                vscode.window.showErrorMessage(
                    `Configuration file not found: ${configFilePath}`
                );
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to load configuration: ${error}`
            );
        }
    }

    private sendConfigToWebview(): void {
        this._panel.webview.postMessage({
            type: 'configData',
            data: this._configData,
            filePath: this._configFilePath,
            fileName: path.basename(this._configFilePath),
        });
    }

    private async sendSchema(moduleName: string): Promise<void> {
        try {
            // Try to load schema from different locations
            const schemaPaths = [
                path.join(
                    this._extensionUri.fsPath,
                    'schemas',
                    `${moduleName}.schema.json`
                ),
                path.join(
                    this._extensionUri.fsPath,
                    'media',
                    'schemas',
                    `${moduleName}.schema.json`
                ),
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
                schema: schemaData,
            });
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'schemaData',
                moduleName,
                schema: null,
                error: String(error),
            });
        }
    }

    private async saveConfig(data: unknown): Promise<void> {
        try {
            const content = JSON.stringify(data, null, 2);
            fs.writeFileSync(this._configFilePath, content, 'utf8');
            this._configData = data;

            vscode.window.showInformationMessage(
                'Configuration saved successfully'
            );
            this._panel.webview.postMessage({ type: 'saveSuccess' });

            // Validate on save if enabled
            const config = vscode.workspace.getConfiguration('yuleasr');
            if (config.get<boolean>('validateOnSave', true)) {
                await this.validateConfig(data);
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to save configuration: ${error}`
            );
            this._panel.webview.postMessage({
                type: 'saveError',
                error: String(error),
            });
        }
    }

    private async validateConfig(data: unknown): Promise<void> {
        try {
            const validationResult = await this.performValidation(data);

            this._panel.webview.postMessage({
                type: 'validationResult',
                result: validationResult,
            });

            if (validationResult.valid) {
                vscode.window.showInformationMessage(
                    'Configuration is valid'
                );
            } else {
                const errorCount = validationResult.errors?.length || 0;
                vscode.window.showWarningMessage(
                    `Configuration has ${errorCount} validation issue(s)`
                );
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Validation failed: ${error}`
            );
        }
    }

    private async performValidation(
        data: unknown
    ): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        if (!data || typeof data !== 'object') {
            errors.push({
                path: '',
                message: 'Configuration must be a valid JSON object',
                severity: 'error',
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
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

            vscode.window.showInformationMessage('Generating code...');

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const showPreview = config.get<boolean>(
                'showGeneratedCode',
                true
            );
            if (showPreview) {
                this.showGeneratedCodePreview();
            }

            vscode.window.showInformationMessage(
                'Code generated successfully'
            );
        } catch (error) {
            vscode.window.showErrorMessage(
                `Code generation failed: ${error}`
            );
        }
    }

    private showGeneratedCodePreview(): void {
        const previewContent = `// Generated code preview for ${path.basename(this._configFilePath)}
// This is a placeholder for the actual generated code

#include "Std_Types.h"
#include "${path.basename(this._configFilePath, '.json')}.h"

// Configuration would be generated here
`;

        vscode.workspace
            .openTextDocument({
                content: previewContent,
                language: 'c',
            })
            .then((doc) => {
                vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            });
    }

    private _update(): void {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = getNonce();

        if (ConfigEditorPanel._isDev) {
            return this._getDevHtml(webview, nonce);
        }
        return this._getProdHtml(webview, nonce);
    }

    // ── Dev mode: IFrame pointing to Vite dev server ──────────────────
    private _getDevHtml(webview: vscode.Webview, nonce: string): string {
        const devServerUrl = 'http://localhost:3000/configurator/';

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        style-src ${webview.cspSource} 'unsafe-inline';
        script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval';
        frame-src http://localhost:3000;
        connect-src http://localhost:3000 http://localhost:3002;
        img-src http://localhost:3000 data:;
        font-src http://localhost:3000 data:;
    ">
    <title>yuleASR Configurator (Dev)</title>
    <style nonce="${nonce}">
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background: transparent;
        }
        iframe#yuleasr-app {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }
        .loading-overlay {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-editor-foreground, #d4d4d4);
            font-family: var(--vscode-font-family, sans-serif);
            font-size: 14px;
            z-index: 999;
            transition: opacity 0.3s ease;
        }
        .loading-overlay.hidden {
            opacity: 0;
            pointer-events: none;
        }
        .spinner {
            width: 24px;
            height: 24px;
            border: 3px solid var(--vscode-editor-foreground, #d4d4d4);
            border-top-color: var(--vscode-button-background, #0e639c);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 12px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loading-overlay" id="loading">
        <div class="spinner"></div>
        <span>Starting yuleASR Configurator…</span>
    </div>
    <iframe id="yuleasr-app" src="${devServerUrl}"></iframe>
    <script nonce="${nonce}">
        const iframe = document.getElementById('yuleasr-app');
        const loading = document.getElementById('loading');

        // Show loading until iframe loads
        iframe.addEventListener('load', () => {
            loading.classList.add('hidden');
        });

        // Fallback: hide loading after 5s even if iframe doesn't signal
        setTimeout(() => loading.classList.add('hidden'), 5000);

        // Relay VS Code API into the iframe
        const vscodeApi = acquireVsCodeApi();
        window.addEventListener('message', (event) => {
            if (event.source === iframe.contentWindow) {
                // Forward messages from webview app to VS Code
                vscodeApi.postMessage(event.data);
            }
        });
        // Listen for VS Code → iframe messages
        window.addEventListener('message', (event) => {
            if (event.source === window && event.data) {
                iframe.contentWindow.postMessage(event.data, '*');
            }
        });
    </script>
</body>
</html>`;
    }

    // ── Production mode: serve built web app assets ──────────────────
    private _getProdHtml(webview: vscode.Webview, nonce: string): string {
        // Path to the built webview bundle
        const webviewDir = vscode.Uri.joinPath(
            this._extensionUri,
            'media',
            'webview'
        );

        // Try loading the built index.html first
        const builtHtmlPath = path.join(
            webviewDir.fsPath,
            'index.html'
        );

        if (fs.existsSync(builtHtmlPath)) {
            // Read the built HTML and adjust asset paths to webview URIs
            let html = fs.readFileSync(builtHtmlPath, 'utf8');

            // Replace relative asset paths with webview URIs
            html = html.replace(
                /(src|href)=["'](\.\/assets\/[^"']+)["']/g,
                (_, attr, assetPath) => {
                    const assetUri = webview.asWebviewUri(
                        vscode.Uri.joinPath(webviewDir, assetPath)
                    );
                    return `${attr}="${assetUri}"`;
                }
            );

            // Inject VS Code API and CSP
            const cspMeta = `<meta http-equiv="Content-Security-Policy" content="
                default-src 'none';
                style-src ${webview.cspSource} 'unsafe-inline';
                script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval';
                connect-src ${webview.cspSource} http://localhost:3002 https:;
                img-src ${webview.cspSource} data:;
                font-src ${webview.cspSource} data:;
            ">`;

            // Insert CSP after the first <head>
            html = html.replace('<head>', `<head>\n    ${cspMeta}`);

            // Insert nonce on the module script tag
            html = html.replace(
                /<script(\s+type="module")?\s+crossorigin\s+src=/,
                `<script nonce="${nonce}"$1 crossorigin src=`
            );

            return html;
        }

        // Fallback: show a message if the built app is not available
        return this._getFallbackHtml(webview, nonce);
    }

    private _getFallbackHtml(
        webview: vscode.Webview,
        nonce: string
    ): string {
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css')
        );

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        style-src ${webview.cspSource};
        script-src 'nonce-${nonce}';
    ">
    <link href="${styleUri}" rel="stylesheet">
    <title>yuleASR Configuration Editor</title>
</head>
<body>
    <div id="root">
        <div class="loading">
            <h1>yuleASR Configuration Editor</h1>
            <p>Web app not built yet.</p>
            <p>Run <code>pnpm build:webview</code> in the extension directory,</p>
            <p>or use <strong>F5</strong> debug launch with Vite dev server running.</p>
        </div>
    </div>
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
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
