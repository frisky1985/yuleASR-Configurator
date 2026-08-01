import { describe, it, expect } from 'vitest';

import { loadModuleSchemas } from '../../schema/load-generated';
import { createChoiceContainerValidator } from '../choice-container-validator';
import { validateAll } from '../validation-pipeline';
import type { ModuleConfig } from '../../types';

describe('P2-3 ChoiceContainerDef end-to-end', () => {
  it('loader should expose x-choice-container annotations on annotated modules', () => {
    const schemas = loadModuleSchemas();
    const wdg = schemas.find(s => s.name === 'Wdg')!;
    const wdgDevice = wdg.containers?.find(c => c.name === 'WdgDevice');
    expect(wdgDevice?.xChoiceContainer).toBe(true);
    expect(wdgDevice?.xChoiceParams).toContain('WdgTriggeredMode');

    const spi = schemas.find(s => s.name === 'Spi')!;
    const spiDriver = spi.containers?.find(c => c.name === 'SpiDriver');
    expect(spiDriver?.xChoiceContainer).toBe(true);
    expect(spiDriver?.xChoiceParams).toContain('SpiChannelType');
  });

  it('annotated modules should be discoverable across all 54', () => {
    const schemas = loadModuleSchemas();
    const withChoice = schemas.filter(
      s => s.containers?.some(c => c.xChoiceContainer)
    );
    expect(withChoice.length).toBeGreaterThanOrEqual(4);
  });

  it('validator should flag conflicting choice params from real schemas', () => {
    const schemas = loadModuleSchemas();
    const validator = createChoiceContainerValidator(schemas);

    // WdgDevice 容器实例中同时设置两个互斥参数 → 报错
    const configs: ModuleConfig[] = [
      {
        module: 'Wdg',
        version: '4.4.0',
        parameters: {},
        containers: {
          WdgDevice: [
            {
              id: 'd1',
              parameters: {
                WdgTriggeredMode: 'WDG_TRIGGERED_MODE_PRETRIGGER',
                WdgTriggerConditionValue: 100,
              },
            },
          ],
        },
      },
    ];
    const errors = validator.validate(configs);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('CHOICE_CONTAINER_EXCLUSIVE');
  });

  it('pipeline should include choiceContainerErrors', () => {
    const schemas = loadModuleSchemas();
    const configs: ModuleConfig[] = [
      {
        module: 'Wdg',
        version: '4.4.0',
        parameters: {},
        containers: {
          WdgDevice: [
            {
              id: 'd1',
              parameters: {
                WdgTriggeredMode: 'WDG_TRIGGERED_MODE_PRETRIGGER',
                WdgTriggerConditionValue: 100,
              },
            },
          ],
        },
      },
    ];
    const result = validateAll(configs, schemas);
    expect(result.choiceContainerErrors).toHaveLength(1);
    expect(result.allErrors.some(e => e.code === 'CHOICE_CONTAINER_EXCLUSIVE')).toBe(true);
  });
});
