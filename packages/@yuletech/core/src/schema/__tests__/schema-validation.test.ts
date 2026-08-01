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
});
