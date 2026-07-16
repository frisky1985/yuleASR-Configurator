// ==================================================================
// @yuletech/plugin-sdk — Plugin type definitions for yuleASR
// ==================================================================

/**
 * Supported plugin types
 */
export type PluginType =
  | 'code-generator'
  | 'validator'
  | 'data-export'
  | 'ui-extension';

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

// ------------------------------------------------------------------
// Code Generator Plugin
// ------------------------------------------------------------------

/**
 * Code generator plugin interface.
 * Registered via PluginContext.registerCodeGenerator().
 *
 * A code generator produces source files (C, header, or any text output)
 * based on a module configuration.
 */
export interface CodeGeneratorPlugin {
  /** Generator name (e.g. "CustomHeaderGenerator") */
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

// ------------------------------------------------------------------
// Validation Result
// ------------------------------------------------------------------

/**
 * Severity level for a validation result item.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * A single validation result item returned by a ValidatorPlugin.
 */
export interface ValidationResult {
  /** The module or parameter name this result applies to */
  module: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** Human-readable message describing the issue */
  message: string;
  /** Optional parameter or field name the result refers to */
  param?: string;
}

// ------------------------------------------------------------------
// Validator Plugin
// ------------------------------------------------------------------

/**
 * Validator plugin interface.
 * Registered via PluginContext.registerValidator().
 *
 * A validator inspects a module configuration and returns a list of
 * validation results (errors, warnings, info).
 */
export interface ValidatorPlugin {
  /** Validator name (e.g. "McuClockValidator") */
  name: string;
  /** Human-readable description */
  description: string;
  /** Modules this validator applies to (empty = all) */
  targetModules: string[];
  /**
   * Validate the given configuration.
   * @param config - Module configuration object
   * @returns A list of validation results
   */
  validate(
    config: Record<string, unknown>,
  ): Promise<ValidationResult[]>;
}

// ------------------------------------------------------------------
// Data Exporter Plugin
// ------------------------------------------------------------------

/**
 * Data exporter plugin interface.
 * Registered via PluginContext.registerDataExporter().
 *
 * A data exporter transforms module configuration data into an
 * output format (JSON, XML, YAML, custom report, etc.) and returns
 * the result as a string or structured blob.
 */
export interface DataExporterPlugin {
  /** Exporter name (e.g. "JsonExporter") */
  name: string;
  /** Human-readable description */
  description: string;
  /** File extension for the exported output (e.g. "json", "xml") */
  outputExtension: string;
  /**
   * Export the given configuration.
   * @param config - Full configuration object (all modules)
   * @param options - Arbitrary options bag
   * @returns Export result with the output content
   */
  export(
    config: Record<string, unknown>,
    options: Record<string, unknown>,
  ): Promise<{ content: string; extension: string }>;
}

// ------------------------------------------------------------------
// Plugin Context
// ------------------------------------------------------------------

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

  /** Register a data exporter plugin */
  registerDataExporter(exporter: DataExporterPlugin): void;
}

// ------------------------------------------------------------------
// YulePlugin — The base plugin interface
// ------------------------------------------------------------------

/**
 * A yuleASR plugin.
 *
 * Every plugin must export this interface as its default export.
 * The plugin manager calls `activate()` during loading, passing a
 * {@link PluginContext} that the plugin uses to register its
 * generators, validators, or exporters.
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
