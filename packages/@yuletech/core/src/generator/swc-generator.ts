/**
 * @yuletech/core - SWC (Application Software Component) Code Generator
 * 
 * AUTOSAR SWC code generation.
 * Generates:
 *  - Rte_<SwcName>_Type.h — RTE type definitions for the SWC
 *  - <SwcName>.c / <SwcName>.h — SWC implementation skeleton
 *  - Rte_<SwcName>_Connector.c — RTE connector / wiring configuration
 * 
 * Follows AUTOSAR 4.4 RTE and SWC specification patterns.
 */

import type { ModuleConfig, ModuleSchema } from '../types/module';
import type {
  PortPrototype,
  PortInterfaceBase,
  RunnableEntity,
  InterRunnableVariable,
  AssemblySwConnector,
  DelegationSwConnector,
} from '../types/swc';

import type { CodeGenerator, GeneratorOptions, GenerationResult, GeneratedFile } from './index';

import {
  generateAutosarFileHeader,
  generateAutosarFunctionHeader,
  generateVersionInfoMacros,
  getModuleId,
  toHex,
} from './autosar-format';

/**
 * SWC generator configuration parsed from ModuleConfig
 */
interface SwcGenConfig {
  componentName: string;
  componentDescription: string;
  ports: PortPrototype[];
  interfaces: PortInterfaceBase[];
  runnables: RunnableEntity[];
  irvs: InterRunnableVariable[];
  dataTypeMappings: Array<{ applicationType: string; implementationType: string }>;
  // Composition-specific
  subComponents: Array<{ name: string; typeRef: string }>;
  assemblyConnectors: AssemblySwConnector[];
  delegationConnectors: DelegationSwConnector[];
}

/**
 * SWC Code Generator
 * Generates AUTOSAR Application SWC implementation files.
 */
export class SwcCodeGenerator implements CodeGenerator {
  name = 'SwcCodeGenerator';
  version = '1.0.0';
  supportedModules: string[] = ['AppSwc', 'CompSwc'];

  supports(moduleName: string): boolean {
    return this.supportedModules.includes(moduleName);
  }

  async generate(
    config: ModuleConfig,
    _schema: ModuleSchema,
    options: GeneratorOptions
  ): Promise<GenerationResult> {
    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const genConfig = this.parseSwcConfig(config);

      // 1. Generate the SWC implementation header <SwcName>.h
      const headerFile = this.generateSwcHeader(genConfig, options);
      files.push({
        path: `${options.outputDir}/${genConfig.componentName}.h`,
        content: headerFile,
        language: 'h',
      });

      // 2. Generate the SWC implementation source <SwcName>.c
      const sourceFile = this.generateSwcSource(genConfig, options);
      files.push({
        path: `${options.outputDir}/${genConfig.componentName}.c`,
        content: sourceFile,
        language: 'c',
      });

      // 3. Generate the RTE type header Rte_<SwcName>_Type.h
      const rteTypeFile = this.generateRteTypeHeader(genConfig, options);
      files.push({
        path: `${options.outputDir}/Rte_${genConfig.componentName}_Type.h`,
        content: rteTypeFile,
        language: 'h',
      });

      // 4. Generate the RTE connector config
      const connectorFile = this.generateRteConnector(genConfig, options);
      files.push({
        path: `${options.outputDir}/Rte_${genConfig.componentName}_Connector.c`,
        content: connectorFile,
        language: 'c',
      });

      return {
        success: errors.length === 0,
        files,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        files,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Parse ModuleConfig into typed SWC generation config
   */
  private parseSwcConfig(config: ModuleConfig): SwcGenConfig {
    const componentName = (config.parameters['ComponentName'] as string) || config.module;
    const componentDescription = (config.parameters['ComponentDescription'] as string) || '';

    // Parse ports
    const ports: PortPrototype[] = this.parseContainerArray<PortPrototype>(
      config,
      'Ports',
      (item) => ({
        name: (item.parameters['PortName'] as string) || '',
        direction: (item.parameters['PortDirection'] as 'IN' | 'OUT' | 'INOUT') || 'IN',
        interfaceRef: (item.parameters['PortInterfaceRef'] as string) || '',
        description: (item.parameters['PortDescription'] as string) || '',
      })
    );

    // Parse interfaces
    const interfaces: PortInterfaceBase[] = this.parseContainerArray<PortInterfaceBase>(
      config,
      'PortInterfaces',
      (item) => ({
        name: (item.parameters['PortInterfaceName'] as string) || '',
        kind: (item.parameters['PortInterfaceKind'] as PortInterfaceBase['kind']) || 'SenderReceiverInterface',
        description: (item.parameters['PortInterfaceDescription'] as string) || '',
      })
    );

    // Parse runnables
    const runnables: RunnableEntity[] = this.parseContainerArray<RunnableEntity>(
      config,
      'Runnables',
      (item) => ({
        name: (item.parameters['RunnableName'] as string) || '',
        symbol: (item.parameters['RunnableSymbol'] as string) || undefined,
        invocationType: (item.parameters['RunnableInvocationType'] as RunnableEntity['invocationType']) || 'cyclic',
        minimumStartInterval: (item.parameters['RunnableInterval'] as number) || undefined,
        canBeInvokedConcurrently: (item.parameters['RunnableCanBeConcurrent'] as boolean) || false,
        description: (item.parameters['RunnableDescription'] as string) || '',
      })
    );

    // Parse IRVs
    const irvs: InterRunnableVariable[] = this.parseContainerArray<InterRunnableVariable>(
      config,
      'InterRunnableVariables',
      (item) => ({
        name: (item.parameters['IrvName'] as string) || '',
        typeRef: (item.parameters['IrvTypeRef'] as string) || 'uint8',
        initValue: item.parameters['IrvInitValue'],
        description: (item.parameters['IrvDescription'] as string) || '',
      })
    );

    // Parse data type mappings
    const dataTypeMappings = this.parseContainerArray<{ applicationType: string; implementationType: string }>(
      config,
      'DataTypeMappings',
      (item) => ({
        applicationType: (item.parameters['MappingApplicationType'] as string) || '',
        implementationType: (item.parameters['MappingImplementationType'] as string) || '',
      })
    );

    // Parse sub-components (for composition)
    const subComponents = this.parseContainerArray<{ name: string; typeRef: string }>(
      config,
      'SubComponents',
      (item) => ({
        name: (item.parameters['SubComponentName'] as string) || '',
        typeRef: (item.parameters['SubComponentTypeRef'] as string) || '',
      })
    );

    // Parse assembly connectors (for composition)
    const assemblyConnectors: AssemblySwConnector[] = this.parseContainerArray<AssemblySwConnector>(
      config,
      'AssemblyConnectors',
      (item) => ({
        name: (item.parameters['ConnectorName'] as string) || '',
        sourceComponent: (item.parameters['ConnectorSourceComponent'] as string) || '',
        sourcePort: (item.parameters['ConnectorSourcePort'] as string) || '',
        targetComponent: (item.parameters['ConnectorTargetComponent'] as string) || '',
        targetPort: (item.parameters['ConnectorTargetPort'] as string) || '',
      })
    );

    // Parse delegation connectors (for composition)
    const delegationConnectors: DelegationSwConnector[] = this.parseContainerArray<DelegationSwConnector>(
      config,
      'DelegationConnectors',
      (item) => ({
        name: (item.parameters['DelegateName'] as string) || '',
        outerPort: (item.parameters['DelegateOuterPort'] as string) || '',
        innerComponent: (item.parameters['DelegateInnerComponent'] as string) || '',
        innerPort: (item.parameters['DelegateInnerPort'] as string) || '',
      })
    );

    return {
      componentName,
      componentDescription,
      ports,
      interfaces,
      runnables,
      irvs,
      dataTypeMappings,
      subComponents,
      assemblyConnectors,
      delegationConnectors,
    };
  }

  /**
   * Parse a container array from ModuleConfig
   */
  private parseContainerArray<T>(
    config: ModuleConfig,
    containerName: string,
    mapper: (item: { parameters: Record<string, unknown> }) => T
  ): T[] {
    const rawItems = config.containers?.[containerName] || [];
    return rawItems.map((item) => mapper({ parameters: item.parameters }));
  }

  /**
   * Generate SWC header file (<SwcName>.h)
   */
  private generateSwcHeader(genConfig: SwcGenConfig, options: GeneratorOptions): string {
    const { componentName } = genConfig;
    const guardName = `${componentName.toUpperCase()}_H`;
    const moduleId = getModuleId(componentName);
    const vendorId = 0x1234;

    let content = generateAutosarFileHeader(
      `${componentName}.h`,
      componentName,
      moduleId,
      vendorId,
      `${componentName} Application SWC Header (AUTOSAR 4.4)`
    );

    content += `\
#ifndef ${guardName}
#define ${guardName}

/*==================[includes]==============================================*/
#include "Std_Types.h"
#include "Rte_${componentName}_Type.h"

`;

    content += generateVersionInfoMacros(componentName, 1, 0, 0, 4, 4, 0);

    content += `\
/*==================[port type definitions]==================================*/
`;

    // Port type definitions (typedefs for each port interface)
    for (const iface of genConfig.interfaces) {
      const typeName = `${componentName}_${iface.name}_Type`;
      if (iface.kind === 'SenderReceiverInterface') {
        content += `typedef uint8 ${typeName}; /* Sender-Receiver: ${iface.description || iface.name} */\n`;
      } else if (iface.kind === 'ClientServerInterface') {
        content += `typedef struct {\n`;
        content += `    Std_ReturnType status;\n`;
        content += `} ${typeName}; /* Client-Server: ${iface.description || iface.name} */\n`;
      } else {
        content += `typedef uint8 ${typeName}; /* ${iface.kind}: ${iface.description || iface.name} */\n`;
      }
      content += '\n';
    }

    content += `\
/*==================[IRV external declarations]==============================*/
`;

    // IRV declarations
    for (const irv of genConfig.irvs) {
      content += `extern ${irv.typeRef} ${componentName}_${irv.name};\n`;
    }
    content += '\n';

    content += `\
/*==================[Runnable declarations]==================================*/
`;

    // Runnable function declarations
    for (const runnable of genConfig.runnables) {
      const symbol = runnable.symbol || `Runnable_${componentName}_${runnable.name}`;
      content += generateAutosarFunctionHeader(
        runnable.description || `Runnable: ${runnable.name}`,
        [],
        'void',
        [`Invocation type: ${runnable.invocationType}`],
        [`The ${runnable.name} runnable has completed execution`]
      );
      content += `void ${symbol}(void);\n\n`;
    }

    // Port data access macros
    content += `\
/*==================[port access macros]=====================================*/
`;

    for (const port of genConfig.ports) {
      const portMacro = `${componentName.toUpperCase()}_PORT_${port.name.toUpperCase()}`;
      content += `#define ${portMacro}    ((uint8)${genConfig.ports.indexOf(port)}U)\n`;
    }
    content += '\n';

    content += `\
/*==================[initialization]=========================================*/
/**
 * @brief Initialize the ${componentName} SWC
 * @return Std_ReturnType: E_OK if initialization succeeded
 */
Std_ReturnType ${componentName}_Init(void);

/**
 * @brief Main function (called cyclically by the RTE)
 */
void ${componentName}_MainFunction(void);

#endif /* ${guardName} */
/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * Generate SWC source file (<SwcName>.c)
   */
  private generateSwcSource(genConfig: SwcGenConfig, options: GeneratorOptions): string {
    const { componentName } = genConfig;
    const moduleId = getModuleId(componentName);
    const vendorId = 0x1234;

    let content = generateAutosarFileHeader(
      `${componentName}.c`,
      componentName,
      moduleId,
      vendorId,
      `${componentName} Application SWC Implementation (AUTOSAR 4.4)`
    );

    content += `\
/*==================[includes]==============================================*/
#include "${componentName}.h"
#include "Rte.h"
#include "Os.h"

/*==================[module identification]=================================*/
#define ${componentName.toUpperCase()}_MODULE_ID    ((uint16)${moduleId}U)
#define ${componentName.toUpperCase()}_VENDOR_ID    ((uint16)0x${toHex(vendorId)})

/*==================[internal data]=========================================*/
static boolean ${componentName}_Initialized = FALSE;

`;

    // IRV storage definitions
    if (genConfig.irvs.length > 0) {
      content += `/*==================[inter-runnable variables]===============================*/\n`;
      for (const irv of genConfig.irvs) {
        const initVal = irv.initValue !== undefined ? ` = ${irv.initValue}` : '';
        content += `${irv.typeRef} ${componentName}_${irv.name}${initVal};\n`;
      }
      content += '\n';
    }

    // Port data storage
    if (genConfig.ports.length > 0) {
      content += `/*==================[port data storage]=====================================*/\n`;
      for (const port of genConfig.ports) {
        const typeName = `${componentName}_${port.interfaceRef}_Type`;
        content += `static ${typeName} ${componentName}_PortData_${port.name};\n`;
      }
      content += '\n';
    }

    content += `\
/*==================[function definitions]==================================*/

/**
 * @brief Initialize the ${componentName} SWC
 * @details Initializes all port data and IRVs to their default values.
 *          Called by the RTE during system startup.
 */
Std_ReturnType ${componentName}_Init(void) {
    if (${componentName}_Initialized) {
        return E_OK;
    }
`;

    // Initialize IRVs
    for (const irv of genConfig.irvs) {
      content += `    /* Initialize IRV: ${irv.name} */\n`;
      if (irv.initValue !== undefined) {
        content += `    ${componentName}_${irv.name} = (${irv.typeRef})${irv.initValue};\n`;
      } else {
        content += `    ${componentName}_${irv.name} = (${irv.typeRef})0;\n`;
      }
    }

    // Initialize port data
    for (const port of genConfig.ports) {
      if (port.direction === 'OUT' || port.direction === 'INOUT') {
        content += `    /* Initialize port data: ${port.name} */\n`;
        content += `    (void)memset(&${componentName}_PortData_${port.name}, 0, sizeof(${componentName}_PortData_${port.name}));\n`;
      }
    }

    content += `\
    ${componentName}_Initialized = TRUE;
    return E_OK;
}

/**
 * @brief ${componentName} main function
 * @details Executes all cyclic runnable entities in sequence.
 *          Called cyclically by the RTE scheduler.
 */
void ${componentName}_MainFunction(void) {
    if (!${componentName}_Initialized) {
        return;
    }
`;

    // Call runnables in sequence
    for (const runnable of genConfig.runnables) {
      const symbol = runnable.symbol || `Runnable_${componentName}_${runnable.name}`;
      if (runnable.invocationType === 'cyclic') {
        if (options.generateComments) {
          content += `    /* Execute cyclic runnable: ${runnable.name} */\n`;
        }
        content += `    ${symbol}();\n`;
      }
    }

    content += `\
}

/*==================[runnable implementations]==============================*/
`;

    // Generate runnable stubs
    for (const runnable of genConfig.runnables) {
      const symbol = runnable.symbol || `Runnable_${componentName}_${runnable.name}`;
      content += `\
/**
 * @brief ${runnable.description || `Runnable entity: ${runnable.name}`}
 * @details Invocation type: ${runnable.invocationType}
 *          ${runnable.canBeInvokedConcurrently ? 'Can be invoked concurrently.' : 'Not re-entrant.'}
 */
void ${symbol}(void) {
    /* TODO: Implement ${componentName}.${runnable.name} logic */
`;

      // For cyclic runnables with interval, add timing placeholder
      if (runnable.invocationType === 'cyclic' && runnable.minimumStartInterval) {
        content += `    /* Expected cycle time: ${runnable.minimumStartInterval}s */\n`;
      }

      // Generate port read/write calls based on port access (placeholder comments)
      const readAccesses = runnable.dataReadAccesses || [];
      const writeAccesses = runnable.dataWriteAccesses || [];

      for (const access of readAccesses) {
        content += `    /* Read from port: ${access.portRef} */\n`;
        content += `    /* ${componentName}_PortData_${access.portRef} = ... */\n`;
      }
      for (const access of writeAccesses) {
        content += `    /* Write to port: ${access.portRef} */\n`;
        content += `    /* Rte_Write_${access.portRef}(&${componentName}_PortData_${access.portRef}); */\n`;
      }

      content += `}\n\n`;
    }

    content += `\
/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * Generate RTE type header (Rte_<SwcName>_Type.h)
   */
  private generateRteTypeHeader(genConfig: SwcGenConfig, _options: GeneratorOptions): string {
    const { componentName } = genConfig;
    const guardName = `RTE_${componentName.toUpperCase()}_TYPE_H`;
    const timestamp = new Date().toISOString();

    let content = `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator - SWC Generator */
/* Component: ${componentName} */
/* Timestamp: ${timestamp} */

#ifndef ${guardName}
#define ${guardName}

/*==================[includes]==============================================*/
#include "Std_Types.h"
#include "Rte.h"
#include "Rte_Type.h"

/*==================[component identification]==============================*/
/**
 * @brief ${componentName} component identification
 */
#define ${componentName.toUpperCase()}_SWC_ID          ((uint16)0x0001U)
#define ${componentName.toUpperCase()}_SWC_VENDOR_ID   ((uint16)0x1234U)

/*==================[port interface type definitions]========================*/
`;

    // Define types for each port interface
    for (const iface of genConfig.interfaces) {
      const typeName = `Rte_${componentName}_${iface.name}_Type`;
      if (iface.kind === 'SenderReceiverInterface') {
        content += `/** @brief ${iface.description || iface.name} (Sender-Receiver) */\n`;
        content += `typedef uint8 ${typeName};\n\n`;
      } else if (iface.kind === 'ClientServerInterface') {
        content += `/** @brief ${iface.description || iface.name} (Client-Server) */\n`;
        content += `typedef struct {\n`;
        content += `    Std_ReturnType status;\n`;
        content += `    uint8 result;\n`;
        content += `} ${typeName};\n\n`;
      } else if (iface.kind === 'ModeSwitchInterface') {
        content += `/** @brief ${iface.description || iface.name} (Mode Switch) */\n`;
        content += `typedef uint8 ${typeName};\n\n`;
      } else {
        content += `/** @brief ${iface.description || iface.name} */\n`;
        content += `typedef uint8 ${typeName};\n\n`;
      }
    }

    // Port data types
    if (genConfig.ports.length > 0) {
      content += `/*==================[port data structures]==================================*/\n`;
      for (const port of genConfig.ports) {
        const dataType = `Rte_${componentName}_${port.interfaceRef}_Type`;
        const structName = `Rte_${componentName}_Port_${port.name}_Type`;
        content += `/** @brief Port data structure for ${port.name} (${port.direction}) */\n`;
        content += `typedef struct {\n`;
        content += `    ${dataType} data;\n`;
        content += `    uint8 status;\n`;
        content += `    boolean updated;\n`;
        content += `} ${structName};\n\n`;
      }
    }

    // IRV types
    if (genConfig.irvs.length > 0) {
      content += `/*==================[inter-runnable variable types]==========================*/\n`;
      for (const irv of genConfig.irvs) {
        content += `/** @brief IRV type for ${irv.name} */\n`;
        content += `typedef ${irv.typeRef} Rte_${componentName}_Irv_${irv.name}_Type;\n\n`;
      }
    }

    // RTE API function declarations for this SWC
    content += `/*==================[RTE API declarations]====================================*/\n`;
    for (const port of genConfig.ports) {
      const dataType = `Rte_${componentName}_${port.interfaceRef}_Type`;
      if (port.direction === 'IN' || port.direction === 'INOUT') {
        content += `Std_ReturnType Rte_Read_${componentName}_${port.name}(${dataType}* data);\n`;
      }
      if (port.direction === 'OUT' || port.direction === 'INOUT') {
        content += `Std_ReturnType Rte_Write_${componentName}_${port.name}(const ${dataType}* data);\n`;
      }
    }
    content += '\n';

    content += `\
#endif /* ${guardName} */
/*==================[end of file]===========================================*/
`;

    return content;
  }

  /**
   * Generate RTE connector configuration (Rte_<SwcName>_Connector.c)
   */
  private generateRteConnector(genConfig: SwcGenConfig, options: GeneratorOptions): string {
    const { componentName } = genConfig;
    const timestamp = new Date().toISOString();

    let content = `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator - SWC Generator */
/* Component: ${componentName} */
/* Timestamp: ${timestamp} */

/*==================[includes]==============================================*/
#include "Rte.h"
#include "${componentName}.h"
#include "Rte_${componentName}_Type.h"

/*==================[port data storage]=====================================*/
`;

    // Static port data storage
    for (const port of genConfig.ports) {
      const structName = `Rte_${componentName}_Port_${port.name}_Type`;
      content += `static ${structName} ${componentName}_PortStorage_${port.name};\n`;
    }
    content += '\n';

    // RTE Read APIs
    const readPorts = genConfig.ports.filter(p => p.direction === 'IN' || p.direction === 'INOUT');
    if (readPorts.length > 0) {
      content += `/*==================[RTE Read implementations]================================*/\n`;
      for (const port of readPorts) {
        const dataType = `Rte_${componentName}_${port.interfaceRef}_Type`;
        content += `\
/**
 * @brief Read from port ${port.name}
 * @param data [out] Pointer to receive the data
 * @return Std_ReturnType
 */
Std_ReturnType Rte_Read_${componentName}_${port.name}(${dataType}* data) {
    if (data == NULL_PTR) {
        return RTE_E_INVALID;
    }
    if (!${componentName}_PortStorage_${port.name}.updated) {
        return RTE_E_NO_DATA;
    }
    *data = ${componentName}_PortStorage_${port.name}.data;
    ${componentName}_PortStorage_${port.name}.updated = FALSE;
    return RTE_E_OK;
}

`;
      }
    }

    // RTE Write APIs
    const writePorts = genConfig.ports.filter(p => p.direction === 'OUT' || p.direction === 'INOUT');
    if (writePorts.length > 0) {
      content += `/*==================[RTE Write implementations]===============================*/\n`;
      for (const port of writePorts) {
        const dataType = `Rte_${componentName}_${port.interfaceRef}_Type`;
        content += `\
/**
 * @brief Write to port ${port.name}
 * @param data [in] Data to send
 * @return Std_ReturnType
 */
Std_ReturnType Rte_Write_${componentName}_${port.name}(const ${dataType}* data) {
    if (data == NULL_PTR) {
        return RTE_E_INVALID;
    }
    ${componentName}_PortStorage_${port.name}.data = *data;
    ${componentName}_PortStorage_${port.name}.updated = TRUE;
    ${componentName}_PortStorage_${port.name}.status = RTE_E_OK;
    return RTE_E_OK;
}

`;
      }
    }

    // Connector registration table
    if (genConfig.assemblyConnectors.length > 0 || genConfig.delegationConnectors.length > 0) {
      content += `/*==================[connector registration]=================================*/\n`;
      content += `/* Assembly Connectors */\n`;
      for (const conn of genConfig.assemblyConnectors) {
        content += `/* ${conn.name}: ${conn.sourceComponent}.${conn.sourcePort} -> ${conn.targetComponent}.${conn.targetPort} */\n`;
      }
      content += '\n';

      for (const conn of genConfig.delegationConnectors) {
        content += `/* Delegation: ${conn.outerPort} -> ${conn.innerComponent}.${conn.innerPort} */\n`;
      }
      content += '\n';
    }

    // Sub-component references for compositions
    if (genConfig.subComponents.length > 0) {
      content += `/*==================[sub-component references]===============================*/\n`;
      for (const sub of genConfig.subComponents) {
        content += `/* Sub-component: ${sub.name} (${sub.typeRef}) */\n`;
        content += `extern Std_ReturnType ${sub.typeRef}_Init(void);\n`;
        content += `extern void ${sub.typeRef}_MainFunction(void);\n`;
      }
      content += '\n';

      // Composition main function delegates to sub-components
      content += `\
/*==================[composition main function]=============================*/
/**
 * @brief Delegates MainFunction to all sub-components
 */
void ${componentName}_MainFunction(void) {
`;
      for (const sub of genConfig.subComponents) {
        content += `    ${sub.typeRef}_MainFunction();\n`;
      }
      content += '}\n\n';
    }

    content += `\
/*==================[end of file]===========================================*/
`;

    return content;
  }
}

/**
 * Create a new SWC code generator instance
 */
export function createSwcGenerator(): SwcCodeGenerator {
  return new SwcCodeGenerator();
}

export default SwcCodeGenerator;
