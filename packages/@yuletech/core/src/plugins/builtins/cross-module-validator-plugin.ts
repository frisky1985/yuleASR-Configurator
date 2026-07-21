import type { YulePlugin, PluginContext, ValidationResult } from '@yuletech/plugin-sdk';
import type { ModuleConfig, ValidationError, ModuleSchema } from '../../types';
import { validateAll } from '../../validators/validation-pipeline';
import { schemaCache } from '../../schema';

const pluginId = 'yuletech-validator-cross-module';

function toValidationResult(err: ValidationError): ValidationResult {
  const parts = err.path.split('.');
  return {
    module: parts[0] || 'system',
    severity: err.severity,
    message: err.message,
    param: err.path,
  };
}

const crossModuleValidatorPlugin: YulePlugin = {
  id: pluginId,
  name: 'Cross-Module Validator',
  version: '1.0.0',
  type: 'validator',
  description: '校验 AUTOSAR 模块间依赖约束（Can↔CanTrcv、Com↔PduR 等跨模块参数一致性）',
  author: 'YuleTech',

  async activate(context: PluginContext): Promise<void> {
    context.registerValidator({
      name: 'CrossModuleValidator',
      description: 'Cross-module reference constraint validation',
      targetModules: ['*'],

      async validate(config: Record<string, unknown>): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];
        const modules = (config.modules as Record<string, unknown>) ?? {};

        try {
          const configs: ModuleConfig[] = Object.entries(modules).map(
            ([module, data]) => ({
              module,
              version: ((data as Record<string, unknown>)?.version as string) ?? '4.4.0',
              parameters:
                ((data as Record<string, unknown>)?.parameters as Record<string, unknown>) ?? {},
            })
          );

          // Read schemas from the global schema cache
          const schemas: ModuleSchema[] = [];
          for (const [, schema] of schemaCache.getAll()) {
            schemas.push(schema as unknown as ModuleSchema);
          }

          const pipelineResult = validateAll(configs, schemas);

          for (const err of pipelineResult.allErrors) {
            results.push(toValidationResult(err));
          }
        } catch (e) {
          results.push({
            module: 'system',
            severity: 'warning',
            message: `Validation error: ${(e as Error).message}`,
          });
        }

        return results;
      },
    });

    context.logger.info('Cross-Module Validator plugin activated');
  },

  async deactivate(): Promise<void> {
    // No cleanup needed
  },
};

export default crossModuleValidatorPlugin;
