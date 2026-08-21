/**
 * @yuletech/core - Ecuc Code Generator
 * AutoSAR Ecuc 配置 C 代码生成器（正式发布路径）
 *
 * 生成 Ecuc_<Module>.c 和 Ecuc_<Module>.h 完整代码文件，遵循 AutoSAR Ecuc
 * 规范标准 4.4。与 web 层宏头生成器分工（互补而非替代）：
 * - EcucCodeGenerator（本文件，core 层）：按 ModuleConfig/ModuleSchema 生成
 *   模块完整 C 代码（参数、容器、实例 + 插件生成器委托），供集成/构建使用
 * - web 层宏头生成器（apps/yuleasr-web/src/services/codegen.ts）：schema 驱动
 *   生成宏头 Cfg.h（generateHeadersFromSchemas + editableToSchemas 编辑回写），
 *   供 Editor 配置预览/导出
 * 两者各司其职；本生成器 API 为正式发布契约，变更遵循 SemVer。
 *
 * @file    ecuc-generator.ts
 * @brief   AUTOSAR ECUC Configuration Code Generator
 */

import { pluginRegistry } from '../plugins/plugin-registry';
import type { ModuleConfig, ModuleSchema, ContainerConfig, ContainerSchema } from '../types';

import {
  formatCValue,
  getCType,
  toHex,
  parseVersion,
  getModuleHeaderName,
  getModuleId,
  toGuardName,
  generateAutosarFileHeader,
  generateAutosarFunctionHeader,
  generateVersionInfoMacros,
  generateDetReportError,
  wrapDevErrorDetect,
  DetErrorCode,
  getCompilerAbstraction,
  CompilerAbstraction,
} from './autosar-format';

import type {
  CodeGenerator,
  GeneratorOptions,
  GenerationResult,
  GeneratedFile,
  CompilerType,
} from './index';

/** Logger for plugin delegation events */
function logPluginDelegation(
  moduleName: string,
  pluginGeneratorName: string,
  warning: string[]
): void {
  const msg = `[ecuc-generator] Delegating generation of "${moduleName}" to plugin generator "${pluginGeneratorName}"`;
  console.info(msg);
  warning.push(`使用插件生成器: ${pluginGeneratorName}`);
}

/**
 * Ecuc 代码生成器
 * 支持生成标准 Ecuc 配置结构 (参数、容器、实例)
 * 符合 AUTOSAR 4.4 BSW 模块代码生成标准
 *
 * 集成 yuleASR 桥接：对于已知 BSW 模块 (Can/Mcu/Port)，
 * 生成 yuleASR 驱动期望的 Xxx_Config 定义，桥接 ECUC ConfigSet 类型与驱动 flat 类型。
 */
export class EcucCodeGenerator implements CodeGenerator {
  name = 'EcucCodeGenerator';
  version = '1.0.0';
  supportedModules: string[] = ['*']; // 支持所有模块
  private compilerAbstraction: CompilerAbstraction = new (
    getCompilerAbstraction(undefined).constructor as new () => CompilerAbstraction
  )();

  supports(moduleName: string): boolean {
    return this.supportedModules.includes('*') || this.supportedModules.includes(moduleName);
  }

  async generate(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): Promise<GenerationResult> {
    // 设置编译器抽象层
    this.compilerAbstraction = getCompilerAbstraction(options.compiler);

    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // ── Plugin generator delegation check ──────────────────────
      // If a plugin code generator supports this module, delegate
      // generation entirely to the plugin and skip built-in generation.
      const pluginGen = pluginRegistry.findCodeGeneratorForModule(config.module);
      if (pluginGen) {
        logPluginDelegation(config.module, pluginGen.name, warnings);
        const pluginResult = await pluginGen.generate(
          config as unknown as Record<string, unknown>,
          options as unknown as Record<string, unknown>
        );
        return {
          success: true,
          files: pluginResult.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.h') ? 'h' : 'c',
          })),
          warnings,
        };
      }

      // 验证配置
      const validationResult = this.validateConfig(config, schema);
      if (!validationResult.valid) {
        errors.push(...validationResult.errors);
        if (options.generateComments) {
          warnings.push(...validationResult.warnings);
        }
      }

      // 生成头文件 (使用 Ecuc_ 前缀避免与 yuleASR 现有宏定义头文件冲突)
      const headerName = getModuleHeaderName(config.module);
      const headerFile = this.generateHeaderFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/${headerName}`,
        content: headerFile,
        language: 'h',
      });

      // 生成源文件 (含 yuleASR bridge 符号)
      const sourceFile = this.generateSourceFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/Ecuc_${config.module}.c`,
        content: sourceFile,
        language: 'c',
      });

      // 生成 PBcfg 文件 (Post-Build 配置)
      const pbcfgFile = this.generatePBcfgFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/Ecuc_${config.module}_PBcfg.c`,
        content: pbcfgFile,
        language: 'c',
      });

      // 生成 Lcfg 文件 (Link-Time 配置)
      const lcfgFile = this.generateLcfgFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/Ecuc_${config.module}_Lcfg.c`,
        content: lcfgFile,
        language: 'c',
      });

      // 生成 yuleASR 桥接文件 (ConfigType bridge) — 可选
      // 桥接代码已内联在 Ecuc_<Module>.c 中；如需独立的 bridge 文件，取消注释下行
      // 注：独立的 bridge 文件会使得 .c 文件能通过 `#include "Can.h"` 找到驱动类型
      // 而在内联方案中，Ecuc_Can.c 直接包含桥接定义（同样 #include "Can.h"）
      // const bridgeFile = this.generateBridgeFile(config, schema, options);
      // if (bridgeFile) files.push(bridgeFile);

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
        errors: [error instanceof Error ? error.message : '未知错误'],
      };
    }
  }

  /**
   * 验证配置
   * @brief Validates module configuration against schema definition
   */
  private validateConfig(
    config: ModuleConfig,
    schema: ModuleSchema
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const moduleId = getModuleId(config.module);
    const vendorId = 0x1234;

    // 检查模块名称
    if (!config.module || config.module.trim() === '') {
      errors.push('模块名称不能为空');
    }

    // 检查版本
    if (!config.version) {
      warnings.push('配置缺少版本信息');
    }

    // 验证必需参数
    for (const param of schema.parameters) {
      if (param.required) {
        const value = config.parameters[param.name];
        if (value === undefined || value === null) {
          errors.push(`必需参数缺失: ${param.name}`);
        }
      }
    }

    // 验证容器实例数量
    if (schema.containers) {
      for (const container of schema.containers) {
        const instances = config.containers?.[container.name] || [];
        if (container.minInstances !== undefined && instances.length < container.minInstances) {
          errors.push(`容器 ${container.name} 实例数量不足，需要至少 ${container.minInstances} 个`);
        }
        if (container.maxInstances !== undefined && instances.length > container.maxInstances) {
          errors.push(`容器 ${container.name} 实例数量超出限制，最多 ${container.maxInstances} 个`);
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * 生成头文件 <Module>_Cfg.h
   * @brief Generates the AUTOSAR 4.4 compliant module configuration header file
   */
  private generateHeaderFile(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    const headerName = getModuleHeaderName(moduleName);
    const guardName = toGuardName(headerName);
    const moduleId = getModuleId(moduleName);
    const vendorId = 0x1234; // Default vendor ID, configurable per module
    const version = parseVersion(config.version);

    // AUTOSAR 4.4 标准 Doxygen 文件头
    let content = generateAutosarFileHeader(
      headerName,
      moduleName,
      moduleId,
      vendorId,
      schema.description || `${schema.label || moduleName} Configuration Header`
    );

    content += `\
/*==================[preprocessor guards]====================================*/
#ifndef ${guardName}
#define ${guardName}

/*==================[includes]==============================================*/
#include "Std_Types.h"
#include "Ecuc.h"

`;

    // AUTOSAR 标准版本信息宏
    // 跳过 — 版本宏由手写驱动头文件(如 Can.h)定义，这里不重复生成避免冲突
    // 如需启用，取消下一行注释
    // content += generateVersionInfoMacros(moduleName, 4, 4, 0, 4, 4, 0);
    // 替代: 生成模块 ID 和供应商 ID 宏（不覆盖驱动头文件中的定义）
    content += `/*==================[module identification]==================================*/
`;
    content += `/** @brief ${moduleName} module identification (ECUC config data) */
`;
    content += `#ifndef ${moduleName.toUpperCase()}_MODULE_ID
`;
    content += `#define ${moduleName.toUpperCase()}_MODULE_ID            ((uint16)0x${toHex(moduleId)})
`;
    content += `#endif /* ${moduleName.toUpperCase()}_MODULE_ID */
`;
    content += `#ifndef ${moduleName.toUpperCase()}_VENDOR_ID
`;
    content += `#define ${moduleName.toUpperCase()}_VENDOR_ID            ((uint16)0x${toHex(vendorId)})
`;
    content += `#endif /* ${moduleName.toUpperCase()}_VENDOR_ID */

`;

    // 生成参数宏定义
    content += this.generateParameterMacros(config, schema, options);

    // 生成类型定义 (含子容器支持)
    content += this.generateTypeDefinitions(config, schema);

    // 生成 yuleASR 兼容类型别名
    content += this.generateYuleASRTypeAliases(config, schema);

    // 生成外部声明
    content += this.generateExternDeclarations(config, schema, options);

    // 文件尾部
    content += `\
#endif /* ${guardName} */

/*==================[end of file]===========================================*/
/**
 * @page ${moduleName.toLowerCase()}_cfg_page ${moduleName} Configuration
 * @brief This page documents the ${moduleName} module configuration parameters.
 *
 * @section ${moduleName.toLowerCase()}_cfg_overview Overview
 * This configuration header defines all compile-time configuration parameters
 * for the ${moduleName} AUTOSAR BSW module.
 *
 * @section ${moduleName.toLowerCase()}_cfg_usage Usage
 * Include this file in your ${moduleName} module implementation to access
 * the configured parameters.
 *
 * @section ${moduleName.toLowerCase()}_cfg_dependencies Dependencies
 * - Std_Types.h: AUTOSAR standard type definitions
 * - Ecuc.h: ECU Configuration base definitions
 */
`;

    return content;
  }

  /**
   * 生成 yuleASR 兼容类型别名
   * 对于已知 BSW 模块，在 ECUC 头文件中声明 yuleASR 驱动期望的类型别名。
   * 这样使用者可以 #include "Ecuc_Can_Cfg.h" 或 "Ecuc_Mcu_Cfg.h" 来同时获得 ECUC 类型
   * 和 yuleASR 兼容的类型定义。
   */
  private generateYuleASRTypeAliases(config: ModuleConfig, _schema: ModuleSchema): string {
    const moduleName = config.module;
    let content = '';

    // 只为已知集成模块生成类型别名 —— 保持向后兼容
    // 类型别名不定义在这里，而是包含驱动头文件并在 bridge 文件中定义符号

    return content;
  }

  /**
   * 判断是否为已知 yuleASR 桥接模块
   */
  private isBridgeModule(moduleName: string): boolean {
    return ['Can', 'Mcu', 'Port'].includes(moduleName);
  }

  /**
   * 生成源文件 Ecuc_<Module>.c
   * @brief Generates the AUTOSAR 4.4 compliant ECUC configuration source file
   *        包含 yuleASR 驱动期望的 flat 配置符号 (Can_Config / Mcu_Config / Port_Config)
   */
  private generateSourceFile(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    const headerName = getModuleHeaderName(moduleName);
    const moduleId = getModuleId(moduleName);
    const vendorId = 0x1234;

    // AUTOSAR 4.4 标准 Doxygen 文件头
    let content = generateAutosarFileHeader(
      `Ecuc_${moduleName}.c`,
      moduleName,
      moduleId,
      vendorId,
      `${schema.label || moduleName} ECU Configuration Source`
    );

    // 桥接模块额外包含驱动头文件以获取 flat 类型定义
    if (this.isBridgeModule(moduleName)) {
      const driverHeader = `${moduleName}.h`;
      content += `\
/*==================[includes]==============================================*/
#include "${headerName}"
#include "${driverHeader}"

`;
    } else {
      content += `\
/*==================[includes]==============================================*/
#include "${headerName}"

`;
    }

    // 生成模块信息结构
    content += this.generateModuleInfo(config, schema);

    // 桥接模块：直接生成 flat 配置结构（无 ConfigSet 嵌套）
    // 非桥接模块：生成标准 AUTOSAR ConfigSet 数据结构
    if (this.isBridgeModule(moduleName)) {
      // 用 MemMap 段标记包裹 flat 配置数据
      const bridgeContent = this.generateYuleASRBridgeDef(config, schema, options);
      content += this.wrapMemMapSection(moduleName, 'CONST_UNSPECIFIED', bridgeContent);
    } else {
      content += this.generateConfigData(config, schema, options);
    }

    // 生成常量定义
    content += this.generateConstants(config, schema, options);

    // 文件尾部
    content += `\
/*==================[end of file]===========================================*/
/**
 * End of Ecuc_${moduleName}.c
 */
`;

    return content;
  }

  /**
   * 生成 Post-Build 配置文件
   * @brief Generates the AUTOSAR post-build configuration source file
   */
  private generatePBcfgFile(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    const headerName = getModuleHeaderName(moduleName);
    const moduleId = getModuleId(moduleName);
    const vendorId = 0x1234;

    // AUTOSAR 4.4 标准 Doxygen 文件头
    let content = generateAutosarFileHeader(
      `Ecuc_${moduleName}_PBcfg.c`,
      moduleName,
      moduleId,
      vendorId,
      `${schema.label || moduleName} Post-Build Configuration`
    );

    content += `\
/*==================[includes]==============================================*/
#include "${headerName}"

`;

    if (options.generateComments) {
      content += `\
/*==================[post-build configuration]==============================*/
/**
 * @brief ${moduleName} Post-Build Configuration Data
 * @details This file contains configuration data that can be modified
 *          after the build process. Post-Build configuration allows
 *          parameter changes without recompilation.
 */
`;
    }

    // 生成 Post-Build 配置数据
    content += this.generatePostBuildConfig(config, schema, options);

    // 文件尾部
    content += `\
/*==================[end of file]===========================================*/
/**
 * End of Ecuc_${moduleName}_PBcfg.c
 */
`;

    return content;
  }

  /**
   * 生成 Link-Time 配置文件
   * @brief Generates the AUTOSAR link-time configuration source file
   */
  private generateLcfgFile(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    const headerName = getModuleHeaderName(moduleName);
    const moduleId = getModuleId(moduleName);
    const vendorId = 0x1234;

    // AUTOSAR 4.4 标准 Doxygen 文件头
    let content = generateAutosarFileHeader(
      `Ecuc_${moduleName}_Lcfg.c`,
      moduleName,
      moduleId,
      vendorId,
      `${schema.label || moduleName} Link-Time Configuration`
    );

    content += `\
/*==================[includes]==============================================*/
#include "${headerName}"

`;

    if (options.generateComments) {
      content += `\
/*==================[link-time configuration]===============================*/
/**
 * @brief ${moduleName} Link-Time Configuration Data
 * @details This file contains configuration data that can be defined
 *          at link time. Link-Time configuration allows parameter changes
 *          at the final linking stage.
 */
`;
    }

    // 生成 Link-Time 配置数据
    content += this.generateLinkTimeConfig(config, schema, options);

    // 文件尾部
    content += `\
/*==================[end of file]===========================================*/
/**
 * End of Ecuc_${moduleName}_Lcfg.c
 */
`;

    return content;
  }

  /**
   * 生成独立的 yuleASR 桥接文件 (Ecuc_<Module>_Bridge.c)
   * 为已知模块 (Can/Mcu/Port) 生成桥接适配文件
   */
  private generateBridgeFile(
    config: ModuleConfig,
    schema: ModuleSchema,
    _options: GeneratorOptions
  ): GeneratedFile | null {
    const moduleName = config.module;
    if (!['Can', 'Mcu', 'Port'].includes(moduleName)) {
      return null;
    }

    const content = this.generateYuleASRBridgeDef(config, schema, _options);
    if (!content) {
      return null;
    }

    const bridgeContent = `\
/**
 * @file    Ecuc_${moduleName}_Bridge.c
 * @brief   yuleASR ConfigType Bridge — ECUC ConfigSet to BSW Driver Config
 * @details
 * This file bridges the gap between the AUTOSAR ECUC configuration data
 * (Ecuc_${moduleName}_Cfg.h types) and the yuleASR BSW driver's expected
 * configuration type (${moduleName}_ConfigType defined in ${moduleName}.h).
 *
 * The ECUC generator produces nested ConfigSet types with container pointers,
 * while the BSW driver expects a flat struct with direct member references.
 * This bridge populates the ${moduleName}_Config instance (declared as extern
 * in ${moduleName}.h) using the ECUC-generated data.
 *
 * @note  This file is auto-generated by yuleASR Configurator.
 *        DO NOT EDIT THIS FILE MANUALLY.
 */
${content}
/*==================[end of file]===========================================*/
/**
 * End of Ecuc_${moduleName}_Bridge.c
 */
`;

    return {
      path: `${_options.outputDir}/Ecuc_${moduleName}_Bridge.c`,
      content: bridgeContent,
      language: 'c',
    };
  }

  /**
   * 生成参数宏定义
   * @brief Generates AUTOSAR 4.4 compliant parameter macro definitions
   */
  private generateParameterMacros(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    let content =
      '/*==================[parameter macros]======================================*/\n';

    for (const param of schema.parameters) {
      const value = config.parameters[param.name];
      if (value === undefined || value === null) continue;

      const macroName = `${config.module.toUpperCase()}_${param.name.toUpperCase()}`;

      if (options.generateComments && param.description) {
        content += `/** @brief ${param.description} */\n`;
      }

      const formattedValue = formatCValue(value, param.type);
      content += `#define ${macroName}    ${formattedValue}\n`;

      // AUTOSAR 标准 DEV_ERROR_DETECT 宏别名
      // (如 CAN_CANDEVERRORDETECT → CAN_DEV_ERROR_DETECT，保证桥接代码中的标准宏名可用)
      if (param.name.toLowerCase().endsWith('deverrordetect')) {
        const stdName = `${config.module.toUpperCase()}_DEV_ERROR_DETECT`;
        content += `#ifndef ${stdName}\n`;
        content += `#define ${stdName}    ${formattedValue}\n`;
        content += `#endif /* ${stdName} */\n`;
      }
    }

    // 生成容器宏定义（包含子容器）
    if (schema.containers) {
      // 递归生成所有容器计数宏
      content += this.generateContainerCountMacros(
        schema.containers,
        config.containers,
        config.module,
        options
      );
    }

    content += '\n';
    return content;
  }

  /**
   * 递归生成容器和子容器的计数宏
   */
  private generateContainerCountMacros(
    containers: ContainerSchema[],
    configContainers: Record<string, ContainerConfig[]> | undefined,
    moduleName: string,
    options: GeneratorOptions
  ): string {
    let content = '';
    for (const container of containers) {
      const instances = configContainers?.[container.name] || [];
      const count = instances.length;
      const containerMacro = `${moduleName.toUpperCase()}_${container.name.toUpperCase()}_COUNT`;
      if (options.generateComments) {
        content += `/** @brief Number of ${container.name} instances */\n`;
      }
      content += `#define ${containerMacro}    ${count}U\n`;

      // 子容器计数
      if (container.children && count > 0) {
        for (const child of container.children) {
          let childCount = 0;
          for (const inst of instances) {
            const childInstances = inst.children?.[child.name] || [];
            childCount = Math.max(childCount, childInstances.length);
          }
          const childMacro = `${moduleName.toUpperCase()}_${container.name.toUpperCase()}_${child.name.toUpperCase()}_COUNT`;
          if (options.generateComments) {
            content += `/** @brief Max number of ${child.name} per ${container.name} */\n`;
          }
          content += `#define ${childMacro}    ${childCount}U\n`;
        }
      }
    }
    return content;
  }

  /**
   * 生成子容器类型定义（递归）
   * 先子后父以保证类型在前向引用中可见
   */
  private generateContainerTypeDef(
    moduleName: string,
    container: ContainerSchema,
    schema: ModuleSchema,
    indent: number,
    parentChain: string[] = []
  ): string {
    let content = '';
    const pad = '    '.repeat(indent);
    // Use a chain-qualified name for sub-containers to avoid name conflicts with driver type definitions
    const qualifier = parentChain.length > 0 ? `${parentChain.join('_')}_` : '';
    const typeName = `${moduleName}_${qualifier}${container.name}Type`;
    const childParentChain = [...parentChain, container.name];

    // 递归生成子容器类型（先子后父，保证类型可见）
    if (container.children) {
      for (const child of container.children) {
        content += this.generateContainerTypeDef(
          moduleName,
          child,
          schema,
          indent,
          childParentChain
        );
      }
    }

    content += `${pad}/** @brief ${container.label || container.name} container type */\n`;
    content += `${pad}typedef struct {\n`;

    // 容器内的参数
    if (container.parameters) {
      for (const paramName of container.parameters) {
        const param = schema.parameters.find(p => p.name === paramName);
        if (param) {
          const cType = getCType(param.type);
          content += `${pad}    ${cType} ${paramName};\n`;
        }
      }
    }

    // 子容器指针成员（const pointer to external sub-instances）
    if (container.children) {
      for (const child of container.children) {
        const childQualifier = [...childParentChain].join('_');
        const childType = `${moduleName}_${childQualifier}_${child.name}Type`;
        content += `${pad}    const ${childType}* ${child.name}s;\n`;
        content += `${pad}    uint8 Num${child.name}s;\n`;
      }
    }

    content += `${pad}} ${typeName};\n\n`;

    return content;
  }

  /**
   * 生成 yuleASR 兼容的 flat 配置定义（无 ConfigSet 嵌套）
   * ECUC 生成器直接输出 yuleASR 驱动期望的 flat 类型符号
   * 只有已知的集成模块（Can/Mcu/Port）会生成
   *
   * 驱动头文件 (Can.h / Mcu.h / Port.h) 定义了 ConfigType 结构体，
   * 本方法直接实例化这些类型，跳过 AUTOSAR ConfigSet 中间层。
   */
  private generateYuleASRBridgeDef(
    config: ModuleConfig,
    schema: ModuleSchema,
    _options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    if (!this.isBridgeModule(moduleName)) {
      return '';
    }

    let content = `\n/*==================[yuleASR flat config - ${moduleName}_Config]============*/\n`;
    content += `/**\n`;
    content += ` * @brief yuleASR flat configuration - ${moduleName}_Config\n`;
    content += ` * @details\n`;
    content += ` * This section directly defines the ${moduleName}_Config symbol expected by\n`;
    content += ` * yuleASR's ${moduleName}.h driver header. The data is generated flat,\n`;
    content += ` * without the AUTOSAR ConfigSet nesting layer.\n`;
    content += ` *\n`;
    content += ` * The ${moduleName}.h header is included at the top of this file.\n`;
    content += ` */\n\n`;

    if (moduleName === 'Can') {
      content += this.generateCanBridge(config, schema, moduleName);
    } else if (moduleName === 'Mcu') {
      content += this.generateMcuBridge(config, schema, moduleName);
    } else if (moduleName === 'Port') {
      content += this.generatePortBridge(config, schema, moduleName);
    }

    return content;
  }

  /**
   * 生成 Can bridge: ECUC ConfigSet → Can_ConfigType Can_Config
   * 填充 Can_ControllerConfigType（含 BaudrateConfig / HardwareObject 子结构）
   */
  private generateCanBridge(
    config: ModuleConfig,
    _schema: ModuleSchema,
    moduleName: string
  ): string {
    const containers = config.containers?.['CanController'] || [];
    const controllerCount = containers.length;

    let content = '';

    if (controllerCount > 0) {
      // Can_Controllers 数组 — 每个 controller 元素内联 compound literal。
      // 注意：C 语言中 static const 对象变量不是常量表达式，不能被静态初始化器引用，
      // 因此 BaudrateConfigs / HardwareObjects 必须使用 compound literal 内联。
      content += `/** @brief Can Controller array */\n`;
      content += `static const Can_ControllerConfigType Can_Controllers[${controllerCount}] = {\n`;
      for (let i = 0; i < controllerCount; i++) {
        const instance = containers[i];
        const params = instance.parameters;
        const baudrateInstances =
          (instance.children?.['BaudrateConfig'] as ContainerConfig[] | undefined) || [];
        const hohInstances =
          (instance.children?.['HardwareObject'] as ContainerConfig[] | undefined) || [];

        // BaudrateConfigs — compound literal，零实例时为 NULL_PTR
        let baudrateLiteral: string;
        if (baudrateInstances.length > 0) {
          const entries: string[] = [];
          for (let b = 0; b < baudrateInstances.length; b++) {
            const bp = baudrateInstances[b].parameters;
            entries.push(
              `        { .BaudRate = ${formatCValue(bp['baudRate'] ?? 500000, 'integer')}, .PropSeg = ${formatCValue(bp['propSeg'] ?? 0, 'integer')}, .PhaseSeg1 = ${formatCValue(bp['phaseSeg1'] ?? 0, 'integer')}, .PhaseSeg2 = ${formatCValue(bp['phaseSeg2'] ?? 0, 'integer')}, .SyncJumpWidth = ${formatCValue(bp['syncJumpWidth'] ?? 0, 'integer')}, .Prescaler = ${formatCValue(bp['prescaler'] ?? 0, 'integer')} },`
            );
          }
          baudrateLiteral = `(const Can_BaudrateConfigType[]){\n${entries.join('\n')}\n    }`;
        } else {
          baudrateLiteral = 'NULL_PTR';
        }

        // HardwareObjects — compound literal，零实例时为 NULL_PTR
        let hohLiteral: string;
        if (hohInstances.length > 0) {
          const entries: string[] = [];
          for (let h = 0; h < hohInstances.length; h++) {
            const hp = hohInstances[h].parameters;
            entries.push(
              `        { .Hoh = ${formatCValue(hp['hoh'] ?? 0, 'integer')}, .HohType = (Can_HohTypeType)${formatCValue(hp['hohType'] ?? 0, 'enum')}, .IdType = (Can_IdTypeType)${formatCValue(hp['idType'] ?? 0, 'enum')}, .FirstId = ${formatCValue(hp['firstId'] ?? 0, 'integer')}, .LastId = ${formatCValue(hp['lastId'] ?? 0, 'integer')}, .ObjectId = ${formatCValue(hp['objectId'] ?? 0, 'integer')}, .Filtering = ${formatCValue(hp['filtering'] ?? false, 'boolean')} },`
            );
          }
          hohLiteral = `(const Can_HardwareObjectType[]){\n${entries.join('\n')}\n    }`;
        } else {
          hohLiteral = 'NULL_PTR';
        }

        content += `    {\n`;
        content += `        .ControllerId = ${formatCValue(params['controllerId'] ?? i, 'integer')},\n`;
        content += `        .BaseAddress = ${formatCValue(params['baseAddress'] ?? 0, 'integer')},\n`;
        content += `        .BaudrateConfigs = ${baudrateLiteral},\n`;
        content += `        .NumBaudrateConfigs = ${baudrateInstances.length}U,\n`;
        content += `        .HardwareObjects = ${hohLiteral},\n`;
        content += `        .NumHardwareObjects = ${hohInstances.length}U,\n`;
        content += `        .RxProcessing = ${formatCValue(params['rxProcessing'] ?? 0, 'integer')},\n`;
        content += `        .TxProcessing = ${formatCValue(params['txProcessing'] ?? 0, 'integer')},\n`;
        content += `        .BusOffProcessing = ${formatCValue(params['busOffProcessing'] ?? false, 'boolean')},\n`;
        content += `        .WakeupProcessing = ${formatCValue(params['wakeupProcessing'] ?? false, 'boolean')},\n`;
        content += `        .WakeupSupport = ${formatCValue(params['wakeupSupport'] ?? false, 'boolean')},\n`;
        content += `        .DefaultBaudrateIndex = ${formatCValue(params['defaultBaudrateIndex'] ?? 0, 'integer')},\n`;
        content += `    },\n`;
      }
      content += `};\n\n`;
    }

    // 最终的 Can_Config 定义
    content += `/** @brief yuleASR Can_Config instance (bridge from ECUC ConfigSet) */\n`;
    content += `const Can_ConfigType Can_Config = {\n`;
    content += `    .Controllers = ${controllerCount > 0 ? 'Can_Controllers' : 'NULL_PTR'},\n`;
    content += `    .NumControllers = ${controllerCount}U,\n`;
    content += `    .DevErrorDetect = (boolean)${moduleName.toUpperCase()}_DEV_ERROR_DETECT,\n`;
    content += `    .VersionInfoApi = STD_ON,\n`;
    content += `};\n\n`;

    return content;
  }

  /**
   * 生成 Mcu bridge: ECUC ConfigSet → Mcu_ConfigType Mcu_Config
   */
  private generateMcuBridge(
    config: ModuleConfig,
    _schema: ModuleSchema,
    moduleName: string
  ): string {
    const containers = config.containers?.['McuClockSettingConfig'] || [];
    const clockCount = containers.length;

    let content = '';

    if (clockCount > 0) {
      // Mcu_ClockConfigs 数组 — 每个时钟配置元素内联 compound literal
      content += `static const Mcu_ClockConfigType Mcu_ClockConfigs[${clockCount}] = {\n`;
      for (let i = 0; i < clockCount; i++) {
        const instance = containers[i];
        const params = instance.parameters;
        const pllInstances =
          (instance.children?.['PllConfig'] as ContainerConfig[] | undefined) || [];

        // PllConfigs — compound literal，零实例时为 NULL_PTR
        let pllLiteral: string;
        if (pllInstances.length > 0) {
          const entries: string[] = [];
          for (let p = 0; p < pllInstances.length; p++) {
            const pp = pllInstances[p].parameters;
            entries.push(
              `        { .PllBaseAddr = ${formatCValue(pp['pllBaseAddr'] ?? 0, 'integer')}, .Prediv = ${formatCValue(pp['prediv'] ?? 0, 'integer')}, .Multiplier = ${formatCValue(pp['multiplier'] ?? 0, 'integer')}, .Postdiv1 = ${formatCValue(pp['postdiv1'] ?? 0, 'integer')}, .Postdiv2 = ${formatCValue(pp['postdiv2'] ?? 0, 'integer')}, .Enable = ${formatCValue(pp['enable'] ?? false, 'boolean')} },`
            );
          }
          pllLiteral = `(const Mcu_PllConfigType[]){\n${entries.join('\n')}\n    }`;
        } else {
          pllLiteral = 'NULL_PTR';
        }

        content += `    {\n`;
        content += `        .PllBaseAddr = ${formatCValue(params['pllBaseAddr'] ?? 0, 'integer')},\n`;
        content += `        .PllConfigs = ${pllLiteral},\n`;
        content += `        .NumPllConfigs = ${pllInstances.length}U,\n`;
        content += `        .ClockSource = ${formatCValue(params['clockSource'] ?? 0, 'integer')},\n`;
        content += `        .ArmDiv = ${formatCValue(params['armDiv'] ?? 0, 'integer')},\n`;
        content += `        .AxiDiv = ${formatCValue(params['axiDiv'] ?? 0, 'integer')},\n`;
        content += `        .AhbDiv = ${formatCValue(params['ahbDiv'] ?? 0, 'integer')},\n`;
        content += `    },\n`;
      }
      content += `};\n\n`;
    }

    // RamSection — 内联 compound literal
    const ramInstances = config.containers?.['McuRamSection'] || [];
    if (ramInstances.length > 0) {
      content += `static const Mcu_RamSectionType Mcu_RamSections[${ramInstances.length}] = {\n`;
      for (let r = 0; r < ramInstances.length; r++) {
        const rp = ramInstances[r].parameters;
        content += `    { .RamBaseAddr = ${formatCValue(rp['ramBaseAddr'] ?? 0, 'integer')}, .RamSize = ${formatCValue(rp['ramSize'] ?? 0, 'integer')}, .RamDefaultValue = ${formatCValue(rp['ramDefaultValue'] ?? 0, 'integer')} },\n`;
      }
      content += `};\n\n`;
    }

    // ModeConfig (placeholder — single entry from parameters or empty)
    content += `/** @brief Mcu ModeConfig (bridge) */\n`;
    content += `static const Mcu_ModeConfigType Mcu_ModeConfigs[1] = {\n`;
    content += `    { .Mode = ${formatCValue(config.parameters['mcuDefaultMode'] ?? 0, 'integer')} },\n`;
    content += `};\n\n`;

    content += `/** @brief yuleASR Mcu_Config instance */\n`;
    content += `const Mcu_ConfigType Mcu_Config = {\n`;
    content += `    .ClockSetting = ${formatCValue(config.parameters['mcuClockSetting'] ?? 0, 'integer')},\n`;
    content += `    .ClockFrequency = ${formatCValue(config.parameters['clockFrequency'] ?? 1000000000, 'integer')},\n`;
    content += `    .PllMultiplier = ${formatCValue(config.parameters['pllMultiplier'] ?? 0, 'integer')},\n`;
    content += `    .PllDivider = ${formatCValue(config.parameters['pllDivider'] ?? 0, 'integer')},\n`;
    content += `    .PllEnabled = ${formatCValue(config.parameters['pllEnabled'] ?? false, 'boolean')},\n`;
    content += `    .RamSections = ${ramInstances.length > 0 ? 'Mcu_RamSections' : 'NULL_PTR'},\n`;
    content += `    .NumRamSections = ${ramInstances.length}U,\n`;
    content += `    .ClockConfigs = ${clockCount > 0 ? 'Mcu_ClockConfigs' : 'NULL_PTR'},\n`;
    content += `    .NumClockConfigs = ${clockCount}U,\n`;
    content += `    .ModeConfigs = Mcu_ModeConfigs,\n`;
    content += `    .NumModes = 1U,\n`;
    content += `};\n\n`;

    return content;
  }

  /**
   * 生成 Port bridge: ECUC ConfigSet → Port_ConfigType Port_Config
   */
  private generatePortBridge(
    config: ModuleConfig,
    _schema: ModuleSchema,
    moduleName: string
  ): string {
    const pinInstances = config.containers?.['PortPin'] || [];
    const pinCount = pinInstances.length;

    let content = '';

    if (pinCount > 0) {
      for (let i = 0; i < pinCount; i++) {
        const pp = pinInstances[i].parameters;
        content += `static const Port_PinConfigType PortPin_${i} = {\n`;
        content += `    .Pin = ${formatCValue(pp['pinId'] ?? i, 'integer')},\n`;
        content += `    .Direction = (Port_PinDirectionType)${formatCValue(pp['pinDirection'] ?? 0, 'enum')},\n`;
        content += `    .Mode = ${formatCValue(pp['pinMode'] ?? 0, 'integer')},\n`;
        content += `    .DirectionChangeable = ${formatCValue(pp['directionChangeable'] ?? false, 'boolean')},\n`;
        content += `    .ModeChangeable = ${formatCValue(pp['modeChangeable'] ?? false, 'boolean')},\n`;
        content += `    .InitialLevel = (Port_PinLevelType)${formatCValue(pp['initialLevel'] ?? 0, 'enum')},\n`;
        content += `    .PullUpEnable = ${formatCValue(pp['pullUpEnable'] ?? false, 'boolean')},\n`;
        content += `    .PullDownEnable = ${formatCValue(pp['pullDownEnable'] ?? false, 'boolean')},\n`;
        content += `};\n\n`;
      }

      content += `static const Port_PinConfigType Port_PinConfigs[${pinCount}] = {\n`;
      for (let i = 0; i < pinCount; i++) {
        content += `    PortPin_${i},\n`;
      }
      content += `};\n\n`;
    }

    content += `/** @brief yuleASR Port_Config instance */\n`;
    content += `const Port_ConfigType Port_Config = {\n`;
    content += `    .NumPins = ${formatCValue(config.parameters['portPinCount'] ?? pinCount, 'integer')},\n`;
    content += `    .PinConfigs = ${pinCount > 0 ? 'Port_PinConfigs' : 'NULL_PTR'},\n`;
    content += `};\n\n`;

    return content;
  }

  /**
   * 生成类型定义
   * @brief Generates AUTOSAR 4.4 compliant type definitions
   */
  private generateTypeDefinitions(config: ModuleConfig, schema: ModuleSchema): string {
    let content =
      '/*==================[type definitions]======================================*/\n';
    const moduleName = config.module;

    // 生成容器类型定义（支持嵌套子容器）— 非桥接模块需要 ECUC 自有容器类型
    // 桥接模块的容器类型由驱动头文件(Can.h/Mcu.h/Port.h)定义，ECUC 不重复定义
    if (!this.isBridgeModule(moduleName)) {
      if (schema.containers) {
        for (const container of schema.containers) {
          content += this.generateContainerTypeDef(moduleName, container, schema, 0, []);
        }
      }
    }

    // 生成配置集类型 (ConfigSetType) — 仅用于非桥接模块
    // 桥接模块的配置数据直接填充驱动定义的 flat ConfigType，无需 ConfigSet 中间层
    if (!this.isBridgeModule(moduleName)) {
      const configSetTypeName = `${moduleName}_ConfigSetType`;
      content += `/** @brief ${moduleName} configuration set type */\n`;
      content += `typedef struct {\n`;
      content += `    uint16 moduleId;\n`;
      content += `    uint8 versionInfo[3];\n`;
      content += `    uint8 instanceCount;\n`;

      // 参数成员
      for (const param of schema.parameters) {
        if (!config.parameters.hasOwnProperty(param.name)) continue;
        const cType = getCType(param.type);
        content += `    ${cType} ${param.name};\n`;
      }

      // 容器指针引用（用 const 指针替代内联数组）
      if (schema.containers) {
        for (const container of schema.containers) {
          const containerType = `${moduleName}_${container.name}Type`;
          const count = config.containers?.[container.name]?.length || 0;
          if (count > 0) {
            content += `    const ${containerType}* ${container.name};\n`;
          }
        }
      }

      content += `} ${configSetTypeName};\n\n`;
    }

    // 配置类型 (ConfigType) 由手写驱动头文件(如 Can.h)定义
    // ECUC 生成器只负责配置数据结构，不负责驱动接口类型

    return content;
  }

  /**
   * 生成外部声明，用 MemMap.h 段标记包裹 const 数据声明
   * @brief Generates AUTOSAR 4.4 compliant external declarations with Init/MainFunction/GetVersionInfo
   */
  private generateExternDeclarations(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    const moduleId = getModuleId(moduleName);
    const vendorId = 0x1234;
    let content =
      '/*==================[external data declarations]============================*/\n';

    // 收集数据声明部分
    let dataDecl = '';

    // 声明配置结构体 — 桥接模块使用 flat 输出，无需 ConfigSet 声明
    if (!this.isBridgeModule(moduleName)) {
      dataDecl += `/** @brief External configuration set structure */\n`;
      dataDecl += `extern const ${moduleName}_ConfigSetType ${moduleName}_ConfigSet;\n\n`;

      // 声明容器实例（递归包含子容器实例）
      if (schema.containers) {
        for (const container of schema.containers) {
          const count = config.containers?.[container.name]?.length || 0;
          if (count > 0) {
            dataDecl += `/** @brief ${container.name} container instances */\n`;
            dataDecl += `extern const ${moduleName}_${container.name}Type ${container.name}_Instances[${count}];\n`;
          }
          // 子容器实例声明
          if (container.children && count > 0) {
            for (const child of container.children) {
              let childMaxCount = 0;
              for (const inst of config.containers?.[container.name] || []) {
                const childCount = inst.children?.[child.name]?.length || 0;
                childMaxCount = Math.max(childMaxCount, childCount);
              }
              if (childMaxCount > 0) {
                // We don't know the total count across instances — external decl per-instance would be handled in bridge
              }
            }
          }
        }
      }
    }

    // 用 MemMap.h 段标记包裹数据声明
    content += this.wrapMemMapSection(moduleName, 'CONST_UNSPECIFIED', dataDecl);

    // 跳过函数声明 — 由手写驱动头文件(如 Can.h)定义
    // ECUC 生成器只负责配置数据结构，不负责驱动接口

    return content;
  }

  /**
   * 用 Autosar MemMap.h 段标记包裹一段代码
   *
   * @param moduleName  模块名称（如 Can）
   * @param section     段名（如 CONST_UNSPECIFIED, VAR_INIT, CODE）
   * @param body        要包裹的代码块
   * @returns           带 MEMORY 段标记的代码
   */
  private wrapMemMapSection(moduleName: string, section: string, body: string): string {
    return this.compilerAbstraction.wrapMemMapSection(moduleName, section, body);
  }

  /**
   * 生成模块信息
   * @brief Generates AUTOSAR 4.4 compliant module version information structure
   */
  private generateModuleInfo(config: ModuleConfig, _schema: ModuleSchema): string {
    const moduleName = config.module;
    const version = parseVersion(config.version);

    let content =
      '/*==================[module information]====================================*/\n';

    // Doxygen 文档
    content += `/**\n`;
    content += ` * @brief ${moduleName} module version information\n`;
    content += ` * @details Static version information structure following AUTOSAR Std_VersionInfoType\n`;
    content += ` * \n`;
    content += ` * Vendor ID:   0x1234 (YuleTech)\n`;
    content += ` * Module ID:   ${getModuleId(moduleName)}\n`;
    content += ` * SW Version:  ${version.major}.${version.minor}.${version.patch}\n`;
    content += ` * AR Version:  4.4.0\n`;
    content += ` */\n`;

    content += `__attribute__((unused)) static const Std_VersionInfoType ${moduleName}_VersionInfo = {\n`;
    content += `    .vendorID = ${moduleName.toUpperCase()}_VENDOR_ID,\n`;
    content += `    .moduleID = ${moduleName.toUpperCase()}_MODULE_ID,\n`;
    content += `    .sw_major_version = ${version.major},\n`;
    content += `    .sw_minor_version = ${version.minor},\n`;
    content += `    .sw_patch_version = ${version.patch}\n`;
    content += `};\n\n`;

    // 初始化状态标志
    content += `/** @brief ${moduleName} module initialization state */\n`;
    content += `__attribute__((unused)) static boolean ${moduleName}_Initialized = FALSE;\n\n`;

    return content;
  }

  /**
   * 生成配置数据（用 MemMap.h 段标记包裹 const 数据定义）
   * @brief Generates AUTOSAR 4.4 compliant configuration data with MemMap sections
   */
  private generateConfigData(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    let content = '/*==================[configuration data]==================================*/\n';

    // 收集所有 const 数据定义到一个块中，统一包裹 MemMap.h 段标记
    let dataBlock = '';

    // 生成容器实例数据（递归支持子容器）
    if (schema.containers && config.containers) {
      for (const container of schema.containers) {
        const instances = config.containers[container.name] || [];
        if (instances.length === 0) continue;

        dataBlock += this.generateContainerInstances(
          container,
          instances,
          schema,
          moduleName,
          options
        );
      }
    }

    // 生成配置集结构体 (ConfigSetType)
    dataBlock += `/** @brief ${moduleName} configuration set structure */\n`;
    dataBlock += `const ${moduleName}_ConfigSetType ${moduleName}_ConfigSet = {\n`;
    dataBlock += `    .moduleId = ${moduleName.toUpperCase()}_MODULE_ID,\n`;
    dataBlock += `    .versionInfo = {${parseVersion(config.version).major}, ${parseVersion(config.version).minor}, ${parseVersion(config.version).patch}},\n`;
    dataBlock += `    .instanceCount = ${this.getInstanceCount(config)},\n`;

    // 参数值
    for (const param of schema.parameters) {
      const value = config.parameters[param.name];
      if (value !== undefined && value !== null) {
        dataBlock += `    .${param.name} = ${formatCValue(value, param.type)},\n`;
      }
    }

    // 容器指针引用（指向外部实例数组）
    if (schema.containers && config.containers) {
      for (const container of schema.containers) {
        const instances = config.containers[container.name] || [];
        if (instances.length > 0) {
          dataBlock += `    .${container.name} = ${container.name}_Instances,\n`;
        }
      }
    }

    dataBlock += `};\n\n`;

    // 用 MemMap.h 段标记包裹整个数据块
    content += this.wrapMemMapSection(moduleName, 'CONST_UNSPECIFIED', dataBlock);

    return content;
  }

  /**
   * 生成容器实例（递归支持子容器）
   * @brief Generates AUTOSAR 4.4 compliant container instance definitions with sub-container support
   */
  private generateContainerInstances(
    container: ContainerSchema,
    instances: ContainerConfig[],
    schema: ModuleSchema,
    moduleName: string,
    options: GeneratorOptions
  ): string {
    let content = '';
    const containerType = `${moduleName}_${container.name}Type`;

    // 生成每个实例
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];

      // 先生成子容器实例（它们被父 struct 引用，必须在父之前定义）
      if (container.children) {
        for (const child of container.children) {
          const childInstances = instance.children?.[child.name] || [];
          if (childInstances.length > 0) {
            content += this.generateSubContainerInstances(
              child,
              childInstances,
              schema,
              moduleName,
              `${container.name}_${i}`,
              options,
              container.name
            );
          }
        }
      }

      if (options.generateComments) {
        content += `/** @brief ${container.name} instance ${i}${instance.name ? ` - ${instance.name}` : ''} */\n`;
      }

      content += `static const ${containerType} ${container.name}_Instance_${i} = {\n`;

      // 实例参数
      if (container.parameters) {
        for (const paramName of container.parameters) {
          const param = schema.parameters.find(p => p.name === paramName);
          const value = instance.parameters[paramName];
          if (value !== undefined && param) {
            content += `    .${paramName} = ${formatCValue(value, param.type)},\n`;
          }
        }
      }

      // 子容器引用（指向子实例数组）
      if (container.children) {
        for (const child of container.children) {
          const childInstances = instance.children?.[child.name] || [];
          if (childInstances.length > 0) {
            content += `    .${child.name}s = ${container.name}_${i}_${child.name}_Instances,\n`;
            content += `    .Num${child.name}s = ${childInstances.length}U,\n`;
          } else {
            content += `    .${child.name}s = NULL_PTR,\n`;
            content += `    .Num${child.name}s = 0U,\n`;
          }
        }
      }

      content += `};\n\n`;
    }

    // 生成实例数组
    if (instances.length > 0) {
      content += `/** @brief ${container.name} instance array */\n`;
      content += `const ${containerType} ${container.name}_Instances[${instances.length}] = {\n`;
      for (let i = 0; i < instances.length; i++) {
        content += `    ${container.name}_Instance_${i},\n`;
      }
      content += `};\n\n`;
    }

    return content;
  }

  /**
   * 生成子容器实例（递归）
   * @brief Generates sub-container instance definitions recursively
   */
  private generateSubContainerInstances(
    container: ContainerSchema,
    instances: ContainerConfig[],
    schema: ModuleSchema,
    moduleName: string,
    parentPrefix: string,
    options: GeneratorOptions,
    parentContainerName?: string
  ): string {
    let content = '';
    // 使用链式命名避免与驱动类型冲突
    const typeQualifier = parentContainerName
      ? `${parentContainerName}_${container.name}`
      : container.name;
    const containerType = `${moduleName}_${typeQualifier}Type`;

    // 生成子容器实例数组 — 使用内联 struct initializers 避免 C99 static const 引用限制
    // C99 标准不允许在 static storage duration 的 initializer 中引用另一个 static const 变量
    if (instances.length > 0) {
      if (options.generateComments) {
        content += `/** @brief ${container.name} sub-instance array (under ${parentPrefix}) */\n`;
      }
      content += `static const ${containerType} ${parentPrefix}_${container.name}_Instances[${instances.length}] = {\n`;

      for (let i = 0; i < instances.length; i++) {
        const instance = instances[i];

        // 更深层子容器实例（内联 struct 之前生成）
        const deepChildContent: string[] = [];
        if (container.children) {
          for (const child of container.children) {
            const childInstances = instance.children?.[child.name] || [];
            if (childInstances.length > 0) {
              const nested = this.generateSubContainerInstances(
                child,
                childInstances,
                schema,
                moduleName,
                `${parentPrefix}_${container.name}_${i}`,
                options,
                typeQualifier
              );
              if (nested) {
                deepChildContent.push(nested);
              }
            }
          }
        }
        // 更深层子容器内容放在数组之前
        for (const dcc of deepChildContent) {
          content += dcc;
        }

        // 内联 struct 定义
        content += `{\n`;
        for (const paramName of container.parameters || []) {
          const param = schema.parameters.find(p => p.name === paramName);
          const value = instance.parameters[paramName];
          if (value !== undefined && param) {
            content += `        .${paramName} = ${formatCValue(value, param.type)},\n`;
          }
        }

        // 更深层子容器引用
        if (container.children) {
          for (const child of container.children) {
            const childInstances = instance.children?.[child.name] || [];
            const arrayName = `${parentPrefix}_${container.name}_${i}_${child.name}_Instances`;
            if (childInstances.length > 0) {
              content += `        .${child.name}s = ${arrayName},\n`;
              content += `        .Num${child.name}s = ${childInstances.length}U,\n`;
            } else {
              content += `        .${child.name}s = NULL_PTR,\n`;
              content += `        .Num${child.name}s = 0U,\n`;
            }
          }
        }

        content += `},\n`;
      }

      content += `};\n\n`;
    }

    return content;
  }

  /**
   * 生成常量定义
   * @brief Generates module-specific constant definitions
   */
  private generateConstants(
    config: ModuleConfig,
    schema: ModuleSchema,
    _options: GeneratorOptions
  ): string {
    let content =
      '/*==================[constants]=============================================*/\n';

    // 生成字符串常量
    for (const param of schema.parameters) {
      if (param.type === 'string') {
        const value = config.parameters[param.name];
        if (typeof value === 'string' && value) {
          const constName = `${config.module}_${param.name}_STR`;
          content += `static const char ${constName}[] = "${value}";\n`;
        }
      }
    }

    return content + '\n';
  }

  /**
   * 生成 Post-Build 配置
   * @brief Generates AUTOSAR post-build configuration data
   */
  private generatePostBuildConfig(
    config: ModuleConfig,
    schema: ModuleSchema,
    _options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    // 桥接模块使用 flat 配置，无需 ConfigSetType 的 post-build 配置
    if (this.isBridgeModule(moduleName)) {
      return '/* Post-Build configuration: using flat bridge config (no ConfigSetType) */\n\n';
    }

    let content = '';

    // 确定哪些参数可以在 Post-Build 时修改
    const pbParams = schema.parameters.filter(p => !p.readonly);

    if (pbParams.length > 0) {
      content += `/* Post-Build configurable parameters */\n`;
      content += `${moduleName}_ConfigSetType ${moduleName}_PostBuildConfig = {\n`;

      for (const param of pbParams) {
        const value = config.parameters[param.name];
        if (value !== undefined) {
          content += `    .${param.name} = ${formatCValue(value, param.type)},\n`;
        }
      }

      content += `};\n\n`;
    }

    return content;
  }

  /**
   * 生成 Link-Time 配置
   * @brief Generates AUTOSAR link-time configuration data
   */
  private generateLinkTimeConfig(
    config: ModuleConfig,
    _schema: ModuleSchema,
    _options: GeneratorOptions
  ): string {
    const moduleName = config.module;
    // 桥接模块使用 flat 配置，无需 ConfigSetType 的 link-time 配置
    if (this.isBridgeModule(moduleName)) {
      return '/* Link-Time configuration: using flat bridge config (no ConfigSetType) */\n\n';
    }

    let content = '';

    content += `/* Link-Time configurable data structures */\n`;
    content += `${moduleName}_ConfigSetType ${moduleName}_Lcfg = {0};`;

    return content;
  }

  /**
   * 获取实例数量
   * @brief Returns the maximum instance count across all containers
   */
  private getInstanceCount(config: ModuleConfig): number {
    let count = 1;
    if (config.containers) {
      for (const instances of Object.values(config.containers)) {
        count = Math.max(count, instances.length);
      }
    }
    return count;
  }
}

/**
 * 创建 Ecuc 代码生成器实例
 * @brief Creates a new Ecuc code generator instance
 */
export function createEcucGenerator(): EcucCodeGenerator {
  return new EcucCodeGenerator();
}

export default EcucCodeGenerator;
