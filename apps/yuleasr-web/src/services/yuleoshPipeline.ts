/**
 * yuleOSH Pipeline API Service
 *
 * Connects yuleASR-Configurator to yuleOSH for pipeline trigger + status polling.
 */

// Fix 26: yuleOSH 默认地址仅 dev 生效 —— 生产环境未配置 VITE_YULEOSH_API_URL
// 时不再裸调 localhost（localhost CSRF/DNS rebinding 风险），直接提示未配置。
const DEFAULT_YULEOSH_URL = import.meta.env.DEV ? 'http://127.0.0.1:8080' : '';
const YULEOSH_API_BASE = import.meta.env.VITE_YULEOSH_API_URL ?? DEFAULT_YULEOSH_URL;

function requireYuleoshBase(): string {
  if (!YULEOSH_API_BASE) {
    throw new Error('yuleOSH 服务未配置：请设置 VITE_YULEOSH_API_URL 环境变量');
  }
  return YULEOSH_API_BASE;
}

/** Pipeline job status type matching yuleOSH backend */
export interface PipelineJob {
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

export interface PipelineStage {
  key: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

/** Pipeline trigger request payload */
export interface PipelineTriggerRequest {
  config_json?: string;
  arxml_content?: string;
  project_dir?: string;
  type?: 'full' | 'ci';
  layer?: number;
}

/** Pipeline trigger response */
export interface PipelineTriggerResponse {
  ok: boolean;
  job_id: string;
  status: string;
  type: string;
  poll_url: string;
  error?: string;
}

/** Pipeline status response */
export interface PipelineStatusResponse {
  ok: boolean;
  job: PipelineJob;
  error?: string;
}

/** Pipeline runs list response */
export interface PipelineRunsResponse {
  ok: boolean;
  runs: Array<{
    job_id: string;
    status: string;
    type: string;
    progress: number;
    current_stage: string;
    started_at: string | null;
    completed_at: string | null;
  }>;
  count: number;
}

/**
 * Trigger a new full pipeline run with config
 */
export async function triggerPipeline(
  payload: PipelineTriggerRequest
): Promise<PipelineTriggerResponse> {
  const response = await fetch(`${requireYuleoshBase()}/api/v1/pipeline/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pipeline trigger failed (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Poll pipeline job status
 */
export async function getPipelineStatus(jobId: string): Promise<PipelineStatusResponse> {
  const response = await fetch(
    `${requireYuleoshBase()}/api/v1/pipeline/status/${jobId}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pipeline status failed (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * List recent pipeline runs
 */
export async function listPipelineRuns(): Promise<PipelineRunsResponse> {
  const response = await fetch(
    `${requireYuleoshBase()}/api/v1/pipeline/runs`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Pipeline runs list failed (${response.status})`);
  }

  return response.json();
}

/**
 * Poll a job until completion or failure
 * Returns when status is 'passed' or 'failed', or after timeout
 */
export async function pollUntilDone(
  jobId: string,
  onUpdate?: (job: PipelineJob) => void,
  intervalMs: number = 3000,
  timeoutMs: number = 300_000
): Promise<PipelineJob> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const resp = await getPipelineStatus(jobId);
    if (!resp.ok) {
      throw new Error(`Polling failed: ${resp.error}`);
    }

    const job = resp.job;
    onUpdate?.(job);

    if (job.status === 'passed' || job.status === 'failed') {
      return job;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Pipeline polling timed out after ${timeoutMs}ms`);
}

export default {
  triggerPipeline,
  getPipelineStatus,
  listPipelineRuns,
  pollUntilDone,
};
