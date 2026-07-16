// ==================================================================
// @yuletech/plugin-sdk — Plugin type definitions for yuleASR
// ==================================================================

/**
 * Supported plugin types
 */
export type PluginType =
  | 'code-generator'
  | 'validator'
  | 'ui-extension'
  | 'data-export';

// ------------------------------------------------------------------
// Plugin Lifecycle
// ------------------------------------------------------------------

/**
 * Plugin-level logger (scoped to the plugin)
 */
export interface PluginLogger {
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

/**
 * Code generator plugin interface
 * Registered via PluginContext.registerCodeGenerator()
 */
export interface CodeGeneratorPlugin {
  /** Generator name (e.g. "MyCanGenerator") */
  name: string;
  /** Human-readable description */
  description: string;
  /** Modules this generator supports (e.g. ["Can", "CanTrcv"]) */
  supportedModules: string[];
  /**
   * Generate code for the given configuration.
   * @param config - Module configuration object
   * @param options - Arbitrary options bag
   */
  generate(
    config: Record<string, unknown>,
    options: Record<string, unknown>,
  ): Promise<{ files: { path: string; content: string }[] }>;
}

/**
 * Validator plugin interface
 * Registered via PluginContext.registerValidator()
 */
export interface ValidatorPlugin {
  name: string;
  description: string;
  /** Modules this validator applies to (empty = all) */
  targetModules: string[];
  validate(
    config: Record<string, unknown>,
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}

/**
 * Context passed to a plugin during activation.
 */
export interface PluginContext {
  /** Read-only configuration for this plugin (from user settings) */
  config: Record<string, unknown>;

  /** Scoped logger */
  logger: PluginLogger;

  /** Register a code generator plugin */
  registerCodeGenerator(generator: CodeGeneratorPlugin): void;

  /** Register a validator plugin */
  registerValidator(validator: ValidatorPlugin): void;
}

/**
 * A yuleASR plugin.
 */
export interface YulePlugin {
  /** Unique plugin identifier (e.g. "yuletech-generator-can") */
  id: string;
  /** Human-readable name */
  name: string;
  /** SemVer version */
  version: string;
  /** Plugin type */
  type: PluginType;
  /** Short description */
  description: string;
  /** Author name or organisation */
  author: string;

  /**
   * Called when the plugin is activated (loaded).
   * Use the context to register generators, validators, etc.
   */
  activate(context: PluginContext): Promise<void>;

  /**
   * Called when the plugin is deactivated (disabled / removed).
   * Clean up any resources here.
   */
  deactivate?(): Promise<void>;
}

// ------------------------------------------------------------------
// Plugin Meta (used for discovery / registry)
// ------------------------------------------------------------------

/**
 * Serialisable plugin metadata persisted in the registry.
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
  source: 'internal' | 'external';
  /** Path to the external JS file (only for external plugins) */
  filePath?: string;
  /** User-supplied config for this plugin */
  config: Record<string, unknown>;
  /** ISO-8601 install date */
  installedAt?: string;
}
