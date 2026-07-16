/**
 * @yuletech/core - SWC Generator Tests
 * 
 * Tests for the SWC (Application Software Component) code generator.
 * Validates:
 *  - SWC header generation (<SwcName>.h)
 *  - SWC source generation (<SwcName>.c)
 *  - RTE type header generation (Rte_<SwcName>_Type.h)
 *  - RTE connector config generation
 *  - Application SWC and Composition SWC schemas
 */

import { describe, it, expect } from 'vitest';

import type { ModuleConfig } from '../../types/module';
import { SwcCodeGenerator } from '../swc-generator';
import { appSwcSchema, compSwcSchema } from '../../swc/schemas';
import { createApplicationSwcConfig, createCompositionSwcConfig, validateSwcComponent } from '../../swc/swc-registry';
import type { SwcComponentEntry } from '../../types/swc';

// ============================================================================
// Test Fixtures
// ============================================================================

function createAppSwcModuleConfig(): ModuleConfig {
  return {
    module: 'AppSwc',
    version: '1.0.0',
    parameters: {
      ComponentName: 'App_VehicleSpeed',
      ComponentDescription: 'Vehicle Speed Sensor Application SWC',
      ImplementationRef: 'App_VehicleSpeed.c',
    },
    containers: {
      PortInterfaces: [
        {
          id: 'iface_1',
          parameters: {
            PortInterfaceName: 'VehicleSpeed_I',
            PortInterfaceKind: 'SenderReceiverInterface',
            PortInterfaceDescription: 'Vehicle speed data interface',
          },
        },
        {
          id: 'iface_2',
          parameters: {
            PortInterfaceName: 'BrakeStatus_I',
            PortInterfaceKind: 'ClientServerInterface',
            PortInterfaceDescription: 'Brake status interface',
          },
        },
      ],
      Ports: [
        {
          id: 'port_1',
          parameters: {
            PortName: 'Speed_In',
            PortDirection: 'IN',
            PortInterfaceRef: 'VehicleSpeed_I',
            PortDescription: 'Incoming vehicle speed',
          },
        },
        {
          id: 'port_2',
          parameters: {
            PortName: 'Speed_Out',
            PortDirection: 'OUT',
            PortInterfaceRef: 'VehicleSpeed_I',
            PortDescription: 'Processed vehicle speed output',
          },
        },
      ],
      Runnables: [
        {
          id: 'rn_1',
          parameters: {
            RunnableName: 'ReadSpeed',
            RunnableSymbol: 'Runnable_App_VehicleSpeed_ReadSpeed',
            RunnableInvocationType: 'cyclic',
            RunnableInterval: 0.01,
            RunnableCanBeConcurrent: false,
            RunnableDescription: 'Read and process vehicle speed',
          },
        },
        {
          id: 'rn_2',
          parameters: {
            RunnableName: 'BrakeMonitor',
            RunnableSymbol: 'Runnable_App_VehicleSpeed_BrakeMonitor',
            RunnableInvocationType: 'cyclic',
            RunnableInterval: 0.05,
            RunnableCanBeConcurrent: false,
            RunnableDescription: 'Monitor brake status',
          },
        },
      ],
      InterRunnableVariables: [
        {
          id: 'irv_1',
          parameters: {
            IrvName: 'SpeedBuffer',
            IrvTypeRef: 'uint16',
            IrvInitValue: 0,
            IrvDescription: 'Internal speed buffer',
          },
        },
        {
          id: 'irv_2',
          parameters: {
            IrvName: 'BrakeFlag',
            IrvTypeRef: 'boolean',
            IrvInitValue: false,
            IrvDescription: 'Brake active flag',
          },
        },
      ],
      DataTypeMappings: [
        {
          id: 'dtm_1',
          parameters: {
            MappingApplicationType: 'VehicleSpeed_T',
            MappingImplementationType: 'uint16',
          },
        },
      ],
    },
  };
}

function createCompSwcModuleConfig(): ModuleConfig {
  return {
    module: 'CompSwc',
    version: '1.0.0',
    parameters: {
      ComponentName: 'Comp_VehicleSystem',
      ComponentDescription: 'Vehicle System Composition',
    },
    containers: {
      SubComponents: [
        {
          id: 'sub_1',
          parameters: {
            SubComponentName: 'SpeedSensor',
            SubComponentTypeRef: 'App_VehicleSpeed',
          },
        },
        {
          id: 'sub_2',
          parameters: {
            SubComponentName: 'BrakeCtrl',
            SubComponentTypeRef: 'App_BrakeControl',
          },
        },
      ],
      PortInterfaces: [
        {
          id: 'iface_1',
          parameters: {
            PortInterfaceName: 'VehicleSystem_I',
            PortInterfaceKind: 'SenderReceiverInterface',
            PortInterfaceDescription: 'System-level interface',
          },
        },
      ],
      Ports: [
        {
          id: 'port_1',
          parameters: {
            PortName: 'SystemCmd_In',
            PortDirection: 'IN',
            PortInterfaceRef: 'VehicleSystem_I',
            PortDescription: 'System command input',
          },
        },
      ],
      AssemblyConnectors: [
        {
          id: 'conn_1',
          parameters: {
            ConnectorName: 'SpeedToBrake',
            ConnectorSourceComponent: 'SpeedSensor',
            ConnectorSourcePort: 'Speed_Out',
            ConnectorTargetComponent: 'BrakeCtrl',
            ConnectorTargetPort: 'Speed_In',
          },
        },
      ],
      DelegationConnectors: [
        {
          id: 'del_1',
          parameters: {
            DelegateName: 'SystemCmdDel',
            DelegateOuterPort: 'SystemCmd_In',
            DelegateInnerComponent: 'SpeedSensor',
            DelegateInnerPort: 'Speed_In',
          },
        },
      ],
    },
  };
}

// ============================================================================
// Tests: Data Model
// ============================================================================

describe('SWC Data Model', () => {
  it('should create a valid ApplicationSwComponentType config', () => {
    const swc = createApplicationSwcConfig('App_Sensor');
    expect(swc.name).toBe('App_Sensor');
    expect(swc.layer).toBe('ASW');
    expect(swc.ports).toEqual([]);
    expect(swc.internalBehavior.runnables).toEqual([]);
    expect(swc.internalBehavior.irvs).toEqual([]);
  });

  it('should create a valid CompositionSwComponentType config', () => {
    const comp = createCompositionSwcConfig('Comp_System');
    expect(comp.name).toBe('Comp_System');
    expect(comp.layer).toBe('ASW');
    expect(comp.components).toEqual([]);
    expect(comp.assemblyConnectors).toEqual([]);
  });

  it('should validate an empty ApplicationSwComponentType', () => {
    const swc = createApplicationSwcConfig('');
    const entry: SwcComponentEntry = {
      type: 'ApplicationSwComponentType',
      name: '',
      config: swc,
    };
    const errors = validateSwcComponent(entry);
    expect(errors).toContain('Component name is required');
  });
});

// ============================================================================
// Tests: Schema Definitions
// ============================================================================

describe('SWC Schemas', () => {
  it('should define AppSwc module schema', () => {
    expect(appSwcSchema.name).toBe('AppSwc');
    expect(appSwcSchema.layer).toBe('ASW');
    expect(appSwcSchema.parameters.length).toBeGreaterThanOrEqual(3);
    expect(appSwcSchema.containers).toBeDefined();
    expect(appSwcSchema.containers!.length).toBeGreaterThanOrEqual(6);
  });

  it('should define CompSwc module schema', () => {
    expect(compSwcSchema.name).toBe('CompSwc');
    expect(compSwcSchema.layer).toBe('ASW');
    expect(compSwcSchema.parameters.length).toBeGreaterThanOrEqual(2);
    expect(compSwcSchema.containers).toBeDefined();
    expect(compSwcSchema.containers!.length).toBeGreaterThanOrEqual(5);
  });

  it('should have required ComponentName parameter', () => {
    const compNameParam = appSwcSchema.parameters.find(p => p.name === 'ComponentName');
    expect(compNameParam).toBeDefined();
    expect(compNameParam!.required).toBe(true);
  });
});

// ============================================================================
// Tests: SWC Code Generator
// ============================================================================

describe('SwcCodeGenerator', () => {
  const generator = new SwcCodeGenerator();

  it('should have correct name and version', () => {
    expect(generator.name).toBe('SwcCodeGenerator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should support AppSwc and CompSwc modules', () => {
    expect(generator.supports('AppSwc')).toBe(true);
    expect(generator.supports('CompSwc')).toBe(true);
    expect(generator.supports('Can')).toBe(false);
  });

  it('should generate 4 files for AppSwc', async () => {
    const config = createAppSwcModuleConfig();
    const result = await generator.generate(config, appSwcSchema, {
      outputDir: './output',
      generateComments: true,
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBe(4);

    // Check file paths
    const paths = result.files.map(f => f.path);
    expect(paths).toContain('./output/App_VehicleSpeed.h');
    expect(paths).toContain('./output/App_VehicleSpeed.c');
    expect(paths).toContain('./output/Rte_App_VehicleSpeed_Type.h');
    expect(paths).toContain('./output/Rte_App_VehicleSpeed_Connector.c');
  });

  it('should generate proper header file content', async () => {
    const config = createAppSwcModuleConfig();
    const result = await generator.generate(config, appSwcSchema, {
      outputDir: './output',
      generateComments: true,
    });

    const headerFile = result.files.find(f => f.path.endsWith('.h') && !f.path.includes('Rte'));
    expect(headerFile).toBeDefined();

    const content = headerFile!.content;
    expect(content).toContain('APP_VEHICLESPEED_H');
    expect(content).toContain('Rte_App_VehicleSpeed_Type.h');
    expect(content).toContain('Runnable_App_VehicleSpeed_ReadSpeed');
    expect(content).toContain('Runnable_App_VehicleSpeed_BrakeMonitor');
    expect(content).toContain('App_VehicleSpeed_Init');
    expect(content).toContain('App_VehicleSpeed_MainFunction');
  });

  it('should generate proper source file with runnable stubs', async () => {
    const config = createAppSwcModuleConfig();
    const result = await generator.generate(config, appSwcSchema, {
      outputDir: './output',
      generateComments: true,
    });

    const sourceFile = result.files.find(f => f.path.endsWith('.c') && !f.path.includes('Rte'));
    expect(sourceFile).toBeDefined();

    const content = sourceFile!.content;
    expect(content).toContain('App_VehicleSpeed_Init');
    expect(content).toContain('App_VehicleSpeed_MainFunction');
    expect(content).toContain('Runnable_App_VehicleSpeed_ReadSpeed');
    expect(content).toContain('Runnable_App_VehicleSpeed_BrakeMonitor');
    expect(content).toContain('TODO: Implement');
    expect(content).toContain('SpeedBuffer');
    expect(content).toContain('BrakeFlag');
  });

  it('should generate RTE type header with port types', async () => {
    const config = createAppSwcModuleConfig();
    const result = await generator.generate(config, appSwcSchema, {
      outputDir: './output',
      generateComments: true,
    });

    const rteTypeFile = result.files.find(f => f.path.includes('Rte') && f.path.includes('Type'));
    expect(rteTypeFile).toBeDefined();

    const content = rteTypeFile!.content;
    expect(content).toContain('RTE_APP_VEHICLESPEED_TYPE_H');
    expect(content).toContain('Rte_App_VehicleSpeed_VehicleSpeed_I_Type');
    expect(content).toContain('Rte_App_VehicleSpeed_BrakeStatus_I_Type');
    expect(content).toContain('Rte_Read_App_VehicleSpeed_Speed_In');
    expect(content).toContain('Rte_Write_App_VehicleSpeed_Speed_Out');
  });

  it('should generate RTE connector with read/write APIs', async () => {
    const config = createAppSwcModuleConfig();
    const result = await generator.generate(config, appSwcSchema, {
      outputDir: './output',
      generateComments: true,
    });

    const connFile = result.files.find(f => f.path.includes('Connector'));
    expect(connFile).toBeDefined();

    const content = connFile!.content;
    expect(content).toContain('Rte_Read_App_VehicleSpeed_Speed_In');
    expect(content).toContain('Rte_Write_App_VehicleSpeed_Speed_Out');
    expect(content).toContain('RTE_E_INVALID');
    expect(content).toContain('RTE_E_NO_DATA');
  });
});

// ============================================================================
// Tests: Composition SWC
// ============================================================================

describe('SwcCodeGenerator - Composition', () => {
  const generator = new SwcCodeGenerator();

  it('should generate composition files with sub-component delegation in connector', async () => {
    const config = createCompSwcModuleConfig();
    const result = await generator.generate(config, compSwcSchema, {
      outputDir: './output',
      generateComments: true,
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBe(4);

    // Check connector file has sub-component delegation
    const connFile = result.files.find(f => f.path.includes('Connector'));
    expect(connFile).toBeDefined();
    expect(connFile!.content).toContain('App_VehicleSpeed_MainFunction');
    expect(connFile!.content).toContain('App_BrakeControl_MainFunction');

    // Check source file has delegation connector calling all sub-component main functions
    expect(connFile!.content).toContain('Comp_VehicleSystem_MainFunction');
  });

  it('should generate connector with assembly connector comments', async () => {
    const config = createCompSwcModuleConfig();
    const result = await generator.generate(config, compSwcSchema, {
      outputDir: './output',
    });

    const connFile = result.files.find(f => f.path.includes('Connector'));
    expect(connFile).toBeDefined();
    expect(connFile!.content).toContain('SpeedToBrake');
    expect(connFile!.content).toContain('SpeedSensor.Speed_Out');
    expect(connFile!.content).toContain('BrakeCtrl.Speed_In');
  });
});
