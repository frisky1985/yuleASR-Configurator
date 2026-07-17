/**
 * Type declarations for VS Code Webview API
 * When the web app runs inside a VS Code Webview Panel,
 * acquireVsCodeApi() is injected by the VS Code runtime.
 */

interface VsCodeApi {
  postMessage(message: unknown): void;
  setState(state: unknown): void;
  getState<T = unknown>(): T | undefined;
}

declare function acquireVsCodeApi(): VsCodeApi;

interface Window {
  __vscodeApi?: VsCodeApi;
}
