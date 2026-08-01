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

  it('should have exactly 54 schema files', () => {
    // 2026-08-01: 39 → 54 (模块扩展: +ea/eep/eth/ethif/fr/frif/i2c/lin/linif/pwm/uart/wdg/wdgif/wdgm/xcp)
    expect(files.length).toBe(54);
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
      'ble',
      'bswm',
      'can',
      'canif',
      'cannm',
      'cansm',
      'cantp',
      'cantrcv',
      'com',
      'comm',
      'compswc',
      'crc',
      'cryif',
      'crypto',
      'csm',
      'dcm',
      'dem',
      'det',
      'dio',
      'ecum',
      'ea',
      'eep',
      'eth',
      'ethif',
      'fee',
      'fls',
      'fr',
      'frif',
      'gpt',
      'i2c',
      'icu',
      'iohwab',
      'lin',
      'linif',
      'mcl',
      'mcu',
      'memif',
      'nm',
      'nvm',
      'os',
      'pdur',
      'port',
      'pwm',
      'rte',
      'sbc',
      'spi',
      'uart',
      'wdg',
      'wdgif',
      'wdgm',
      'xcp',
    ];
    expect(names.sort()).toEqual(expected.sort());
  });

  it('should parse all 54 module schemas as valid JSON (AUTOSAR 合规基线)', () => {
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
});
