/**
 * arxml-templates 测试（R2 · 模板机制）
 *
 * 覆盖：依赖先建、查重防重复、create 后 append、appendToPackage=false、
 * ref() 引用路径、create 非法返回报错、GenericTemplate 全自由。
 */

import { describe, expect, it } from 'vitest';

import {
  ElementTemplate,
  GenericTemplate,
  type NamedElement,
} from '../element-template';
import { ApplicationSwcTemplate, SenderReceiverInterfaceTemplate } from '../swc-templates';
import { TemplateWorkspace } from '../workspace';
import type { SwcProjectConfig } from '../../types/swc';

function emptyProject(): SwcProjectConfig {
  return {
    applicationComponents: [],
    compositionComponents: [],
    applicationDataTypes: [],
    implementationDataTypes: [],
    interfaces: [],
    compuMethods: [],
  };
}

describe('TemplateWorkspace.apply · ElementTemplate 自动化四步', () => {
  it('依赖先建：接口模板先于 SWC 落地，端口引用已建接口', () => {
    const workspace = new TemplateWorkspace(emptyProject());
    const ifaceTemplate = new SenderReceiverInterfaceTemplate('VehicleSpeed_I', {
      description: '车速信号',
      dataElements: [{ name: 'VehicleSpeed', typeRef: 'VehicleSpeed_T' }],
    });
    const swcTemplate = new ApplicationSwcTemplate(
      'App_SpeedSensor',
      {
        ports: [{ name: 'VehicleSpeed_In', direction: 'IN', interfaceName: 'VehicleSpeed_I' }],
      },
      [ifaceTemplate]
    );

    const swc = workspace.apply(swcTemplate);

    // 依赖接口已创建（依赖先建）
    expect(workspace.project.interfaces?.map(i => i.name)).toEqual(['VehicleSpeed_I']);
    // SWC 已 append（create 后追加）
    expect(workspace.project.applicationComponents.map(c => c.name)).toEqual([
      'App_SpeedSensor',
    ]);
    expect(swc.ports).toEqual([
      { name: 'VehicleSpeed_In', direction: 'IN', interfaceRef: 'VehicleSpeed_I' },
    ]);
    // 依赖表里的接口自动挂到 SWC.interfaces
    expect(swc.interfaces.map(i => i.name)).toEqual(['VehicleSpeed_I']);
  });

  it('查重防重复：重复 apply 返回既有元素，集合不增长（幂等）', () => {
    const workspace = new TemplateWorkspace(emptyProject());
    const template = new ApplicationSwcTemplate('App_SpeedSensor', {}, [
      new SenderReceiverInterfaceTemplate('VehicleSpeed_I'),
    ]);

    const first = workspace.apply(template);
    const second = workspace.apply(template);

    expect(second).toBe(first);
    expect(workspace.project.applicationComponents).toHaveLength(1);
    expect(workspace.project.interfaces).toHaveLength(1);
  });

  it('无依赖模板独立 apply：接口模板直接落 Interface 包', () => {
    const workspace = new TemplateWorkspace(emptyProject());
    const iface = workspace.apply(
      new SenderReceiverInterfaceTemplate('Diag_I', {
        dataElements: [{ name: 'DiagRequest', typeRef: 'DiagRequest_T' }],
      })
    );

    expect(iface.name).toBe('Diag_I');
    expect(iface.kind).toBe('SenderReceiverInterface');
    expect(workspace.project.interfaces).toHaveLength(1);
  });

  it('appendToPackage=false：元素创建但不落地（如仅用于引用）', () => {
    class DetachedTemplate extends ElementTemplate<{ name: string; tag: string }> {
      create(): { name: string; tag: string } {
        return { name: this.elementName, tag: 'detached' };
      }
    }

    const workspace = new TemplateWorkspace(emptyProject());
    const template = new DetachedTemplate('Temp_Only', 'ApplicationComponent', [], false);

    const element = workspace.apply(template);
    expect(element.tag).toBe('detached');
    expect(workspace.project.applicationComponents).toHaveLength(0);
  });

  it('ref() 预计算元素引用路径', () => {
    expect(new SenderReceiverInterfaceTemplate('VehicleSpeed_I').ref()).toBe(
      '/Interfaces/VehicleSpeed_I'
    );
    expect(new ApplicationSwcTemplate('App_SpeedSensor').ref()).toBe(
      '/Components/ApplicationComponents/App_SpeedSensor'
    );
  });

  it('create 返回非模型对象抛 AssignmentTypeError', () => {
    class BadTemplate extends ElementTemplate<NamedElement> {
      create(): NamedElement {
        // 运行时返回无 name 的对象（模拟实现错误）
        return { name: 42 as unknown as string };
      }
    }

    const workspace = new TemplateWorkspace(emptyProject());
    expect(() => workspace.apply(new BadTemplate('Bad', 'ApplicationComponent'))).toThrow(
      /create\(\) 必须返回带 name 的模型元素/
    );
  });
});

describe('GenericTemplate 全自由扩展', () => {
  it('apply 直接转发，workspace 不干预', () => {
    class AddCompuMethodTemplate extends GenericTemplate {
      apply(workspace: TemplateWorkspace): unknown {
        workspace.project.compuMethods ??= [];
        workspace.project.compuMethods.push({
          name: 'Linear_1',
          category: 'LINEAR',
          scales: [],
        });
        return 'ok';
      }
    }

    const workspace = new TemplateWorkspace(emptyProject());
    const result = workspace.apply(new AddCompuMethodTemplate());

    expect(result).toBe('ok');
    expect(workspace.project.compuMethods).toHaveLength(1);
  });
});
