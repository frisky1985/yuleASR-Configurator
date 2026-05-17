/**
 * Parameter Validator
 * Advanced parameter-level validation with rules engine
 */

import type { ConfigParameter, ValidationIssue } from '../types/config'

export interface ValidationRule {
  type: 'required' | 'range' | 'pattern' | 'enum' | 'dependency' | 'custom'
  message: string
  params?: Record<string, unknown>
}

export interface ParameterValidationConfig {
  parameterName: string
  rules: ValidationRule[]
}

export class ParameterValidator {
  private rules: Map<string, ValidationRule[]> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules() {
    // MCU Clock frequency validation
    this.rules.set('McuClockSettingConfig.McuClockReferencePointFrequency', [
      { type: 'required', message: 'Clock frequency is required' },
      { type: 'range', message: 'Frequency must be between 1 and 1000 MHz', params: { min: 1, max: 1000 } },
    ])

    // CAN Baudrate validation
    this.rules.set('CanControllerBaudrateConfig.CanControllerBaudRate', [
      { type: 'required', message: 'Baudrate is required' },
      { type: 'enum', message: 'Standard baudrates: 125000, 250000, 500000, 1000000', params: { values: [125000, 250000, 500000, 1000000] } },
    ])

    // PWM frequency validation
    this.rules.set('PwmChannelConfig.PwmChannelFrequency', [
      { type: 'range', message: 'PWM frequency must be between 0.1 and 10000 Hz', params: { min: 0.1, max: 10000 } },
    ])

    // ADC resolution validation
    this.rules.set('AdcChannelConfig.AdcChannelResolution', [
      { type: 'enum', message: 'Valid resolutions: 8, 10, 12 bits', params: { values: [8, 10, 12] } },
    ])

    // GPT timer validation
    this.rules.set('GptChannelConfig.GptChannelTickFrequency', [
      { type: 'range', message: 'Tick frequency must be between 1 and 1000000 Hz', params: { min: 1, max: 1000000 } },
    ])

    // Port pin mode validation
    this.rules.set('PortPinConfig.PortPinMode', [
      { type: 'enum', message: 'Valid modes: INPUT, OUTPUT, ANALOG, ALTERNATE', params: { values: ['INPUT', 'OUTPUT', 'ANALOG', 'ALTERNATE'] } },
    ])

    // Task priority validation
    this.rules.set('OsTaskConfig.OsTaskPriority', [
      { type: 'range', message: 'Priority must be between 0 and 255', params: { min: 0, max: 255 } },
    ])

    // Stack size validation
    this.rules.set('OsTaskConfig.OsTaskStackSize', [
      { type: 'range', message: 'Stack size must be between 64 and 65536 bytes', params: { min: 64, max: 65536 } },
    ])
  }

  /**
   * Add custom validation rule for a parameter
   */
  addRule(parameterName: string, rule: ValidationRule): void {
    const existingRules = this.rules.get(parameterName) || []
    existingRules.push(rule)
    this.rules.set(parameterName, existingRules)
  }

  /**
   * Validate a single parameter value
   */
  validateParameter(
    parameterName: string,
    value: unknown,
    parameterConfig?: ConfigParameter
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    const rules = this.rules.get(parameterName) || []

    for (const rule of rules) {
      const isValid = this.executeRule(rule, value, parameterConfig)
      if (!isValid) {
        issues.push({
          id: `${parameterName}-${rule.type}`,
          severity: rule.type === 'required' ? 'error' : 'warning',
          message: rule.message,
          path: parameterName,
          module: this.extractModuleName(parameterName),
        })
      }
    }

    return issues
  }

  /**
   * Validate all parameters in a configuration
   */
  validateAllParameters(parameters: Record<string, unknown>): ValidationIssue[] {
    const allIssues: ValidationIssue[] = []

    for (const [name, value] of Object.entries(parameters)) {
      const issues = this.validateParameter(name, value)
      allIssues.push(...issues)
    }

    return allIssues
  }

  /**
   * Execute a single validation rule
   */
  private executeRule(
    rule: ValidationRule,
    value: unknown,
    parameterConfig?: ConfigParameter
  ): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== ''

      case 'range': {
        if (typeof value !== 'number') return true
        const min = rule.params?.min as number
        const max = rule.params?.max as number
        if (min !== undefined && value < min) return false
        if (max !== undefined && value > max) return false
        return true
      }

      case 'pattern': {
        if (typeof value !== 'string') return true
        const pattern = new RegExp(rule.params?.pattern as string)
        return pattern.test(value)
      }

      case 'enum': {
        const allowedValues = rule.params?.values as unknown[]
        if (!allowedValues) return true
        return allowedValues.includes(value)
      }

      case 'dependency': {
        // Complex dependency validation - would need full config context
        return true
      }

      case 'custom': {
        const validator = rule.params?.validator as (value: unknown) => boolean
        if (!validator) return true
        return validator(value)
      }

      default:
        return true
    }
  }

  /**
   * Get validation suggestions for a parameter
   */
  getSuggestions(parameterName: string, currentValue: unknown): string[] {
    const suggestions: string[] = []
    const rules = this.rules.get(parameterName) || []

    for (const rule of rules) {
      if (rule.type === 'enum' && rule.params?.values) {
        const values = rule.params.values as unknown[]
        if (!values.includes(currentValue)) {
          suggestions.push(`Suggested values: ${values.join(', ')}`)
        }
      }

      if (rule.type === 'range') {
        const min = rule.params?.min as number
        const max = rule.params?.max as number
        if (typeof currentValue === 'number') {
          if (min !== undefined && currentValue < min) {
            suggestions.push(`Minimum value is ${min}`)
          }
          if (max !== undefined && currentValue > max) {
            suggestions.push(`Maximum value is ${max}`)
          }
        }
      }
    }

    return suggestions
  }

  /**
   * Extract module name from parameter path
   */
  private extractModuleName(parameterName: string): string {
    const parts = parameterName.split('.')
    return parts[0] || 'Unknown'
  }

  /**
   * Validate parameter relationships
   */
  validateRelationships(
    parameters: Record<string, unknown>
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    // Example: Validate that CAN baudrate and sample point are compatible
    const canBaudrate = parameters['CanControllerBaudrateConfig.CanControllerBaudRate'] as number
    const canSamplePoint = parameters['CanControllerBaudrateConfig.CanControllerSamplePoint'] as number

    if (canBaudrate && canSamplePoint) {
      // Sample point should typically be between 75% and 87.5%
      if (canSamplePoint < 75 || canSamplePoint > 87.5) {
        issues.push({
          id: 'can-sample-point-warning',
          severity: 'warning',
          message: 'CAN sample point should typically be between 75% and 87.5%',
          path: 'CanControllerBaudrateConfig.CanControllerSamplePoint',
          module: 'Can',
        })
      }
    }

    // Validate MCU clock relationships
    const sysClock = parameters['McuClockSettingConfig.McuClockReferencePointFrequency'] as number
    const periphClock = parameters['McuClockSettingConfig.McuPeripheralClockFrequency'] as number

    if (sysClock && periphClock && periphClock > sysClock) {
      issues.push({
        id: 'mcu-clock-error',
        severity: 'error',
        message: 'Peripheral clock cannot exceed system clock',
        path: 'McuClockSettingConfig.McuPeripheralClockFrequency',
        module: 'Mcu',
      })
    }

    return issues
  }
}

// Singleton instance
export const parameterValidator = new ParameterValidator()
