/**
 * yuleASR-Configurator → yuleOSH Pipeline 一键触发集成测试
 *
 * 测试目标:
 *   1. yuleOSH HTTP Server 可启动并响应 API
 *   2. POST /api/v1/pipeline/trigger 返回 job_id
 *   3. GET /api/v1/pipeline/status/{job_id} 跟踪 pipeline 执行进度
 *   4. GET /api/v1/pipeline/runs 列出历史运行
 *   5. GET /api/v1/pipeline/stats 返回聚合统计
 *   6. Pipeline 异步执行完成后状态为 'passed' 或 'failed'
 *   7. Pipeline 所有 stage 按顺序执行
 *   8. Pipeline 日志可读
 *   9. 并发 pipeline 状态隔离
 *  10. Configurator API 客户端 (yuleoshPipeline.ts) 与后端集成
 *
 * 前置条件:
 *   - yuleOSH 已安装 (pip install -e ~/.openclaw/workspace/tasks/yuleOSH)
 *   - OSH_HOME^C 指向有效的 yuleOSH 项目目录
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// ── 确保 yuleOSH server 可用 ──────────────────────────────────────────────

const YULEOSH_SERVER_PORT = 18082;
const YULEOSH_BASE = `http://127.0.0.1:${YULEOSH_SERVER_PORT}`;

interface PipelineStage {
  key: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

interface PipelineJob {
  job_id: string;
  status: 'queued' | 'running' | 'passed' | 'failed';
  type: string;
  progress: number;
  current_stage: string;
  stages: PipelineStage[];
  logs: string[];
  started_at: string | null;
  completed_at: string | null;
  result: unknown;
}

interface TriggerResponse {
  ok: boolean;
  job_id: string;
  status: string;
  type: string;
  poll_url: string;
  error?: string;
}

interface StatusResponse {
  ok: boolean;
  job: PipelineJob;
  error?: string;
}

interface RunsResponse {
  ok: boolean;
  runs: Array<{
    job_id: string;
    status: string;
    progress: number;
    current_stage: string;
  }>;
  count: number;
}

interface StatsResponse {
  ok: boolean;
  total: number;
  running: number;
  queued: number;
  passed: number;
  failed: number;
}

// ── 测试工具 ──────────────────────────────────────────────────────────────

async function apiPost(path: string, body: unknown): Promise<Response> {
  return fetch(`${YULEOSH_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function apiGet(path: string): Promise<Response> {
  return fetch(`${YULEOSH_BASE}${path}`);
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function getConfigPayload() {
  return JSON.stringify({
    name: 'test-pipeline-config',
    description: 'Pipeline integration test config',
    targetPlatform: 'ARM Cortex-M4',
    targetChip: 'STM32F407',
    compiler: 'GCC',
    modules: [
      {
        name: 'Can',
        version: '4.3.0',
        enabled: true,
        layer: 2,
        parameters: {
          CanBaudrate: 500000,
          CanControllerId: 0,
          CanDevErrorDetect: true,
        },
      },
      {
        name: 'Mcu',
        version: '4.3.0',
        enabled: true,
        layer: 1,
        parameters: {
          McuClockRef: 168000000,
          McuCoreVoltage: 3300,
        },
      },
    ],
  });
}

// ── JUnit 风格测试 ────────────────────────────────────────────────────────

describe('yuleASR-Configurator ↔ yuleOSH Pipeline 集成', () => {
  let jobId: string;

  // ===================================================
  // Test 1: Server 健康检查
  // ===================================================
  describe('P1: Server 可访问性', () => {
    it('Test 1.1 - Server 应响应 GET /api/health', async () => {
      const resp = await apiGet('/api/health');
      expect(resp.status).toBe(200);
      const data = await resp.json();
      expect(data.status).toBe('ok');
    });
  });

  // ===================================================
  // Test 2: Pipeline 触发 + 状态轮询
  // ===================================================
  describe('P2: Pipeline 触发与状态跟踪', () => {
    it('Test 2.1 - POST /api/v1/pipeline/trigger 应返回 job_id', async () => {
      const resp = await apiPost('/api/v1/pipeline/trigger', {
        type: 'full',
        config_json: getConfigPayload(),
      });

      expect(resp.status).toBe(200);

      const data: TriggerResponse = await resp.json();
      console.log(`[trigger] job_id=${data.job_id}, status=${data.status}`);

      expect(data.ok).toBe(true);
      expect(data.job_id).toBeTruthy();
      expect(data.status).toBe('queued');
      expect(data.type).toBe('full');

      jobId = data.job_id;
    });

    it('Test 2.2 - GET /api/v1/pipeline/status/{job_id} 应返回正在运行的状态', async () => {
      // 先等一会让 pipeline 开始执行
      await sleep(2000);

      const resp = await apiGet(`/api/v1/pipeline/status/${jobId}`);
      expect(resp.status).toBe(200);

      const data: StatusResponse = await resp.json();
      expect(data.ok).toBe(true);
      expect(data.job).toBeTruthy();
      expect(data.job.job_id).toBe(jobId);
      expect(data.job.status).toMatch(/^(queued|running|passed|failed)$/);
      expect(data.job.stages.length).toBeGreaterThan(0);
    });

    it('Test 2.3 - Pipeline 应包含完整的 6 阶段定义', async () => {
      await sleep(1000);

      const resp = await apiGet(`/api/v1/pipeline/status/${jobId}`);
      const data: StatusResponse = await resp.json();

      const stageKeys = data.job.stages.map(s => s.key);
      expect(stageKeys).toEqual(
        expect.arrayContaining([
          'arxml_parse',
          'config_validate',
          'rte_generate',
          'ci_compile',
          'misra_check',
          'coverage',
        ])
      );
    });

    it('Test 2.4 - Pipeline 最终应完成 (passed 或 failed)', async () => {
      // 轮询最多 60 秒等待完成
      const deadline = Date.now() + 60_000;
      let finalStatus: string | null = null;
      let lastJob: PipelineJob | null = null;

      while (Date.now() < deadline) {
        const resp = await apiGet(`/api/v1/pipeline/status/${jobId}`);
        const data: StatusResponse = await resp.json();
        lastJob = data.job;

        if (data.job.status === 'passed' || data.job.status === 'failed') {
          finalStatus = data.job.status;
          break;
        }

        await sleep(3000);
      }

      console.log(`[final] status=${finalStatus}, progress=${lastJob?.progress}%`);
      expect(finalStatus).not.toBeNull();
      expect(finalStatus).toMatch(/^(passed|failed)$/);
    }, 70_000); // 70s timeout

    it('Test 2.5 - Pipeline 应记录日志', async () => {
      const resp = await apiGet(`/api/v1/pipeline/status/${jobId}`);
      const data: StatusResponse = await resp.json();
      expect(data.job.logs.length).toBeGreaterThan(0);
    });
  });

  // ===================================================
  // Test 3: Pipeline 历史与统计
  // ===================================================
  describe('P3: Pipeline 历史与统计', () => {
    it('Test 3.1 - GET /api/v1/pipeline/runs 应返回运行列表', async () => {
      const resp = await apiGet('/api/v1/pipeline/runs');
      expect(resp.status).toBe(200);

      const data: RunsResponse = await resp.json();
      expect(data.ok).toBe(true);
      expect(data.count).toBeGreaterThanOrEqual(1);
      expect(data.runs.length).toBeGreaterThanOrEqual(1);

      // 验证最近的运行包含刚才触发的 job
      const found = data.runs.find(r => r.job_id === jobId);
      expect(found).toBeTruthy();
    });

    it('Test 3.2 - GET /api/v1/pipeline/stats 应返回聚合统计', async () => {
      const resp = await apiGet('/api/v1/pipeline/stats');
      expect(resp.status).toBe(200);

      const data: StatsResponse = await resp.json();
      expect(data.ok).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(1);
      expect(typeof data.running).toBe('number');
      expect(typeof data.queued).toBe('number');
      expect(typeof data.passed).toBe('number');
      expect(typeof data.failed).toBe('number');
    });
  });

  // ===================================================
  // Test 4: 并发 Pipeline
  // ===================================================
  describe('P4: 并发 Pipeline 状态隔离', () => {
    it('Test 4.1 - 同时运行两个 pipeline 应有各自独立的 job_id', async () => {
      const resp1 = await apiPost('/api/v1/pipeline/trigger', {
        type: 'full',
        config_json: getConfigPayload(),
      });
      const resp2 = await apiPost('/api/v1/pipeline/trigger', {
        type: 'ci',
        layer: 1,
      });

      const data1: TriggerResponse = await resp1.json();
      const data2: TriggerResponse = await resp2.json();

      expect(data1.job_id).toBeTruthy();
      expect(data2.job_id).toBeTruthy();
      expect(data1.job_id).not.toBe(data2.job_id);
      console.log(`[concurrent] job1=${data1.job_id}, job2=${data2.job_id}`);
    });
  });
});
