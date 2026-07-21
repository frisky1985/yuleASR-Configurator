/**
 * Built-in Plugin Registration
 *
 * Activates all built-in (internal) plugins on application startup.
 * Call this once during app initialization.
 */
import { pluginManager } from '../plugin-manager';

import arxmlExportPlugin from './arxml-export-plugin';
import crossModuleValidatorPlugin from './cross-module-validator-plugin';
import schemaValidatorPlugin from './schema-validator-plugin';
import mcalGeneratorPlugin from './mcal-generator-plugin';

/** Ordered list of built-in plugins to register */
const BUILTIN_PLUGINS = [
  arxmlExportPlugin,
  crossModuleValidatorPlugin,
  schemaValidatorPlugin,
  mcalGeneratorPlugin,
];

/**
 * Register all built-in plugins with the plugin manager.
 *
 * Should be called once during application startup, before any
 * configuration editing begins.
 *
 * @returns List of plugin metadata for all registered builtins
 */
export async function registerBuiltinPlugins() {
  const results = [];

  for (const plugin of BUILTIN_PLUGINS) {
    try {
      const meta = await pluginManager.activate(plugin, {}, 'internal');
      results.push(meta);
      console.info(`[builtins] Registered: ${plugin.id} v${plugin.version}`);
    } catch (err) {
      console.error(`[builtins] Failed to register ${plugin.id}:`, err);
    }
  }

  return results;
}
