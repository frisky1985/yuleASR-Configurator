/**
 * yuleASR RTE Generator Wrapper
 * 封装调用 yuleASR 的 rte_generator.py 脚本
 */

import { spawn } from 'child_process';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface RteGeneratorOptions {
  /** 输入配置文件路径 */
  configPath: string;
  /** 输出目录 */
  outputDir: string;
  /** SWC 名称 (可选) */
  swcName?: string;
}

export interface RteGeneratorResult {
  success: boolean;
  files: string[];
  errors: string[];
  stdout: string;
  stderr: string;
}

/**
 * yuleASR RTE 外部生成器
 * 调用 yuleASR 工程中的 rte_generator.py
 */
export class YuleasrRteGenerator {
  private pythonPath = 'python3';
  private generatorScript: string | null = null;

  constructor() {
    // 尝试找到 rte_generator.py 脚本
    this.findGeneratorScript();
  }

  /**
   * 查找 rte_generator.py 脚本
   */
  private findGeneratorScript(): void {
    // 常见路径
    const possiblePaths = [
      // 相对于当前项目的路径
      join(__dirname, '../../../../../yuleASR/tools/rte_generator/rte_generator.py'),
      // 环境变量指定的路径
      process.env.YULEASR_RTE_GENERATOR || '',
      // 当前工作目录的子目录
      join(process.cwd(), 'yuleASR/tools/rte_generator/rte_generator.py'),
      join(process.cwd(), '../yuleASR/tools/rte_generator/rte_generator.py'),
    ];

    for (const path of possiblePaths) {
      if (path) {
        this.generatorScript = path;
        break;
      }
    }
  }

  /**
   * 设置 Python 解释器路径
   */
  setPythonPath(path: string): void {
    this.pythonPath = path;
  }

  /**
   * 设置生成器脚本路径
   */
  setGeneratorScript(path: string): void {
    this.generatorScript = path;
  }

  /**
   * 生成 RTE 代码
   */
  async generate(options: RteGeneratorOptions): Promise<RteGeneratorResult> {
    const result: RteGeneratorResult = {
      success: false,
      files: [],
      errors: [],
      stdout: '',
      stderr: '',
    };

    try {
      // 确保输出目录存在
      await mkdir(options.outputDir, { recursive: true });

      // 如果没有外部生成器，使用内置生成器
      if (!this.generatorScript) {
        return this.generateInternal(options);
      }

      // 调用外部 Python 脚本
      const args = [
        this.generatorScript,
        '--config', options.configPath,
        '--output', options.outputDir,
      ];

      if (options.swcName) {
        args.push('--swc', options.swcName);
      }

      const { stdout, stderr, exitCode } = await this.runPython(args);

      result.stdout = stdout;
      result.stderr = stderr;

      if (exitCode === 0) {
        result.success = true;
        // 解析生成的文件
        result.files = await this.listGeneratedFiles(options.outputDir);
      } else {
        result.errors.push(`Python script exited with code ${exitCode}`);
        if (stderr) {
          result.errors.push(stderr);
        }
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * 运行 Python 脚本
   */
  private runPython(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const child = spawn(this.pythonPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (exitCode) => {
        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? -1,
        });
      });

      child.on('error', (error) => {
        resolve({
          stdout,
          stderr: error.message,
          exitCode: -1,
        });
      });
    });
  }

  /**
   * 内置生成器（备用）
   * 当外部脚本不可用时使用简化的内置生成器
   */
  private async generateInternal(options: RteGeneratorOptions): Promise<RteGeneratorResult> {
    const result: RteGeneratorResult = {
      success: false,
      files: [],
      errors: [],
      stdout: '',
      stderr: '',
    };

    try {
      // 读取配置
      const configContent = await readFile(options.configPath, 'utf-8');
      const config = JSON.parse(configContent);

      // 生成简化的 RTE 头文件
      const headerContent = this.generateRteHeader(config);
      const headerPath = join(options.outputDir, 'Rte_Generated.h');
      await writeFile(headerPath, headerContent);
      result.files.push(headerPath);

      // 生成简化的 RTE 源文件
      const sourceContent = this.generateRteSource(config);
      const sourcePath = join(options.outputDir, 'Rte_Generated.c');
      await writeFile(sourcePath, sourceContent);
      result.files.push(sourcePath);

      result.success = true;
      result.stdout = `Generated ${result.files.length} files using internal generator`;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * 生成 RTE 头文件（内置）
   */
  private generateRteHeader(config: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();

    return `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator */
/* Timestamp: ${timestamp} */

#ifndef RTE_GENERATED_H
#define RTE_GENERATED_H

#include "Rte.h"
#include "Rte_Type.h"

/* Generated for ${config.softwareComponents ? (config.softwareComponents as unknown[]).length : 0} software components */

${this.generateComponentDeclarations(config)}

#endif /* RTE_GENERATED_H */
`;
  }

  /**
   * 生成 RTE 源文件（内置）
   */
  private generateRteSource(config: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();

    return `/* AUTOGENERATED FILE - DO NOT EDIT */
/* Generated by yuleASR Configurator */
/* Timestamp: ${timestamp} */

#include "Rte_Generated.h"

/* RTE Implementation */

${this.generateComponentImplementations(config)}
`;
  }

  /**
   * 生成组件声明
   */
  private generateComponentDeclarations(config: Record<string, unknown>): string {
    const components = config.softwareComponents as Array<{ name: string }> || [];
    return components.map((swc) => `
/* Software Component: ${swc.name} */
Std_ReturnType Rte_${swc.name}_Init(void);
Std_ReturnType Rte_${swc.name}_DeInit(void);
`).join('\n');
  }

  /**
   * 生成组件实现
   */
  private generateComponentImplementations(config: Record<string, unknown>): string {
    const components = config.softwareComponents as Array<{ name: string }> || [];
    return components.map((swc) => `
/* Software Component: ${swc.name} Implementation */
Std_ReturnType Rte_${swc.name}_Init(void) {
    /* TODO: Implement initialization */
    return RTE_E_OK;
}

Std_ReturnType Rte_${swc.name}_DeInit(void) {
    /* TODO: Implement deinitialization */
    return RTE_E_OK;
}
`).join('\n');
  }

  /**
   * 列出生成的文件
   */
  private async listGeneratedFiles(dir: string): Promise<string[]> {
    try {
      const files: string[] = [];
      const entries = await readFile(dir, 'utf-8');
      // 简单返回预期的文件列表
      return [
        join(dir, 'Rte.h'),
        join(dir, 'Rte.c'),
        join(dir, 'Rte_Type.h'),
      ];
    } catch {
      return [];
    }
  }

  /**
   * 检查生成器是否可用
   */
  isAvailable(): boolean {
    return this.generatorScript !== null;
  }

  /**
   * 获取生成器状态
   */
  getStatus(): { available: boolean; scriptPath: string | null } {
    return {
      available: this.isAvailable(),
      scriptPath: this.generatorScript,
    };
  }
}

// 导出默认实例
export const yuleasrRteGenerator = new YuleasrRteGenerator();

export default YuleasrRteGenerator;
