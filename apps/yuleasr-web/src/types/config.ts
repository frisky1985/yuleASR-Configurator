/**
 * Enhanced Configuration Types for yuleASR Configurator
 * Inspired by Vector Configurator architecture
 *
 * Hierarchical structure: Module -> Container -> Sub-container -> Parameter
 */

// Parameter value types
export type ParameterValue = string | number | boolean | string[] | number[] | undefined | unknown;

// Parameter definition
export interface ConfigParameter {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  type: 'integer' | 'float' | 'boolean' | 'string' | 'enum' | 'array' | 'reference';
  value: ParameterValue;
  defaultValue?: ParameterValue;
  min?: number;
  max?: number;
  options?: Array<{ value: string | number; label: string }>;
  unit?: string;
  readonly?: boolean;
  hidden?: boolean;
  validation?: {
    required?: boolean;
    pattern?: string;
    customValidator?: string;
  };
  // Dependencies - this parameter is only visible when conditions are met
  dependencies?: Array<{
    parameter: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
    value: unknown;
  }>;
  // For array type
  itemType?: 'string' | 'integer' | 'float';
  // For reference type
  referenceTarget?: string;
}

// Container for grouping parameters
export interface ConfigContainer {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  shortName?: string;
  parameters: ConfigParameter[];
  subContainers?: ConfigContainer[];
  multiple?: boolean; // Can have multiple instances (like in Ecuc)
  minInstances?: number;
  maxInstances?: number;
  index?: number; // Instance index for multiple containers
  condition?: string; // Conditional display expression
}

// Module dependency definition
export interface ModuleDependency {
  module: string; // Module short name (e.g., 'Mcu', 'Can')
  required: boolean; // true = hard dependency, false = optional
  description?: string;
  // Auto-enable dependency when this module is enabled
  autoEnable?: boolean;
}

// Module definition
export interface ConfigModule {
  id: string;
  name: string; // Short name (e.g., 'Mcu', 'Can')
  displayName?: string; // Full display name
  description?: string;
  vendor?: string; // Vendor ID (e.g., 'NXP', 'Infineon')
  version: string; // Module version
  autosarVersion?: string; // AutoSAR version (e.g., '4.4.0')
  layer: 'MCAL' | 'ECUAL' | 'Service' | 'RTE' | 'OS' | 'ASW';
  enabled: boolean;

  // Hierarchical structure
  containers: ConfigContainer[];
  parameters: ConfigParameter[]; // Module-level parameters

  // Dependencies
  dependencies: ModuleDependency[];

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Validation status
  validationStatus?: 'valid' | 'invalid' | 'warning' | 'pending';
  validationErrors?: string[];

  // Configuration status - tracks if module has been configured
  configStatus: 'unconfigured' | 'configuring' | 'configured' | 'partial';

  // Configuration progress (0-100)
  configProgress?: number;

  // Last configuration timestamp
  lastConfiguredAt?: string;

  // Configuration method used
  configMethod?: 'wizard' | 'manual' | 'import';
}

// OS specific configuration
export interface OSConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;

  // OS Objects
  tasks: OSTask[];
  events: OSEvent[];
  alarms: OSAlarm[];
  resources: OSResource[];
  counters: OSCounter[];
  scheduleTables: OSScheduleTable[];
  isrs: OSISR[];

  // OS Properties
  scalabilityClass: 'SC1' | 'SC2' | 'SC3' | 'SC4';
  statusLevel: 'STANDARD' | 'EXTENDED';
  startupHooks: boolean;
  shutdownHooks: boolean;
  errorHooks: boolean;
  protectionHooks: boolean;
}

export interface OSTask {
  id: string;
  name: string;
  priority: number;
  schedule: 'FULL' | 'NON';
  activation: number;
  autostart: boolean;
  resources: string[];
  events: string[];
  stackSize: number;
}

export interface OSEvent {
  id: string;
  name: string;
  mask?: string;
}

export interface OSAlarm {
  id: string;
  name: string;
  counter: string;
  autostart: boolean;
  period: number;
  action: 'ACTIVATETASK' | 'SETEVENT' | 'ALARMCALLBACK';
  task?: string;
  event?: string;
  callback?: string;
}

export interface OSResource {
  id: string;
  name: string;
  linkedResources?: string[];
}

export interface OSCounter {
  id: string;
  name: string;
  maxAllowedValue: number;
  ticksPerBase: number;
  minCycle: number;
}

export interface OSScheduleTable {
  id: string;
  name: string;
  counter: string;
  periodic: boolean;
  autostart: boolean;
  expiryPoints: OSExpiryPoint[];
}

export interface OSExpiryPoint {
  id: string;
  offset: number;
  tasks: string[];
  events: Array<{ task: string; event: string }>;
}

export interface OSISR {
  id: string;
  name: string;
  category: 1 | 2;
  priority: number;
  vector: number | string;
  resource?: string;
}

// Complete configuration file
export interface ConfigFile {
  id: string;
  name: string;
  description?: string;
  targetPlatform?: string;
  targetChip?: string;
  compiler?: string;

  // Configuration modules
  modules: ConfigModule[];
  os?: OSConfig;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version?: string;

  // Validation
  lastValidation?: {
    timestamp: string;
    valid: boolean;
    errorCount: number;
    warningCount: number;
  };
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

export interface ValidationIssue {
  id: string;
  path: string; // e.g., "Mcu.General.McuClockSetting"
  message: string;
  severity: 'error' | 'warning' | 'info';
  module?: string;
  container?: string;
  parameter?: string;
  suggestion?: string;
  // Dependency related
  dependencySource?: string;
  dependencyTarget?: string;
}

// Tree view node types for hierarchical display
export interface TreeNode {
  id: string;
  type: 'layer' | 'module' | 'container' | 'parameter';
  name: string;
  displayName?: string;
  icon?: string;
  expanded?: boolean;
  selected?: boolean;
  enabled?: boolean;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  children?: TreeNode[];
  // Reference to actual data
  data?: ConfigModule | ConfigContainer | ConfigParameter;
  parent?: TreeNode;
  level: number;
}

// Configuration change for undo/redo
export interface ConfigChange {
  id: string;
  timestamp: string;
  type: 'parameter' | 'module' | 'container' | 'create' | 'delete';
  path: string;
  oldValue: unknown;
  newValue: unknown;
  description: string;
}

// Export/Import formats
export interface ExportOptions {
  format: 'json' | 'arxml' | 'dbc' | 'ldf';
  includeMetadata?: boolean;
  includeDisabled?: boolean;
  moduleFilter?: string[]; // Only export specific modules
}

// Search result
export interface SearchResult {
  path: string;
  type: 'module' | 'container' | 'parameter';
  name: string;
  value?: unknown;
  module: string;
  breadcrumb: string[];
}
