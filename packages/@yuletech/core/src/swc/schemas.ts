/**
 * @yuletech/core - SWC Schema Definitions
 *
 * Module schema definitions for AUTOSAR SWC components.
 * These define the configuration parameters for:
 *  - AppSwc (ApplicationSwComponentType)
 *  - CompSwc (CompositionSwComponentType)
 */

import type { ModuleSchema, ContainerSchema } from '../types/module';

// ============================================================================
// ApplicationSwComponentType Schema
// ============================================================================

const appSwcContainers: ContainerSchema[] = [
  // --- Port Interface definitions ---
  {
    name: 'PortInterfaces',
    label: 'Port Interfaces',
    description: 'Port interface definitions (SenderReceiver, ClientServer, etc.)',
    multiple: true,
    minInstances: 0,
    parameters: [
      'PortInterfaceName',
      'PortInterfaceKind',
      'PortInterfaceDescription',
      'PortInterfaceIsService',
    ],
    children: [
      {
        name: 'DataElements',
        label: 'Data Elements (S/R)',
        description: 'Sender-Receiver data elements',
        multiple: true,
        minInstances: 0,
        parameters: [
          'DataElementName',
          'DataElementTypeRef',
          'DataElementQueueLength',
          'DataElementDescription',
        ],
      },
      {
        name: 'Operations',
        label: 'Operations (C/S)',
        description: 'Client-Server operations',
        multiple: true,
        minInstances: 0,
        parameters: ['OperationName', 'OperationDescription'],
        children: [
          {
            name: 'OperationArguments',
            label: 'Operation Arguments',
            description: 'Arguments for client-server operations',
            multiple: true,
            minInstances: 0,
            parameters: ['ArgName', 'ArgTypeRef', 'ArgDirection', 'ArgDescription'],
          },
        ],
      },
    ],
  },
  // --- Port Prototypes ---
  {
    name: 'Ports',
    label: 'Port Prototypes',
    description: 'Component ports (typed with port interfaces)',
    multiple: true,
    minInstances: 0,
    parameters: ['PortName', 'PortDirection', 'PortInterfaceRef', 'PortDescription'],
  },
  // --- Runnable Entities ---
  {
    name: 'Runnables',
    label: 'Runnable Entities',
    description: 'Schedulable functions inside the SWC',
    multiple: true,
    minInstances: 0,
    parameters: [
      'RunnableName',
      'RunnableSymbol',
      'RunnableInvocationType',
      'RunnableInterval',
      'RunnableCanBeConcurrent',
      'RunnableDescription',
    ],
  },
  // --- Inter-Runnable Variables (IRV) ---
  {
    name: 'InterRunnableVariables',
    label: 'Inter-Runnable Variables',
    description: 'Shared memory between runnables within the same SWC',
    multiple: true,
    minInstances: 0,
    parameters: ['IrvName', 'IrvTypeRef', 'IrvInitValue', 'IrvDescription'],
  },
  // --- Data Type Mappings ---
  {
    name: 'DataTypeMappings',
    label: 'Data Type Mappings',
    description: 'ApplicationDataType → ImplementationDataType mapping',
    multiple: true,
    minInstances: 0,
    parameters: ['MappingApplicationType', 'MappingImplementationType'],
  },
  // --- Data Access Points ---
  {
    name: 'DataAccessPoints',
    label: 'Data Access Points',
    description: 'Read/write access points for runnables on ports',
    multiple: true,
    minInstances: 0,
    parameters: [
      'AccessName',
      'AccessRunnableRef',
      'AccessPortRef',
      'AccessDataElementRef',
      'AccessKind',
    ],
  },
  // --- Server Call Points ---
  {
    name: 'ServerCallPoints',
    label: 'Server Call Points',
    description: 'Server operation invocations from runnables',
    multiple: true,
    minInstances: 0,
    parameters: ['ScpName', 'ScpRunnableRef', 'ScpPortRef', 'ScpOperationRef', 'ScpTimeout'],
  },
];

export const appSwcSchema: ModuleSchema = {
  name: 'AppSwc',
  label: 'Application SWC',
  layer: 'ASW',
  version: '1.0.0',
  description: 'AUTOSAR Application Software Component (ApplicationSwComponentType)',
  parameters: [
    {
      name: 'ComponentName',
      label: 'Component Name',
      type: 'string',
      description: 'Name of the application SW component',
      required: true,
    },
    {
      name: 'ComponentDescription',
      label: 'Description',
      type: 'string',
      description: 'Description of the component',
    },
    {
      name: 'ImplementationRef',
      label: 'Implementation Reference',
      type: 'string',
      description: 'Reference to the implementation (e.g., code file name)',
    },
  ],
  containers: appSwcContainers,
};

// ============================================================================
// CompositionSwComponentType Schema
// ============================================================================

const compSwcContainers: ContainerSchema[] = [
  // --- Sub-component references ---
  {
    name: 'SubComponents',
    label: 'Sub-Components',
    description: 'Component instances within this composition',
    multiple: true,
    minInstances: 0,
    parameters: ['SubComponentName', 'SubComponentTypeRef'],
  },
  // --- Port Interfaces ---
  {
    name: 'PortInterfaces',
    label: 'Port Interfaces',
    description: 'Interface definitions used by composition boundary ports',
    multiple: true,
    minInstances: 0,
    parameters: ['PortInterfaceName', 'PortInterfaceKind', 'PortInterfaceDescription'],
  },
  // --- Composition Boundary Ports ---
  {
    name: 'Ports',
    label: 'Composition Port Prototypes',
    description: 'Ports on the composition boundary',
    multiple: true,
    minInstances: 0,
    parameters: ['PortName', 'PortDirection', 'PortInterfaceRef', 'PortDescription'],
  },
  // --- Assembly Connectors (component-to-component) ---
  {
    name: 'AssemblyConnectors',
    label: 'Assembly Connectors',
    description: 'Connections between sub-component ports',
    multiple: true,
    minInstances: 0,
    parameters: [
      'ConnectorName',
      'ConnectorSourceComponent',
      'ConnectorSourcePort',
      'ConnectorTargetComponent',
      'ConnectorTargetPort',
    ],
  },
  // --- Delegation Connectors (boundary-to-component) ---
  {
    name: 'DelegationConnectors',
    label: 'Delegation Connectors',
    description: 'Connections from composition boundary ports to sub-component ports',
    multiple: true,
    minInstances: 0,
    parameters: [
      'DelegateName',
      'DelegateOuterPort',
      'DelegateInnerComponent',
      'DelegateInnerPort',
    ],
  },
];

export const compSwcSchema: ModuleSchema = {
  name: 'CompSwc',
  label: 'Composition SWC',
  layer: 'ASW',
  version: '1.0.0',
  description: 'AUTOSAR Composition Software Component (CompositionSwComponentType)',
  parameters: [
    {
      name: 'ComponentName',
      label: 'Component Name',
      type: 'string',
      description: 'Name of the composition SW component',
      required: true,
    },
    {
      name: 'ComponentDescription',
      label: 'Description',
      type: 'string',
      description: 'Description of the composition',
    },
  ],
  containers: compSwcContainers,
};

// ============================================================================
// All SWC schemas
// ============================================================================

export const swcSchemas: ModuleSchema[] = [appSwcSchema, compSwcSchema];

export default swcSchemas;
