/**
 * YuleTech Core Schema Types
 *
 * Type definitions for yuleASR BSW module schemas
 */

/** Parameter value types */
export type ParameterValue = string | number | boolean | string[] | number[];

/** Parameter data types */
export type ParameterDataType =
  | 'BOOLEAN'
  | 'INTEGER'
  | 'FLOAT'
  | 'STRING'
  | 'ENUM'
  | 'FUNCTION-NAME'
  | 'REFERENCE'
  | 'ARRAY';

/** Module parameter definition */
export interface ModuleParameter {
  name: string;
  value: ParameterValue;
  type: ParameterDataType;
  definition: string;
  description: string;
  min?: number;
  max?: number;
  enumValues?: string[];
  optional?: boolean;
  /** 跨模块参数引用约束 */
  crossReferences?: CrossModuleReference[];
}

/** Cross-module parameter reference constraint */
export interface CrossModuleReference {
  module: string;
  container?: string;
  param: string;
  relation: 'equals' | 'less_than' | 'greater_than' | 'in_range' | 'in_enum';
  severity: 'error' | 'warning';
  description: string;
  bidirectional?: boolean;
}

/** Module container definition */
export interface ModuleContainer {
  name: string;
  definition: string;
  description: string;
  parameters: ModuleParameter[];
  subContainers?: ModuleContainer[];
}

/** BSW Module definition */
export interface BswModule {
  name: string;
  moduleDef: string;
  description: string;
  category: 'MCAL' | 'ECUAL' | 'SERVICE' | 'INTEGRATION';
  version: string;
  dependencies: string[];
  containers: ModuleContainer[];
}

/** Module dependency info */
export interface ModuleDependency {
  module: string;
  requiredBy: string[];
  requires: string[];
}

/** OS Task configuration */
export interface OsTask {
  name: string;
  priority: number;
  activation: number;
  autostart: boolean;
  schedule: 'FULL' | 'NON';
  events?: string[];
}

/** OS Alarm configuration */
export interface OsAlarm {
  name: string;
  counter: string;
  action: 'ACTIVATETASK' | 'SETEVENT' | 'ALARMCALLBACK';
  task?: string;
  event?: string;
  callback?: string;
  autostart: boolean;
  period?: number;
}

/** OS Resource configuration */
export interface OsResource {
  name: string;
  priorityCeiling: number;
}

/** OS Event configuration */
export interface OsEvent {
  name: string;
  mask: number;
}

/** OS Configuration */
export interface OsConfig {
  name: string;
  version: string;
  status: 'STANDARD' | 'EXTENDED';
  tasks: OsTask[];
  alarms: OsAlarm[];
  resources: OsResource[];
  events: OsEvent[];
  scheduleTables: string[];
}

/** Complete schema definition */
export interface YuleSchema {
  version: string;
  generatedAt: string;
  source: string;
  modules: BswModule[];
  osConfig?: OsConfig;
  dependencies: ModuleDependency[];
}

/** JSON Schema property */
export interface JsonSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  default?: ParameterValue;
}

/** JSON Schema for a module */
export interface ModuleJsonSchema {
  $schema: string;
  $id: string;
  title: string;
  description: string;
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
}

/** Parser options */
export interface ParserOptions {
  sourcePath: string;
  outputPath: string;
  includeOs?: boolean;
  includeDependencies?: boolean;
  strictMode?: boolean;
}

/** Parse result */
export interface ParseResult {
  success: boolean;
  schema?: YuleSchema;
  errors: string[];
  warnings: string[];
}
