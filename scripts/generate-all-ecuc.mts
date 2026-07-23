#!/usr/bin/env node
/**
 * generate-all-ecuc.mjs — Generate ECUC files for all yuleASR BSW modules
 * 
 * Usage:
 *   node scripts/generate-all-ecuc.mjs                   # → dist/ecuc-output/
 *   node scripts/generate-all-ecuc.mjs /path/to/yuleASR/config/generated
 * 
 * This is the production-grade generation script that the yuleASR
 * build system calls to regenerate ECUC configuration files.
 */

import { EcucCodeGenerator } from '../packages/@yuletech/core/src/generator/ecuc-generator.ts';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

const CONFIGURATOR_DIR = dirname(new URL(import.meta.url).pathname);
const DEFAULT_OUTPUT = join(CONFIGURATOR_DIR, 'dist/ecuc-output');
const outputDir = process.argv[2] || DEFAULT_OUTPUT;

// All 8 BSW module configurations matching yuleASR config/input/mcal/*
const MODULE_DEFINITIONS = [
  { module: 'Can', label: 'CAN Driver', version: '4.4.0',
    parameters: { canDevErrorDetect: true, canVersionInfoApi: true, canNumControllers: 2, canNumHoh: 8, canNumBaudrateConfigs: 1, canBaudrate500K: 500000 },
    paramDefs: [{ name: 'canDevErrorDetect', type: 'boolean', required: true }, { name: 'canVersionInfoApi', type: 'boolean' }, { name: 'canNumControllers', type: 'integer', required: true }, { name: 'canNumHoh', type: 'integer', required: true }],
    containers: { CanController: [{ id: 'c0', parameters: { canControllerId: 0, canBaudrate: 500000 } }, { id: 'c1', parameters: { canControllerId: 1, canBaudrate: 500000 } }], CanHardwareObject: [{ id: 'hoh0', parameters: { hohId: 0, hohType: 'RX' } }, { id: 'hoh1', parameters: { hohId: 1, hohType: 'RX' } }] },
    containerDefs: [{ name: 'CanController', label: 'CAN Controller', multiple: true, minInstances: 1, maxInstances: 4, parameters: ['canControllerId', 'canBaudrate'] }, { name: 'CanHardwareObject', label: 'CAN Hardware Object', multiple: true, minInstances: 1, maxInstances: 32, parameters: ['hohId', 'hohType'] }],
  },
  { module: 'Mcu', label: 'MCU Driver', version: '4.4.0',
    parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4, mcuDevErrorDetect: true },
    paramDefs: [{ name: 'mcuClockSetting', type: 'integer', required: true }, { name: 'mcuRamSectors', type: 'integer' }, { name: 'mcuDevErrorDetect', type: 'boolean' }],
    containers: { McuClockSettingConfig: [{ id: 'clk0', parameters: { clockId: 0, clockFrequency: 16000000 } }] },
    containerDefs: [{ name: 'McuClockSettingConfig', label: 'Clock Setting', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['clockId', 'clockFrequency'] }],
  },
  { module: 'Port', label: 'PORT Driver', version: '4.4.0',
    parameters: { portDevErrorDetect: true, portPinCount: 8 },
    paramDefs: [{ name: 'portDevErrorDetect', type: 'boolean' }, { name: 'portPinCount', type: 'integer', required: true }],
    containers: { PortPin: [{ id: 'p0', parameters: { pinId: 0, pinDirection: 1 } }, { id: 'p1', parameters: { pinId: 1, pinDirection: 0 } }] },
    containerDefs: [{ name: 'PortPin', label: 'Port Pin', multiple: true, minInstances: 1, maxInstances: 64, parameters: ['pinId', 'pinDirection'] }],
  },
  { module: 'Dio', label: 'DIO Driver', version: '4.4.0',
    parameters: { dioDevErrorDetect: true, dioVersionInfoApi: true, dioFlipChannelApi: true, dioMaskedWritePortApi: true, dioNumPorts: 8, dioNumChannelsPerPort: 32, dioNumChannelGroups: 4 },
    paramDefs: [{ name: 'dioDevErrorDetect', type: 'boolean', required: true }, { name: 'dioVersionInfoApi', type: 'boolean' }, { name: 'dioFlipChannelApi', type: 'boolean' }, { name: 'dioNumPorts', type: 'integer', required: true }, { name: 'dioNumChannelsPerPort', type: 'integer' }],
    containers: { DioPort: [{ id: 'pa', parameters: { portId: 0 } }, { id: 'pb', parameters: { portId: 1 } }], DioChannel: [{ id: 'a0', parameters: { channelId: 0x0000, portRef: 0 } }, { id: 'b0', parameters: { channelId: 0x0100, portRef: 1 } }] },
    containerDefs: [{ name: 'DioPort', label: 'DIO Port', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['portId'] }, { name: 'DioChannel', label: 'DIO Channel', multiple: true, minInstances: 1, maxInstances: 64, parameters: ['channelId', 'portRef'] }],
  },
  { module: 'Adc', label: 'ADC Driver', version: '4.4.0',
    parameters: { adcDevErrorDetect: true, adcVersionInfoApi: true, adcDeInitApi: true, adcHwTriggerApi: true, adcNumHwUnits: 2, adcNumGroups: 8, adcNumChannels: 16, adcClockFrequencyHz: 24000000 },
    paramDefs: [{ name: 'adcDevErrorDetect', type: 'boolean', required: true }, { name: 'adcNumHwUnits', type: 'integer', required: true }, { name: 'adcNumGroups', type: 'integer', required: true }, { name: 'adcNumChannels', type: 'integer', required: true }],
    containers: { AdcHwUnit: [{ id: 'hw0', parameters: { hwUnitId: 0 } }, { id: 'hw1', parameters: { hwUnitId: 1 } }], AdcGroup: [{ id: 'grp0', parameters: { groupId: 0, hwUnitRef: 0 } }], AdcChannel: [{ id: 'ch0', parameters: { channelId: 0 } }, { id: 'ch1', parameters: { channelId: 1 } }] },
    containerDefs: [{ name: 'AdcHwUnit', label: 'ADC HW Unit', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['hwUnitId'] }, { name: 'AdcGroup', label: 'ADC Group', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['groupId', 'hwUnitRef'] }, { name: 'AdcChannel', label: 'ADC Channel', multiple: true, minInstances: 1, maxInstances: 32, parameters: ['channelId'] }],
  },
  { module: 'Spi', label: 'SPI Driver', version: '4.4.0',
    parameters: { spiDevErrorDetect: true, spiVersionInfoApi: true, spiChannelBuffersAllowed: 2, spiHwStatusApi: true, spiNumChannels: 8, spiNumJobs: 8, spiNumSequences: 4, spiNumHwUnits: 4, spiMaxBufferSize: 256 },
    paramDefs: [{ name: 'spiDevErrorDetect', type: 'boolean', required: true }, { name: 'spiNumChannels', type: 'integer', required: true }, { name: 'spiNumJobs', type: 'integer' }, { name: 'spiNumSequences', type: 'integer' }],
    containers: { SpiChannel: [{ id: 'ch0', parameters: { channelId: 0 } }, { id: 'ch1', parameters: { channelId: 1 } }], SpiHwUnit: [{ id: 'hw0', parameters: { hwUnitId: 0 } }, { id: 'hw1', parameters: { hwUnitId: 1 } }] },
    containerDefs: [{ name: 'SpiChannel', label: 'SPI Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId'] }, { name: 'SpiHwUnit', label: 'SPI HW Unit', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['hwUnitId'] }],
  },
  { module: 'Gpt', label: 'GPT Driver', version: '4.4.0',
    parameters: { gptDevErrorDetect: true, gptVersionInfoApi: true, gptDeinitApi: true, gptTimeElapsedApi: true, gptTimeRemainingApi: true, gptNumChannels: 8, gptClockFrequencyHz: 24000000, gptMaxTickValue: 0xFFFFFFFF },
    paramDefs: [{ name: 'gptDevErrorDetect', type: 'boolean', required: true }, { name: 'gptNumChannels', type: 'integer', required: true }],
    containers: { GptChannel: [{ id: 'ch0', parameters: { channelId: 0, tickFrequency: 1000000 } }, { id: 'ch1', parameters: { channelId: 1, tickFrequency: 1000000 } }] },
    containerDefs: [{ name: 'GptChannel', label: 'GPT Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId', 'tickFrequency'] }],
  },
  { module: 'Pwm', label: 'PWM Driver', version: '4.4.0',
    parameters: { pwmDevErrorDetect: true, pwmVersionInfoApi: true, pwmDeInitApi: true, pwmSetDutyCycleApi: true, pwmSetPeriodAndDutyApi: true, pwmNotificationSupported: true, pwmNumChannels: 8, pwmClockFrequencyHz: 24000000 },
    paramDefs: [{ name: 'pwmDevErrorDetect', type: 'boolean', required: true }, { name: 'pwmNumChannels', type: 'integer', required: true }],
    containers: { PwmChannel: [{ id: 'ch0', parameters: { channelId: 0, defaultPeriod: 1000, defaultDutyCycle: 0x4000 } }, { id: 'ch1', parameters: { channelId: 1, defaultPeriod: 1000, defaultDutyCycle: 0x4000 } }] },
    containerDefs: [{ name: 'PwmChannel', label: 'PWM Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId', 'defaultPeriod', 'defaultDutyCycle'] }],
  },
];

async function main() {
  console.log('==============================================');
  console.log(' yuleASR-Configurator — Full ECUC Generation');
  console.log(` Output: ${outputDir}`);
  console.log(` Modules: ${MODULE_DEFINITIONS.map(m => m.module).join(', ')}`);
  console.log('==============================================\n');

  const gen = new EcucCodeGenerator();
  mkdirSync(outputDir, { recursive: true });

  let totalFiles = 0;
  for (const def of MODULE_DEFINITIONS) {
    const config = { module: def.module, version: def.version, parameters: def.parameters, containers: def.containers };
    const schema = { name: def.module, label: def.label, layer: 'MCAL', version: def.version, parameters: def.paramDefs, containers: def.containerDefs };

    const result = await gen.generate(config, schema, { outputDir, generateComments: true });
    if (!result.success) {
      console.error(` ❌ ${def.module}: generation failed`);
      process.exit(1);
    }

    for (const f of result.files) {
      const fn = require('path').basename(f.path);
      writeFileSync(join(outputDir, fn), f.content);
      console.log(`   ✅ ${def.module}/${fn}`);
      totalFiles++;
    }
  }

  console.log(`\n ✅ Generated ${totalFiles} files across ${MODULE_DEFINITIONS.length} modules\n`);

  // Syntax check if gcc available
  try {
    execSync('gcc --version', { stdio: 'pipe' });
    console.log('Performing GCC syntax check...');
    let pass = 0, fail = 0;
    for (const def of MODULE_DEFINITIONS) {
      for (const suffix of ['_Cfg.h', '.c', '_PBcfg.c', '_Lcfg.c']) {
        const filePath = join(outputDir, `Ecuc_${def.module}${suffix}`);
        if (!existsSync(filePath)) continue;
        try {
          const isHeader = suffix === '_Cfg.h';
          if (isHeader) {
            execSync(`gcc -fsyntax-only -x c ${filePath}`, { stdio: 'pipe', timeout: 15000 });
          } else {
            execSync(`gcc -fsyntax-only ${filePath}`, { stdio: 'pipe', timeout: 15000 });
          }
          pass++;
        } catch {
          console.error(`   ⚠️  ${def.module}${suffix}: syntax check failed`);
          fail++;
        }
      }
    }
    console.log(`   Syntax check: ${pass} passed, ${fail} failed`);
  } catch {
    console.log('   (gcc not available, skipping syntax check)');
  }

  console.log('\n✅ ECUC generation complete');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
