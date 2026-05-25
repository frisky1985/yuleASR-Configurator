/**
 * @yuletech/core - Validation Types
 * 验证相关类型定义
 */

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误路径 */
  path: string;
  /** 错误消息 */
  message: string;
  /** 错误严重级别 */
  severity: 'error' | 'warning' | 'info';
  /** 错误代码 (可选) */
  code?: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
  /** 警告列表 */
  warnings: ValidationError[];
}
