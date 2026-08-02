import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('probe import.meta.env.DEV', () => {
  it('default', async () => {
    vi.resetModules();
    const mod: any = await import('./env-probe-module');
    expect(mod.getDev()).toBe(true);
    expect(mod.getUrl()).toBe('dev-default');
  });

  it('stub DEV=false', async () => {
    vi.stubEnv('DEV', false);
    vi.resetModules();
    const mod: any = await import('./env-probe-module');
    expect(mod.getDev()).toBe(false);
    expect(mod.getUrl()).toBe('');
  });

  it('stub DEV=true', async () => {
    vi.stubEnv('DEV', true);
    vi.resetModules();
    const mod: any = await import('./env-probe-module');
    expect(mod.getDev()).toBe(true);
    expect(mod.getUrl()).toBe('dev-default');
  });

  it('stub DEV=false then true (sequence like real test)', async () => {
    vi.stubEnv('DEV', false);
    vi.resetModules();
    await import('./env-probe-module');
    vi.unstubAllEnvs();
    vi.stubEnv('DEV', true);
    vi.resetModules();
    const mod: any = await import('./env-probe-module');
    expect(mod.getDev()).toBe(true);
    expect(mod.getUrl()).toBe('dev-default');
  });
});
