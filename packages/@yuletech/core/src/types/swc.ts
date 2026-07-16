/**
 * @yuletech/core - SWC (Application Software Component) Types
 * 
 * AUTOSAR Application Software Component data model types.
 * Defines the structural elements of SWC configuration:
 *  - ApplicationSwComponentType / CompositionSwComponentType
 *  - PortPrototype (Sender/Receiver, Client/Server)
 *  - RunnableEntity (cyclic / event / triggered)
 *  - SwcInternalBehavior
 *  - PortInterface (SenderReceiverInterface, ClientServerInterface)
 *  - DataType mapping (ApplicationDataType → ImplementationDataType)
 *  - Component connectors (AssemblySwConnector)
 */

import type { ModuleLayer } from './module';

// ============================================================================
// Layer
// ============================================================================

/** SWC module layer classification */
export type SwcModuleLayer = Extract<ModuleLayer, 'ASW'>;

// ============================================================================
// Data Types
// ============================================================================

/**
 * Application Data Type — the logical type used at SWC boundaries.
 * Maps to an Implementation Data Type for the C implementation.
 */
export interface ApplicationDataType {
  /** Data type name (e.g., "VehicleSpeed_T") */
  name: string;
  /** Display label */
  label?: string;
  /** Description */
  description?: string;
  /** Category: VALUE, ARRAY, RECORD, STRING */
  category: 'VALUE' | 'ARRAY' | 'RECORD' | 'STRING';
  /** Base type for VALUE category (e.g., "uint16", "sint32", "float32") */
  baseType?: string;
  /** Array element definition */
  arrayElement?: {
    typeRef: string;
    arraySize: number;
  };
  /** Record / struct members */
  members?: ApplicationDataTypeMember[];
  /** Length in bits (for serialization) */
  lengthBits?: number;
  /** SwDataDefProps: lower / upper limit */
  lowerLimit?: number;
  upperLimit?: number;
}

/**
 * Member of a record (RECORD category) Application Data Type
 */
export interface ApplicationDataTypeMember {
  name: string;
  typeRef: string;
  description?: string;
}

/**
 * Implementation Data Type — the C-language type used in generated code.
 */
export interface ImplementationDataType {
  name: string;
  label?: string;
  /** C type (e.g., "uint16", "sint32", "struct {...}") */
  cType: string;
  /** AUTOSAR type: TYPE_REFERENCE, TYPE_REFERENCE_ARRAY, STRUCTURE, ARRAY, STRING, BOOLEAN, INTEGER, FLOAT */
  category: string;
  /** Sub-elements for STRUCTURE */
  subElements?: Array<{
    name: string;
    cType: string;
    description?: string;
  }>;
  /** Array size */
  arraySize?: number;
  /** SwDataDefProps */
  lowerLimit?: number;
  upperLimit?: number;
}

/**
 * Data type mapping: ApplicationDataType → ImplementationDataType
 */
export interface SwcDataTypeMapping {
  /** Application Data Type reference */
  applicationType: string;
  /** Implementation Data Type reference */
  implementationType: string;
}

// ============================================================================
// Port Interface
// ============================================================================

/**
 * Port interface kind
 */
export type PortInterfaceKind = 'SenderReceiverInterface' | 'ClientServerInterface' | 'ModeSwitchInterface' | 'ParameterInterface' | 'NvDataInterface';

/**
 * Base port interface definition
 */
export interface PortInterfaceBase {
  name: string;
  label?: string;
  kind: PortInterfaceKind;
  description?: string;
  /** Service interface flag (AUTOSAR service interfaces) */
  isService?: boolean;
}

/**
 * Sender-Receiver Interface
 */
export interface SenderReceiverInterface extends PortInterfaceBase {
  kind: 'SenderReceiverInterface';
  /** Data elements sent/received via this interface */
  dataElements: SrDataElement[];
  /** Invalid behavior specification */
  invalidBehavior?: 'DONT_INVALIDATE' | 'KEEP' | 'REPLACE';
}

/**
 * Data element within a SenderReceiverInterface
 */
export interface SrDataElement {
  name: string;
  label?: string;
  /** Application Data Type reference */
  typeRef: string;
  description?: string;
  /** Queue length (0 = queued, 1 = last-is-best) */
  queueLength?: number;
  /** SwCalprmIndex (for calibration) */
  swCalprmIndex?: number;
}

/**
 * Client-Server Interface
 */
export interface ClientServerInterface extends PortInterfaceBase {
  kind: 'ClientServerInterface';
  /** Operations (server methods) provided by this interface */
  operations: CsOperation[];
}

/**
 * Operation within a ClientServerInterface
 */
export interface CsOperation {
  name: string;
  label?: string;
  description?: string;
  /** Possible error return values */
  possibleErrors?: string[];
  /** Arguments: in-parameters */
  arguments?: CsArgument[];
}

/**
 * Argument of a Client-Server operation
 */
export interface CsArgument {
  name: string;
  typeRef: string;
  direction: 'IN' | 'OUT' | 'INOUT';
  description?: string;
}

// ============================================================================
// Port Prototype
// ============================================================================

/**
 * Port direction
 */
export type PortDirection = 'IN' | 'OUT' | 'INOUT';

/**
 * Port prototype — the actual port on a component
 */
export interface PortPrototype {
  /** Port name (e.g., "VehicleSpeed_In") */
  name: string;
  label?: string;
  /** Port direction: IN (receiver), OUT (sender), INOUT */
  direction: PortDirection;
  /** Reference to the PortInterface */
  interfaceRef: string;
  /** Com specification (optional, for communication configuration) */
  comSpec?: PortComSpec;
  description?: string;
}

/**
 * Port communication specification
 */
export interface PortComSpec {
  /** For SenderReceiver: queue length */
  queueLength?: number;
  /** For SenderReceiver: data element mapping */
  dataElementMapping?: Record<string, string>;
  /** For ClientServer: timeout in ms */
  timeout?: number;
}

// ============================================================================
// Runnable Entity
// ============================================================================

/**
 * Runnable invocation type
 */
export type RunnableInvocationType = 'cyclic' | 'event' | 'triggered' | 'onEntry' | 'onExit' | 'onTransition';

/**
 * Runnable entity — a schedulable function inside an SWC
 */
export interface RunnableEntity {
  /** Runnable name (e.g., "Runnable_ReadSpeed") */
  name: string;
  label?: string;
  description?: string;
  /** Symbol name (defaults to name if not set) */
  symbol?: string;
  /** Minimum start interval in seconds (for cyclic runnables) */
  minimumStartInterval?: number;
  /** Invocation type */
  invocationType: RunnableInvocationType;
  /** Can be invoked concurrently? */
  canBeInvokedConcurrently?: boolean;
  /** Server call points (operations this runnable invokes on client ports) */
  serverCallPoints?: ServerCallPoint[];
  /** Data read access points */
  dataReadAccesses?: DataAccess[];
  /** Data write access points */
  dataWriteAccesses?: DataAccess[];
  /** Mode access points */
  modeAccesses?: ModeAccess[];
  /** Timing event references */
  timingEvents?: string[];
  /** RTEEvent references */
  rteEvents?: string[];
}

/**
 * Server call point — a runnable invoking a server operation
 */
export interface ServerCallPoint {
  name: string;
  /** Port name that provides the operation */
  portRef: string;
  /** Operation name */
  operationRef: string;
  /** Timeout */
  timeout?: number;
}

/**
 * Data access — a runnable reading or writing data via a port
 */
export interface DataAccess {
  name: string;
  /** Port name */
  portRef: string;
  /** Data element name (for SenderReceiver) */
  dataElementRef?: string;
}

/**
 * Mode access — a runnable switching or being notified of a mode
 */
export interface ModeAccess {
  name: string;
  /** Port name */
  portRef: string;
  /** Mode group / declaration */
  modeGroupRef?: string;
}

// ============================================================================
// Inter-Runnable Variable (IRV)
// ============================================================================

/**
 * Inter-Runnable Variable — shared memory between runnables within one SWC
 */
export interface InterRunnableVariable {
  name: string;
  label?: string;
  /** Implementation Data Type reference */
  typeRef: string;
  description?: string;
  /** Initial value */
  initValue?: unknown;
}

// ============================================================================
// SWC Internal Behavior
// ============================================================================

/**
 * SwcInternalBehavior — the internal behavior definition of an SWC
 */
export interface SwcInternalBehavior {
  name: string;
  /** Runnable entities */
  runnables: RunnableEntity[];
  /** Inter-runnable variables */
  irvs: InterRunnableVariable[];
  /** Per-instance memory */
  perInstanceMemories?: PerInstanceMemory[];
  /** Exclusive areas (for concurrency protection) */
  exclusiveAreas?: ExclusiveArea[];
  /** Constant memory */
  constantMemories?: ConstantMemory[];
}

/**
 * Per-instance memory (PIM)
 */
export interface PerInstanceMemory {
  name: string;
  typeRef: string;
  description?: string;
  /** Size in bytes (when type is implicit) */
  size?: number;
}

/**
 * Exclusive area — mutual exclusion region inside an SWC
 */
export interface ExclusiveArea {
  name: string;
  label?: string;
}

/**
 * Constant memory — read-only calibration / parameter memory
 */
export interface ConstantMemory {
  name: string;
  typeRef: string;
}

// ============================================================================
// Application SWC Component
// ============================================================================

/**
 * ApplicationSwComponentType
 */
export interface ApplicationSwComponentType {
  name: string;
  label?: string;
  description?: string;
  /** AUTOSAR module layer */
  layer: 'ASW';
  /** Component ports */
  ports: PortPrototype[];
  /** Internal behavior */
  internalBehavior: SwcInternalBehavior;
  /** Required data type mappings */
  dataTypeMappings: SwcDataTypeMapping[];
  /** Required interfaces (referenced by ports) */
  interfaces: PortInterfaceBase[];
  /** Implementation reference */
  implementationRef?: string;
}

// ============================================================================
// Composition SWC
// ============================================================================

/**
 * Assembly SW Connector — connects two ports of components within a composition
 */
export interface AssemblySwConnector {
  name: string;
  /** Source component + port */
  sourceComponent: string;
  sourcePort: string;
  /** Target component + port */
  targetComponent: string;
  targetPort: string;
}

/**
 * Delegation SW Connector — connects a composition port to a sub-component port
 */
export interface DelegationSwConnector {
  name: string;
  /** Outer port (on the composition boundary) */
  outerPort: string;
  /** Inner port (on a sub-component) */
  innerComponent: string;
  innerPort: string;
}

/**
 * PASSING Sw Connector — connects ports for pass-through
 */
export interface PassingSwConnector {
  name: string;
  sourcePort: string;
  targetPort: string;
}

/**
 * CompositionSwComponentType — hierarchical composition of SWCs
 */
export interface CompositionSwComponentType {
  name: string;
  label?: string;
  description?: string;
  layer: 'ASW';
  /** Sub-components (references to other SWC types) */
  components: SwcComponentRef[];
  /** Ports on the composition boundary */
  ports: PortPrototype[];
  /** Assembly connectors (component-to-component) */
  assemblyConnectors: AssemblySwConnector[];
  /** Delegation connectors (boundary-to-component) */
  delegationConnectors: DelegationSwConnector[];
  /** Passing connectors */
  passingConnectors?: PassingSwConnector[];
  /** Interfaces used */
  interfaces: PortInterfaceBase[];
}

/**
 * Reference to a component type inside a composition
 */
export interface SwcComponentRef {
  name: string;
  /** The type name (e.g., "App_SpeedSensor") */
  typeRef: string;
}

// ============================================================================
// SWC Project / Configuration Root
// ============================================================================

/**
 * Complete SWC configuration for a project
 */
export interface SwcProjectConfig {
  /** Application SW Components */
  applicationComponents: ApplicationSwComponentType[];
  /** Composition SW Components */
  compositionComponents: CompositionSwComponentType[];
  /** Data types */
  applicationDataTypes: ApplicationDataType[];
  implementationDataTypes: ImplementationDataType[];
}

// ============================================================================
// Schema-level types for module config (used by the configurator framework)
// ============================================================================

/**
 * SWC component registry entry
 */
export interface SwcComponentEntry {
  type: 'ApplicationSwComponentType' | 'CompositionSwComponentType';
  name: string;
  config: ApplicationSwComponentType | CompositionSwComponentType;
}
