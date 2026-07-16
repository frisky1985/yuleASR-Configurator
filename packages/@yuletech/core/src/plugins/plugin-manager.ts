/**
 * @yuletech/core — Plugin Manager
 *
 * Orchestrates plugin lifecycle: discovery, activation, deactivation,
 * and toggling of plugin enable/disable state.
 *
 * Phase 1 supports:
 *  - Internal (inlined) plugins registered programmatically
 *  - External plugins loaded from a directory via dynamic import()
 *
 * No vm sandbox is applied in Phase 1 (planned for Phase 2).
 */

import type {
  YulePlugin,
  PluginMeta,
  PluginContext,
  CodeGeneratorPlugin,
  ValidatorPlugin,
} from '@yuletech/plugin-sdk';
import { pluginRegistry, type RegisteredPlugin } from './plugin-registry';

// ------------------------------------------------------------------
// Logger factory
// ------------------------------------------------------------------

function createPluginLogger(pluginId: string): PluginContext['logger'] {
  const prefix = `[plugin:${pluginId}]`;
  return {
    info: (...args: unknown[]) => console.info(prefix, ...args),
    warn: (...args: unknown[]) => console.warn(prefix, ...args),
    error: (...args: unknown[]) => console.error(prefix, ...args),
    debug: (...args: unknown[]) => console.debug(prefix, ...args),
  };
}

// ------------------------------------------------------------------
// Plugin Manager
// ------------------------------------------------------------------

class PluginManagerImpl {
  /** Directory where external plugins are stored */
  private externalPluginDir: string | null = null;
  /** Factory for creating the context — allows overriding in tests */
  private contextFactory:
    | ((pluginId: string, userConfig: Record<string, unknown>) => PluginContext)
    | null = null;

  /**
   * Set the directory path for external plugin discovery.
   * Typically ~/.yule-plugins/ or similar.
   */
  setExternalPluginDir(dir: string): void {
    this.externalPluginDir = dir;
  }

  /**
   * Override the context factory (useful for dependency injection / testing).
   */
  setContextFactory(
    factory: (
      pluginId: string,
      userConfig: Record<string, unknown>,
    ) => PluginContext,
  ): void {
    this.contextFactory = factory;
  }

  // ── Context creation ──────────────────────────────────────────

  private buildContext(
    pluginId: string,
    userConfig: Record<string, unknown>,
  ): PluginContext {
    if (this.contextFactory) {
      return this.contextFactory(pluginId, userConfig);
    }

    const logger = createPluginLogger(pluginId);
    return {
      config: userConfig,
      logger,
      registerCodeGenerator: (gen: CodeGeneratorPlugin) => {
        // Prefix generator names with the plugin id to avoid collisions
        const prefixed: CodeGeneratorPlugin = {
          ...gen,
          name: `${pluginId}:${gen.name}`,
        };
        pluginRegistry.registerCodeGenerator(prefixed);
        logger.info(`Registered code generator: ${gen.name}`);
      },
      registerValidator: (val: ValidatorPlugin) => {
        const prefixed: ValidatorPlugin = {
          ...val,
          name: `${pluginId}:${val.name}`,
        };
        pluginRegistry.registerValidator(prefixed);
        logger.info(`Registered validator: ${val.name}`);
      },
    };
  }

  // ── Activation / Deactivation ─────────────────────────────────

  /**
   * Activate a plugin instance.
   * - Creates the PluginContext
   * - Calls plugin.activate(context)
   * - Stores the plugin + meta in the registry
   */
  async activate(
    plugin: YulePlugin,
    userConfig?: Record<string, unknown>,
    source: PluginMeta['source'] = 'internal',
    filePath?: string,
  ): Promise<PluginMeta> {
    const config = userConfig ?? {};
    const context = this.buildContext(plugin.id, config);

    // Create meta before activation (so we can store it even if activation fails
    // partially — though we'll only commit on success)
    const meta: PluginMeta = {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      type: plugin.type,
      description: plugin.description,
      author: plugin.author,
      enabled: true,
      source,
      filePath,
      config,
      installedAt: new Date().toISOString(),
    };

    // Activate
    await plugin.activate(context);

    // Commit to registry
    const registered: RegisteredPlugin = { instance: plugin, meta };
    pluginRegistry.register(registered);

    return meta;
  }

  /**
   * Deactivate and unregister a plugin.
   */
  async deactivate(id: string): Promise<boolean> {
    return pluginRegistry.unregister(id);
  }

  // ── Enable / Disable (toggle without unregistering) ───────────

  /**
   * Enable a plugin (set enabled=true in meta).
   * If the plugin is not currently activated, re-activate it.
   */
  async enable(id: string): Promise<boolean> {
    const existing = pluginRegistry.get(id);
    if (existing) {
      existing.meta.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * Disable a plugin (set enabled=false in meta).
   * Deactivates the plugin but keeps its metadata in the registry.
   */
  async disable(id: string): Promise<boolean> {
    const existing = pluginRegistry.get(id);
    if (!existing) return false;

    // Deactivate the instance
    if (existing.instance.deactivate) {
      await existing.instance.deactivate();
    }

    existing.meta.enabled = false;
    // Remove owned generators & validators
    for (const [name, gen] of pluginRegistry['codeGenerators']) {
      if (gen.name.startsWith(`${id}:`)) {
        pluginRegistry.unregisterCodeGenerator(name);
      }
    }
    for (const [name, val] of pluginRegistry['validators']) {
      if (val.name.startsWith(`${id}:`)) {
        pluginRegistry.unregisterValidator(name);
      }
    }

    return true;
  }

  /**
   * Toggle plugin enabled state.
   */
  async toggle(id: string, enabled: boolean): Promise<boolean> {
    if (enabled) {
      return this.enable(id);
    }
    return this.disable(id);
  }

  // ── External plugin loading ───────────────────────────────────

  /**
   * Load all external plugins from the configured external plugin directory.
   * Scans for .js / .mjs files and dynamically imports them.
   *
   * Expects each file to export a default `YulePlugin` or an array of plugins,
   * or have a `createPlugin` / `plugin` named export.
   */
  async loadExternalPlugins(): Promise<PluginMeta[]> {
    if (!this.externalPluginDir) {
      console.warn('[plugin-manager] No external plugin dir configured');
      return [];
    }

    const metas: PluginMeta[] = [];

    try {
      // Dynamic import of the directory scanner (Node-only module)
      const fs = await import('node:fs');
      const path = await import('node:path');

      const dir = this.externalPluginDir;
      if (!fs.existsSync(dir)) {
        console.info(`[plugin-manager] External plugin dir does not exist: ${dir}`);
        return [];
      }

      const entries = fs.readdirSync(dir);
      const files = entries.filter(
        (f: string) => f.endsWith('.js') || f.endsWith('.mjs'),
      );

      for (const file of files) {
        const fullPath = path.resolve(dir, file);
        try {
          const pluginModule = await import(fullPath);
          const plugin: YulePlugin | undefined =
            pluginModule.default ??
            pluginModule.plugin ??
            pluginModule.createPlugin?.();

          if (!plugin || typeof plugin.activate !== 'function') {
            console.warn(
              `[plugin-manager] Skipping ${file}: no valid YulePlugin export`,
            );
            continue;
          }

          if (pluginRegistry.has(plugin.id)) {
            console.warn(
              `[plugin-manager] Skipping ${file}: plugin "${plugin.id}" already registered`,
            );
            continue;
          }

          const meta = await this.activate(plugin, {}, 'external', fullPath);
          metas.push(meta);
          console.info(`[plugin-manager] Loaded external plugin: ${plugin.id}`);
        } catch (err) {
          console.error(
            `[plugin-manager] Failed to load plugin from ${file}:`,
            err,
          );
        }
      }
    } catch (err) {
      console.error('[plugin-manager] Error scanning external plugins:', err);
    }

    return metas;
  }

  /** Update the user configuration for a given plugin */
  updateConfig(id: string, newConfig: Record<string, unknown>): boolean {
    const entry = pluginRegistry.get(id);
    if (!entry) return false;
    entry.meta.config = { ...entry.meta.config, ...newConfig };
    return true;
  }

  /** Convenience: list all plugin meta (for API responses) */
  listPlugins(): PluginMeta[] {
    return pluginRegistry.exportMeta();
  }

  /** Get a single plugin's meta */
  getPluginMeta(id: string): PluginMeta | undefined {
    return pluginRegistry.get(id)?.meta;
  }
}

/** Singleton plugin manager instance */
export const pluginManager = new PluginManagerImpl();
