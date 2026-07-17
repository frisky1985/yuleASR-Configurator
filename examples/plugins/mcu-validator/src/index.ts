// ==================================================================
// Example: McuValidator
// Type: validator
//
// Validates MCU module clock configuration parameters:
//   - Clock frequency within valid range
//   - PLL configuration sanity checks
//   - Required parameter presence
//
// Demonstrates:
//   - YulePlugin.activate()
//   - PluginContext.registerValidator()
//   - ValidatorPlugin.validate() returning ValidationResult[]
//   - Multiple severity levels (error, warning, info)
// ==================================================================

import type {
  YulePlugin,
  PluginContext,
  ValidatorPlugin,
  ValidationResult,
} from '@yuletech/plugin-sdk';

// ── Constants ───────────────────────────────────────────────────────────────

/** Maximum allowed clock frequency in Hz for this MCU family */
const MAX_CLOCK_HZ = 16_000_000; // 16 MHz

/** Minimum allowed clock frequency in Hz */
const MIN_CLOCK_HZ = 1_000_000; // 1 MHz

/** Valid PLL multiplier ranges */
const PLL_MULTIPLIER_MIN = 8;
const PLL_MULTIPLIER_MAX = 64;

/** Valid PLL divider ranges */
const PLL_DIVIDER_MIN = 1;
const PLL_DIVIDER_MAX = 16;

// ── Validation helpers ──────────────────────────────────────────────────────

/**
 * Check that a numeric parameter exists and is within range.
 */
function checkNumericParam(
  config: Record<string, unknown>,
  paramName: string,
  min: number,
  max: number,
  module: string
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const params = (config.parameters as Record<string, unknown>) ?? {};
  const value = params[paramName] as number | undefined;

  if (value === undefined || value === null) {
    results.push({
      module,
      severity: 'error',
      message: `Missing required parameter "${paramName}"`,
      param: paramName,
    });
    return results;
  }

  if (typeof value !== 'number' || isNaN(value)) {
    results.push({
      module,
      severity: 'error',
      message: `Parameter "${paramName}" must be a number, got ${typeof value}`,
      param: paramName,
    });
    return results;
  }

  if (value < min || value > max) {
    results.push({
      module,
      severity: 'error',
      message: `Parameter "${paramName}" value ${value} is out of range [${min}, ${max}]`,
      param: paramName,
    });
  }

  // Warning if nearing the limit
  if (value > max * 0.9) {
    results.push({
      module,
      severity: 'warning',
      message: `Parameter "${paramName}" value ${value} is close to the maximum (${max})`,
      param: paramName,
    });
  }

  return results;
}

/**
 * Validates the MCU module configuration.
 *
 * Expected config.parameters:
 *   - clockFrequency  (number, Hz) — Main system clock frequency
 *   - pllMultiplier   (number)     — PLL multiplier factor
 *   - pllDivider      (number)     — PLL output divider
 *   - externalOsc     (number, Hz) — External oscillator frequency (optional)
 */
async function validateMcuConfig(config: Record<string, unknown>): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const module = (config.module as string) || 'Mcu';

  // 1. Validate clock frequency
  results.push(...checkNumericParam(config, 'clockFrequency', MIN_CLOCK_HZ, MAX_CLOCK_HZ, module));

  // 2. Validate PLL multiplier
  results.push(
    ...checkNumericParam(config, 'pllMultiplier', PLL_MULTIPLIER_MIN, PLL_MULTIPLIER_MAX, module)
  );

  // 3. Validate PLL divider
  results.push(
    ...checkNumericParam(config, 'pllDivider', PLL_DIVIDER_MIN, PLL_DIVIDER_MAX, module)
  );

  // 4. If external oscillator is provided, check it
  const params = (config.parameters as Record<string, unknown>) ?? {};
  const externalOsc = params.externalOsc as number | undefined;
  if (externalOsc !== undefined) {
    if (typeof externalOsc === 'number' && !isNaN(externalOsc)) {
      if (externalOsc > MAX_CLOCK_HZ) {
        results.push({
          module,
          severity: 'error',
          message: `External oscillator frequency ${externalOsc} Hz exceeds maximum ${MAX_CLOCK_HZ} Hz`,
          param: 'externalOsc',
        });
      }
    }
  }

  // 5. Sanity check: PLL output should not exceed max clock
  const clockFreq = params.clockFrequency as number | undefined;
  const pllMult = params.pllMultiplier as number | undefined;
  const pllDiv = params.pllDivider as number | undefined;
  if (
    typeof clockFreq === 'number' &&
    typeof pllMult === 'number' &&
    typeof pllDiv === 'number' &&
    pllDiv > 0
  ) {
    const pllOutput = clockFreq * (pllMult / pllDiv);
    if (pllOutput > MAX_CLOCK_HZ) {
      results.push({
        module,
        severity: 'error',
        message:
          `PLL output frequency ${pllOutput} Hz exceeds maximum ${MAX_CLOCK_HZ} Hz ` +
          `(clockFrequency=${clockFreq} × pllMultiplier=${pllMult} / pllDivider=${pllDiv})`,
        param: 'pllMultiplier',
      });
    } else if (pllOutput > MAX_CLOCK_HZ * 0.95) {
      results.push({
        module,
        severity: 'warning',
        message: `PLL output frequency ${pllOutput} Hz is very close to the maximum`,
        param: 'pllMultiplier',
      });
    }
  }

  // 6. Info: check if external oscillator is available for better accuracy
  if (externalOsc === undefined) {
    results.push({
      module,
      severity: 'info',
      message: 'Consider configuring an external oscillator for better clock accuracy',
      param: 'externalOsc',
    });
  }

  return results;
}

// ── Plugin Definition ───────────────────────────────────────────────────────

const mcuValidator: YulePlugin = {
  id: 'example-mcu-validator',
  name: 'MCU Clock Validator',
  version: '1.0.0',
  type: 'validator',
  description:
    'Validates MCU module clock configuration including frequency, PLL, and oscillator settings',
  author: 'YuleTech Examples',

  async activate(context: PluginContext): Promise<void> {
    context.logger.info('Activating McuValidator');

    const validator: ValidatorPlugin = {
      name: 'McuClockValidator',
      description:
        'Checks clock frequency range, PLL multiplier/divider sanity, and external oscillator configuration',
      // Only applies to the "Mcu" module
      targetModules: ['Mcu'],

      async validate(config: Record<string, unknown>): Promise<ValidationResult[]> {
        return validateMcuConfig(config);
      },
    };

    context.registerValidator(validator);
    context.logger.info('McuClockValidator registered for module "Mcu"');
  },

  async deactivate(): Promise<void> {
    console.info('[example-mcu-validator] Plugin deactivated');
  },
};

export default mcuValidator;
