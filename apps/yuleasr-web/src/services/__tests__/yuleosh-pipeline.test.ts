/**
 * Fix 26: yuleoshPipeline —— 默认地址仅 dev 生效；生产环境未配置
 * VITE_YULEOSH_API_URL 时提示「yuleOSH 服务未配置」，不再裸调 localhost。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const okJson = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('yuleoshPipeline 默认地址仅 dev（Fix 26）', () => {
  it('生产环境（DEV=false）未配置 VITE_YULEOSH_API_URL：抛「yuleOSH 服务未配置」', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_YULEOSH_API_URL', '');

    const mod = await import('../yuleoshPipeline');
    await expect(mod.triggerPipeline({ type: 'full' })).rejects.toThrow('yuleOSH 服务未配置');
    await expect(mod.getPipelineStatus('job-1')).rejects.toThrow('yuleOSH 服务未配置');
    await expect(mod.listPipelineRuns()).rejects.toThrow('yuleOSH 服务未配置');
    // 未配置时绝不能裸调 localhost
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('dev 环境未配置时默认指向 http://127.0.0.1:8080', async () => {
    // 注意: 不 stub VITE_YULEOSH_API_URL（未设置 → undefined → ?? 落到 dev 默认值）
    vi.stubEnv('DEV', true);
    vi.mocked(fetch).mockResolvedValue(
      okJson({ ok: true, job_id: 'j1', status: 'queued', type: 'full', poll_url: '' })
    );

    const mod = await import('../yuleoshPipeline');
    const resp = await mod.triggerPipeline({ type: 'full' });
    expect(resp.job_id).toBe('j1');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('http://127.0.0.1:8080/api/v1/pipeline/trigger'),
      expect.anything()
    );
  });

  it('生产环境配置 VITE_YULEOSH_API_URL：使用配置地址', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_YULEOSH_API_URL', 'https://osh.example.com');
    vi.mocked(fetch).mockResolvedValue(
      okJson({ ok: true, job_id: 'j2', status: 'queued', type: 'ci', poll_url: '' })
    );

    const mod = await import('../yuleoshPipeline');
    await mod.triggerPipeline({ type: 'ci' });
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('https://osh.example.com/api/v1/pipeline/trigger'),
      expect.anything()
    );
  });
});
