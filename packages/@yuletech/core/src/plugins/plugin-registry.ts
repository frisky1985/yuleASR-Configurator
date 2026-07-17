/**
 * @yuletech/core — Plugin Registry
 *
 * In-memory registry that stores plugin metadata and activated plugin instances.
 * Works in both Node and browser environments (no vm sandbox in Phase 1).
 */

import type {
  YulePlugin,
  CodeGeneratorPlugin,
  ValidatorPlugin,
  DataExporterPlugin,
  PluginMeta,
  PluginType,
} from '@yuletech/plugin-sdk';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface RegisteredPlugin {
  /** The plugin instance (after activation) */
  instance: YulePlugin;
  /** Persisted metadata */
  meta: PluginMeta;
}

// ------------------------------------------------------------------
// Registry
// ------------------------------------------------------------------

class PluginRegistryImpl {
  /** All registered plugins keyed by id */
  private plugins = new Map<string, RegisteredPlugin>();

  /** Code generators registered by all plugins, keyed by generator name */
  private codeGenerators = new Map<string, CodeGeneratorPlugin>();

  /** Validators registered by all plugins, keyed by validator name */
  private validators = new Map<string, ValidatorPlugin>();

  /** Data exporters registered by all plugins, keyed by exporter name */
  private dataExporters = new Map<string, DataExporterPlugin>();

  // ── Plugin lifecycle ──────────────────────────────────────────

  /**
   * Register a plugin instance (called after successful activation).
   * Upserts — if the same id already exists it is overwritten.
   */
  register(plugin: RegisteredPlugin): void {
    this.plugins.set(plugin.meta.id, plugin);
  }

  /**
   * Unregister a plugin and all its registered generators / validators / exporters.
   * Calls deactivate() if the instance provides it.
   */
  async unregister(id: string): Promise<boolean> {
    const entry = this.plugins.get(id);
    if (!entry) return false;

    // Deactivate
    if (entry.instance.deactivate) {
      await entry.instance.deactivate();
    }

    // Remove owned generators
    for (const [name, gen] of this.codeGenerators) {
      if (gen.name.startsWith(`${id}:`)) {
        this.codeGenerators.delete(name);
      }
    }
    // Remove owned validators
    for (const [name, val] of this.validators) {
      if (val.name.startsWith(`${id}:`)) {
        this.validators.delete(name);
      }
    }
    // Remove owned data exporters
    for (const [name, exp] of this.dataExporters) {
      if (exp.name.startsWith(`${id}:`)) {
        this.dataExporters.delete(name);
      }
    }

    this.plugins.delete(id);
    return true;
  }

  /** Check if a plugin is registered */
  has(id: string): boolean {
    return this.plugins.has(id);
  }

  /** Get a registered plugin by id */
  get(id: string): RegisteredPlugin | undefined {
    return this.plugins.get(id);
  }

  /** List all registered plugins */
  getAll(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  /** List plugins by type */
  getByType(type: PluginType): RegisteredPlugin[] {
    return this.getAll().filter(p => p.meta.type === type);
  }

  /** List plugins by enabled state */
  getEnabled(): RegisteredPlugin[] {
    return this.getAll().filter(p => p.meta.enabled);
  }

  // ── Code generators ───────────────────────────────────────────

  registerCodeGenerator(gen: CodeGeneratorPlugin): void {
    this.codeGenerators.set(gen.name, gen);
  }

  unregisterCodeGenerator(name: string): void {
    this.codeGenerators.delete(name);
  }

  getCodeGenerator(name: string): CodeGeneratorPlugin | undefined {
    return this.codeGenerators.get(name);
  }

  getAllCodeGenerators(): CodeGeneratorPlugin[] {
    return Array.from(this.codeGenerators.values());
  }

  /**
   * Find a code generator that supports a given module name.
   * Checks supportedModules for a match (supports '*' wildcard).
   */
  findCodeGeneratorForModule(moduleName: string): CodeGeneratorPlugin | undefined {
    return this.getAllCodeGenerators().find(
      g => g.supportedModules.includes('*') || g.supportedModules.includes(moduleName)
    );
  }

  // ── Validators ────────────────────────────────────────────────

  registerValidator(val: ValidatorPlugin): void {
    this.validators.set(val.name, val);
  }

  unregisterValidator(name: string): void {
    this.validators.delete(name);
  }

  getValidator(name: string): ValidatorPlugin | undefined {
    return this.validators.get(name);
  }

  getAllValidators(): ValidatorPlugin[] {
    return Array.from(this.validators.values());
  }

  /**
   * Find validators that apply to a given module (targetModules contains
   * the module or '*' wildcard).
   */
  findValidatorsForModule(moduleName: string): ValidatorPlugin[] {
    return this.getAllValidators().filter(
      v =>
        v.targetModules.length === 0 ||
        v.targetModules.includes('*') ||
        v.targetModules.includes(moduleName)
    );
  }

  // ── Data Exporters ─────────────────────────────────────────────

  registerDataExporter(exporter: DataExporterPlugin): void {
    this.dataExporters.set(exporter.name, exporter);
  }

  unregisterDataExporter(name: string): void {
    this.dataExporters.delete(name);
  }

  getDataExporter(name: string): DataExporterPlugin | undefined {
    return this.dataExporters.get(name);
  }

  getAllDataExporters(): DataExporterPlugin[] {
    return Array.from(this.dataExporters.values());
  }

  // ── Serialisation ─────────────────────────────────────────────

  /** Export metadata for all plugins (no runtime instances) */
  exportMeta(): PluginMeta[] {
    return this.getAll().map(p => p.meta);
  }

  /** Clear everything (useful for testing) */
  clear(): void {
    this.plugins.clear();
    this.codeGenerators.clear();
    this.validators.clear();
    this.dataExporters.clear();
  }
}

/** Singleton registry instance */
export const pluginRegistry = new PluginRegistryImpl();
