/**
 * @yuletech/core - SWC Registry
 *
 * Registers SWC modules (AppSwc, CompSwc) in the module registry
 * and provides utility functions for SWC configuration management.
 */

import type { ModuleSchema } from '../types/module';
import type {
  ApplicationSwComponentType,
  CompositionSwComponentType,
  PortPrototype,
  PortInterfaceBase,
  RunnableEntity,
  SwcComponentEntry,
} from '../types/swc';

import { appSwcSchema, compSwcSchema } from './schemas';

/**
 * Get all SWC module schemas
 */
export function getSwcSchemas(): ModuleSchema[] {
  return [appSwcSchema, compSwcSchema];
}

/**
 * Create a default ApplicationSwComponentType configuration
 */
export function createApplicationSwcConfig(name: string): ApplicationSwComponentType {
  return {
    name,
    label: name,
    description: `Application SWC: ${name}`,
    layer: 'ASW',
    ports: [],
    internalBehavior: {
      name: `${name}_InternalBehavior`,
      runnables: [],
      irvs: [],
      perInstanceMemories: [],
      exclusiveAreas: [],
    },
    dataTypeMappings: [],
    interfaces: [],
  };
}

/**
 * Create a default CompositionSwComponentType configuration
 */
export function createCompositionSwcConfig(name: string): CompositionSwComponentType {
  return {
    name,
    label: name,
    description: `Composition SWC: ${name}`,
    layer: 'ASW',
    components: [],
    ports: [],
    assemblyConnectors: [],
    delegationConnectors: [],
    interfaces: [],
  };
}

/**
 * Validate SWC component configuration
 */
export function validateSwcComponent(component: SwcComponentEntry): string[] {
  const errors: string[] = [];

  if (!component.name || component.name.trim() === '') {
    errors.push('Component name is required');
  }

  if (component.type === 'ApplicationSwComponentType') {
    const cfg = component.config as ApplicationSwComponentType;
    // Validate port interfaces
    for (const port of cfg.ports) {
      if (!port.interfaceRef) {
        errors.push(`Port "${port.name}" is missing interface reference`);
      }
    }
    // Validate runnables
    for (const runnable of cfg.internalBehavior.runnables) {
      if (!runnable.name || runnable.name.trim() === '') {
        errors.push('Runnable entity name is required');
      }
    }
  } else if (component.type === 'CompositionSwComponentType') {
    const cfg = component.config as CompositionSwComponentType;
    // Validate assembly connectors
    for (const conn of cfg.assemblyConnectors || []) {
      if (!conn.sourceComponent || !conn.targetComponent) {
        errors.push(`Assembly connector "${conn.name}" is missing component references`);
      }
    }
  }

  return errors;
}

/**
 * Find all ports of a given direction in an SWC config
 */
export function getPortsByDirection(
  ports: PortPrototype[],
  direction: 'IN' | 'OUT' | 'INOUT'
): PortPrototype[] {
  return ports.filter(p => p.direction === direction);
}

/**
 * Resolve the interface for a port from a list of interfaces
 */
export function resolvePortInterface(
  port: PortPrototype,
  interfaces: PortInterfaceBase[]
): PortInterfaceBase | undefined {
  return interfaces.find(i => i.name === port.interfaceRef);
}

/**
 * Generate an RTE-port symbol name for a component port
 */
export function rtePortSymbol(componentName: string, portName: string): string {
  return `Rte_${componentName}_${portName}`;
}

/**
 * Generate a Runnable function symbol
 */
export function runnableSymbol(componentName: string, runnable: RunnableEntity): string {
  return runnable.symbol || `Runnable_${componentName}_${runnable.name}`;
}
