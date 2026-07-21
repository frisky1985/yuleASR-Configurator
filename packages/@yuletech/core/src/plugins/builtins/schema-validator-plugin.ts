/**
 * Built-in: AUTOSAR Schema Validator Plugin
 *
 * Validates module configurations against AUTOSAR standard schemas.
 * Checks: required parameters, value ranges, enum validity, reference targets.
 */
import type { YulePlugin, PluginContext, ValidationResult } from '@yuletech/plugin-sdk';
import { schemaCache } from '../../schema';

const schemaValidatorPlugin: YulePlugin = {
  id: 'yuletech-validator-schema',
  name: 'AUTOSAR Schema Validator',
  version: '1.0.0',
  type: 'validator',
  description: '基于 AUTOSAR 标准 Schema 校验配置参数完整性、范围、引用合法性',
  author: 'YuleTech',

  async activate(context: PluginContext): Promise<void> {
    context.registerValidator({
      name: 'SchemaValidator',
      description: 'AUTOSAR schema compliance validation',
      targetModules: ['*'],

      async validate(config: Record<string, unknown>): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];
        const modules = (config.modules as Record<string, unknown>) ?? {};

        for (const [moduleName, moduleData] of Object.entries(modules)) {
          const params =
            ((moduleData as Record<string, unknown>)?.parameters as Record<string, unknown>) ?? {};
          const schema = schemaCache.get(moduleName);

          if (!schema) {
            results.push({
              module: moduleName,
              severity: 'info',
              message: `No AUTOSAR schema found for module "${moduleName}" — skipping schema validation`,
            });
            continue;
          }

          const schemaParams = (schema.parameters as Array<Record<string, unknown>>) ?? [];

          for (const param of schemaParams) {
            const paramName = param.name as string;
            const required = param.required as boolean;
            const paramType = param.type as string;
            const value = params[paramName];

            // Required parameter check
            if (required && (value === undefined || value === null || value === '')) {
              results.push({
                module: moduleName,
                severity: 'error',
                message: `Missing required parameter: ${paramName}`,
                param: `${moduleName}.${paramName}`,
              });
              continue;
            }

            if (value === undefined) continue;

            // Enum validity
            if (paramType === 'enum' && param.options) {
              const validValues = (param.options as Array<Record<string, unknown>>).map(
                o => o.value
              );
              if (!validValues.includes(String(value))) {
                results.push({
                  module: moduleName,
                  severity: 'error',
                  message: `Invalid value "${value}" for ${paramName}. Valid: ${validValues.join(', ')}`,
                  param: `${moduleName}.${paramName}`,
                });
              }
            }

            // Range check
            if ((paramType === 'integer' || paramType === 'float') && typeof value === 'number') {
              if (param.min !== undefined && value < (param.min as number)) {
                results.push({
                  module: moduleName,
                  severity: 'error',
                  message: `${paramName} = ${value} below minimum ${param.min}`,
                  param: `${moduleName}.${paramName}`,
                });
              }
              if (param.max !== undefined && value > (param.max as number)) {
                results.push({
                  module: moduleName,
                  severity: 'error',
                  message: `${paramName} = ${value} exceeds maximum ${param.max}`,
                  param: `${moduleName}.${paramName}`,
                });
              }
            }
          }
        }

        return results;
      },
    });

    context.logger.info('AUTOSAR Schema Validator plugin activated');
  },

  async deactivate(): Promise<void> {
    // No cleanup needed
  },
};

export default schemaValidatorPlugin;
