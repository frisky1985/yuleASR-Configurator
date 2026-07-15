/**
 * UI Adapter: ConfigModule → ModuleSchema + ModuleConfig
 *
 * Bridges the yuleasr-web UI data format (ConfigModule with nested containers)
 * to the core generator format (ModuleSchema + ModuleConfig for EcucCodeGenerator).
 *
 * Key transformations:
 *   - Parameters: UI uses array of {name, type, value} → Generator uses {name: value}
 *   - Containers: UI uses deep nesting (subContainers) → Generator uses flat instance arrays
 *   - Schema: Auto-derived from the UI shape types
 */

import type { ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config';
import type { ModuleConfig, ModuleSchema, ContainerSchema, ContainerConfig } from '@yuletech/core';

/** Return the short PascalCase module name (e.g. 'ADC Driver' → 'Adc', 'Can' → 'Can') */
export function getModuleShortName(module: ConfigModule): string {
  // Some modules already have short names like 'Can' or 'Mcu'
  const name = module.name.trim();
  // If name is short and PascalCase already, return as-is
  if (/^[A-Z][a-z]+$/.test(name) || /^[A-Z]{2,}$/.test(name)) return name;
  // Otherwise try to extract the short prefix from displayName or id
  // 'ADC Driver' → 'Adc', 'CAN Driver' → 'Can'
  const firstWord = name.split(/\s+/)[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

/** Collect all non-multiple containers' parameters as UI parameters */
function collectContainerParameters(containers: ConfigContainer[]): ConfigParameter[] {
  const result: ConfigParameter[] = [];
  for (const c of containers) {
    if (!c.multiple) {
      result.push(...c.parameters);
      if (c.subContainers?.length) {
        result.push(...collectContainerParameters(c.subContainers));
      }
    }
  }
  return result;
}

/** Flatten ConfigParameter array to {name: value} object */
function parametersToObject(params: ConfigParameter[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const p of params) {
    if (p.value !== undefined && p.value !== null) {
      obj[p.name] = p.value;
    }
  }
  return obj;
}

/** Build a ModuleSchema by introspecting the UI module config */
export function buildModuleSchema(module: ConfigModule, shortName: string): ModuleSchema {
  // Collect all non-multiple parameters (module-level + from non-multiple containers)
  const allParams = [...module.parameters, ...collectContainerParameters(module.containers)];

  // Build parameter definitions
  const paramDefs = allParams.map(p => ({
    name: p.name,
    type: p.type,
    required: p.validation?.required ?? false,
    description: p.description || p.displayName,
  }));

  // Deduplicate by name (last wins)
  const paramMap = new Map<string, typeof paramDefs[0]>();
  for (const pd of paramDefs) paramMap.set(pd.name, pd);
  const uniqueParamDefs = [...paramMap.values()];

  // Find multiple containers with subContainers (these are instance-based containers)
  const containerDefs: ContainerSchema[] = [];

  for (const c of module.containers) {
    if (c.multiple && c.subContainers?.length) {
      // The subContainers' shortName IS the AUTOSAR container type name
      const containerTypeName = c.subContainers[0].shortName || c.subContainers[0].name;

      // Collect all unique parameter names from subContainer instances
      const paramNames = new Set<string>();
      for (const sc of c.subContainers) {
        for (const p of sc.parameters) paramNames.add(p.name);
      }

      containerDefs.push({
        name: containerTypeName,
        label: c.displayName || c.name,
        multiple: true,
        minInstances: c.minInstances ?? 0,
        maxInstances: c.maxInstances ?? 64,
        parameters: [...paramNames],
      });
    }
  }

  return {
    name: shortName,
    label: module.displayName || module.name,
    layer: module.layer,
    version: module.version,
    parameters: uniqueParamDefs,
    containers: containerDefs,
  };
}

/** Build a ModuleConfig from the UI module data */
export function buildModuleConfig(module: ConfigModule, shortName: string): ModuleConfig {
  // Collect parameters from module level + non-multiple containers
  const allParams = [...module.parameters, ...collectContainerParameters(module.containers)];
  const parameters = parametersToObject(allParams);

  // Build container instances
  const containers: Record<string, ContainerConfig[]> = {};

  for (const c of module.containers) {
    if (c.multiple && c.subContainers?.length) {
      const containerTypeName = c.subContainers[0].shortName || c.subContainers[0].name;
      const instances: ContainerConfig[] = c.subContainers.map(sc => ({
        id: sc.id,
        parameters: parametersToObject(sc.parameters),
        ...(sc.subContainers?.length ? {
          children: collectNestedContainers(sc),
        } : {}),
      }));
      containers[containerTypeName] = instances;
    }
  }

  return {
    module: shortName,
    version: module.autosarVersion || module.version,
    parameters,
    ...(Object.keys(containers).length > 0 ? { containers } : {}),
  };
}

/** Recursively collect nested container definitions */
function collectNestedContainers(container: ConfigContainer): Record<string, ContainerConfig[]> {
  const result: Record<string, ContainerConfig[]> = {};
  if (!container.subContainers?.length) return result;

  for (const sc of container.subContainers) {
    const key = sc.shortName || sc.name;
    if (!result[key]) result[key] = [];
    result[key].push({
      id: sc.id,
      parameters: parametersToObject(sc.parameters),
      ...(sc.subContainers?.length ? { children: collectNestedContainers(sc) } : {}),
    });
  }
  return result;
}

/** Main transform: ConfigModule → (ModuleSchema, ModuleConfig) */
export function uiModuleToGenerator(module: ConfigModule): {
  schema: ModuleSchema;
  config: ModuleConfig;
} | null {
  if (!module.enabled) return null;

  const shortName = getModuleShortName(module);
  const schema = buildModuleSchema(module, shortName);
  const config = buildModuleConfig(module, shortName);

  return { schema, config };
}

/**
 * Transform all enabled modules
 */
export function uiModulesToGenerator(
  modules: ConfigModule[]
): Array<{ schema: ModuleSchema; config: ModuleConfig }> {
  const results: Array<{ schema: ModuleSchema; config: ModuleConfig }> = [];
  for (const m of modules) {
    const r = uiModuleToGenerator(m);
    if (r) results.push(r);
  }
  return results;
}
