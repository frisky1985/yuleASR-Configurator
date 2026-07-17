/**
 * Schema Parser Utility
 *
 * Parses XDM/ARXML/JSON configuration files from yuleASR
 * and converts them to JSON Schema format
 */

import * as fs from 'fs';
import * as path from 'path';

import type {
  BswModule,
  ModuleContainer,
  ModuleParameter,
  ParameterValue,
  OsConfig,
  OsTask,
  OsAlarm,
  OsResource,
  OsEvent,
  ModuleJsonSchema,
  JsonSchemaProperty,
  ParameterDataType,
  YuleSchema,
  ParseResult,
  ModuleDependency,
} from '../../packages/@yuletech/core/src/types/schema';

export interface SchemaParserOptions {
  yuleASRPath: string;
  includeModules?: string[];
  excludeModules?: string[];
  includeOs?: boolean;
}

/**
 * Schema parser for yuleASR configurations
 */
export class SchemaParser {
  private options: SchemaParserOptions;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(options: SchemaParserOptions) {
    this.options = {
      includeModules: [],
      excludeModules: [],
      includeOs: true,
      ...options,
    };
  }

  /**
   * Parse all schemas from yuleASR
   */
  async parseAll(): Promise<ParseResult> {
    try {
      const modules: BswModule[] = [];
      const dependencies: ModuleDependency[] = [];

      // Parse BSW module specs from openspec
      const bswModules = await this.parseBswModules();
      modules.push(...bswModules);

      // Parse module dependencies from toolchain spec
      const deps = await this.parseModuleDependencies();
      dependencies.push(...deps);

      // Parse OS config if available
      let osConfig: OsConfig | undefined;
      if (this.options.includeOs) {
        osConfig = await this.parseOsConfig();
      }

      // Parse ARXML configs if available
      const arxmlModules = await this.parseArxmlConfigs();
      // Merge ARXML data with spec data
      this.mergeModules(modules, arxmlModules);

      if (this.errors.length > 0) {
        return {
          success: false,
          errors: this.errors,
          warnings: this.warnings,
        };
      }

      const schema: YuleSchema = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        source: this.options.yuleASRPath,
        modules,
        osConfig,
        dependencies,
      };

      return {
        success: true,
        schema,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: this.warnings,
      };
    }
  }

  /**
   * Parse BSW modules from openspec
   */
  private async parseBswModules(): Promise<BswModule[]> {
    const modules: BswModule[] = [];
    const specPath = path.join(this.options.yuleASRPath, 'openspec/specs/bsw');

    if (!fs.existsSync(specPath)) {
      this.warnings.push(`BSW spec path not found: ${specPath}`);
      return modules;
    }

    // Parse spec.md for module definitions
    const specFile = path.join(specPath, 'spec.md');
    if (fs.existsSync(specFile)) {
      const modulesFromSpec = this.parseSpecMarkdown(fs.readFileSync(specFile, 'utf-8'));
      modules.push(...modulesFromSpec);
    }

    // Parse individual module configs if available
    const srcBswPath = path.join(this.options.yuleASRPath, 'src/bsw');
    if (fs.existsSync(srcBswPath)) {
      const mcalModules = await this.parseSourceModules(path.join(srcBswPath, 'mcal'), 'MCAL');
      const ecualModules = await this.parseSourceModules(path.join(srcBswPath, 'ecual'), 'ECUAL');
      const serviceModules = await this.parseSourceModules(
        path.join(srcBswPath, 'services'),
        'SERVICE'
      );
      const integrationModules = await this.parseSourceModules(
        path.join(srcBswPath, 'integration'),
        'INTEGRATION'
      );

      modules.push(...mcalModules, ...ecualModules, ...serviceModules, ...integrationModules);
    }

    return modules;
  }

  /**
   * Parse spec.md markdown for module definitions
   */
  private parseSpecMarkdown(content: string): BswModule[] {
    const modules: BswModule[] = [];

    // Parse MCAL modules
    const mcalSection = this.extractSection(content, '### 1. MCAL', '### 2.');
    if (mcalSection) {
      const mcuModule = this.parseModuleSection(mcalSection, 'MCU Driver', 'MCAL');
      if (mcuModule) modules.push(mcuModule);

      const gpioModule = this.parseModuleSection(mcalSection, 'GPIO Driver', 'MCAL');
      if (gpioModule) modules.push(gpioModule);

      const canModule = this.parseModuleSection(mcalSection, 'CAN Driver', 'MCAL');
      if (canModule) modules.push(canModule);
    }

    // Parse ECUAL modules
    const ecualSection = this.extractSection(content, '### 2. ECU Abstraction Layer', '### 3.');
    if (ecualSection) {
      const ioHwAbModule: BswModule = {
        name: 'IoHwAb',
        moduleDef: 'AUTOSAR/EcucDefs/IoHwAb',
        description: 'I/O Hardware Abstraction',
        category: 'ECUAL',
        version: '1.0.0',
        dependencies: ['Port', 'Dio', 'Adc', 'Pwm'],
        containers: [],
      };
      modules.push(ioHwAbModule);
    }

    // Parse Service layer modules
    const serviceSection = this.extractSection(content, '### 3. Service Layer', '##');
    if (serviceSection) {
      const comModule = this.parseModuleSection(
        serviceSection,
        'Communication Services',
        'SERVICE'
      );
      if (comModule) {
        comModule.name = 'Com';
        comModule.moduleDef = 'AUTOSAR/EcucDefs/Com';
        modules.push(comModule);
      }

      const dcmModule = this.parseModuleSection(serviceSection, 'Diagnostic Services', 'SERVICE');
      if (dcmModule) {
        dcmModule.name = 'Dcm';
        dcmModule.moduleDef = 'AUTOSAR/EcucDefs/Dcm';
        modules.push(dcmModule);
      }

      const nvmModule: BswModule = {
        name: 'NvM',
        moduleDef: 'AUTOSAR/EcucDefs/NvM',
        description: 'Memory Services - Non-volatile data management',
        category: 'SERVICE',
        version: '1.0.0',
        dependencies: ['MemIf', 'Fee', 'Ea'],
        containers: [],
      };
      modules.push(nvmModule);
    }

    return modules;
  }

  /**
   * Parse a module section from markdown
   */
  private parseModuleSection(
    content: string,
    sectionName: string,
    category: BswModule['category']
  ): BswModule | null {
    const sectionRegex = new RegExp(`#### .*${sectionName}.*\n\n([^#]+)`, 'i');
    const match = content.match(sectionRegex);

    if (!match) return null;

    const section = match[1];

    // Extract description
    const descMatch = section.match(/\*\*功能要求\*\*:\n([^]+?)(?=\*\*|$)/);
    const description = descMatch
      ? descMatch[1]
          .split('\n')
          .filter(l => l.startsWith('-'))
          .map(l => l.replace(/^- /, ''))
          .join('; ')
      : sectionName;

    // Map section name to module name
    const nameMap: Record<string, string> = {
      'MCU Driver': 'Mcu',
      'GPIO Driver': 'Port',
      'CAN Driver': 'Can',
      'Communication Services': 'Com',
      'Diagnostic Services': 'Dcm',
    };

    const name = nameMap[sectionName] || sectionName.replace(/\s+/g, '');

    return {
      name,
      moduleDef: `AUTOSAR/EcucDefs/${name}`,
      description: description.substring(0, 200),
      category,
      version: '1.0.0',
      dependencies: [],
      containers: this.extractContainersFromSection(section),
    };
  }

  /**
   * Extract containers from module section
   */
  private extractContainersFromSection(section: string): ModuleContainer[] {
    const containers: ModuleContainer[] = [];

    // Look for interface definitions in C code blocks
    const codeBlockMatch = section.match(/```c\n([^`]+)```/);
    if (codeBlockMatch) {
      const code = codeBlockMatch[1];

      // Extract configuration-related functions
      const configParams: ModuleParameter[] = [];
      const lines = code.split('\n');

      for (const line of lines) {
        // Look for config types
        const configMatch = line.match(/(\w+)_ConfigType/);
        if (configMatch && !configParams.find(p => p.name === `${configMatch[1]}Config`)) {
          configParams.push({
            name: `${configMatch[1]}Config`,
            value: '',
            type: 'REFERENCE',
            definition: `${configMatch[1]}_ConfigType`,
            description: `Configuration for ${configMatch[1]}`,
          });
        }
      }

      if (configParams.length > 0) {
        containers.push({
          name: 'General',
          definition: 'GeneralConfiguration',
          description: 'General configuration parameters',
          parameters: configParams,
        });
      }
    }

    return containers;
  }

  /**
   * Parse source modules from directory
   */
  private async parseSourceModules(
    dirPath: string,
    category: BswModule['category']
  ): Promise<BswModule[]> {
    const modules: BswModule[] = [];

    if (!fs.existsSync(dirPath)) {
      return modules;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const moduleName = entry.name.charAt(0).toUpperCase() + entry.name.slice(1).toLowerCase();

        // Skip if not in include list (if specified)
        if (
          this.options.includeModules?.length &&
          !this.options.includeModules.includes(moduleName)
        ) {
          continue;
        }

        // Skip if in exclude list
        if (this.options.excludeModules?.includes(moduleName)) {
          continue;
        }

        const module: BswModule = {
          name: moduleName,
          moduleDef: `AUTOSAR/EcucDefs/${moduleName}`,
          description: `${moduleName} module - ${category} layer`,
          category,
          version: '1.0.0',
          dependencies: [],
          containers: await this.parseModuleContainers(path.join(dirPath, entry.name)),
        };

        modules.push(module);
      }
    }

    return modules;
  }

  /**
   * Parse module containers from source directory
   */
  private async parseModuleContainers(modulePath: string): Promise<ModuleContainer[]> {
    const containers: ModuleContainer[] = [];

    // Look for config headers
    const configFiles = [
      path.join(modulePath, 'include', `${path.basename(modulePath)}_Cfg.h`),
      path.join(modulePath, 'config', `${path.basename(modulePath)}_Cfg.h`),
      path.join(modulePath, `${path.basename(modulePath)}_Cfg.h`),
    ];

    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        const container = await this.parseConfigHeader(configFile);
        if (container) {
          containers.push(container);
        }
      }
    }

    return containers;
  }

  /**
   * Parse C header file for configuration
   */
  private async parseConfigHeader(filePath: string): Promise<ModuleContainer | null> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parameters: ModuleParameter[] = [];

    // Parse #define macros for configuration
    const defineRegex = /#define\s+(\w+)\s+(\w+)/g;
    let match;

    while ((match = defineRegex.exec(content)) !== null) {
      const name = match[1];
      const value = match[2];

      // Skip include guards and internal macros
      if (name.endsWith('_H') || name.includes('_INTERNAL_')) {
        continue;
      }

      // Determine type from value
      let type: ParameterDataType = 'STRING';
      if (value === 'true' || value === 'false' || value === 'TRUE' || value === 'FALSE') {
        type = 'BOOLEAN';
      } else if (/^\d+$/.test(value)) {
        type = 'INTEGER';
      } else if (/^\d+\.\d+$/.test(value)) {
        type = 'FLOAT';
      } else if (value.startsWith('0x')) {
        type = 'INTEGER';
      }

      parameters.push({
        name,
        value:
          type === 'BOOLEAN'
            ? value.toLowerCase() === 'true'
            : type === 'INTEGER'
              ? parseInt(value, value.startsWith('0x') ? 16 : 10)
              : type === 'FLOAT'
                ? parseFloat(value)
                : value,
        type,
        definition: `#define ${name}`,
        description: `Configuration parameter ${name}`,
      });
    }

    if (parameters.length === 0) {
      return null;
    }

    return {
      name: 'Config',
      definition: `${path.basename(filePath, '.h')}`,
      description: `Configuration from ${path.basename(filePath)}`,
      parameters,
    };
  }

  /**
   * Parse OS configuration
   */
  private async parseOsConfig(): Promise<OsConfig | undefined> {
    const osConfigPath = path.join(
      this.options.yuleASRPath,
      'tools/yule-configurator/os/example_os_config.json'
    );

    if (!fs.existsSync(osConfigPath)) {
      this.warnings.push(`OS config not found: ${osConfigPath}`);
      return undefined;
    }

    try {
      const content = fs.readFileSync(osConfigPath, 'utf-8');
      const data = JSON.parse(content);

      return {
        name: data.os?.name || 'YuleOS',
        version: data.os?.version || '1.0.0',
        status: data.os?.status || 'STANDARD',
        tasks: (data.tasks || []).map(
          (t: any): OsTask => ({
            name: t.name,
            priority: t.priority,
            activation: t.activation,
            autostart: t.autostart,
            schedule: t.schedule,
            events: t.events,
          })
        ),
        alarms: (data.alarms || []).map(
          (a: any): OsAlarm => ({
            name: a.name,
            counter: a.counter,
            action: a.action,
            task: a.task,
            autostart: a.autostart,
            period: a.period,
          })
        ),
        resources: (data.resources || []).map(
          (r: any): OsResource => ({
            name: r.name,
            priorityCeiling: r.priority_ceiling,
          })
        ),
        events: (data.events || []).map(
          (e: any): OsEvent => ({
            name: e.name,
            mask: e.mask,
          })
        ),
        scheduleTables: data.schedule_tables || [],
      };
    } catch (error) {
      this.warnings.push(`Failed to parse OS config: ${error}`);
      return undefined;
    }
  }

  /**
   * Parse module dependencies from toolchain spec
   */
  private async parseModuleDependencies(): Promise<ModuleDependency[]> {
    const dependencies: ModuleDependency[] = [];
    const specPath = path.join(this.options.yuleASRPath, 'openspec/specs/toolchain/spec.md');

    if (!fs.existsSync(specPath)) {
      return dependencies;
    }

    const content = fs.readFileSync(specPath, 'utf-8');

    // Parse module dependencies from YAML block
    const yamlMatch = content.match(/```yaml\n(modules:[^`]+)```/);
    if (yamlMatch) {
      const yamlContent = yamlMatch[1];
      const lines = yamlContent.split('\n');

      let currentModule: ModuleDependency | null = null;

      for (const line of lines) {
        const moduleMatch = line.match(/^\s+- name:\s*(\w+)/);
        if (moduleMatch) {
          if (currentModule) {
            dependencies.push(currentModule);
          }
          currentModule = {
            module: moduleMatch[1],
            requiredBy: [],
            requires: [],
          };
        }

        const depsMatch = line.match(/^\s+dependencies:\s*\[(.*?)\]/);
        if (depsMatch && currentModule) {
          currentModule.requires = depsMatch[1]
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0);
        }
      }

      if (currentModule) {
        dependencies.push(currentModule);
      }
    }

    // Calculate requiredBy
    for (const dep of dependencies) {
      for (const otherDep of dependencies) {
        if (otherDep.requires.includes(dep.module)) {
          dep.requiredBy.push(otherDep.module);
        }
      }
    }

    return dependencies;
  }

  /**
   * Parse ARXML configuration files
   */
  private async parseArxmlConfigs(): Promise<BswModule[]> {
    const modules: BswModule[] = [];
    const arxmlDir = path.join(this.options.yuleASRPath, 'tools/arxml-tool/examples');

    if (!fs.existsSync(arxmlDir)) {
      return modules;
    }

    const jsonFiles = fs.readdirSync(arxmlDir).filter(f => f.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
      try {
        const content = fs.readFileSync(path.join(arxmlDir, jsonFile), 'utf-8');
        const data = JSON.parse(content);

        if (data.name && data.containers) {
          const category = this.inferCategory(data.name);

          const module: BswModule = {
            name: data.name,
            moduleDef: data.module_def || `AUTOSAR/EcucDefs/${data.name}`,
            description: data.description || `${data.name} configuration`,
            category,
            version: '1.0.0',
            dependencies: [],
            containers: data.containers.map(
              (c: any): ModuleContainer => ({
                name: c.name,
                definition: c.definition,
                description: c.description,
                parameters: (c.parameters || []).map(
                  (p: any): ModuleParameter => ({
                    name: p.name,
                    value: this.parseValue(p.value, p.type),
                    type: p.type,
                    definition: p.definition,
                    description: p.description,
                  })
                ),
              })
            ),
          };

          modules.push(module);
        }
      } catch (error) {
        this.warnings.push(`Failed to parse ${jsonFile}: ${error}`);
      }
    }

    return modules;
  }

  /**
   * Infer module category from name
   */
  private inferCategory(name: string): BswModule['category'] {
    const mcalModules = [
      'Mcu',
      'Port',
      'Dio',
      'Can',
      'Spi',
      'Gpt',
      'Pwm',
      'Adc',
      'Wdg',
      'Icu',
      'Lin',
      'Flash',
    ];
    const ecualModules = [
      'CanIf',
      'IoHwAb',
      'CanTp',
      'EthIf',
      'MemIf',
      'Fee',
      'Ea',
      'FrIf',
      'LinIf',
    ];
    const integrationModules = ['BswM', 'EcuM'];

    if (mcalModules.includes(name)) return 'MCAL';
    if (ecualModules.includes(name)) return 'ECUAL';
    if (integrationModules.includes(name)) return 'INTEGRATION';
    return 'SERVICE';
  }

  /**
   * Parse parameter value based on type
   */
  private parseValue(value: string, type: string): ParameterValue {
    switch (type) {
      case 'BOOLEAN':
        return value.toLowerCase() === 'true';
      case 'INTEGER':
        return parseInt(value, value.startsWith('0x') ? 16 : 10);
      case 'FLOAT':
        return parseFloat(value);
      default:
        return value;
    }
  }

  /**
   * Merge ARXML modules with spec modules
   */
  private mergeModules(specModules: BswModule[], arxmlModules: BswModule[]): void {
    for (const arxmlModule of arxmlModules) {
      const existingIndex = specModules.findIndex(m => m.name === arxmlModule.name);
      if (existingIndex >= 0) {
        // Merge containers
        specModules[existingIndex].containers.push(...arxmlModule.containers);
      } else {
        specModules.push(arxmlModule);
      }
    }
  }

  /**
   * Extract a section from markdown
   */
  private extractSection(content: string, startMarker: string, endMarker: string): string | null {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return null;

    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex === -1) {
      return content.substring(startIndex);
    }

    return content.substring(startIndex, endIndex);
  }

  /**
   * Convert a module to JSON Schema
   */
  static moduleToJsonSchema(module: BswModule): ModuleJsonSchema {
    const properties: Record<string, JsonSchemaProperty> = {
      name: {
        type: 'string',
        description: 'Module name',
        default: module.name,
      },
      version: {
        type: 'string',
        description: 'Module version',
        default: module.version,
      },
      enabled: {
        type: 'boolean',
        description: 'Enable this module',
        default: true,
      },
    };

    // Add container parameters
    for (const container of module.containers) {
      const containerProps: Record<string, JsonSchemaProperty> = {};

      for (const param of container.parameters) {
        const prop: JsonSchemaProperty = {
          type: SchemaParser.mapTypeToJsonSchema(param.type),
          description: param.description,
        };

        if (param.enumValues) {
          prop.enum = param.enumValues;
        }
        if (param.min !== undefined) {
          prop.minimum = param.min;
        }
        if (param.max !== undefined) {
          prop.maximum = param.max;
        }

        containerProps[param.name] = prop;
      }

      properties[container.name] = {
        type: 'object',
        description: container.description,
        properties: containerProps,
      };
    }

    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: `https://yuletech.cn/schemas/bsw/${module.name.toLowerCase()}.json`,
      title: `${module.name} Configuration`,
      description: module.description,
      type: 'object',
      properties,
      required: ['name', 'enabled'],
    };
  }

  /**
   * Map parameter type to JSON Schema type
   */
  private static mapTypeToJsonSchema(type: ParameterDataType): string {
    switch (type) {
      case 'BOOLEAN':
        return 'boolean';
      case 'INTEGER':
        return 'integer';
      case 'FLOAT':
        return 'number';
      case 'ARRAY':
        return 'array';
      default:
        return 'string';
    }
  }
}

/**
 * Create a schema parser with default options
 */
export function createSchemaParser(yuleASRPath: string): SchemaParser {
  return new SchemaParser({
    yuleASRPath,
    includeOs: true,
  });
}
