/**
 * Dependency Validator for yuleASR Configurator
 * Validates module dependencies and configuration consistency
 * Similar to Vector Configurator's validation engine
 */

import type {
  ConfigFile,
  ConfigModule,
  ModuleDependency,
  ValidationResult,
  ValidationIssue,
} from '@/types/config';

export class DependencyValidator {
  private config: ConfigFile;
  private issues: ValidationIssue[] = [];
  private issueIdCounter = 0;

  constructor(config: ConfigFile) {
    this.config = config;
    this.issues = [];
    this.issueIdCounter = 0;
  }

  /**
   * Run full validation on the configuration
   */
  validate(): ValidationResult {
    this.issues = [];

    // 1. Validate module dependencies
    this.validateModuleDependencies();

    // 2. Validate OS configuration
    this.validateOSConfiguration();

    // 3. Validate parameter constraints
    this.validateParameterConstraints();

    // 4. Validate cross-module references
    this.validateCrossModuleReferences();

    // 5. Validate RTE consistency
    this.validateRTEConsistency();

    return {
      valid: !this.issues.some(i => i.severity === 'error'),
      errors: this.issues.filter(i => i.severity === 'error'),
      warnings: this.issues.filter(i => i.severity === 'warning'),
      info: this.issues.filter(i => i.severity === 'info'),
    };
  }

  /**
   * Validate module dependencies
   * - Hard dependencies must be enabled
   * - Optional dependencies should be warned if not enabled
   */
  private validateModuleDependencies(): void {
    const enabledModules = new Set(this.config.modules.filter(m => m.enabled).map(m => m.name));

    for (const module of this.config.modules) {
      if (!module.enabled) continue;

      for (const dep of module.dependencies) {
        const depEnabled = enabledModules.has(dep.module);

        if (dep.required && !depEnabled) {
          this.addIssue({
            path: `${module.name}.dependencies`,
            message: `Module "${module.name}" requires "${dep.module}" which is not enabled`,
            severity: 'error',
            module: module.name,
            dependencySource: module.name,
            dependencyTarget: dep.module,
            suggestion: dep.autoEnable
              ? `Enable ${dep.module} automatically`
              : `Enable ${dep.module} module`,
          });
        } else if (!dep.required && !depEnabled) {
          this.addIssue({
            path: `${module.name}.dependencies`,
            message: `Optional dependency "${dep.module}" for "${module.name}" is not enabled`,
            severity: 'info',
            module: module.name,
            dependencySource: module.name,
            dependencyTarget: dep.module,
          });
        }
      }
    }
  }

  /**
   * Validate OS configuration
   * - Task priorities must be unique
   * - ISR vectors must not conflict
   * - Resource ceiling priorities
   */
  private validateOSConfiguration(): void {
    if (!this.config.os || !this.config.os.enabled) return;

    const os = this.config.os;

    // Check for duplicate task priorities
    const priorityMap = new Map<number, string[]>();
    for (const task of os.tasks) {
      const existing = priorityMap.get(task.priority) || [];
      existing.push(task.name);
      priorityMap.set(task.priority, existing);
    }

    for (const [priority, tasks] of priorityMap) {
      if (tasks.length > 1) {
        this.addIssue({
          path: `OS.Tasks`,
          message: `Duplicate task priority ${priority}: ${tasks.join(', ')}`,
          severity: 'error',
          module: 'OS',
          suggestion: 'Assign unique priorities to tasks',
        });
      }
    }

    // Check ISR vector conflicts
    const vectorMap = new Map<number | string, string[]>();
    for (const isr of os.isrs) {
      const existing = vectorMap.get(isr.vector) || [];
      existing.push(isr.name);
      vectorMap.set(isr.vector, existing);
    }

    for (const [vector, isrs] of vectorMap) {
      if (isrs.length > 1) {
        this.addIssue({
          path: `OS.ISRs`,
          message: `ISR vector ${vector} conflict: ${isrs.join(', ')}`,
          severity: 'error',
          module: 'OS',
          suggestion: 'Assign unique vectors to ISRs',
        });
      }
    }

    // Check alarm counters exist
    const counterNames = new Set(os.counters.map(c => c.name));
    for (const alarm of os.alarms) {
      if (!counterNames.has(alarm.counter)) {
        this.addIssue({
          path: `OS.Alarms.${alarm.name}`,
          message: `Alarm "${alarm.name}" references non-existent counter "${alarm.counter}"`,
          severity: 'error',
          module: 'OS',
          suggestion: `Create counter "${alarm.counter}" or update alarm reference`,
        });
      }
    }
  }

  /**
   * Validate parameter constraints
   * - Min/max values
   * - Required parameters
   * - Enum values
   */
  private validateParameterConstraints(): void {
    for (const module of this.config.modules) {
      if (!module.enabled) continue;

      // Validate module-level parameters
      for (const param of module.parameters) {
        this.validateParameter(param, module.name);
      }

      // Validate container parameters (including dynamic instances)
      for (const container of module.containers) {
        this.validateContainer(container, module.name);
      }
    }
  }

  /**
   * Validate a single parameter
   */
  private validateParameter(
    param: any,
    moduleName: string,
    containerPath?: string,
    instanceName?: string
  ): void {
    const path = containerPath
      ? `${moduleName}.${containerPath}.${param.name}`
      : `${moduleName}.${param.name}`;

    // Check required
    if (param.validation?.required && (param.value === undefined || param.value === '')) {
      this.addIssue({
        path,
        message: `Parameter "${param.name}" is required`,
        severity: 'error',
        module: moduleName,
        parameter: param.name,
      });
    }

    // Check min/max for numbers
    if (param.type === 'integer' || param.type === 'float') {
      const val = param.value as number;
      if (param.min !== undefined && val < param.min) {
        this.addIssue({
          path,
          message: `Value ${val} is below minimum ${param.min}`,
          severity: 'error',
          module: moduleName,
          parameter: param.name,
          suggestion: `Set value to at least ${param.min}`,
        });
      }
      if (param.max !== undefined && val > param.max) {
        this.addIssue({
          path,
          message: `Value ${val} exceeds maximum ${param.max}`,
          severity: 'error',
          module: moduleName,
          parameter: param.name,
          suggestion: `Set value to at most ${param.max}`,
        });
      }
    }

    // Check enum values
    if (param.type === 'enum' && param.options) {
      const validValues = param.options.map(
        (o: { value: string | number; label: string } | string) =>
          typeof o === 'string' ? o : o.value
      );
      const paramValue = String(param.value);
      if (!validValues.map(String).includes(paramValue)) {
        this.addIssue({
          path,
          message: `Invalid enum value "${param.value}"`,
          severity: 'error',
          module: moduleName,
          parameter: param.name,
          suggestion: `Valid values: ${validValues.join(', ')}`,
        });
      }
    }
  }

  /**
   * Validate container and its sub-containers recursively
   */
  private validateContainer(container: any, moduleName: string, parentPath?: string): void {
    const containerPath = parentPath ? `${parentPath}.${container.name}` : container.name;

    // Validate container parameters
    for (const param of container.parameters || []) {
      this.validateParameter(param, moduleName, containerPath);
    }

    // Validate sub-containers
    for (const sub of container.subContainers || []) {
      this.validateContainer(sub, moduleName, containerPath);
    }

    // Check instance count for multiple containers
    if (container.multiple) {
      const instanceCount = container.subContainers?.length || 0;
      if (container.minInstances !== undefined && instanceCount < container.minInstances) {
        this.addIssue({
          path: `${moduleName}.${containerPath}`,
          message: `Container "${container.name}" requires at least ${container.minInstances} instances, found ${instanceCount}`,
          severity: 'error',
          module: moduleName,
          container: container.name,
        });
      }
      if (container.maxInstances !== undefined && instanceCount > container.maxInstances) {
        this.addIssue({
          path: `${moduleName}.${containerPath}`,
          message: `Container "${container.name}" allows at most ${container.maxInstances} instances, found ${instanceCount}`,
          severity: 'error',
          module: moduleName,
          container: container.name,
        });
      }
    }
  }

  /**
   * Validate cross-module references
   * - Parameters referencing other modules
   */
  private validateCrossModuleReferences(): void {
    // AUTOSAR implicit dependency rules
    const dependencyRules: Array<{
      module: string;
      requires: string;
      severity: 'error' | 'warning' | 'info';
    }> = [
      { module: 'Can', requires: 'CanTrcv', severity: 'error' },
      { module: 'CanTp', requires: 'Can', severity: 'error' },
      { module: 'CanNm', requires: 'Can', severity: 'error' },
      { module: 'CanSM', requires: 'Can', severity: 'error' },
      { module: 'CanSM', requires: 'CanNm', severity: 'error' },
      { module: 'Dcm', requires: 'CanTp', severity: 'warning' },
      { module: 'NvM', requires: 'Fee', severity: 'warning' },
      { module: 'NvM', requires: 'Fls', severity: 'warning' },
      { module: 'EcuM', requires: 'Mcu', severity: 'warning' },
      { module: 'Csm', requires: 'Crypto', severity: 'warning' },
      { module: 'Csm', requires: 'CryIf', severity: 'warning' },
      { module: 'Crypto', requires: 'CryIf', severity: 'error' },
      { module: 'CanIf', requires: 'Can', severity: 'error' },
      { module: 'PduR', requires: 'Can', severity: 'info' },
    ];

    const moduleMap = new Map(this.config.modules.map(m => [m.name, m]));

    for (const rule of dependencyRules) {
      const srcModule = moduleMap.get(rule.module);
      const tgtModule = moduleMap.get(rule.requires);

      if (!srcModule || !srcModule.enabled) continue;
      if (tgtModule && tgtModule.enabled) continue;

      this.addIssue({
        path: `${rule.module}.dependencies`,
        message: tgtModule
          ? `"${rule.module}" requires "${rule.requires}" which is not enabled`
          : `"${rule.module}" requires "${rule.requires}" which is not in the configuration`,
        severity: rule.severity,
        module: rule.module,
        suggestion: `Enable "${rule.requires}" module`,
      });
    }
  }

  /**
   * Validate RTE consistency
   * - Sender-Receiver interfaces
   * - Client-Server interfaces
   */
  private validateRTEConsistency(): void {
    const rteModule = this.config.modules.find(m => m.layer === 'RTE');
    if (!rteModule || !rteModule.enabled) return;

    // Validate that all referenced interfaces exist
    // Validate port connections
  }

  /**
   * Get list of modules that should be auto-enabled
   */
  getAutoEnableSuggestions(): Array<{ source: string; target: string }> {
    const enabledModules = new Set(this.config.modules.filter(m => m.enabled).map(m => m.name));
    const suggestions: Array<{ source: string; target: string }> = [];

    for (const module of this.config.modules) {
      if (!module.enabled) continue;

      for (const dep of module.dependencies) {
        if (dep.required && !enabledModules.has(dep.module) && dep.autoEnable) {
          suggestions.push({ source: module.name, target: dep.module });
        }
      }
    }

    return suggestions;
  }

  /**
   * Add a validation issue
   */
  private addIssue(issue: Omit<ValidationIssue, 'id'>): void {
    this.issues.push({
      ...issue,
      id: `issue-${++this.issueIdCounter}`,
    });
  }

  /**
   * Static validation method for convenience
   */
  static validate(config: ConfigFile): ValidationResult {
    const validator = new DependencyValidator(config);
    return validator.validate();
  }
}

export default DependencyValidator;
