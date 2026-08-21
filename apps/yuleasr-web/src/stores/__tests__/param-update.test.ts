import { describe, it, expect, vi } from 'vitest';

import {
  matchesParamKey,
  parseParamPath,
  setContainerInstances,
  updateContainerParam,
} from '../param-update';

import type { ConfigContainer } from '@/types';

function makeContainer(overrides: Partial<ConfigContainer>): ConfigContainer {
  return {
    id: 'adcconfigset',
    name: 'AdcConfigSet',
    parameters: [
      { id: 'adcdozemode', name: 'DozeMode', type: 'enum', value: 'off' },
      { id: 'adcsampletime', name: 'SampleTime', type: 'float', value: 10.0 },
    ],
    ...overrides,
  };
}

describe('parseParamPath', () => {
  it('解析模块级参数路径', () => {
    const r = parseParamPath('layer:MCAL/module:adc/param:adcdozemode');
    expect(r.moduleId).toBe('adc');
    expect(r.containerId).toBeNull();
    expect(r.instanceName).toBeNull();
    expect(r.paramKey).toBe('adcdozemode');
  });

  it('解析静态容器参数路径', () => {
    const r = parseParamPath('layer:MCAL/module:adc/container:adcconfigset/param:SampleTime');
    expect(r.moduleId).toBe('adc');
    expect(r.containerId).toBe('adcconfigset');
    expect(r.paramKey).toBe('SampleTime');
  });

  it('解析动态实例参数路径', () => {
    const r = parseParamPath(
      'layer:MCAL/module:can/container:cancontroller/instance:CanController_0/param:baudrate'
    );
    expect(r.moduleId).toBe('can');
    expect(r.containerId).toBe('cancontroller');
    expect(r.instanceName).toBe('CanController_0');
    expect(r.paramKey).toBe('baudrate');
  });

  it('兼容旧路径：无 param 段时取最后一段', () => {
    const r = parseParamPath('layer:MCAL/module:adc/container:adcconfigset');
    expect(r.paramKey).toBe('adcconfigset');
  });
});

describe('matchesParamKey', () => {
  it('同时匹配 id 与 name', () => {
    const p = { id: 'adcdozemode', name: 'DozeMode' };
    expect(matchesParamKey(p, 'adcdozemode')).toBe(true);
    expect(matchesParamKey(p, 'DozeMode')).toBe(true);
    expect(matchesParamKey(p, 'nope')).toBe(false);
  });
});

describe('updateContainerParam', () => {
  it('更新静态容器参数（按 id）', () => {
    const containers = [makeContainer({})];
    const result = updateContainerParam(containers, 'adcconfigset', null, 'adcdozemode', 'on');
    expect(result[0].parameters[0].value).toBe('on');
    expect(result[0].parameters[1].value).toBe(10.0); // 未改动参数保持不变
  });

  it('更新静态容器参数（按 name，UI 传入路径）', () => {
    const containers = [makeContainer({})];
    const result = updateContainerParam(containers, 'adcconfigset', null, 'SampleTime', 20.5);
    expect(result[0].parameters[1].value).toBe(20.5);
  });

  it('更新动态实例参数（只更新目标实例）', () => {
    const containers = [
      makeContainer({
        id: 'cancontroller',
        multiple: true,
        instances: [
          { name: 'CanController_0', paramValues: { baudrate: 250000 } },
          { name: 'CanController_1', paramValues: { baudrate: 500000 } },
        ],
      }),
    ];
    const result = updateContainerParam(
      containers,
      'cancontroller',
      'CanController_0',
      'baudrate',
      1000000
    );
    expect(result[0].instances?.[0].paramValues.baudrate).toBe(1000000);
    expect(result[0].instances?.[1].paramValues.baudrate).toBe(500000); // 其他实例不变
  });

  it('递归更新子容器参数', () => {
    const containers = [
      makeContainer({
        subContainers: [
          makeContainer({
            id: 'nested',
            name: 'Nested',
            parameters: [{ id: 'depth', name: 'Depth', type: 'integer', value: 1 }],
          }),
        ],
      }),
    ];
    const result = updateContainerParam(containers, 'nested', null, 'depth', 99);
    expect(result[0].subContainers?.[0].parameters[0].value).toBe(99);
  });

  it('参数不存在时返回原对象并 console.error（不静默）', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const containers = [makeContainer({})];
    const result = updateContainerParam(containers, 'adcconfigset', null, 'notexist', 1);
    expect(result[0].parameters[0].value).toBe('off'); // 原值不变
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('setContainerInstances', () => {
  it('设置容器的实例集合（Fix C2 持久化）', () => {
    const containers = [makeContainer({ id: 'cancontroller', multiple: true })];
    const result = setContainerInstances(containers, 'cancontroller', [
      { name: 'CanController_0', paramValues: { baudrate: 250000 } },
    ]);
    expect(result[0].instances).toHaveLength(1);
    expect(result[0].instances?.[0].name).toBe('CanController_0');
  });

  it('递归定位嵌套容器并设置实例', () => {
    const containers = [
      makeContainer({
        subContainers: [makeContainer({ id: 'nested-can', multiple: true })],
      }),
    ];
    const result = setContainerInstances(containers, 'nested-can', [
      { name: 'Nested_0', paramValues: { baudrate: 500000 } },
    ]);
    expect(result[0].subContainers?.[0].instances?.[0].paramValues.baudrate).toBe(500000);
  });

  it('容器不存在时原样返回（不静默新建）', () => {
    const containers = [makeContainer({})];
    const result = setContainerInstances(containers, 'notexist', [
      { name: 'X_0', paramValues: {} },
    ]);
    expect(result[0].instances).toBeUndefined();
  });
});
