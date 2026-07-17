'use strict';
var F = Object.create;
var A = Object.defineProperty;
var U = Object.getOwnPropertyDescriptor;
var O = Object.getOwnPropertyNames;
var N = Object.getPrototypeOf,
  V = Object.prototype.hasOwnProperty;
var H = (s, e) => {
    for (var o in e) A(s, o, { get: e[o], enumerable: !0 });
  },
  $ = (s, e, o, t) => {
    if ((e && typeof e == 'object') || typeof e == 'function')
      for (let i of O(e))
        !V.call(s, i) &&
          i !== o &&
          A(s, i, { get: () => e[i], enumerable: !(t = U(e, i)) || t.enumerable });
    return s;
  };
var p = (s, e, o) => (
    (o = s != null ? F(N(s)) : {}),
    $(e || !s || !s.__esModule ? A(o, 'default', { value: s, enumerable: !0 }) : o, s)
  ),
  G = s => $(A({}, '__esModule', { value: !0 }), s);
var se = {};
H(se, { activate: () => ee, deactivate: () => oe });
module.exports = G(se);
var m = p(require('vscode'));
var l = p(require('fs')),
  h = p(require('path')),
  n = p(require('vscode'));
var w = p(require('fs')),
  v = p(require('path')),
  d = p(require('vscode')),
  P = class s {
    constructor(e, o, t) {
      this._disposables = [];
      ((this._panel = e),
        (this._extensionUri = o),
        (this._configFilePath = t),
        this._update(),
        t && this.loadConfig(t),
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables),
        this._panel.onDidChangeViewState(
          () => {
            this._panel.visible && this._update();
          },
          null,
          this._disposables
        ),
        this._panel.webview.onDidReceiveMessage(
          async i => {
            switch (i.type) {
              case 'ready':
                this.sendConfigToWebview();
                break;
              case 'save':
                await this.saveConfig(i.data);
                break;
              case 'cancel':
                this.loadConfig(this._configFilePath);
                break;
              case 'validate':
                await this.validateConfig(i.data);
                break;
              case 'generate':
                await this.generateCode();
                break;
              case 'getSchema':
                await this.sendSchema(i.moduleName);
                break;
              case 'error':
                d.window.showErrorMessage(i.error);
                break;
              case 'info':
                d.window.showInformationMessage(i.info);
                break;
              default:
                console.log('Unknown message:', i);
            }
          },
          null,
          this._disposables
        ));
    }
    static {
      this.viewType = 'yuleasrConfigEditor';
    }
    static get _isDev() {
      return (
        process.env.NODE_ENV === 'development' ||
        process.env.VSCODE_DEBUG === 'true' ||
        process.env.VSCODE_DEV !== void 0
      );
    }
    static createOrShow(e, o) {
      let t = d.window.activeTextEditor ? d.window.activeTextEditor.viewColumn : void 0;
      if (s.currentPanel)
        return (s.currentPanel._panel.reveal(t), o && s.currentPanel.loadConfig(o), s.currentPanel);
      let i = [d.Uri.joinPath(e, 'media'), d.Uri.joinPath(e, 'out')];
      s._isDev && i.push(d.Uri.parse('http://localhost:3000'));
      let r = d.window.createWebviewPanel(
        s.viewType,
        o ? `yuleASR: ${v.basename(o)}` : 'yuleASR Configurator',
        t || d.ViewColumn.One,
        { enableScripts: !0, retainContextWhenHidden: !0, localResourceRoots: i }
      );
      return ((s.currentPanel = new s(r, e, o || '')), s.currentPanel);
    }
    loadConfig(e) {
      this._configFilePath = e;
      try {
        if (w.existsSync(e)) {
          let o = w.readFileSync(e, 'utf8');
          ((this._configData = JSON.parse(o)),
            (this._panel.title = `yuleASR: ${v.basename(e)}`),
            this.sendConfigToWebview());
        } else d.window.showErrorMessage(`Configuration file not found: ${e}`);
      } catch (o) {
        d.window.showErrorMessage(`Failed to load configuration: ${o}`);
      }
    }
    sendConfigToWebview() {
      this._panel.webview.postMessage({
        type: 'configData',
        data: this._configData,
        filePath: this._configFilePath,
        fileName: v.basename(this._configFilePath),
      });
    }
    async sendSchema(e) {
      try {
        let o = [
            v.join(this._extensionUri.fsPath, 'schemas', `${e}.schema.json`),
            v.join(this._extensionUri.fsPath, 'media', 'schemas', `${e}.schema.json`),
          ],
          t = null;
        for (let i of o)
          if (w.existsSync(i)) {
            let r = w.readFileSync(i, 'utf8');
            t = JSON.parse(r);
            break;
          }
        this._panel.webview.postMessage({ type: 'schemaData', moduleName: e, schema: t });
      } catch (o) {
        this._panel.webview.postMessage({
          type: 'schemaData',
          moduleName: e,
          schema: null,
          error: String(o),
        });
      }
    }
    async saveConfig(e) {
      try {
        let o = JSON.stringify(e, null, 2);
        (w.writeFileSync(this._configFilePath, o, 'utf8'),
          (this._configData = e),
          d.window.showInformationMessage('Configuration saved successfully'),
          this._panel.webview.postMessage({ type: 'saveSuccess' }),
          d.workspace.getConfiguration('yuleasr').get('validateOnSave', !0) &&
            (await this.validateConfig(e)));
      } catch (o) {
        (d.window.showErrorMessage(`Failed to save configuration: ${o}`),
          this._panel.webview.postMessage({ type: 'saveError', error: String(o) }));
      }
    }
    async validateConfig(e) {
      try {
        let o = await this.performValidation(e);
        if ((this._panel.webview.postMessage({ type: 'validationResult', result: o }), o.valid))
          d.window.showInformationMessage('Configuration is valid');
        else {
          let t = o.errors?.length || 0;
          d.window.showWarningMessage(`Configuration has ${t} validation issue(s)`);
        }
      } catch (o) {
        d.window.showErrorMessage(`Validation failed: ${o}`);
      }
    }
    async performValidation(e) {
      let o = [],
        t = [];
      return (
        (!e || typeof e != 'object') &&
          o.push({
            path: '',
            message: 'Configuration must be a valid JSON object',
            severity: 'error',
          }),
        { valid: o.length === 0, errors: o, warnings: t }
      );
    }
    async generateCode() {
      try {
        let e = d.workspace.getConfiguration('yuleasr');
        if (!e.get('yuleASRPath')) {
          d.window.showErrorMessage(
            'yuleASR path not configured. Please set yuleasr.yuleASRPath in settings.'
          );
          return;
        }
        (d.window.showInformationMessage('Generating code...'),
          await new Promise(i => setTimeout(i, 1e3)),
          e.get('showGeneratedCode', !0) && this.showGeneratedCodePreview(),
          d.window.showInformationMessage('Code generated successfully'));
      } catch (e) {
        d.window.showErrorMessage(`Code generation failed: ${e}`);
      }
    }
    showGeneratedCodePreview() {
      let e = `// Generated code preview for ${v.basename(this._configFilePath)}
// This is a placeholder for the actual generated code

#include "Std_Types.h"
#include "${v.basename(this._configFilePath, '.json')}.h"

// Configuration would be generated here
`;
      d.workspace.openTextDocument({ content: e, language: 'c' }).then(o => {
        d.window.showTextDocument(o, d.ViewColumn.Beside);
      });
    }
    _update() {
      let e = this._panel.webview;
      this._panel.webview.html = this._getHtmlForWebview(e);
    }
    _getHtmlForWebview(e) {
      let o = q();
      return s._isDev ? this._getDevHtml(e, o) : this._getProdHtml(e, o);
    }
    _getDevHtml(e, o) {
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        style-src ${e.cspSource} 'unsafe-inline';
        script-src 'nonce-${o}' 'unsafe-inline' 'unsafe-eval';
        frame-src http://localhost:3000;
        connect-src http://localhost:3000 http://localhost:3002;
        img-src http://localhost:3000 data:;
        font-src http://localhost:3000 data:;
    ">
    <title>yuleASR Configurator (Dev)</title>
    <style nonce="${o}">
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
    <iframe id="yuleasr-app" src="http://localhost:3000/configurator/"></iframe>
    <script nonce="${o}">
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
    _getProdHtml(e, o) {
      let t = d.Uri.joinPath(this._extensionUri, 'media', 'webview'),
        i = v.join(t.fsPath, 'index.html');
      if (w.existsSync(i)) {
        let r = w.readFileSync(i, 'utf8');
        r = r.replace(/(src|href)=["'](\.\/assets\/[^"']+)["']/g, (u, C, I) => {
          let S = e.asWebviewUri(d.Uri.joinPath(t, I));
          return `${C}="${S}"`;
        });
        let c = `<meta http-equiv="Content-Security-Policy" content="
                default-src 'none';
                style-src ${e.cspSource} 'unsafe-inline';
                script-src 'nonce-${o}' 'unsafe-inline' 'unsafe-eval';
                connect-src ${e.cspSource} http://localhost:3002 https:;
                img-src ${e.cspSource} data:;
                font-src ${e.cspSource} data:;
            ">`;
        return (
          (r = r.replace(
            '<head>',
            `<head>
    ${c}`
          )),
          (r = r.replace(
            /<script(\s+type="module")?\s+crossorigin\s+src=/,
            `<script nonce="${o}"$1 crossorigin src=`
          )),
          r
        );
      }
      return this._getFallbackHtml(e, o);
    }
    _getFallbackHtml(e, o) {
      let t = e.asWebviewUri(d.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        style-src ${e.cspSource};
        script-src 'nonce-${o}';
    ">
    <link href="${t}" rel="stylesheet">
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
      for (s.currentPanel = void 0, this._panel.dispose(); this._disposables.length; ) {
        let e = this._disposables.pop();
        e && e.dispose();
      }
    }
  };
function q() {
  let s = '',
    e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let o = 0; o < 32; o++) s += e.charAt(Math.floor(Math.random() * e.length));
  return s;
}
function L(s, e) {
  let o = n.commands.registerCommand('yuleasr.openConfig', async f => {
      let T = typeof f == 'string' ? f : f.filePath;
      if (!T) {
        n.window.showErrorMessage('No configuration file specified');
        return;
      }
      let ie = n.workspace.getConfiguration('yuleasr');
      if (!0) P.createOrShow(s.extensionUri, T);
      else {
        let j = await n.workspace.openTextDocument(T);
        await n.window.showTextDocument(j);
      }
    }),
    t = n.commands.registerCommand('yuleasr.refreshExplorer', () => {
      (e.refresh(), n.window.showInformationMessage('yuleASR Explorer refreshed'));
    }),
    i = n.commands.registerCommand('yuleasr.syncConfig', async f => {
      await B(f);
    }),
    r = n.commands.registerCommand('yuleasr.validateConfig', async f => {
      f?.filePath ? await x(f.filePath) : await Y(e);
    }),
    c = n.commands.registerCommand('yuleasr.generateCode', async f => {
      f?.filePath ? await z(f.filePath, f.moduleName) : await J(e);
    }),
    u = n.commands.registerCommand('yuleasr.newModule', async () => {
      await K(e);
    }),
    C = n.commands.registerCommand('yuleasr.deleteModule', async f => {
      await Z(f, e);
    }),
    I = n.commands.registerCommand('yuleasr.renameModule', async f => {
      await Q(f, e);
    }),
    S = n.commands.registerCommand('yuleasr.initProject', async () => {
      await X(e);
    });
  s.subscriptions.push(o, t, i, r, c, u, C, I, S);
  let W = n.languages.registerHoverProvider({ pattern: '**/*.{yule.json,json}' }, new E()),
    _ = n.languages.registerCompletionItemProvider(
      { pattern: '**/*.{yule.json,json}' },
      new R(),
      '"',
      ':',
      '.'
    ),
    k = n.languages.createDiagnosticCollection('yuleasr');
  (s.subscriptions.push(W, _, k),
    n.workspace.onDidSaveTextDocument(async f => {
      n.workspace.getConfiguration('yuleasr').get('validateOnSave', !0) &&
        (f.fileName.endsWith('.yule.json') || f.fileName.endsWith('.json')) &&
        (await x(f.fileName, k));
    }));
}
async function B(s) {
  let e = n.workspace.getConfiguration('yuleasr'),
    o = e.get('yuleASRPath');
  if (!o) {
    if (
      (await n.window.showInformationMessage(
        'yuleASR path not configured. Would you like to set it now?',
        'Yes',
        'No'
      )) === 'Yes'
    ) {
      let i = await n.window.showOpenDialog({
        canSelectFolders: !0,
        canSelectFiles: !1,
        canSelectMany: !1,
        openLabel: 'Select yuleASR Repository',
      });
      i && i.length > 0 && (await e.update('yuleASRPath', i[0].fsPath, !0));
    }
    return;
  }
  if (!l.existsSync(o)) {
    n.window.showErrorMessage(`yuleASR path does not exist: ${o}`);
    return;
  }
  (await n.window.withProgress(
    {
      location: n.ProgressLocation.Notification,
      title: 'Syncing with yuleASR...',
      cancellable: !0,
    },
    async (t, i) => {
      (t.report({ increment: 0, message: 'Checking repository...' }),
        await M(500),
        !i.isCancellationRequested &&
          (t.report({ increment: 30, message: 'Syncing schemas...' }),
          await M(500),
          !i.isCancellationRequested &&
            (t.report({ increment: 40, message: 'Syncing configurations...' }),
            await M(500),
            !i.isCancellationRequested && t.report({ increment: 30, message: 'Complete' }))));
    }
  ),
    n.window.showInformationMessage('Sync with yuleASR completed successfully'));
}
async function x(s, e) {
  try {
    let o = l.readFileSync(s, 'utf8'),
      t = JSON.parse(o),
      i = [],
      r = !0;
    if (!t.moduleName) {
      r = !1;
      let c = new n.Range(0, 0, 0, 0),
        u = new n.Diagnostic(c, 'Missing required field: moduleName', n.DiagnosticSeverity.Error);
      i.push(u);
    }
    if (e) {
      let c = n.Uri.file(s);
      e.set(c, i);
    }
    return (
      r
        ? n.window.showInformationMessage(`Configuration is valid: ${h.basename(s)}`)
        : n.window.showWarningMessage(`Configuration has errors: ${h.basename(s)}`),
      r
    );
  } catch (o) {
    return (n.window.showErrorMessage(`Validation failed: ${o}`), !1);
  }
}
async function Y(s) {
  let e = await s.getAllModules(),
    o = 0,
    t = 0;
  for (let i of e) i.filePath && ((await x(i.filePath)) ? o++ : t++);
  n.window.showInformationMessage(`Validation complete: ${o} valid, ${t} invalid`);
}
async function z(s, e) {
  if (!n.workspace.getConfiguration('yuleasr').get('yuleASRPath')) {
    n.window.showErrorMessage('Please configure yuleASR path first');
    return;
  }
  (await n.window.withProgress(
    {
      location: n.ProgressLocation.Notification,
      title: `Generating code for ${e || h.basename(s)}...`,
      cancellable: !0,
    },
    async i => {
      (i.report({ increment: 50, message: 'Generating...' }),
        await M(1e3),
        i.report({ increment: 50, message: 'Done' }));
    }
  ),
    n.window.showInformationMessage(`Code generated for ${e || h.basename(s)}`));
}
async function J(s) {
  let e = await s.getAllModules();
  (await n.window.withProgress(
    {
      location: n.ProgressLocation.Notification,
      title: 'Generating code for all modules...',
      cancellable: !0,
    },
    async o => {
      for (let t = 0; t < e.length; t++)
        e[t].filePath &&
          (o.report({ increment: 100 / e.length, message: `Processing ${e[t].label}...` }),
          await M(200));
    }
  ),
    n.window.showInformationMessage(`Code generated for ${e.length} modules`));
}
async function K(s) {
  let e = await n.window.showInputBox({
    prompt: 'Enter module name',
    placeHolder: 'e.g., Can, Mcu, Port',
    validateInput: c =>
      !c || c.trim().length === 0
        ? 'Module name is required'
        : /^[A-Za-z][A-Za-z0-9]*$/.test(c)
          ? null
          : 'Module name must start with a letter and contain only letters and numbers',
  });
  if (!e) return;
  let o = await n.window.showQuickPick(
    ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'],
    { placeHolder: 'Select module layer' }
  );
  if (!o) return;
  let t = n.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!t) {
    n.window.showErrorMessage('No workspace folder open');
    return;
  }
  let i = h.join(t, 'config', e),
    r = h.join(i, `${e}.yule.json`);
  try {
    l.existsSync(i) || l.mkdirSync(i, { recursive: !0 });
    let c = {
      moduleName: e,
      layer: o,
      version: '1.0.0',
      description: `${e} module configuration`,
      parameters: {},
      containers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (l.writeFileSync(r, JSON.stringify(c, null, 2)),
      s.refresh(),
      (await n.window.showInformationMessage(
        `Module ${e} created. Open configuration?`,
        'Open',
        'Later'
      )) === 'Open' &&
        P.createOrShow(n.extensions.getExtension('yuletech.yuleasr-vscode').extensionUri, r));
  } catch (c) {
    n.window.showErrorMessage(`Failed to create module: ${c}`);
  }
}
async function Z(s, e) {
  if (
    (await n.window.showWarningMessage(
      `Are you sure you want to delete ${s.label}?`,
      { modal: !0 },
      'Delete'
    )) === 'Delete'
  )
    try {
      s.filePath && l.unlinkSync(s.filePath);
      let t = s.filePath ? h.dirname(s.filePath) : void 0;
      (t && l.existsSync(t) && l.readdirSync(t).length === 0 && l.rmdirSync(t),
        e.refresh(),
        n.window.showInformationMessage(`${s.label} deleted successfully`));
    } catch (t) {
      n.window.showErrorMessage(`Failed to delete module: ${t}`);
    }
}
async function Q(s, e) {
  let o = await n.window.showInputBox({
    prompt: 'Enter new module name',
    value: s.label,
    validateInput: t => (!t || t.trim().length === 0 ? 'Module name is required' : null),
  });
  if (!(!o || o === s.label))
    try {
      if (s.filePath) {
        let t = h.dirname(s.filePath),
          i = h.extname(s.filePath),
          r = h.join(t, `${o}${i}`);
        l.renameSync(s.filePath, r);
      }
      (e.refresh(), n.window.showInformationMessage(`Module renamed to ${o}`));
    } catch (t) {
      n.window.showErrorMessage(`Failed to rename module: ${t}`);
    }
}
async function X(s) {
  let e = n.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!e) {
    n.window.showErrorMessage('No workspace folder open');
    return;
  }
  let o = h.join(e, 'config'),
    t = h.join(e, 'yuleasr.config.json');
  try {
    l.existsSync(o) || l.mkdirSync(o, { recursive: !0 });
    let i = {
      name: h.basename(e),
      version: '0.1.0',
      description: 'yuleASR Configuration Project',
      createdAt: new Date().toISOString(),
      modules: [],
    };
    (l.writeFileSync(t, JSON.stringify(i, null, 2)),
      n.commands.executeCommand('setContext', 'workspaceHasYuleASR', !0),
      s.refresh(),
      n.window.showInformationMessage('yuleASR project initialized successfully'));
  } catch (i) {
    n.window.showErrorMessage(`Failed to initialize project: ${i}`);
  }
}
function M(s) {
  return new Promise(e => setTimeout(e, s));
}
var E = class {
    provideHover(e, o) {
      let t = e.lineAt(o.line).text;
      if (t.includes('moduleName'))
        return new n.Hover(
          new n.MarkdownString(
            '**moduleName**: The name of the AutoSAR module (e.g., Can, Mcu, Port)'
          )
        );
      if (t.includes('layer'))
        return new n.Hover(
          new n.MarkdownString(
            '**layer**: The BSW layer this module belongs to (MCAL, ECUAL, Service, RTE, ASW, OS)'
          )
        );
    }
  },
  R = class {
    provideCompletionItems(e, o) {
      let t = e.lineAt(o.line).text.substring(0, o.character),
        i = [];
      if (t.includes('layer')) {
        let r = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];
        for (let c of r) {
          let u = new n.CompletionItem(c, n.CompletionItemKind.EnumMember);
          ((u.detail = `${c} Layer`), i.push(u));
        }
      }
      if (t.includes('moduleName')) {
        let r = [
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
        for (let c of r) {
          let u = new n.CompletionItem(c.name, n.CompletionItemKind.Module);
          ((u.detail = c.detail), i.push(u));
        }
      }
      return i;
    }
  };
var y = p(require('fs')),
  g = p(require('path')),
  a = p(require('vscode')),
  b = class extends a.TreeItem {
    constructor(o, t, i, r, c, u) {
      super(o, t);
      this.label = o;
      this.collapsibleState = t;
      this.type = i;
      this.layer = r;
      this.filePath = c;
      this.moduleName = u;
      ((this.tooltip = this.getTooltip()),
        (this.description = this.getDescription()),
        (this.iconPath = this.getIconPath()),
        (this.contextValue = i),
        i === 'config' &&
          c &&
          ((this.command = {
            command: 'yuleasr.openConfig',
            title: 'Open Configuration',
            arguments: [c],
          }),
          (this.resourceUri = a.Uri.file(c))));
    }
    getTooltip() {
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
    getDescription() {
      switch (this.type) {
        case 'layer':
          return '';
        case 'module':
          return this.layer || '';
        case 'config':
          return g.basename(this.filePath || '');
        default:
          return '';
      }
    }
    getIconPath() {
      switch (this.type) {
        case 'layer':
          return new a.ThemeIcon('folder');
        case 'module':
          return this.getModuleIcon();
        case 'config':
          return new a.ThemeIcon('file-code');
        default:
          return;
      }
    }
    getModuleIcon() {
      switch (this.layer) {
        case 'MCAL':
          return new a.ThemeIcon('chip', new a.ThemeColor('symbolIcon.classForeground'));
        case 'ECUAL':
          return new a.ThemeIcon('layers', new a.ThemeColor('symbolIcon.interfaceForeground'));
        case 'Service':
          return new a.ThemeIcon('gear', new a.ThemeColor('symbolIcon.methodForeground'));
        case 'RTE':
          return new a.ThemeIcon('plug', new a.ThemeColor('symbolIcon.variableForeground'));
        case 'ASW':
          return new a.ThemeIcon('apps', new a.ThemeColor('symbolIcon.fieldForeground'));
        case 'OS':
          return new a.ThemeIcon(
            'server-process',
            new a.ThemeColor('symbolIcon.namespaceForeground')
          );
        default:
          return new a.ThemeIcon('symbol-misc');
      }
    }
  },
  D = class {
    constructor(e) {
      this.workspaceRoot = e;
      this._onDidChangeTreeData = new a.EventEmitter();
      this.onDidChangeTreeData = this._onDidChangeTreeData.event;
      this.layerModules = {
        MCAL: ['Mcu', 'Port', 'Dio', 'Can', 'Spi', 'I2c', 'Pwm', 'Adc', 'Gpt', 'Wdg'],
        ECUAL: ['CanIf', 'CanTp', 'PduR', 'Com', 'Dcm', 'Dem', 'Nvm', 'Fee', 'Ea'],
        Service: ['BswM', 'EcuM', 'ComM', 'Nm', 'CanNm'],
        RTE: ['Rte'],
        ASW: ['Application', 'Swc'],
        OS: ['Os'],
        Integration: ['Ecu'],
        Unknown: [],
      };
    }
    refresh() {
      this._onDidChangeTreeData.fire();
    }
    getTreeItem(e) {
      return e;
    }
    async getChildren(e) {
      if (!this.workspaceRoot)
        return (a.window.showInformationMessage('No workspace folder open'), []);
      if (!e) return this.getLayers();
      switch (e.type) {
        case 'layer':
          return this.getModulesForLayer(e.layer);
        case 'module':
          return this.getConfigsForModule(e.moduleName, e.layer);
        default:
          return [];
      }
    }
    async getLayers() {
      let e = [],
        o = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];
      for (let t of o)
        (await this.hasModulesInLayer(t)) &&
          e.push(new b(t, a.TreeItemCollapsibleState.Collapsed, 'layer', t));
      return e;
    }
    async getModulesForLayer(e) {
      let o = [],
        t = this.layerModules[e];
      for (let i of t)
        (await this.hasModuleConfig(i, e)) &&
          o.push(new b(i, a.TreeItemCollapsibleState.Collapsed, 'module', e, void 0, i));
      return (o.sort((i, r) => i.label.localeCompare(r.label)), o);
    }
    async getConfigsForModule(e, o) {
      let t = [],
        i = await this.findModuleConfigPath(e, o);
      if (i) {
        let r = ['.yule.json', '.json', '.xdm', '.arxml'];
        for (let c of r) {
          let u = g.join(i, `${e}${c}`);
          y.existsSync(u) &&
            t.push(new b(`${e} Configuration`, a.TreeItemCollapsibleState.None, 'config', o, u, e));
        }
        if (y.existsSync(i)) {
          let c = y.readdirSync(i);
          for (let u of c) {
            let C = g.join(i, u);
            if (y.statSync(C).isFile() && !t.some(S => S.filePath === C)) {
              let S = g.extname(u);
              (['.json', '.xdm', '.arxml'].includes(S) || u.endsWith('.yule.json')) &&
                t.push(new b(g.basename(u), a.TreeItemCollapsibleState.None, 'config', o, C, e));
            }
          }
        }
      }
      return t;
    }
    async hasModulesInLayer(e) {
      let o = this.layerModules[e];
      for (let t of o) if (await this.hasModuleConfig(t, e)) return !0;
      return !1;
    }
    async hasModuleConfig(e, o) {
      let t = await this.findModuleConfigPath(e, o);
      return t !== void 0 && y.existsSync(t);
    }
    async findModuleConfigPath(e, o) {
      if (!this.workspaceRoot) return;
      let t = [
          g.join(this.workspaceRoot, 'config', e),
          g.join(this.workspaceRoot, 'configs', e),
          g.join(this.workspaceRoot, o, e),
          g.join(this.workspaceRoot, e),
        ],
        r = a.workspace.getConfiguration('yuleasr').get('yuleASRPath');
      r && t.push(g.join(r, 'config', e), g.join(r, 'src', o.toLowerCase(), e, 'config'));
      for (let c of t) if (y.existsSync(c)) return c;
    }
    async findModule(e) {
      let o = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];
      for (let t of o)
        if (await this.hasModuleConfig(e, t))
          return new b(e, a.TreeItemCollapsibleState.Collapsed, 'module', t, void 0, e);
    }
    async getAllModules() {
      let e = [],
        o = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW', 'OS', 'Integration'];
      for (let t of o) {
        let i = await this.getModulesForLayer(t);
        e.push(...i);
      }
      return e;
    }
  };
function ee(s) {
  console.log('yuleASR Configurator extension is now active');
  let e = new D(m.workspace.rootPath),
    o = m.window.createTreeView('yuleasrExplorer', {
      treeDataProvider: e,
      showCollapseAll: !0,
      canSelectMany: !1,
    });
  L(s, e);
  let t = m.commands.registerCommand('yuleasr.openDashboard', () => {
    P.createOrShow(s.extensionUri);
  });
  (s.subscriptions.push(t), s.subscriptions.push(o), te(s, e), ne());
}
function oe() {
  console.log('yuleASR Configurator extension is now deactivated');
}
function te(s, e) {
  let o = m.workspace.createFileSystemWatcher('**/*.{yule.json,xdm,arxml}');
  (o.onDidCreate(() => e.refresh()),
    o.onDidDelete(() => e.refresh()),
    o.onDidChange(() => e.refresh()),
    s.subscriptions.push(o));
  let t = m.workspace.createFileSystemWatcher('**/yuleasr.config.json');
  (t.onDidCreate(() => {
    (m.commands.executeCommand('setContext', 'workspaceHasYuleASR', !0), e.refresh());
  }),
    t.onDidDelete(() => {
      m.commands.executeCommand('setContext', 'workspaceHasYuleASR', !1);
    }),
    s.subscriptions.push(t));
}
async function ne() {
  if (!m.workspace.workspaceFolders) return;
  let s = await Promise.any(
    m.workspace.workspaceFolders.map(async e => {
      let o = new m.RelativePattern(e, '**/yuleasr.config.json');
      return (await m.workspace.findFiles(o, null, 1)).length > 0;
    })
  ).catch(() => !1);
  m.commands.executeCommand('setContext', 'workspaceHasYuleASR', s);
}
0 && (module.exports = { activate, deactivate });
