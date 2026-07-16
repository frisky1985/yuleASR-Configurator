/**
 * @yuletech/core - Ecuc Code Generator
 * AutoSAR Ecuc 配置 C 代码生成器
 * 
 * 生成 Ecuc_<Module>.c 和 Ecuc_<Module>.h 文件
 * 遵循 AutoSAR Ecuc 规范标准 4.4
 * 
 * @file    ecuc-generator.ts
 * @brief   AUTOSAR ECUC Configuration Code Generator
 */

import type { 
  ModuleConfig, 
  ModuleSchema, 
  ContainerConfig,
  ContainerSchema 
} from '../types';

import type { CodeGenerator, GeneratorOptions, GenerationResult, GeneratedFile, CompilerType } from './index';

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

/**
 * Ecuc 代码生成器
 * 支持生成标准 Ecuc 配置结构 (参数、容器、实例)
 * 符合 AUTOSAR 4.4 BSW 模块代码生成标准
 */
export class EcucCodeGenerator implements CodeGenerator {
  name = 'EcucCodeGenerator';
  version = '1.0.0';
  supportedModules: string[] = ['*']; // 支持所有模块
  private compilerAbstraction: CompilerAbstraction = new (getCompilerAbstraction(undefined).constructor as new () => CompilerAbstraction)();

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
      // 验证配置
      const validationResult = this.validateConfig(config, schema);
      if (!validationResult.valid) {
        errors.push(...validationResult.errors);
        if (options.generateComments) {
          warnings.push(...validationResult.warnings);
        }
      }

      // 生成头文件 (使用标准模块头文件名)
      const headerName = getModuleHeaderName(config.module);
      const headerFile = this.generateHeaderFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/${headerName}`,
        content: headerFile,
        language: 'h'
      });

      // 生成源文件
      const sourceFile = this.generateSourceFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/Ecuc_${config.module}.c`,
        content: sourceFile,
        language: 'c'
      });

      // 生成 PBcfg 文件 (Post-Build 配置)
      const pbcfgFile = this.generatePBcfgFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/Ecuc_${config.module}_PBcfg.c`,
        content: pbcfgFile,
        language: 'c'
      });

      // 生成 Lcfg 文件 (Link-Time 配置)
      const lcfgFile = this.generateLcfgFile(config, schema, options);
      files.push({
        path: `${options.outputDir}/Ecuc_${config.module}_Lcfg.c`,
        content: lcfgFile,
        language: 'c'
      });

      return {
        success: errors.length === 0,
        files,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      return {
        success: false,
        files,
        errors: [error instanceof Error ? error.message : '未知错误']
      };
    }
  }

  /**
   * 验证配置
   * @brief Validates module configuration against schema definition
   */
  private validateConfig(config: ModuleConfig, schema: ModuleSchema): { 
    valid: boolean; 
    errors: string[]; 
    warnings: string[] 
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
    content += generateVersionInfoMacros(
      moduleName,
      version.major,
      version.minor,
      version.patch,
      4,   // AUTOSAR 4.x
      4,   // 4.4
      0    // Revision 0
    );

    // 机构 / 供应商信息
    content += `\
/*==================[vendor identification]==================================*/
/**
 * @brief YuleTech vendor information
 */
#define YULETECH_VENDOR_ID              ((uint16)0x1234)

`;

    // 生成参数宏定义
    content += this.generateParameterMacros(config, schema, options);

    // 生成类型定义
    content += this.generateTypeDefinitions(config, schema);

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
   * 生成源文件 Ecuc_<Module>.c
   * @brief Generates the AUTOSAR 4.4 compliant ECUC configuration source file
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

    content += `\
/*==================[includes]==============================================*/
#include "${headerName}"

/*==================[module identification]=================================*/
/**
 * @brief ${moduleName} module identification
 */
#define ${moduleName.toUpperCase()}_MODULE_ID          ((uint16)${moduleId}U)
#define ${moduleName.toUpperCase()}_VENDOR_ID          ((uint16)0x${toHex(vendorId)})

`;

    // 生成模块信息结构
    content += this.generateModuleInfo(config, schema);

    // 生成配置数据结构
    content += this.generateConfigData(config, schema, options);

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
   * 生成参数宏定义
   * @brief Generates AUTOSAR 4.4 compliant parameter macro definitions
   */
  private generateParameterMacros(
    config: ModuleConfig,
    schema: ModuleSchema,
    options: GeneratorOptions
  ): string {
    let content = '/*==================[parameter macros]======================================*/\n';
    
    for (const param of schema.parameters) {
      const value = config.parameters[param.name];
      if (value === undefined || value === null) continue;

      const macroName = `${config.module.toUpperCase()}_${param.name.toUpperCase()}`;
      
      if (options.generateComments && param.description) {
        content += `/** @brief ${param.description} */\n`;
      }

      const formattedValue = formatCValue(value, param.type);
      content += `#define ${macroName}    ${formattedValue}\n`;
    }

    // 生成容器宏定义
    if (schema.containers) {
      for (const container of schema.containers) {
        const containerMacro = `${config.module.toUpperCase()}_${container.name.toUpperCase()}_COUNT`;
        const count = config.containers?.[container.name]?.length || 0;
        content += `/** @brief Number of ${container.name} instances */\n`;
        content += `#define ${containerMacro}    ${count}U\n`;
      }
    }

    content += '\n';
    return content;
  }

  /**
   * 生成类型定义
   * @brief Generates AUTOSAR 4.4 compliant type definitions
   */
  private generateTypeDefinitions(config: ModuleConfig, schema: ModuleSchema): string {
    let content = '/*==================[type definitions]======================================*/\n';
    const moduleName = config.module;

    // 生成容器类型定义
    if (schema.containers) {
      for (const container of schema.containers) {
        const typeName = `${moduleName}_${container.name}Type`;
        
        content += `/** @brief ${container.label || container.name} container type */\n`;
        content += `typedef struct {\n`;
        
        // 容器内的参数
        if (container.parameters) {
          for (const paramName of container.parameters) {
            const param = schema.parameters.find(p => p.name === paramName);
            if (param) {
              const cType = getCType(param.type);
              content += `    ${cType} ${param.name};\n`;
            }
          }
        }

        content += `} ${typeName};\n\n`;
      }
    }

    // 生成配置集类型 (ConfigSetType)
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

    // 生成配置类型 (ConfigType) - 只包含指向 ConfigSet 的指针
    const configTypeName = `${moduleName}_ConfigType`;
    content += `/** @brief ${moduleName} configuration type */\n`;
    content += `typedef struct {\n`;
    content += `    const ${configSetTypeName}* configSet;\n`;
    content += `} ${configTypeName};\n\n`;

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
    let content = '/*==================[external data declarations]============================*/\n';

    // 收集数据声明部分
    let dataDecl = '';

    // 声明配置结构体
    dataDecl += `/** @brief External configuration set structure */\n`;
    dataDecl += `extern const ${moduleName}_ConfigSetType ${moduleName}_ConfigSet;\n`;
    dataDecl += `/** @brief External configuration structure */\n`;
    dataDecl += `extern const ${moduleName}_ConfigType ${moduleName}_Config;\n\n`;

    // 声明容器实例
    if (schema.containers) {
      for (const container of schema.containers) {
        const count = config.containers?.[container.name]?.length || 0;
        if (count > 0) {
          dataDecl += `/** @brief ${container.name} container instances */\n`;
          dataDecl += `extern const ${moduleName}_${container.name}Type ${container.name}_Instances[${count}];\n`;
        }
      }
    }

    // 用 MemMap.h 段标记包裹数据声明
    content += this.wrapMemMapSection(moduleName, 'CONST_UNSPECIFIED', dataDecl);

    // AUTOSAR 标准函数声明（带 Doxygen 文档）
    content += '\n/*==================[function declarations]=================================*/\n';
    
    // Module_Init
    content += generateAutosarFunctionHeader(
      `Initialize the ${moduleName} module`,
      [
        { name: 'ConfigPtr', direction: 'in', description: `Pointer to the ${moduleName} configuration set` }
      ],
      `Std_ReturnType: E_OK if initialization succeeded, E_NOT_OK otherwise`,
      ['The module shall be uninitialized'],
      [`The ${moduleName} module is fully initialized and operational`]
    );
    content += `Std_ReturnType ${moduleName}_Init(const ${moduleName}_ConfigType* ConfigPtr);\n\n`;

    // Module_DeInit
    content += generateAutosarFunctionHeader(
      `De-initialize the ${moduleName} module`,
      [],
      `Std_ReturnType: E_OK if de-initialization succeeded, E_NOT_OK otherwise`,
      [`The ${moduleName} module shall be initialized`],
      [`The ${moduleName} module is de-initialized and no longer operational`]
    );
    content += `Std_ReturnType ${moduleName}_DeInit(void);\n\n`;

    // Module_MainFunction (AUTOSAR 标准 BSW 主函数模式)
    content += generateAutosarFunctionHeader(
      `${moduleName} main function - scheduled cyclic processing`,
      [],
      `void`,
      [`The ${moduleName} module shall be initialized`],
      [`All pending ${moduleName} processing is completed for this cycle`]
    );
    content += `void ${moduleName}_MainFunction(void);\n\n`;

    // Module_GetVersionInfo
    content += generateAutosarFunctionHeader(
      `Get the ${moduleName} module version information`,
      [
        { name: 'versioninfo', direction: 'out', description: `Pointer to the version information structure to be filled` }
      ],
      `void`,
      [`versioninfo shall not be NULL_PTR`],
      [`The version structure contains the ${moduleName} module's vendor, module, and software version IDs`]
    );
    content += `void ${moduleName}_GetVersionInfo(Std_VersionInfoType* versioninfo);\n\n`;

    // 模块状态查询（可选，但符合 AUTOSAR 标准）
    content += generateAutosarFunctionHeader(
      `Check if the ${moduleName} module is initialized`,
      [],
      `boolean: TRUE if the module is initialized, FALSE otherwise`
    );
    content += `boolean ${moduleName}_IsInitialized(void);\n\n`;

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

    let content = '/*==================[module information]====================================*/\n';
    
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
    
    content += `static const Std_VersionInfoType ${moduleName}_VersionInfo = {\n`;
    content += `    .vendorID = ${moduleName.toUpperCase()}_VENDOR_ID,\n`;
    content += `    .moduleID = ${moduleName.toUpperCase()}_MODULE_ID,\n`;
    content += `    .sw_major_version = ${version.major},\n`;
    content += `    .sw_minor_version = ${version.minor},\n`;
    content += `    .sw_patch_version = ${version.patch}\n`;
    content += `};\n\n`;

    // 初始化状态标志
    content += `/** @brief ${moduleName} module initialization state */\n`;
    content += `static boolean ${moduleName}_Initialized = FALSE;\n\n`;

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

    // 生成容器实例数据
    if (schema.containers && config.containers) {
      for (const container of schema.containers) {
        const instances = config.containers[container.name] || [];
        if (instances.length === 0) continue;

        dataBlock += this.generateContainerInstances(container, instances, schema, moduleName, options);
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

    // 生成配置类型 (ConfigType) - 只包含一个指向 ConfigSet 的指针
    dataBlock += `/** @brief ${moduleName} configuration type */\n`;
    dataBlock += `const ${moduleName}_ConfigType ${moduleName}_Config = {\n`;
    dataBlock += `    .configSet = &${moduleName}_ConfigSet,\n`;
    dataBlock += `};\n\n`;

    // 用 MemMap.h 段标记包裹整个数据块
    content += this.wrapMemMapSection(moduleName, 'CONST_UNSPECIFIED', dataBlock);

    return content;
  }

  /**
   * 生成容器实例
   * @brief Generates AUTOSAR 4.4 compliant container instance definitions
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
   * 生成常量定义
   * @brief Generates module-specific constant definitions
   */
  private generateConstants(
    config: ModuleConfig,
    schema: ModuleSchema,
    _options: GeneratorOptions
  ): string {
    let content = '/*==================[constants]=============================================*/\n';

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
    let content = '';

    content += `/* Link-Time configurable data structures */\n`;
    content += `${moduleName}_ConfigSetType ${moduleName}_Lcfg = {0};`

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
