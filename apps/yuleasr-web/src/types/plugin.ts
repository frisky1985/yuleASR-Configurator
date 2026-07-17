// ==================================================================
// Plugin type definitions for the UI layer
// ==================================================================

/**
 * Supported plugin types
 */
export type PluginType = 'code-generator' | 'validator' | 'ui-extension' | 'data-export';

/**
 * Plugin source type
 */
export type PluginSource = 'internal' | 'external';

/**
 * Serialisable plugin metadata — mirrors @yuletech/plugin-sdk PluginMeta
 */
export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description: string;
  author: string;
  /** Whether the plugin is currently enabled */
  enabled: boolean;
  /** Whether the plugin is internal (bundled) or external */
  source: PluginSource;
  /** Path to the external JS file (only for external plugins) */
  filePath?: string;
  /** User-supplied config for this plugin */
  config: Record<string, unknown>;
  /** ISO-8601 install date */
  installedAt?: string;
}

/**
 * Response from the toggle endpoint
 */
export interface ToggleResponse {
  ok: boolean;
  enabled: boolean;
}
