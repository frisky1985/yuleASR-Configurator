/**
 * ARXML SWC 层导入服务测试（Web 薄重导出层）
 *
 * 验证：core 的 arxml-import 后端经 web 服务层可正常调用，
 * 返回 Configurator 现有数据模型（SwcProjectConfig）+ 导入报告。
 */

import { describe, it, expect } from 'vitest';

import { importSwcArxml } from '../arxml-swc-import';

const MINIMAL_ARXML = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>AppSwc</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>WebDoor</SHORT-NAME>
          <PORTS>
            <P-PORT-PROTOTYPE>
              <SHORT-NAME>State_P</SHORT-NAME>
              <PROVIDED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/Interfaces/State_IF</PROVIDED-INTERFACE-TREF>
            </P-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

describe('arxml-swc-import web service', () => {
  it('re-exports importSwcArxml from @yuletech/core/arxml-import', () => {
    const { project, report } = importSwcArxml(MINIMAL_ARXML, 'web.arxml');

    expect(project.applicationComponents).toHaveLength(1);
    expect(project.applicationComponents[0].name).toBe('WebDoor');
    expect(project.applicationComponents[0].ports[0].name).toBe('State_P');
    expect(project.applicationComponents[0].ports[0].direction).toBe('OUT');
    expect(report.counts.swComponents).toBe(1);
    expect(report.counts.ports).toBe(1);
    expect(report.errors).toHaveLength(0);
  });
});
