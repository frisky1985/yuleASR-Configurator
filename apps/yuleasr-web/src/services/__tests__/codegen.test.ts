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
  it('should generate Adc_Cfg.h for ADC module', () => {
    const module = makeMinimalModule({
      id: 'adc',
      name: 'ADC Driver',
      version: '44',
      containers: [{
        id: 'adcconfigset',
        name: 'ConfigSet',
        parameters: [
          { id: 'hwu_id', name: 'adcHwUnitId', type: 'string', value: 'ADC0' },
          { id: 'res', name: 'adcResolution', type: 'string', value: 'BITS_12' },
        ],
      }],
    });
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Adc_Cfg.h');
    expect(result!.content).toContain('ADC_MODULE_ID');
    expect(result!.content).toContain('ADC_VENDOR_ID');
  });

  it('should generate Can_Cfg.h for CAN module', () => {
    const module = makeMinimalModule({
      id: 'can',
      name: 'CAN Driver',
      version: '80',
      containers: [{
        id: 'canconfigset',
        name: 'ConfigSet',
        parameters: [
          { id: 'baud', name: 'canBaudrate', type: 'integer', value: 500000 },
        ],
        subContainers: [{
          id: 'cancontroller_0',
          name: 'CanController_0',
          parameters: [
            { id: 'baud', name: 'canBaudrate', type: 'integer', value: 500000 },
          ],
          subContainers: [],
        }],
      }],
    });
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Can_Cfg.h');
    expect(result!.content).toContain('CAN_MODULE_ID');
    expect(result!.content).toContain('CAN_VENDOR_ID');
    expect(result!.content).toContain('CAN_CONTROLLER_COUNT');
  });

  it('should generate Mcu_Cfg.h for MCU module', () => {
    const module = makeMinimalModule({
      id: 'mcu',
      name: 'MCU Driver',
      version: '43',
      containers: [{
        id: 'mcuclocksetting',
        name: 'McuClockSetting',
        parameters: [
          { id: 'core', name: 'mcuCoreClock', type: 'integer', value: 96000000 },
          { id: 'pll', name: 'mcuPllRefClk', type: 'integer', value: 8000000 },
        ],
        subContainers: [{
          id: 'mcuclocksetting_0',
          name: 'McuClockSettingMode_0',
          parameters: [
            { id: 'core', name: 'mcuCoreClock', type: 'integer', value: 96000000 },
            { id: 'pll', name: 'mcuPllRefClk', type: 'integer', value: 8000000 },
          ],
        }],
      }],
    });
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Mcu_Cfg.h');
    expect(result!.content).toContain('MCU_MODULE_ID');
  });

  it('should generate Port_Cfg.h for PORT module', () => {
    const module = makeMinimalModule({
      id: 'port',
      name: 'PORT Driver',
      version: '42',
      containers: [{
        id: 'portconfigset',
        name: 'PortConfigSet',
        parameters: [
          { id: 'pin', name: 'portPinId', type: 'integer', value: 5 },
          { id: 'dir', name: 'portPinDirection', type: 'string', value: 'PORT_PIN_OUT' },
        ],
        subContainers: [{
          id: 'portcontainer_0',
          name: 'PortContainer_0',
          parameters: [],
          subContainers: [{
            id: 'portpin_0',
            name: 'PortPin_0',
            parameters: [
              { id: 'pin', name: 'portPinId', type: 'integer', value: 5 },
              { id: 'dir', name: 'portPinDirection', type: 'string', value: 'PORT_PIN_OUT' },
              { id: 'mode', name: 'portPinMode', type: 'string', value: 'PORT_PIN_MODE_GPIO' },
            ],
          }],
        }],
      }],
    });
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Port_Cfg.h');
    expect(result!.content).toContain('PORT_MODULE_ID');
  });

  it('should generate Dio_Cfg.h for DIO module', () => {
    const module = makeMinimalModule({
      id: 'dio',
      name: 'DIO Driver',
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
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Dio_Cfg.h');
    expect(result!.content).toContain('DIO_MODULE_ID');
    expect(result!.content).toContain('DIO_NUMBER_OF_PORTS');
  });

  it('should skip disabled modules in generateAllHeaders', async () => {
    // generateHeader() does not check enabled — that's in generateAllHeaders()
    const { generateAllHeaders } = await import('../codegen');
    const module = makeMinimalModule({ id: 'adc', enabled: false });
    const results = generateAllHeaders([module]);
    expect(results).toHaveLength(0);
  });

  it('should return null for unknown modules', () => {
    const module = makeMinimalModule({ id: 'unknown_chip' });
    const result = generateHeader(module);
    expect(result).toBeNull();
  });

  it('should generate Gpt_Cfg.h for GPT module', () => {
    const module = makeMinimalModule({
      id: 'gpt',
      name: 'GPT Driver',
      version: '121',
      containers: [{
        id: 'gptchannelconfigset',
        name: 'GptChannelConfigSet',
        parameters: [],
        subContainers: [{
          id: 'gptch_0',
          name: 'GptChannelConfiguration_0',
          parameters: [
            { id: 'freq', name: 'gptTickFrequency', type: 'integer', value: 1000 },
            { id: 'mode', name: 'gptChannelMode', type: 'string', value: 'GPT_CH_MODE_ONESHOT' },
          ],
        }],
      }],
    });
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Gpt_Cfg.h');
    expect(result!.content).toContain('GPT_MODULE_ID');
  });
});
