/**
 * @yuletech/core — Plugins barrel export
 */

export { pluginRegistry, type RegisteredPlugin } from './plugin-registry';
export { pluginManager } from './plugin-manager';

// Built-in AUTOSAR plugins
export { registerBuiltinPlugins } from './builtins/register-builtins';
