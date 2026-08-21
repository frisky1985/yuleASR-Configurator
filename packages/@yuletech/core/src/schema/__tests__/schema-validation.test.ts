import fs from 'fs';
import path from 'path';

import { describe, it, expect } from 'vitest';

const GENERATED_DIR = path.resolve(__dirname, '../generated');

function getSchemaFiles(): string[] {
  return fs
    .readdirSync(GENERATED_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();
}

describe('JSON Schema Validation', () => {
  const files = getSchemaFiles();

  it('should have exactly 118 schema files (54 existing + 63 CfgH-extracted − 3 deleted: ble/mcl/sbc + 5 补全: ethtsyn/ldcom/tm/dds/microdds − 1: dlt_ecual 并入 dlt)', () => {
    // 2026-08-01: 39 → 54; 2026-08-09 (F1): 54 → 117 (+63 yuleASR Cfg.h 自动提取)
    // YAC-MAP-002（2026-08-21 老板裁决）：ble/mcl/sbc 删除（无实现），ethtsyn/ldcom/tm/dds/microdds 补全（有代码无 schema）
    // YAC-MAP-003（2026-08-21）：dlt_ecual 删除（yuleASR ecual/dlt 并入 services/dlt）→ 119 → 118
    expect(files.length).toBe(118);
  });

  it.each(files)('should parse %s as valid JSON', file => {
    const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it.each(files)('should have valid schema structure in %s', file => {
    const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8');
    const schema = JSON.parse(content);

    expect(schema).toHaveProperty('title');
    expect(typeof schema.title).toBe('string');
    expect(schema.title.length).toBeGreaterThan(0);

    expect(schema).toHaveProperty('type', 'object');
    expect(schema).toHaveProperty('properties');
    expect(typeof schema.properties).toBe('object');

    expect(schema).toHaveProperty('x-layer');
    expect(['MCAL', 'ECUAL', 'Service', 'RTE', 'OS', 'ASW']).toContain(schema['x-layer']);
  });

  it.each(files)('should include CommonPublishedInformation in %s', file => {
    const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8');
    const schema = JSON.parse(content);
    const cpi = schema.properties?.CommonPublishedInformation;
    // D 类修复（2026-08-10）：CfgH-Extracted 提取版不再强制附加 CPI 容器——
    // 手写头版本宏（AR_RELEASE_*/MODULE_ID/SW_*/VENDOR_ID）由普通参数 rawMacroNames
    // 原样保留；强加 8 个版本宏会与模块 .h 重复定义 / 抢占 #ifndef 守卫（V5 D 类 7 模块根因）。
    if (schema['x-source'] === 'CfgH-Extracted') {
      expect(cpi, `${file} CfgH-Extracted 不应附加 CPI 容器（D 类修复，版本宏由普通参数保留）`).toBeUndefined();
      return;
    }
    expect(cpi, `${file} 缺 CommonPublishedInformation (AUTOSAR ECUC 标准容器)`).toBeDefined();
    expect(cpi.type).toBe('object');
    // AUTOSAR 标准 8 字段
    const cpiFields = [
      'ArReleaseMajorVersion', 'ArReleaseMinorVersion', 'ArReleaseRevisionVersion',
      'ModuleId', 'SwMajorVersion', 'SwMinorVersion', 'SwPatchVersion', 'VendorId',
    ];
    for (const f of cpiFields) {
      expect(cpi.properties?.[f], `${file} CPI 缺字段 ${f}`).toBeDefined();
      expect(cpi.properties[f].type).toBe('integer');
    }
  });

  it('should enum-ify known AUTOSAR enum parameters (PortPinDirection / GptChannelMode)', () => {
    const port = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'port.json'), 'utf8'));
    const gpt = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'gpt.json'), 'utf8'));

    function findEnums(node: any, paramName: string, out: any[]) {
      if (!node || typeof node !== 'object') return;
      if (node[paramName] && Array.isArray(node[paramName].enum)) out.push(node[paramName].enum);
      for (const v of Object.values(node)) {
        if (v && typeof v === 'object') findEnums(v, paramName, out);
      }
    }
    const portDirs: any[] = [];
    const gptModes: any[] = [];
    findEnums(port, 'PortPinDirection', portDirs);
    findEnums(gpt, 'GptChannelMode', gptModes);

    expect(portDirs.length).toBeGreaterThan(0);
    for (const e of portDirs) {
      expect(e).toEqual(['PORT_PIN_IN', 'PORT_PIN_OUT']);
    }
    expect(gptModes.length).toBeGreaterThan(0);
    for (const e of gptModes) {
      expect(e).toEqual(['GPT_CHANNEL_MODE_CONTINUOUS', 'GPT_CHANNEL_MODE_ONESHOT']);
    }
  });

  it('should cover all expected BSW modules', () => {
    const names = files.map(f => f.replace('.json', ''));
    const expected = [
      'adc',
      'appswc',
      'arti',
      'boot',
      'bswm',
      'can',
      'canif',
      'cannm',
      'cannm_ecual',
      'cansm',
      'cantp',
      'cantrcv',
      'cantsyn',
      'cddfvm',
      'com',
      'comm',
      'compswc',
      'crc',
      'cryif',
      'crypto',
      'csm',
      'dcm',
      'dds',
      'dem',
      'dem_legacy',
      'det',
      'dio',
      'dlt',
      'docan',
      'doip',
      'doip_ecual',
      'e2e',
      'ea',
      'ecuc',
      'ecum',
      'eep',
      'eth',
      'ethif',
      'ethsm',
      'ethsm_ecual',
      'ethswt',
      'ethtrcv',
      'ethtsyn',
      'fee',
      'fee_ecual',
      'fim',
      'fim_ecual',
      'flash',
      'fls',
      'flstst',
      'fr',
      'frif',
      'frtp',
      'gpt',
      'i2c',
      'icu',
      'iohwab',
      'ipdum',
      'ipdum_ecual',
      'j1939nm',
      'j1939tp',
      'j1939tp_ecual',
      'keym',
      'ldcom',
      'lin',
      'linif',
      'linker',
      'linm',
      'linmaster',
      'linnm',
      'linslave',
      'linsm',
      'linsm_ecual',
      'lintp',
      'lintp_ecual',
      'lintrcv',
      'mcu',
      'mem',
      'memif',
      'memif_ecual',
      'microdds',
      'mqtt',
      'nm',
      'nvm',
      'nvmecchandler',
      'ocu',
      'os',
      'ostimingprotection',
      'pdur',
      'port',
      'pwm',
      'ramsafety',
      'ramtst',
      'ramtst_service',
      'rte',
      'schm',
      'sd',
      'secoc',
      'soad',
      'someip',
      'someipif',
      'someipsd',
      'someipsd_ecual',
      'someiptp',
      'someipxf',
      'spi',
      'srp',
      'stbm',
      'swc',
      'tcpip',
      'tm',
      'uart',
      'udpnm',
      'wdg',
      'wdgif',
      'wdgm',
      'xcp',
      'xcp_ecual',
    ];
    expect(names.sort()).toEqual(expected.sort());
  });

  it('should parse all 117 module schemas as valid JSON (AUTOSAR 合规基线)', () => {
    for (const file of files) {
      const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8');
      expect(() => JSON.parse(content), `${file} 不是合法 JSON`).not.toThrow();
    }
  });

  it('can.json 应包含 crossReferences (ReferenceDef 表达) 且元素字段完整', () => {
    const can = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'can.json'), 'utf8'));
    expect(Array.isArray(can.crossReferences)).toBe(true);
    expect(can.crossReferences.length).toBeGreaterThan(0);
    for (const ref of can.crossReferences) {
      expect(ref).toHaveProperty('module');
      expect(ref).toHaveProperty('param');
      expect(ref).toHaveProperty('relation');
      expect(ref).toHaveProperty('severity');
      expect(ref).toHaveProperty('description');
    }
  });

  it('can.json 应包含 x-multiplicity (顶层或容器)', () => {
    const can = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'can.json'), 'utf8'));
    const hasMultiplicity =
      typeof can['x-multiplicity'] === 'string' ||
      Object.values(can.properties ?? {}).some(
        (p: any) => p && typeof p === 'object' && typeof p['x-multiplicity'] === 'string'
      );
    expect(hasMultiplicity, 'can.json 顶层或容器应含 x-multiplicity').toBe(true);
  });

  it('至少一个 schema 含 x-config-class (ConfigurationClass)', () => {
    const withConfigClass: string[] = [];
    for (const file of files) {
      const schema = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8'));
      const found = (function scan(node: any): boolean {
        if (!node || typeof node !== 'object') return false;
        if (typeof node['x-config-class'] === 'string') return true;
        return Object.values(node).some(v => scan(v));
      })(schema);
      if (found) withConfigClass.push(file);
    }
    expect(withConfigClass, `含 x-config-class 的 schema: ${withConfigClass.join(', ')}`).not.toHaveLength(0);
  });

  it('至少一个 schema 含 x-choice-container (ChoiceContainerDef 表达, P2-3)', () => {
    const withChoice: string[] = [];
    for (const file of files) {
      const schema = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8'));
      const found = (function scan(node: any): boolean {
        if (!node || typeof node !== 'object') return false;
        if (node['x-choice-container'] === true) return true;
        return Object.values(node).some(v => scan(v));
      })(schema);
      if (found) withChoice.push(file);
    }
    expect(withChoice, `含 x-choice-container 的 schema: ${withChoice.join(', ')}`).not.toHaveLength(0);
  });

  it('x-choice-container 容器应含 x-choice-params 且参数真实存在', () => {
    for (const file of files) {
      const schema = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8'));
      const walk = (node: any, path: string): void => {
        if (!node || typeof node !== 'object') return;
        if (node['x-choice-container'] === true) {
          expect(
            Array.isArray(node['x-choice-params']) && node['x-choice-params'].length > 0,
            `${file} ${path} 应含 x-choice-params`
          ).toBe(true);
          for (const p of node['x-choice-params']) {
            expect(
              node.properties?.[p],
              `${file} ${path} 的互斥参数 ${p} 应存在于容器`
            ).toBeTruthy();
          }
        }
        for (const [k, v] of Object.entries(node)) {
          if (v && typeof v === 'object') walk(v, `${path}.${k}`);
        }
      };
      walk(schema, '');
    }
  });

  it('mcu.json 应含 McuGeneral 容器及 McuClockReferenceFrequency (P2-3 补充)', () => {
    const mcu = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'mcu.json'), 'utf8'));
    const general = mcu.properties?.McuGeneral;
    expect(general, 'mcu.json 应含 McuGeneral 容器').toBeTruthy();
    const freq = general?.properties?.McuClockReferenceFrequency;
    expect(freq, 'McuGeneral 应含 McuClockReferenceFrequency').toBeTruthy();
    expect(freq.type).toBe('integer');
    expect(freq['x-config-class']).toBe('POSTBUILD');
  });

  it('Gpt/Spi/Adc 应含指向 Mcu.McuClockReferenceFrequency 的 crossReferences', () => {
    for (const mod of ['gpt', 'spi', 'adc']) {
      const schema = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, `${mod}.json`), 'utf8'));
      const refs = schema.crossReferences ?? [];
      const mcuRef = refs.find(
        (r: any) => r.module === 'Mcu' && r.param === 'McuClockReferenceFrequency'
      );
      expect(mcuRef, `${mod}.json 应引用 Mcu.McuClockReferenceFrequency`).toBeTruthy();
      expect(mcuRef.relation).toBe('less_than');
    }
  });
});
