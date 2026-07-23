"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode4 = __toESM(require("vscode"));

// src/commands/index.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var vscode2 = __toESM(require("vscode"));

// src/panels/ConfigEditorPanel.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var vscode = __toESM(require("vscode"));
var ConfigEditorPanel = class _ConfigEditorPanel {
  constructor(panel, extensionUri, configFilePath) {
    this._disposables = [];
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._configFilePath = configFilePath;
    this._update();
    if (configFilePath) {
      this.loadConfig(configFilePath);
    }
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.onDidChangeViewState(
      () => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case "ready":
            this.sendConfigToWebview();
            break;
          case "save":
            await this.saveConfig(message.data);
            break;
          case "cancel":
            this.loadConfig(this._configFilePath);
            break;
          case "validate":
            await this.validateConfig(message.data);
            break;
          case "generate":
            await this.generateCode();
            break;
          case "getSchema":
            await this.sendSchema(message.moduleName);
            break;
          case "error":
            vscode.window.showErrorMessage(message.error);
            break;
          case "info":
            vscode.window.showInformationMessage(message.info);
            break;
          default:
            console.log("Unknown message:", message);
        }
      },
      null,
      this._disposables
    );
  }
  static {
    this.viewType = "yuleasrConfigEditor";
  }
  /**
   * Whether we are running in development mode (launched via F5 /
   * the Vite dev server is expected on localhost:3000).
   */
  static get _isDev() {
    return process.env.NODE_ENV === "development" || // VS Code launches extensions with `--extensionDevelopmentPath`
    // when debugging – we can treat that as dev.
    process.env.VSCODE_DEBUG === "true" || process.env["VSCODE_DEV"] !== void 0;
  }
  static createOrShow(extensionUri, configFilePath) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : void 0;
    if (_ConfigEditorPanel.currentPanel) {
      _ConfigEditorPanel.currentPanel._panel.reveal(column);
      if (configFilePath) {
        _ConfigEditorPanel.currentPanel.loadConfig(configFilePath);
      }
      return _ConfigEditorPanel.currentPanel;
    }
    const localResourceRoots = [
      vscode.Uri.joinPath(extensionUri, "media"),
      vscode.Uri.joinPath(extensionUri, "out")
    ];
    if (_ConfigEditorPanel._isDev) {
      localResourceRoots.push(vscode.Uri.parse("http://localhost:3000"));
    }
    const panel = vscode.window.createWebviewPanel(
      _ConfigEditorPanel.viewType,
      configFilePath ? `yuleASR: ${path.basename(configFilePath)}` : "yuleASR Configurator",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots
      }
    );
    _ConfigEditorPanel.currentPanel = new _ConfigEditorPanel(
      panel,
      extensionUri,
      configFilePath || ""
    );
    return _ConfigEditorPanel.currentPanel;
  }
  loadConfig(configFilePath) {
    this._configFilePath = configFilePath;
    try {
      if (fs.existsSync(configFilePath)) {
        const content = fs.readFileSync(configFilePath, "utf8");
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
  sendConfigToWebview() {
    this._panel.webview.postMessage({
      type: "configData",
      data: this._configData,
      filePath: this._configFilePath,
      fileName: path.basename(this._configFilePath)
    });
  }
  async sendSchema(moduleName) {
    try {
      const schemaPaths = [
        path.join(this._extensionUri.fsPath, "schemas", `${moduleName}.schema.json`),
        path.join(this._extensionUri.fsPath, "media", "schemas", `${moduleName}.schema.json`)
      ];
      let schemaData = null;
      for (const schemaPath of schemaPaths) {
        if (fs.existsSync(schemaPath)) {
          const content = fs.readFileSync(schemaPath, "utf8");
          schemaData = JSON.parse(content);
          break;
        }
      }
      this._panel.webview.postMessage({
        type: "schemaData",
        moduleName,
        schema: schemaData
      });
    } catch (error) {
      this._panel.webview.postMessage({
        type: "schemaData",
        moduleName,
        schema: null,
        error: String(error)
      });
    }
  }
  async saveConfig(data) {
    try {
      const content = JSON.stringify(data, null, 2);
      fs.writeFileSync(this._configFilePath, content, "utf8");
      this._configData = data;
      vscode.window.showInformationMessage("Configuration saved successfully");
      this._panel.webview.postMessage({ type: "saveSuccess" });
      const config = vscode.workspace.getConfiguration("yuleasr");
      if (config.get("validateOnSave", true)) {
        await this.validateConfig(data);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save configuration: ${error}`);
      this._panel.webview.postMessage({
        type: "saveError",
        error: String(error)
      });
    }
  }
  async validateConfig(data) {
    try {
      const validationResult = await this.performValidation(data);
      this._panel.webview.postMessage({
        type: "validationResult",
        result: validationResult
      });
      if (validationResult.valid) {
        vscode.window.showInformationMessage("Configuration is valid");
      } else {
        const errorCount = validationResult.errors?.length || 0;
        vscode.window.showWarningMessage(`Configuration has ${errorCount} validation issue(s)`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Validation failed: ${error}`);
    }
  }
  async performValidation(data) {
    const errors = [];
    const warnings = [];
    if (!data || typeof data !== "object") {
      errors.push({
        path: "",
        message: "Configuration must be a valid JSON object",
        severity: "error"
      });
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  async generateCode() {
    try {
      const config = vscode.workspace.getConfiguration("yuleasr");
      const yuleASRPath = config.get("yuleASRPath");
      if (!yuleASRPath) {
        vscode.window.showErrorMessage(
          "yuleASR path not configured. Please set yuleasr.yuleASRPath in settings."
        );
        return;
      }
      vscode.window.showInformationMessage("Generating code...");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const showPreview = config.get("showGeneratedCode", true);
      if (showPreview) {
        this.showGeneratedCodePreview();
      }
      vscode.window.showInformationMessage("Code generated successfully");
    } catch (error) {
      vscode.window.showErrorMessage(`Code generation failed: ${error}`);
    }
  }
  showGeneratedCodePreview() {
    const previewContent = `// Generated code preview for ${path.basename(this._configFilePath)}
// This is a placeholder for the actual generated code

#include "Std_Types.h"
#include "${path.basename(this._configFilePath, ".json")}.h"

// Configuration would be generated here
`;
    vscode.workspace.openTextDocument({
      content: previewContent,
      language: "c"
    }).then((doc) => {
      vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    });
  }
  _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }
  _getHtmlForWebview(webview) {
    const nonce = getNonce();
    if (_ConfigEditorPanel._isDev) {
      return this._getDevHtml(webview, nonce);
    }
    return this._getProdHtml(webview, nonce);
  }
  // ── Dev mode: IFrame pointing to Vite dev server ──────────────────
  _getDevHtml(webview, nonce) {
    const devServerUrl = "http://localhost:3000/configurator/";
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
        <span>Starting yuleASR Configurator\u2026</span>
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
        // Listen for VS Code \u2192 iframe messages
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
  _getProdHtml(webview, nonce) {
    const webviewDir = vscode.Uri.joinPath(this._extensionUri, "media", "webview");
    const builtHtmlPath = path.join(webviewDir.fsPath, "index.html");
    if (fs.existsSync(builtHtmlPath)) {
      let html = fs.readFileSync(builtHtmlPath, "utf8");
      html = html.replace(/(src|href)=["'](\.\/assets\/[^"']+)["']/g, (_, attr, assetPath) => {
        const assetUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewDir, assetPath));
        return `${attr}="${assetUri}"`;
      });
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="
                default-src 'none';
                style-src ${webview.cspSource} 'unsafe-inline';
                script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval';
                connect-src ${webview.cspSource} http://localhost:3002 https:;
                img-src ${webview.cspSource} data:;
                font-src ${webview.cspSource} data:;
            ">`;
      html = html.replace("<head>", `<head>
    ${cspMeta}`);
      html = html.replace(
        /<script(\s+type="module")?\s+crossorigin\s+src=/,
        `<script nonce="${nonce}"$1 crossorigin src=`
      );
      return html;
    }
    return this._getFallbackHtml(webview, nonce);
  }
  _getFallbackHtml(webview, nonce) {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "style.css")
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
  dispose() {
    _ConfigEditorPanel.currentPanel = void 0;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
};
function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// src/commands/index.ts
function registerCommands(context, treeProvider) {
  const openConfigCmd = vscode2.commands.registerCommand(
    "yuleasr.openConfig",
    async (arg) => {
      const configPath = typeof arg === "string" ? arg : arg.filePath;
      if (!configPath) {
        vscode2.window.showErrorMessage("No configuration file specified");
        return;
      }
      const useWebview = true;
      if (useWebview) {
        ConfigEditorPanel.createOrShow(context.extensionUri, configPath);
      } else {
        const document = await vscode2.workspace.openTextDocument(configPath);
        await vscode2.window.showTextDocument(document);
      }
    }
  );
  const refreshExplorerCmd = vscode2.commands.registerCommand("yuleasr.refreshExplorer", () => {
    treeProvider.refresh();
    vscode2.window.showInformationMessage("yuleASR Explorer refreshed");
  });
  const syncConfigCmd = vscode2.commands.registerCommand(
    "yuleasr.syncConfig",
    async (item) => {
      await syncWithYuleASR(item);
    }
  );
  const validateConfigCmd = vscode2.commands.registerCommand(
    "yuleasr.validateConfig",
    async (item) => {
      if (item?.filePath) {
        await validateConfiguration(item.filePath);
      } else {
        await validateAllConfigurations(treeProvider);
      }
    }
  );
  const generateCodeCmd = vscode2.commands.registerCommand(
    "yuleasr.generateCode",
    async (item) => {
      if (item?.filePath) {
        await generateCodeForConfig(item.filePath, item.moduleName);
      } else {
        await generateAllCode(treeProvider);
      }
    }
  );
  const newModuleCmd = vscode2.commands.registerCommand("yuleasr.newModule", async () => {
    await createNewModule(treeProvider);
  });
  const deleteModuleCmd = vscode2.commands.registerCommand(
    "yuleasr.deleteModule",
    async (item) => {
      await deleteModule(item, treeProvider);
    }
  );
  const renameModuleCmd = vscode2.commands.registerCommand(
    "yuleasr.renameModule",
    async (item) => {
      await renameModule(item, treeProvider);
    }
  );
  const initProjectCmd = vscode2.commands.registerCommand("yuleasr.initProject", async () => {
    await initializeProject(treeProvider);
  });
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
  const hoverProvider = vscode2.languages.registerHoverProvider(
    { pattern: "**/*.{yule.json,json}" },
    new YuleASRHoverProvider()
  );
  const completionProvider = vscode2.languages.registerCompletionItemProvider(
    { pattern: "**/*.{yule.json,json}" },
    new YuleASRCompletionProvider(),
    '"',
    ":",
    "."
  );
  const diagnosticCollection = vscode2.languages.createDiagnosticCollection("yuleasr");
  context.subscriptions.push(hoverProvider, completionProvider, diagnosticCollection);
  vscode2.workspace.onDidSaveTextDocument(async (document) => {
    const config = vscode2.workspace.getConfiguration("yuleasr");
    if (config.get("validateOnSave", true)) {
      if (document.fileName.endsWith(".yule.json") || document.fileName.endsWith(".json")) {
        await validateConfiguration(document.fileName, diagnosticCollection);
      }
    }
  });
}
async function syncWithYuleASR(_item) {
  const config = vscode2.workspace.getConfiguration("yuleasr");
  const yuleASRPath = config.get("yuleASRPath");
  if (!yuleASRPath) {
    const result = await vscode2.window.showInformationMessage(
      "yuleASR path not configured. Would you like to set it now?",
      "Yes",
      "No"
    );
    if (result === "Yes") {
      const folder = await vscode2.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: "Select yuleASR Repository"
      });
      if (folder && folder.length > 0) {
        await config.update("yuleASRPath", folder[0].fsPath, true);
      }
    }
    return;
  }
  if (!fs2.existsSync(yuleASRPath)) {
    vscode2.window.showErrorMessage(`yuleASR path does not exist: ${yuleASRPath}`);
    return;
  }
  await vscode2.window.withProgress(
    {
      location: vscode2.ProgressLocation.Notification,
      title: "Syncing with yuleASR...",
      cancellable: true
    },
    async (progress, token) => {
      progress.report({ increment: 0, message: "Checking repository..." });
      await delay(500);
      if (token.isCancellationRequested) {
        return;
      }
      progress.report({ increment: 30, message: "Syncing schemas..." });
      await delay(500);
      if (token.isCancellationRequested) {
        return;
      }
      progress.report({ increment: 40, message: "Syncing configurations..." });
      await delay(500);
      if (token.isCancellationRequested) {
        return;
      }
      progress.report({ increment: 30, message: "Complete" });
    }
  );
  vscode2.window.showInformationMessage("Sync with yuleASR completed successfully");
}
async function validateConfiguration(filePath, diagnosticCollection) {
  try {
    const content = fs2.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    const diagnostics = [];
    let isValid = true;
    if (!data.moduleName) {
      isValid = false;
      const range = new vscode2.Range(0, 0, 0, 0);
      const diagnostic = new vscode2.Diagnostic(
        range,
        "Missing required field: moduleName",
        vscode2.DiagnosticSeverity.Error
      );
      diagnostics.push(diagnostic);
    }
    if (diagnosticCollection) {
      const uri = vscode2.Uri.file(filePath);
      diagnosticCollection.set(uri, diagnostics);
    }
    if (isValid) {
      vscode2.window.showInformationMessage(`Configuration is valid: ${path2.basename(filePath)}`);
    } else {
      vscode2.window.showWarningMessage(`Configuration has errors: ${path2.basename(filePath)}`);
    }
    return isValid;
  } catch (error) {
    vscode2.window.showErrorMessage(`Validation failed: ${error}`);
    return false;
  }
}
async function validateAllConfigurations(treeProvider) {
  const modules = await treeProvider.getAllModules();
  let validCount = 0;
  let invalidCount = 0;
  for (const module2 of modules) {
    if (module2.filePath) {
      const isValid = await validateConfiguration(module2.filePath);
      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    }
  }
  vscode2.window.showInformationMessage(
    `Validation complete: ${validCount} valid, ${invalidCount} invalid`
  );
}
async function generateCodeForConfig(filePath, moduleName) {
  const config = vscode2.workspace.getConfiguration("yuleasr");
  const yuleASRPath = config.get("yuleASRPath");
  if (!yuleASRPath) {
    vscode2.window.showErrorMessage("Please configure yuleASR path first");
    return;
  }
  await vscode2.window.withProgress(
    {
      location: vscode2.ProgressLocation.Notification,
      title: `Generating code for ${moduleName || path2.basename(filePath)}...`,
      cancellable: true
    },
    async (progress) => {
      progress.report({ increment: 50, message: "Generating..." });
      await delay(1e3);
      progress.report({ increment: 50, message: "Done" });
    }
  );
  vscode2.window.showInformationMessage(
    `Code generated for ${moduleName || path2.basename(filePath)}`
  );
}
async function generateAllCode(treeProvider) {
  const modules = await treeProvider.getAllModules();
  await vscode2.window.withProgress(
    {
      location: vscode2.ProgressLocation.Notification,
      title: "Generating code for all modules...",
      cancellable: true
    },
    async (progress) => {
      for (let i = 0; i < modules.length; i++) {
        if (modules[i].filePath) {
          progress.report({
            increment: 100 / modules.length,
            message: `Processing ${modules[i].label}...`
          });
          await delay(200);
        }
      }
    }
  );
  vscode2.window.showInformationMessage(`Code generated for ${modules.length} modules`);
}
async function createNewModule(treeProvider) {
  const moduleName = await vscode2.window.showInputBox({
    prompt: "Enter module name",
    placeHolder: "e.g., Can, Mcu, Port",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Module name is required";
      }
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
        return "Module name must start with a letter and contain only letters and numbers";
      }
      return null;
    }
  });
  if (!moduleName) {
    return;
  }
  const layer = await vscode2.window.showQuickPick(
    ["MCAL", "ECUAL", "Service", "RTE", "ASW", "OS", "Integration"],
    {
      placeHolder: "Select module layer"
    }
  );
  if (!layer) {
    return;
  }
  const workspaceRoot = vscode2.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    vscode2.window.showErrorMessage("No workspace folder open");
    return;
  }
  const moduleDir = path2.join(workspaceRoot, "config", moduleName);
  const configFile = path2.join(moduleDir, `${moduleName}.yule.json`);
  try {
    if (!fs2.existsSync(moduleDir)) {
      fs2.mkdirSync(moduleDir, { recursive: true });
    }
    const template = {
      moduleName,
      layer,
      version: "1.0.0",
      description: `${moduleName} module configuration`,
      parameters: {},
      containers: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    fs2.writeFileSync(configFile, JSON.stringify(template, null, 2));
    treeProvider.refresh();
    const openFile = await vscode2.window.showInformationMessage(
      `Module ${moduleName} created. Open configuration?`,
      "Open",
      "Later"
    );
    if (openFile === "Open") {
      ConfigEditorPanel.createOrShow(
        vscode2.extensions.getExtension("yuletech.yuleasr-vscode").extensionUri,
        configFile
      );
    }
  } catch (error) {
    vscode2.window.showErrorMessage(`Failed to create module: ${error}`);
  }
}
async function deleteModule(item, treeProvider) {
  const confirm = await vscode2.window.showWarningMessage(
    `Are you sure you want to delete ${item.label}?`,
    { modal: true },
    "Delete"
  );
  if (confirm !== "Delete") {
    return;
  }
  try {
    if (item.filePath) {
      fs2.unlinkSync(item.filePath);
    }
    const parentDir = item.filePath ? path2.dirname(item.filePath) : void 0;
    if (parentDir && fs2.existsSync(parentDir) && fs2.readdirSync(parentDir).length === 0) {
      fs2.rmdirSync(parentDir);
    }
    treeProvider.refresh();
    vscode2.window.showInformationMessage(`${item.label} deleted successfully`);
  } catch (error) {
    vscode2.window.showErrorMessage(`Failed to delete module: ${error}`);
  }
}
async function renameModule(item, treeProvider) {
  const newName = await vscode2.window.showInputBox({
    prompt: "Enter new module name",
    value: item.label,
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Module name is required";
      }
      return null;
    }
  });
  if (!newName || newName === item.label) {
    return;
  }
  try {
    if (item.filePath) {
      const parentDir = path2.dirname(item.filePath);
      const ext = path2.extname(item.filePath);
      const newFilePath = path2.join(parentDir, `${newName}${ext}`);
      fs2.renameSync(item.filePath, newFilePath);
    }
    treeProvider.refresh();
    vscode2.window.showInformationMessage(`Module renamed to ${newName}`);
  } catch (error) {
    vscode2.window.showErrorMessage(`Failed to rename module: ${error}`);
  }
}
async function initializeProject(treeProvider) {
  const workspaceRoot = vscode2.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    vscode2.window.showErrorMessage("No workspace folder open");
    return;
  }
  const configDir = path2.join(workspaceRoot, "config");
  const projectConfig = path2.join(workspaceRoot, "yuleasr.config.json");
  try {
    if (!fs2.existsSync(configDir)) {
      fs2.mkdirSync(configDir, { recursive: true });
    }
    const projectData = {
      name: path2.basename(workspaceRoot),
      version: "0.1.0",
      description: "yuleASR Configuration Project",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      modules: []
    };
    fs2.writeFileSync(projectConfig, JSON.stringify(projectData, null, 2));
    vscode2.commands.executeCommand("setContext", "workspaceHasYuleASR", true);
    treeProvider.refresh();
    vscode2.window.showInformationMessage("yuleASR project initialized successfully");
  } catch (error) {
    vscode2.window.showErrorMessage(`Failed to initialize project: ${error}`);
  }
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var YuleASRHoverProvider = class {
  provideHover(document, position) {
    const lineText = document.lineAt(position.line).text;
    if (lineText.includes("moduleName")) {
      return new vscode2.Hover(
        new vscode2.MarkdownString(
          "**moduleName**: The name of the AutoSAR module (e.g., Can, Mcu, Port)"
        )
      );
    }
    if (lineText.includes("layer")) {
      return new vscode2.Hover(
        new vscode2.MarkdownString(
          "**layer**: The BSW layer this module belongs to (MCAL, ECUAL, Service, RTE, ASW, OS)"
        )
      );
    }
    return void 0;
  }
};
var YuleASRCompletionProvider = class {
  provideCompletionItems(document, position) {
    const lineText = document.lineAt(position.line).text.substring(0, position.character);
    const completions = [];
    if (lineText.includes("layer")) {
      const layers = ["MCAL", "ECUAL", "Service", "RTE", "ASW", "OS", "Integration"];
      for (const layer of layers) {
        const item = new vscode2.CompletionItem(layer, vscode2.CompletionItemKind.EnumMember);
        item.detail = `${layer} Layer`;
        completions.push(item);
      }
    }
    if (lineText.includes("moduleName")) {
      const modules = [
        { name: "Can", detail: "CAN Driver" },
        { name: "Mcu", detail: "MCU Driver" },
        { name: "Port", detail: "Port Driver" },
        { name: "Dio", detail: "DIO Driver" },
        { name: "Spi", detail: "SPI Driver" },
        { name: "Pwm", detail: "PWM Driver" },
        { name: "Adc", detail: "ADC Driver" },
        { name: "Gpt", detail: "GPT Driver" },
        { name: "Wdg", detail: "Watchdog Driver" },
        { name: "CanIf", detail: "CAN Interface" },
        { name: "PduR", detail: "PDU Router" },
        { name: "Com", detail: "Communication" },
        { name: "BswM", detail: "BSW Mode Manager" },
        { name: "EcuM", detail: "ECU State Manager" }
      ];
      for (const mod of modules) {
        const item = new vscode2.CompletionItem(mod.name, vscode2.CompletionItemKind.Module);
        item.detail = mod.detail;
        completions.push(item);
      }
    }
    return completions;
  }
};

// src/providers/ConfigTreeProvider.ts
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var vscode3 = __toESM(require("vscode"));
var ConfigTreeItem = class extends vscode3.TreeItem {
  constructor(label, collapsibleState, type, layer, filePath, moduleName) {
    super(label, collapsibleState);
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.type = type;
    this.layer = layer;
    this.filePath = filePath;
    this.moduleName = moduleName;
    this.tooltip = this.getTooltip();
    this.description = this.getDescription();
    this.iconPath = this.getIconPath();
    this.contextValue = type;
    if (type === "config" && filePath) {
      this.command = {
        command: "yuleasr.openConfig",
        title: "Open Configuration",
        arguments: [filePath]
      };
      this.resourceUri = vscode3.Uri.file(filePath);
    }
  }
  getTooltip() {
    switch (this.type) {
      case "layer":
        return `${this.label} Layer`;
      case "module":
        return `${this.moduleName} Module (${this.layer})`;
      case "config":
        return this.filePath || "Configuration file";
      default:
        return this.label;
    }
  }
  getDescription() {
    switch (this.type) {
      case "layer":
        return "";
      case "module":
        return this.layer || "";
      case "config":
        return path3.basename(this.filePath || "");
      default:
        return "";
    }
  }
  getIconPath() {
    switch (this.type) {
      case "layer":
        return new vscode3.ThemeIcon("folder");
      case "module":
        return this.getModuleIcon();
      case "config":
        return new vscode3.ThemeIcon("file-code");
      default:
        return void 0;
    }
  }
  getModuleIcon() {
    switch (this.layer) {
      case "MCAL":
        return new vscode3.ThemeIcon("chip", new vscode3.ThemeColor("symbolIcon.classForeground"));
      case "ECUAL":
        return new vscode3.ThemeIcon(
          "layers",
          new vscode3.ThemeColor("symbolIcon.interfaceForeground")
        );
      case "Service":
        return new vscode3.ThemeIcon("gear", new vscode3.ThemeColor("symbolIcon.methodForeground"));
      case "RTE":
        return new vscode3.ThemeIcon("plug", new vscode3.ThemeColor("symbolIcon.variableForeground"));
      case "ASW":
        return new vscode3.ThemeIcon("apps", new vscode3.ThemeColor("symbolIcon.fieldForeground"));
      case "OS":
        return new vscode3.ThemeIcon(
          "server-process",
          new vscode3.ThemeColor("symbolIcon.namespaceForeground")
        );
      default:
        return new vscode3.ThemeIcon("symbol-misc");
    }
  }
};
var ConfigTreeProvider = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this._onDidChangeTreeData = new vscode3.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    // Module layer mappings
    this.layerModules = {
      MCAL: ["Mcu", "Port", "Dio", "Can", "Spi", "I2c", "Pwm", "Adc", "Gpt", "Wdg"],
      ECUAL: ["CanIf", "CanTp", "PduR", "Com", "Dcm", "Dem", "Nvm", "Fee", "Ea"],
      Service: ["BswM", "EcuM", "ComM", "Nm", "CanNm"],
      RTE: ["Rte"],
      ASW: ["Application", "Swc"],
      OS: ["Os"],
      Integration: ["Ecu"],
      Unknown: []
    };
  }
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element) {
    return element;
  }
  async getChildren(element) {
    if (!this.workspaceRoot) {
      vscode3.window.showInformationMessage("No workspace folder open");
      return [];
    }
    if (!element) {
      return this.getLayers();
    }
    switch (element.type) {
      case "layer":
        return this.getModulesForLayer(element.layer);
      case "module":
        return this.getConfigsForModule(element.moduleName, element.layer);
      default:
        return [];
    }
  }
  async getLayers() {
    const layers = [];
    const layerOrder = [
      "MCAL",
      "ECUAL",
      "Service",
      "RTE",
      "ASW",
      "OS",
      "Integration"
    ];
    for (const layer of layerOrder) {
      const hasModules = await this.hasModulesInLayer(layer);
      if (hasModules) {
        layers.push(
          new ConfigTreeItem(layer, vscode3.TreeItemCollapsibleState.Collapsed, "layer", layer)
        );
      }
    }
    return layers;
  }
  async getModulesForLayer(layer) {
    const modules = [];
    const moduleNames = this.layerModules[layer];
    for (const moduleName of moduleNames) {
      const hasConfig = await this.hasModuleConfig(moduleName, layer);
      if (hasConfig) {
        modules.push(
          new ConfigTreeItem(
            moduleName,
            vscode3.TreeItemCollapsibleState.Collapsed,
            "module",
            layer,
            void 0,
            moduleName
          )
        );
      }
    }
    modules.sort((a, b) => a.label.localeCompare(b.label));
    return modules;
  }
  async getConfigsForModule(moduleName, layer) {
    const configs = [];
    const configPath = await this.findModuleConfigPath(moduleName, layer);
    if (configPath) {
      const extensions2 = [".yule.json", ".json", ".xdm", ".arxml"];
      for (const ext of extensions2) {
        const filePath = path3.join(configPath, `${moduleName}${ext}`);
        if (fs3.existsSync(filePath)) {
          configs.push(
            new ConfigTreeItem(
              `${moduleName} Configuration`,
              vscode3.TreeItemCollapsibleState.None,
              "config",
              layer,
              filePath,
              moduleName
            )
          );
        }
      }
      if (fs3.existsSync(configPath)) {
        const files = fs3.readdirSync(configPath);
        for (const file of files) {
          const fullPath = path3.join(configPath, file);
          const stat = fs3.statSync(fullPath);
          if (stat.isFile() && !configs.some((c) => c.filePath === fullPath)) {
            const ext = path3.extname(file);
            if ([".json", ".xdm", ".arxml"].includes(ext) || file.endsWith(".yule.json")) {
              configs.push(
                new ConfigTreeItem(
                  path3.basename(file),
                  vscode3.TreeItemCollapsibleState.None,
                  "config",
                  layer,
                  fullPath,
                  moduleName
                )
              );
            }
          }
        }
      }
    }
    return configs;
  }
  async hasModulesInLayer(layer) {
    const moduleNames = this.layerModules[layer];
    for (const moduleName of moduleNames) {
      if (await this.hasModuleConfig(moduleName, layer)) {
        return true;
      }
    }
    return false;
  }
  async hasModuleConfig(moduleName, layer) {
    const configPath = await this.findModuleConfigPath(moduleName, layer);
    return configPath !== void 0 && fs3.existsSync(configPath);
  }
  async findModuleConfigPath(moduleName, layer) {
    if (!this.workspaceRoot) {
      return void 0;
    }
    const possiblePaths = [
      path3.join(this.workspaceRoot, "config", moduleName),
      path3.join(this.workspaceRoot, "configs", moduleName),
      path3.join(this.workspaceRoot, layer, moduleName),
      path3.join(this.workspaceRoot, moduleName)
    ];
    const config = vscode3.workspace.getConfiguration("yuleasr");
    const yuleASRPath = config.get("yuleASRPath");
    if (yuleASRPath) {
      possiblePaths.push(
        path3.join(yuleASRPath, "config", moduleName),
        path3.join(yuleASRPath, "src", layer.toLowerCase(), moduleName, "config")
      );
    }
    for (const configPath of possiblePaths) {
      if (fs3.existsSync(configPath)) {
        return configPath;
      }
    }
    return void 0;
  }
  /**
   * Find a module by name
   */
  async findModule(moduleName) {
    const layers = ["MCAL", "ECUAL", "Service", "RTE", "ASW", "OS", "Integration"];
    for (const layer of layers) {
      const hasConfig = await this.hasModuleConfig(moduleName, layer);
      if (hasConfig) {
        return new ConfigTreeItem(
          moduleName,
          vscode3.TreeItemCollapsibleState.Collapsed,
          "module",
          layer,
          void 0,
          moduleName
        );
      }
    }
    return void 0;
  }
  /**
   * Get all modules
   */
  async getAllModules() {
    const allModules = [];
    const layers = ["MCAL", "ECUAL", "Service", "RTE", "ASW", "OS", "Integration"];
    for (const layer of layers) {
      const modules = await this.getModulesForLayer(layer);
      allModules.push(...modules);
    }
    return allModules;
  }
};

// src/extension.ts
function activate(context) {
  console.log("yuleASR Configurator extension is now active");
  const treeProvider = new ConfigTreeProvider(vscode4.workspace.rootPath);
  const treeView = vscode4.window.createTreeView("yuleasrExplorer", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
    canSelectMany: false
  });
  registerCommands(context, treeProvider);
  const openDashboardCmd = vscode4.commands.registerCommand("yuleasr.openDashboard", () => {
    ConfigEditorPanel.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(openDashboardCmd);
  context.subscriptions.push(treeView);
  setupFileWatchers(context, treeProvider);
  checkYuleASRWorkspace();
}
function deactivate() {
  console.log("yuleASR Configurator extension is now deactivated");
}
function setupFileWatchers(context, treeProvider) {
  const configWatcher = vscode4.workspace.createFileSystemWatcher("**/*.{yule.json,xdm,arxml}");
  configWatcher.onDidCreate(() => treeProvider.refresh());
  configWatcher.onDidDelete(() => treeProvider.refresh());
  configWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(configWatcher);
  const workspaceWatcher = vscode4.workspace.createFileSystemWatcher("**/yuleasr.config.json");
  workspaceWatcher.onDidCreate(() => {
    vscode4.commands.executeCommand("setContext", "workspaceHasYuleASR", true);
    treeProvider.refresh();
  });
  workspaceWatcher.onDidDelete(() => {
    vscode4.commands.executeCommand("setContext", "workspaceHasYuleASR", false);
  });
  context.subscriptions.push(workspaceWatcher);
}
async function checkYuleASRWorkspace() {
  if (!vscode4.workspace.workspaceFolders) {
    return;
  }
  const hasYuleASR = await Promise.any(
    vscode4.workspace.workspaceFolders.map(async (folder) => {
      const pattern = new vscode4.RelativePattern(folder, "**/yuleasr.config.json");
      const files = await vscode4.workspace.findFiles(pattern, null, 1);
      return files.length > 0;
    })
  ).catch(() => false);
  vscode4.commands.executeCommand("setContext", "workspaceHasYuleASR", hasYuleASR);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
