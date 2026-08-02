import { describe, it, expect } from 'vitest';

import { generateAuditReport } from '../configReportGenerator';

import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config';

function makeParam(
  id: string,
  name: string,
  value: unknown,
  overrides: Partial<ConfigParameter> = {}
): ConfigParameter {
  return { id, name, type: 'string', value, ...overrides } as ConfigParameter;
}

function makeModule(overrides: Partial<ConfigModule> = {}): ConfigModule {
  return {
    id: 'm1',
    name: 'Can',
    displayName: 'CAN Driver',
    version: '4.4.0',
    autosarVersion: '4.4.0',
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

function makeConfig(overrides: Partial<ConfigFile> = {}): ConfigFile {
  return {
    id: 'cfg1',
    name: 'Test Config',
    modules: [makeModule()],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('generateAuditReport XSS escaping (Fix 25)', () => {
  it('escapes config name in title and header', () => {
    const html = generateAuditReport(makeConfig({ name: 'Evil</title><script>alert(1)</script>' }));
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes parameter values in tables', () => {
    const module = makeModule({
      parameters: [
        makeParam('p1', 'Safe', 'normal'),
        makeParam('p2', 'Unsafe', '<img src=x onerror=alert(1)>'),
      ],
    });
    const html = generateAuditReport(makeConfig({ modules: [module] }));

    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes parameter display names and units', () => {
    const module = makeModule({
      parameters: [
        makeParam('p1', 'Name', 'v', {
          displayName: '<b>Bold</b>',
          unit: '"inch"',
        }),
      ],
    });
    const html = generateAuditReport(makeConfig({ modules: [module] }));

    expect(html).not.toContain('<b>Bold</b>');
    expect(html).toContain('&lt;b&gt;Bold&lt;/b&gt;');
    expect(html).toContain('&quot;inch&quot;');
  });

  it('escapes module names, descriptions, and validation errors', () => {
    // 报告显示 displayName || name —— 让 name 生效需清空 displayName
    const module = makeModule({
      name: '<svg/onload=alert(1)>',
      displayName: undefined,
      description: 'desc <script>x</script>',
      validationErrors: ['<script>alert("err")</script>'],
    });
    const html = generateAuditReport(makeConfig({ modules: [module] }));

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;svg/onload=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(&quot;err&quot;)&lt;/script&gt;');
  });

  it('escapes container names and dependency module names', () => {
    const module = makeModule({
      containers: [
        {
          id: 'c1',
          name: 'Container<script>',
          displayName: undefined,
          parameters: [makeParam('p1', 'Rate', '100')],
          subContainers: [],
        } as ConfigContainer,
      ],
      dependencies: [{ module: '<script>dep</script>', required: true }],
    });
    const html = generateAuditReport(makeConfig({ modules: [module] }));

    expect(html).not.toContain('<script>');
    expect(html).toContain('Container&lt;script&gt;');
    expect(html).toContain('&lt;script&gt;dep&lt;/script&gt;');
  });

  it('escapes config id, target chip, compiler and OS version', () => {
    const html = generateAuditReport(
      makeConfig({
        id: 'id<script>',
        targetChip: 'chip<img>',
        targetPlatform: 'plat"x"',
        compiler: 'gcc<&>',
        version: '1.0</strong><script>',
        os: {
          id: 'os1',
          name: 'OS',
          version: '<script>os</script>',
          enabled: true,
          scalabilityClass: 'SC1',
          statusLevel: 'STANDARD',
          startupHooks: false,
          shutdownHooks: false,
          errorHooks: false,
          protectionHooks: false,
          tasks: [],
          events: [],
          alarms: [],
          resources: [],
          counters: [],
          scheduleTables: [],
          isrs: [],
        },
      })
    );

    expect(html).not.toContain('<script>');
    expect(html).toContain('id&lt;script&gt;');
    expect(html).toContain('chip&lt;img&gt;');
    expect(html).toContain('&lt;script&gt;os&lt;/script&gt;');
  });

  it('keeps valid HTML structure intact for normal configs', () => {
    const html = generateAuditReport(makeConfig({ name: 'Normal Config' }));
    expect(html).toContain('<title>Configuration Audit Report - Normal Config</title>');
    expect(html).toContain('CAN Driver');
    expect(html).toContain('</html>');
  });
});
