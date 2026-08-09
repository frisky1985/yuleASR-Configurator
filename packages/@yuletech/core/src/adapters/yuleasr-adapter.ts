/**
 * yuleASR Adapter
 * 将 yuleASR 配置格式与 yuleASR-Configurator 内部模型互转换
 * 支持: config/bsw_config.json 格式, ARXML 格式
 */

import type { ModuleConfig } from '../types';

import { ParseError } from '../arxml-errors';
import { parseArxml, validateArxml } from './arxml-parser';

/**
 * yuleASR 模块配置结构
 */
export interface YuleasrModuleConfig {
  name: string;
  enabled: boolean;
  version: string;
  parameters: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * yuleASR BSW 配置根结构
 */
export interface YuleasrBswConfig {
  version: string;
  modules: Record<string, YuleasrModuleConfig>;
}

/**
 * yuleASR 配置适配器
 */
export class YuleasrAdapter {
  private configVersion = '1.0.0';

  /**
   * 从 yuleASR JSON 导入配置
   */
  importFromYuleasr(jsonConfig: string): ModuleConfig[] {
    const bswConfig: YuleasrBswConfig = JSON.parse(jsonConfig);
    const modules: ModuleConfig[] = [];

    for (const [moduleName, moduleData] of Object.entries(bswConfig.modules)) {
      const moduleConfig = this.convertYuleasrModule(moduleName, moduleData);
      modules.push(moduleConfig);
    }

    return modules;
  }

  /**
   * 导出为 yuleASR JSON 配置
   */
  exportToYuleasr(modules: ModuleConfig[]): string {
    const bswConfig: YuleasrBswConfig = {
      version: this.configVersion,
      modules: {},
    };

    for (const module of modules) {
      bswConfig.modules[module.module] = this.convertToYuleasrModule(module);
    }

    return JSON.stringify(bswConfig, null, 2);
  }

  /**
   * 转换 yuleASR 模块配置为内部模型
   */
  private convertYuleasrModule(
    moduleName: string,
    yuleasrModule: YuleasrModuleConfig
  ): ModuleConfig {
    const parameters: Record<string, unknown> = {};

    // 转换基础参数
    for (const [key, value] of Object.entries(yuleasrModule.parameters || {})) {
      parameters[key] = value;
    }

    // 复制所有其他属性到 parameters（排除标准字段）
    const standardKeys = new Set(['name', 'enabled', 'version', 'parameters']);
    for (const [key, value] of Object.entries(yuleasrModule)) {
      if (!standardKeys.has(key)) {
        parameters[key] = value;
      }
    }

    return {
      module: moduleName,
      version: yuleasrModule.version || '1.0.0',
      parameters,
    };
  }

  /**
   * 转换内部模型为 yuleASR 模块配置
   */
  private convertToYuleasrModule(module: ModuleConfig): YuleasrModuleConfig {
    const yuleasrModule: YuleasrModuleConfig = {
      name: module.module,
      enabled: true,
      version: module.version || '1.0.0',
      parameters: {},
    };

    // 转换参数
    for (const [key, value] of Object.entries(module.parameters)) {
      yuleasrModule.parameters[key] = value;

      // 处理特殊字段
      if (key === 'clock_frequency') {
        yuleasrModule.clock_frequency = value as number;
      }
      if (key === 'core_count') {
        yuleasrModule.core_count = value as number;
      }
      if (key === 'baudrate') {
        yuleasrModule.baudrate = value as number;
      }
      if (key === 'controller_count') {
        yuleasrModule.controller_count = value as number;
      }
    }

    return yuleasrModule;
  }

  /**
   * 验证配置是否符合 yuleASR 格式
   */
  validateYuleasrConfig(jsonConfig: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const config = JSON.parse(jsonConfig) as YuleasrBswConfig;

      if (!config.version || typeof config.version !== 'string' || config.version.trim() === '') {
        errors.push('Missing or invalid field: version');
      }

      if (
        !config.modules ||
        typeof config.modules !== 'object' ||
        Object.keys(config.modules).length === 0
      ) {
        errors.push('Missing or invalid field: modules');
      }

      for (const [moduleName, moduleData] of Object.entries(config.modules || {})) {
        if (!moduleData.name) {
          errors.push(`Module ${moduleName}: missing name`);
        }
      }
    } catch (error) {
      errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 从 ARXML 导入配置
   *
   * Fix 18: core 解析器统一为 fast-xml-parser 版（parseArxml 返回 ParsedModuleDef[]），
   * 这里把结构化解析结果转换为内部 ModuleConfig[]（扁平 parameters，保持旧 DOMParser 版语义）。
   */
  importFromArxml(arxmlContent: string): ModuleConfig[] {
    const result = parseArxml(arxmlContent);

    if (result.errors.length > 0) {
      throw new ParseError(`ARXML parse failed: ${result.errors.join(', ')}`);
    }

    return result.modules.map(mod => ({
      module: mod.shortName,
      version: extractVersion(mod.definitionRef) || '4.4.0',
      parameters: flattenModuleParams(mod),
    }));
  }

  /**
   * 验证 ARXML 格式
   */
  validateArxmlConfig(arxmlContent: string): { valid: boolean; errors: string[] } {
    return validateArxml(arxmlContent);
  }
}

// 导出适配器实例
export const yuleasrAdapter = new YuleasrAdapter();

/**
 * 从模块 DEFINITION-REF 提取版本号 (e.g. "/Ep/4.4.0/Mcu" → "4.4.0")。
 * Fix 18: 保持旧 DOMParser 版语义。
 */
function extractVersion(defRef: string): string | null {
  const match = defRef.match(/\/Ep\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * 把 ParsedModuleDef 的参数扁平化为 Record<string, unknown>（模块级 + 容器级递归），
 * 值做 JS 类型强转（true/false/number/string）。Fix 18: 保持旧 DOMParser 版语义。
 */
function flattenModuleParams(mod: {
  shortName: string;
  parameters: Array<{ shortName: string; definitionRef: string; value: string }>;
  containers: Array<{
    parameters: Array<{ shortName: string; definitionRef: string; value: string }>;
    subContainers: Array<{
      parameters: Array<{ shortName: string; definitionRef: string; value: string }>;
      subContainers: unknown[];
    }>;
  }>;
}): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  const collect = (
    params: Array<{ shortName: string; definitionRef: string; value: string }>
  ): void => {
    for (const p of params) {
      const key = p.shortName || p.definitionRef.split('/').pop() || p.definitionRef;
      let value: unknown = p.value;
      if (p.value === 'true') value = true;
      else if (p.value === 'false') value = false;
      else if (p.value !== '' && !isNaN(Number(p.value))) value = Number(p.value);
      record[key] = value;
    }
  };

  const walkContainers = (containers: unknown[]): void => {
    for (const c of containers as Array<{
      parameters: Array<{ shortName: string; definitionRef: string; value: string }>;
      subContainers: unknown[];
    }>) {
      collect(c.parameters);
      walkContainers(c.subContainers);
    }
  };

  collect(mod.parameters);
  walkContainers(mod.containers);
  return record;
}

export default YuleasrAdapter;
