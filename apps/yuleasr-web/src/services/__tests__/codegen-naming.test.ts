import { describe, expect, it } from 'vitest';

import { getModuleShortName } from '../codegen';

/**
 * YAC-MAP-002（2026-08-21 老板裁决）— 命名映射显式化单测。
 *
 * 背景：yuleASR 文件名/目录名 ≠ Configurator schema id（canm↔cannm、lntm↔lintp、
 * cdd 家族等），getModuleShortName known 表补显式条目防漂移。
 * 映射表文档：docs/planning/2026-08-21-module-mapping-naming.md
 */
describe('getModuleShortName — 命名映射显式条目（YAC-MAP-002）', () => {
  it('canm↔cannm：yuleASR CanNm → Configurator id=cannm/cannm_ecual → CanNm', () => {
    expect(getModuleShortName('cannm')).toBe('CanNm');
    expect(getModuleShortName('cannm_ecual')).toBe('CanNm');
  });

  it('cdd 家族：cddfvm → Cdd_Fvm（头文件名/宏前缀对齐）', () => {
    expect(getModuleShortName('cddfvm')).toBe('Cdd_Fvm');
  });

  it('lntm↔lintp：services/lntm + ecual/lintp 双版 → LinTp（DoIP 双版先例）', () => {
    expect(getModuleShortName('lintp')).toBe('LinTp');
    expect(getModuleShortName('lintp_ecual')).toBe('LinTp');
  });

  it('YAC-MAP-002 补全模块：ethtsyn/ldcom/tm/dds/microdds 头文件名精确化', () => {
    expect(getModuleShortName('ethtsyn')).toBe('EthTSyn');
    expect(getModuleShortName('ldcom')).toBe('LdCom');
    expect(getModuleShortName('tm')).toBe('Tm');
    expect(getModuleShortName('dds')).toBe('Dds');
    expect(getModuleShortName('microdds')).toBe('MicroDds');
  });

  it('既有 known 条目不回归（MCAL + F1 别名）', () => {
    expect(getModuleShortName('can')).toBe('Can');
    expect(getModuleShortName('mcu')).toBe('Mcu');
    expect(getModuleShortName('secoc')).toBe('SecOC');
    expect(getModuleShortName('someip')).toBe('SomeIp');
    expect(getModuleShortName('tcpip')).toBe('TcpIp');
    expect(getModuleShortName('udpnm')).toBe('UdpNm');
    expect(getModuleShortName('e2e')).toBe('E2E');
  });

  it('未知 id 兜底 PascalCase（原行为不变）', () => {
    expect(getModuleShortName('somefuturemod')).toBe('Somefuturemod');
  });
});
