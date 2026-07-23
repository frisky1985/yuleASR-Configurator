#!/usr/bin/env node
/**
 * yuleASR-Configurator Baseline Manager
 * 
 * Generates reference baseline files for all 8 BSW modules.
 * Baselines are stored in tests/integration/baseline/ and serve
 * as the "golden" reference for regression detection.
 * 
 * Usage:
 *   node scripts/manage-baseline.cjs [generate|verify|diff]
 * 
 * Commands:
 *   generate  — Generate fresh baselines (run after verified success)
 *   verify    — Compare current output against baselines
 *   diff      — Show diff between current and baseline
 */

const { EcucCodeGenerator } = require(require('path').join(__dirname, '..', 'packages/@yuletech/core/dist/generator/index.js'));
const { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } = require('fs');
const { join, resolve } = require('path');

const PROJECT_ROOT = resolve(__dirname, '..');
const BASELINE_DIR = join(PROJECT_ROOT, 'tests/integration/baseline');
const TMP_DIR = join(PROJECT_ROOT, '.baseline-tmp');

const command = process.argv[2] || 'generate';

// Module definitions matching the integration tests
const MODULE_DEFINITIONS = [
  // Can
  { module: 'Can', label: 'CAN Driver', version: '4.4.0',
    parameters: { canDevErrorDetect: true, canVersionInfoApi: true, canNumControllers: 2, canNumHoh: 8, canNumBaudrateConfigs: 1, canBaudrate500K: 500000 },
    paramDefs: [{ name: 'canDevErrorDetect', type: 'boolean', required: true }, { name: 'canVersionInfoApi', type: 'boolean' }, { name: 'canNumControllers', type: 'integer', required: true }, { name: 'canNumHoh', type: 'integer', required: true }],
    containers: { CanController: [{ id: 'c0', parameters: { canControllerId: 0, canBaudrate: 500000 } }, { id: 'c1', parameters: { canControllerId: 1, canBaudrate: 500000 } }], CanHardwareObject: [{ id: 'hoh0', parameters: { hohId: 0, hohType: 'RX' } }, { id: 'hoh1', parameters: { hohId: 1, hohType: 'RX' } }] },
    containerDefs: [{ name: 'CanController', label: 'CAN Controller', multiple: true, minInstances: 1, maxInstances: 4, parameters: ['canControllerId', 'canBaudrate'] }, { name: 'CanHardwareObject', label: 'CAN Hardware Object', multiple: true, minInstances: 1, maxInstances: 32, parameters: ['hohId', 'hohType'] }],
  },
  // Mcu
  { module: 'Mcu', label: 'MCU Driver', version: '4.4.0',
    parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4, mcuDevErrorDetect: true },
    paramDefs: [{ name: 'mcuClockSetting', type: 'integer', required: true }, { name: 'mcuRamSectors', type: 'integer' }, { name: 'mcuDevErrorDetect', type: 'boolean' }],
    containers: { McuClockSettingConfig: [{ id: 'clk0', parameters: { clockId: 0, clockFrequency: 16000000 } }] },
    containerDefs: [{ name: 'McuClockSettingConfig', label: 'Clock Setting', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['clockId', 'clockFrequency'] }],
  },
  // Port
  { module: 'Port', label: 'PORT Driver', version: '4.4.0',
    parameters: { portDevErrorDetect: true, portPinCount: 8 },
    paramDefs: [{ name: 'portDevErrorDetect', type: 'boolean' }, { name: 'portPinCount', type: 'integer', required: true }],
    containers: { PortPin: [{ id: 'p0', parameters: { pinId: 0, pinDirection: 1 } }, { id: 'p1', parameters: { pinId: 1, pinDirection: 0 } }] },
    containerDefs: [{ name: 'PortPin', label: 'Port Pin', multiple: true, minInstances: 1, maxInstances: 64, parameters: ['pinId', 'pinDirection'] }],
  },
  // Dio
  { module: 'Dio', label: 'DIO Driver', version: '4.4.0',
    parameters: { dioDevErrorDetect: true, dioVersionInfoApi: true, dioFlipChannelApi: true, dioMaskedWritePortApi: true, dioNumPorts: 8, dioNumChannelsPerPort: 32 },
    paramDefs: [{ name: 'dioDevErrorDetect', type: 'boolean', required: true }, { name: 'dioVersionInfoApi', type: 'boolean' }, { name: 'dioFlipChannelApi', type: 'boolean' }, { name: 'dioNumPorts', type: 'integer', required: true }],
    containers: { DioPort: [{ id: 'pa', parameters: { portId: 0 } }, { id: 'pb', parameters: { portId: 1 } }], DioChannel: [{ id: 'a0', parameters: { channelId: 0x0000, portRef: 0 } }, { id: 'b0', parameters: { channelId: 0x0100, portRef: 1 } }] },
    containerDefs: [{ name: 'DioPort', label: 'DIO Port', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['portId'] }, { name: 'DioChannel', label: 'DIO Channel', multiple: true, minInstances: 1, maxInstances: 64, parameters: ['channelId', 'portRef'] }],
  },
  // Adc
  { module: 'Adc', label: 'ADC Driver', version: '4.4.0',
    parameters: { adcDevErrorDetect: true, adcVersionInfoApi: true, adcDeInitApi: true, adcHwTriggerApi: true, adcNumHwUnits: 2, adcNumGroups: 8, adcNumChannels: 16, adcClockFrequencyHz: 24000000 },
    paramDefs: [{ name: 'adcDevErrorDetect', type: 'boolean', required: true }, { name: 'adcNumHwUnits', type: 'integer', required: true }, { name: 'adcNumGroups', type: 'integer', required: true }, { name: 'adcNumChannels', type: 'integer', required: true }],
    containers: { AdcHwUnit: [{ id: 'hw0', parameters: { hwUnitId: 0 } }, { id: 'hw1', parameters: { hwUnitId: 1 } }], AdcGroup: [{ id: 'grp0', parameters: { groupId: 0, hwUnitRef: 0 } }], AdcChannel: [{ id: 'ch0', parameters: { channelId: 0 } }, { id: 'ch1', parameters: { channelId: 1 } }] },
    containerDefs: [{ name: 'AdcHwUnit', label: 'ADC HW Unit', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['hwUnitId'] }, { name: 'AdcGroup', label: 'ADC Group', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['groupId', 'hwUnitRef'] }, { name: 'AdcChannel', label: 'ADC Channel', multiple: true, minInstances: 1, maxInstances: 32, parameters: ['channelId'] }],
  },
  // Spi
  { module: 'Spi', label: 'SPI Driver', version: '4.4.0',
    parameters: { spiDevErrorDetect: true, spiVersionInfoApi: true, spiChannelBuffersAllowed: 2, spiHwStatusApi: true, spiNumChannels: 8, spiNumJobs: 8, spiNumSequences: 4, spiNumHwUnits: 4, spiMaxBufferSize: 256 },
    paramDefs: [{ name: 'spiDevErrorDetect', type: 'boolean', required: true }, { name: 'spiNumChannels', type: 'integer', required: true }, { name: 'spiNumJobs', type: 'integer', required: true }, { name: 'spiNumSequences', type: 'integer', required: true }],
    containers: { SpiChannel: [{ id: 'ch0', parameters: { channelId: 0 } }, { id: 'ch1', parameters: { channelId: 1 } }], SpiHwUnit: [{ id: 'hw0', parameters: { hwUnitId: 0 } }, { id: 'hw1', parameters: { hwUnitId: 1 } }] },
    containerDefs: [{ name: 'SpiChannel', label: 'SPI Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId'] }, { name: 'SpiHwUnit', label: 'SPI HW Unit', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['hwUnitId'] }],
  },
  // Gpt
  { module: 'Gpt', label: 'GPT Driver', version: '4.4.0',
    parameters: { gptDevErrorDetect: true, gptVersionInfoApi: true, gptDeinitApi: true, gptTimeElapsedApi: true, gptTimeRemainingApi: true, gptNumChannels: 8, gptClockFrequencyHz: 24000000, gptMaxTickValue: 0xFFFFFFFF },
    paramDefs: [{ name: 'gptDevErrorDetect', type: 'boolean', required: true }, { name: 'gptNumChannels', type: 'integer', required: true }],
    containers: { GptChannel: [{ id: 'ch0', parameters: { channelId: 0, tickFrequency: 1000000 } }, { id: 'ch1', parameters: { channelId: 1, tickFrequency: 1000000 } }] },
    containerDefs: [{ name: 'GptChannel', label: 'GPT Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId', 'tickFrequency'] }],
  },
  // Pwm
  { module: 'Pwm', label: 'PWM Driver', version: '4.4.0',
    parameters: { pwmDevErrorDetect: true, pwmVersionInfoApi: true, pwmDeInitApi: true, pwmSetDutyCycleApi: true, pwmSetPeriodAndDutyApi: true, pwmNotificationSupported: true, pwmNumChannels: 8, pwmClockFrequencyHz: 24000000 },
    paramDefs: [{ name: 'pwmDevErrorDetect', type: 'boolean', required: true }, { name: 'pwmNumChannels', type: 'integer', required: true }],
    containers: { PwmChannel: [{ id: 'ch0', parameters: { channelId: 0, defaultPeriod: 1000, defaultDutyCycle: 0x4000 } }, { id: 'ch1', parameters: { channelId: 1, defaultPeriod: 1000, defaultDutyCycle: 0x4000 } }] },
    containerDefs: [{ name: 'PwmChannel', label: 'PWM Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId', 'defaultPeriod', 'defaultDutyCycle'] }],
  },
];

function generateBaselines() {
  const gen = new EcucCodeGenerator();
  mkdirSync(BASELINE_DIR, { recursive: true });

  for (const def of MODULE_DEFINITIONS) {
    const config = { module: def.module, version: def.version, parameters: def.parameters, containers: def.containers };
    const schema = { name: def.module, label: def.label, layer: 'MCAL', version: def.version, parameters: def.paramDefs, containers: def.containerDefs };

    const moduleDir = join(TMP_DIR, def.module);
    mkdirSync(moduleDir, { recursive: true });

    const result = gen.generate(config, schema, { outputDir: moduleDir, generateComments: true });
    if (!result.success) {
      console.error(`Failed to generate baseline for ${def.module}`);
      process.exit(1);
    }

    const modBaselineDir = join(BASELINE_DIR, def.module);
    mkdirSync(modBaselineDir, { recursive: true });

    for (const f of result.files) {
      const filename = require('path').basename(f.path);
      writeFileSync(join(modBaselineDir, filename), f.content);
      console.log(`  ✓ ${def.module}/${filename}`);
    }
  }
  console.log(`\nBaselines generated: ${BASELINE_DIR}`);
}

function verifyBaselines() {
  const gen = new EcucCodeGenerator();
  let allMatch = true;

  for (const def of MODULE_DEFINITIONS) {
    const config = { module: def.module, version: def.version, parameters: def.parameters, containers: def.containers };
    const schema = { name: def.module, label: def.label, layer: 'MCAL', version: def.version, parameters: def.paramDefs, containers: def.containerDefs };

    const moduleDir = join(TMP_DIR, def.module);
    mkdirSync(moduleDir, { recursive: true });

    const result = gen.generate(config, schema, { outputDir: moduleDir, generateComments: true });
    if (!result.success) {
      console.error(`Failed to generate for ${def.module}`);
      process.exit(1);
    }

    const modBaselineDir = join(BASELINE_DIR, def.module);
    if (!existsSync(modBaselineDir)) {
      console.error(`  ✗ ${def.module}: baseline directory not found. Run 'generate' first.`);
      allMatch = false;
      continue;
    }

    for (const f of result.files) {
      const filename = require('path').basename(f.path);
      const baselinePath = join(modBaselineDir, filename);
      const currentContent = f.content.replace(/@date\s+.*/g, '@date [STRIPPED]');

      if (!existsSync(baselinePath)) {
        console.error(`  ✗ ${def.module}/${filename}: no baseline file`);
        allMatch = false;
        continue;
      }

      const baselineContent = readFileSync(baselinePath, 'utf-8').replace(/@date\s+.*/g, '@date [STRIPPED]');
      if (currentContent !== baselineContent) {
        console.error(`  ✗ ${def.module}/${filename}: content mismatch`);
        allMatch = false;
      } else {
        console.log(`  ✓ ${def.module}/${filename}: matches baseline`);
      }
    }
  }
  return allMatch;
}

// Main
console.log(`yuleASR Baseline Manager — command: ${command}\n`);

switch (command) {
  case 'generate':
    generateBaselines();
    break;
  case 'verify':
    const ok = verifyBaselines();
    console.log(`\n${ok ? '✅ All baselines match' : '❌ Some baselines differ'}`);
    process.exit(ok ? 0 : 1);
    break;
  case 'diff':
    // TODO: implement diff
    console.log('Diff command not yet implemented. Use verify for now.');
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.log('Usage: node scripts/manage-baseline.cjs [generate|verify|diff]');
    process.exit(1);
}
