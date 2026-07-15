import { describe, it, expect } from 'vitest';
import { generateHeader } from '../codegen';
import type { ConfigModule } from '@/types/config';

function makeMinimalModule(overrides: Partial<ConfigModule>): ConfigModule {
  return {
    id: 'test',
    name: 'Test',
    version: '1.0',
    enabled: true,
    layer: 'MCAL',
    containers: [],
    parameters: [],
    dependencies: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    configStatus: 'configured',
    ...overrides,
  };
}

describe('Codegen - Module header generation', () => {
  it('should generate Adc_Cfg.h for ADC module', async () => {
    const module = makeMinimalModule({
      id: 'adc',
      name: 'ADC Driver',
      version: '44',
      containers: [{
        id: 'adcconfigset',
        name: 'ConfigSet',
        multiple: true,
        parameters: [
          { id: 'hwu_id', name: 'adcHwUnitId', type: 'string', value: 'ADC0' },
          { id: 'res', name: 'adcResolution', type: 'string', value: 'BITS_12' },
        ],
        subContainers: [{
          id: 'adchwunit_0',
          name: 'AdcHwUnit_0',
          shortName: 'AdcHwUnit',
          parameters: [
            { id: 'hwu_id', name: 'adcHwUnitId', type: 'string', value: 'ADC0' },
            { id: 'res', name: 'adcResolution', type: 'string', value: 'BITS_12' },
          ],
        }],
      }],
    });
    const result = await generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Adc_Cfg.h');
    expect(result!.content).toContain('ADC_MODULE_ID');
    expect(result!.content).toContain('ADC_VENDOR_ID');
  });

  it('should generate Can_Cfg.h for CAN module', async () => {
    const module = makeMinimalModule({
      id: 'can',
      name: 'Can',
      version: '4.4.0',
      containers: [{
        id: 'cangeneral',
        name: 'CanGeneral',
        parameters: [
          { id: 'det', name: 'CanDevErrorDetect', type: 'boolean', value: false },
        ],
      }, {
        id: 'canconfigset',
        name: 'CanConfigSet',
        multiple: true,
        parameters: [],
        subContainers: [{
          id: 'cancontroller_0',
          name: 'CanController_0',
          shortName: 'CanController',
          parameters: [
            { id: 'baud', name: 'canBaudrate', type: 'integer', value: 500000 },
          ],
        }],
      }],
    });
    const result = await generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Can_Cfg.h');
    expect(result!.content).toContain('CAN_MODULE_ID');
    expect(result!.content).toContain('CAN_VENDOR_ID');
  });

  it('should generate Mcu_Cfg.h for MCU module', async () => {
    const module = makeMinimalModule({
      id: 'mcu',
      name: 'Mcu',
      version: '4.4.0',
      containers: [{
        id: 'mcuclocksetting',
        name: 'McuClockSettingConfig',
        multiple: true,
        parameters: [],
        subContainers: [{
          id: 'mcuclocksetting_0',
          name: 'McuClockSettingMode_0',
          shortName: 'McuClockSettingConfig',
          parameters: [
            { id: 'core', name: 'mcuCoreClock', type: 'integer', value: 96000000 },
            { id: 'pll', name: 'mcuPllRefClk', type: 'integer', value: 8000000 },
          ],
        }],
      }],
    });
    const result = await generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Mcu_Cfg.h');
    expect(result!.content).toContain('MCU_MODULE_ID');
  });

  it('should generate Port_Cfg.h for PORT module', async () => {
    const module = makeMinimalModule({
      id: 'port',
      name: 'Port',
      version: '4.4.0',
      containers: [{
        id: 'portconfigset',
        name: 'PortConfigSet',
        multiple: true,
        parameters: [],
        subContainers: [{
          id: 'portcontainer_0',
          name: 'PortContainer_0',
          shortName: 'PortPin',
          parameters: [
            { id: 'pin', name: 'portPinId', type: 'integer', value: 5 },
            { id: 'dir', name: 'portPinDirection', type: 'string', value: 'PORT_PIN_OUT' },
          ],
        }],
      }],
    });
    const result = await generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Port_Cfg.h');
    expect(result!.content).toContain('PORT_MODULE_ID');
  });

  it('should generate Dio_Cfg.h for DIO module', async () => {
    const module = makeMinimalModule({
      id: 'dio',
      name: 'Dio',
      version: '41',
      containers: [{
        id: 'dioconfig',
        name: 'DioConfig',
        parameters: [
          { id: 'p1', name: 'PortId_0', type: 'integer', value: 0 },
          { id: 'ch1', name: 'ChannelId_0', type: 'integer', value: 1 },
        ],
      }],
    });
    const result = await generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Dio_Cfg.h');
    expect(result!.content).toContain('DIO_MODULE_ID');
  });

  it('should skip disabled modules in generateAllHeaders', async () => {
    const { generateAllHeaders } = await import('../codegen');
    const module = makeMinimalModule({ id: 'adc', enabled: false });
    const results = await generateAllHeaders([module]);
    expect(results).toHaveLength(0);
  });

  it('should generate header even for unknown module names', async () => {
    const module = makeMinimalModule({ id: 'unknown_chip', name: 'UnknownChip' });
    const result = await generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Unknownchip_Cfg.h');
    expect(result!.content).toContain('MODULE_ID');
  });

  it('should generate Gpt_Cfg.h for GPT module', async () => {
    const module = makeMinimalModule({
      id: 'gpt',
      name: 'Gpt',
      version: '121',
      containers: [{
        id: 'gptchannelconfigset',
        name: 'GptChannelConfigSet',
        multiple: true,
        parameters: [],
        subContainers: [{
          id: 'gptch_0',
          name: 'GptChannelConfiguration_0',
          shortName: 'GptChannel',
          parameters: [
            { id: 'freq', name: 'gptTickFrequency', type: 'integer', value: 1000 },
            { id: 'mode', name: 'gptChannelMode', type: 'string', value: 'GPT_CH_MODE_ONESHOT' },
          ],
        }],
      }],
    });
    const result = await generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Gpt_Cfg.h');
    expect(result!.content).toContain('GPT_MODULE_ID');
  });
});
