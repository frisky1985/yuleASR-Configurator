# yuleASR-Configurator ↔ yuleOSH Pipeline 一键触发集成报告

> **日期:** 2026-07-29 10:00-10:30 **任务:** P1-3 Configurator ↔
> Pipeline 一键触发集成 **状态:** ✅ 全部验证通过

---

## 1. 架构设计

### 1.1 集成架构

```
┌──────────────────────────────────────────────────┐
│  yuleASR-Configurator (React + TypeScript)        │
│                                                    │
│  Editor.tsx                                        │
│  ├── ▶ PipelinePushButton ──── triggerPipeline()   │
│  └── PipelineStatusPanel ───── getPipelineStatus() │
│                                                    │
│  Dashboard.tsx                                     │
│  └── PipelineStatusPanel ───── listPipelineRuns()  │
│                                                    │
│  yuleoshPipeline.ts (API 客户端)                    │
│  └── fetch() POST/GET http://127.0.0.1:8080      │
└──────────────────────┬───────────────────────────┘
                       │ HTTP
┌──────────────────────▼───────────────────────────┐
│  yuleOSH Pipeline Server (Python HTTP)            │
│  Port 8080                                        │
│                                                    │
│  handler_helpers.py (路由分发)                      │
│  ├── POST /api/v1/pipeline/trigger                │
│  ├── GET  /api/v1/pipeline/status/<job_id>        │
│  ├── GET  /api/v1/pipeline/runs                   │
│  └── GET  /api/v1/pipeline/stats                  │
│                                                    │
│  pipeline_routes.py (请求处理)                      │
│  └── handle_pipeline_trigger()                     │
│       └── async_runner.submit_full_pipeline()      │
│                                                    │
│  async_runner.py (异步执行引擎)                      │
│  ├── ThreadPoolExecutor (4 workers)                │
│  └── _PIPELINE_JOBS dict (内存状态存储)            │
└──────────────────────────────────────────────────┘
```

### 1.2 交互流程

```
用户点击 "Push to Pipeline"
        │
        ▼
PipelinePushButton.onClick()
        │  triggerPipeline({config_json, type:'full'})
        ▼
POST /api/v1/pipeline/trigger
        │  { ok: true, job_id: "abc123", status: "queued" }
        ▼
PipelineStatusPanel 开始轮询
        │  GET /api/v1/pipeline/status/abc123  (每 3s)
        ▼
┌─────────────┬─────────────┬──────────────┬──────────┐
│ ARXML 解析  │ 配置验证    │ RTE 代码生成  │ CI 编译  │
│ 15%         │ 30%         │ 50%          │ 70%      │
├─────────────┼─────────────┼──────────────┼──────────┤
│ MISRA 检查  │ 覆盖率分析   │ 完成         │          │
│ 85%         │ 100%        │ 成功 / 失败  │          │
└─────────────┴─────────────┴──────────────┴──────────┘
        │
        ▼
PipelineStatusPanel 显示最终结果 + 日志
```

---

## 2. 代码结构

### 2.1 Frontend (Configurator)

| 文件                                     | 角色                                                          | 状态 |
| ---------------------------------------- | ------------------------------------------------------------- | ---- |
| `src/services/yuleoshPipeline.ts`        | API 客户端（trigger/getStatus/listRuns/pollUntilDone）        | ✅   |
| `src/components/PipelinePushButton.tsx`  | "Push to Pipeline" 按钮（状态机: idle→pushing→success/error） | ✅   |
| `src/components/PipelineStatusPanel.tsx` | 实时状态面板（阶段进度条、日志流、自动轮询）                  | ✅   |
| `src/pages/Editor.tsx`                   | Editor 页面 - 集成按钮+面板                                   | ✅   |
| `src/pages/Dashboard.tsx`                | Dashboard 页面 - 历史运行列表                                 | ✅   |

### 2.2 Backend (yuleOSH)

| 文件                                       | 角色                                      | 状态 |
| ------------------------------------------ | ----------------------------------------- | ---- |
| `src/yuleosh/ui/routes/pipeline_routes.py` | REST handler（trigger/status/runs/stats） | ✅   |
| `src/yuleosh/ui/routes/handler_helpers.py` | HTTP 路由分发                             | ✅   |
| `src/yuleosh/ui/server.py`                 | HTTP 服务器（port 8080）                  | ✅   |
| `src/yuleosh/pipeline/async_runner.py`     | 异步 Pipeline 执行引擎                    | ✅   |

### 2.3 新增文件 (本任务)

| 文件                                         | 角色                        | 状态 |
| -------------------------------------------- | --------------------------- | ---- |
| `scripts/start-pipeline-server.sh`           | Pipeline 服务器一键启动脚本 | ✅   |
| `tests/integration/pipeline-trigger.test.ts` | 端到端集成测试              | ✅   |

---

## 3. API 端点详细说明

### POST /api/v1/pipeline/trigger

触发一个完整的 Pipeline 运行。

**请求:**

```json
{
  "type": "full",
  "config_json": "{...模块配置...}",
  "arxml_content": "...ARXML 配置..."
}
```

**响应:**

```json
{
  "ok": true,
  "job_id": "ccccb72685ef78b8",
  "status": "queued",
  "type": "full",
  "poll_url": "/api/v1/pipeline/status/ccccb72685ef78b8"
}
```

### GET /api/v1/pipeline/status/{job_id}

轮询 Pipeline 执行状态。

**响应:**

```json
{
  "ok": true,
  "job": {
    "job_id": "ccccb72685ef78b8",
    "status": "running",
    "type": "full_pipeline",
    "progress": 50,
    "current_stage": "rte_generate",
    "stages": [
      { "key": "arxml_parse", "name": "ARXML 解析", "status": "passed" },
      { "key": "config_validate", "name": "配置验证", "status": "passed" },
      { "key": "rte_generate", "name": "RTE 代码生成", "status": "running" },
      { "key": "ci_compile", "name": "CI 编译 (Layer 1)", "status": "pending" },
      {
        "key": "misra_check",
        "name": "MISRA 检查 (Layer 2)",
        "status": "pending"
      },
      { "key": "coverage", "name": "覆盖率分析 (Layer 3)", "status": "pending" }
    ],
    "logs": [
      "[10:18:02] === yuleOSH Full Pipeline Started ===",
      "[10:18:02] Stage 1/6: Parsing ARXML configuration...",
      "[10:18:03] Config JSON saved to ..."
    ]
  }
}
```

### GET /api/v1/pipeline/runs

列出最近 20 个 Pipeline 运行。

### GET /api/v1/pipeline/stats

聚合统计：total, running, queued, passed, failed。

---

## 4. Pipeline 执行阶段 (Full Pipeline)

| #   | 阶段         | key               | 耗时(约) | 功能                       |
| --- | ------------ | ----------------- | -------- | -------------------------- |
| 1   | ARXML 解析   | `arxml_parse`     | ~1s      | 解析 ARXML 或 JSON 配置    |
| 2   | 配置验证     | `config_validate` | ~1s      | 使用 config_validator 验证 |
| 3   | RTE 代码生成 | `rte_generate`    | ~1s      | 生成 RTE 代码文件          |
| 4   | CI 编译      | `ci_compile`      | ~2s      | GCC 编译 Layer 1           |
| 5   | MISRA 检查   | `misra_check`     | ~2s      | MISRA C:2023 合规检查      |
| 6   | 覆盖率分析   | `coverage`        | ~1s      | 代码覆盖率分析             |

**总预计时间:** ~8-10 秒（取决于 project 大小和 CI 需要）

---

## 5. 验证结果

### 5.1 API 端点验证

| #   | 测试项                             | 结果 | 说明                       |
| --- | ---------------------------------- | ---- | -------------------------- |
| 1   | Server 健康检查 GET /api/health    | ✅   | 返回 `{"status":"ok"}`     |
| 2   | Pipeline 触发 POST /trigger        | ✅   | 返回 job_id, status=queued |
| 3   | Pipeline 状态轮询 GET /status/{id} | ✅   | 显示 6 个阶段和进度        |
| 4   | Pipeline 历史 GET /runs            | ✅   | 包含已触发的 job           |
| 5   | Pipeline 统计 GET /stats           | ✅   | 聚合统计正常               |
| 6   | Pipeline 最终完成                  | ✅   | 6 个阶段全部 passed        |
| 7   | 并发 Pipeline 隔离                 | ✅   | job_id 互不相同            |

### 5.2 Frontend 组件验证

| #   | 组件                | 验证内容                         | 结果 |
| --- | ------------------- | -------------------------------- | ---- |
| 1   | yuleoshPipeline.ts  | triggerPipeline 发送完整 payload | ✅   |
| 2   | PipelinePushButton  | idle→pushing→success 状态流转    | ✅   |
| 3   | PipelinePushButton  | 错误时正确显示 error 状态        | ✅   |
| 4   | PipelineStatusPanel | 实时轮询 + 阶段进度条            | ✅   |
| 5   | PipelineStatusPanel | 日志可展开                       | ✅   |
| 6   | PipelineStatusPanel | 完成后自动停止轮询               | ✅   |
| 7   | Editor.tsx          | 按钮与 config 绑定               | ✅   |
| 8   | Dashboard.tsx       | 历史运行列表                     | ✅   |

---

## 6. 启动与使用

### 6.1 启动 Pipeline Server

```bash
# 一键启动 (默认端口 8080)
cd yuleASR-Configurator
./scripts/start-pipeline-server.sh
```

```bash
# 自定义端口和项目目录
./scripts/start-pipeline-server.sh --port 8080 --project ~/my-yuleasr-project
```

### 6.2 开发模式快速验证

```bash
# 1. 启动 yuleOSH pipeline server
export OSH_HOME=~/.openclaw/workspace/yuleASR
export YULEOSH_AUTH_DISABLED=true
python3 -m yuleosh.ui.server 127.0.0.1 8080

# 2. 启动 Configurator dev server
cd yuleASR-Configurator/apps/yuleasr-web
pnpm dev

# 3. 打开浏览器 http://localhost:3000
# 4. 打开任意 config → Editor → 点击 "Push to Pipeline"
```

### 6.3 运行集成测试

```bash
cd yuleASR-Configurator
# 确保 yuleOSH server 在端口 18082 运行
export OSH_HOME=~/path/to/yuleosh-project
python3 -m yuleosh.ui.server 127.0.0.1 18082 &
npx vitest run --config tests/integration/vitest.config.ts pipeline-trigger
```

---

## 7. 技术细节

### 7.1 异步执行机制

Pipeline 使用
`ThreadPoolExecutor`（max_workers=4）实现异步执行。触发后立即返回 job_id，后台线程依次执行 6 个阶段，状态存储在内存
`_PIPELINE_JOBS` 字典中。

```python
pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix="pipeline-")
pool.submit(_run_full_pipeline, job_id, project_dir, config_json, arxml_content)
```

### 7.2 状态轮询机制

前端使用 `setInterval(poll, 3000)` 每 3 秒轮询一次。当 job status 为 `passed` 或
`failed` 时，自动停止轮询。Polling 间隔可通过 `pollInterval` prop 配置。

### 7.3 配置传递

Configurator Editor 的 `currentConfig` 通过 `config_json` 传递给 Pipeline
Server，包含模块列表、参数和平台信息。同时也尝试生成 ARXML 一并传递。

### 7.4 错误处理

- 网络错误 → PipelinePushButton 显示 "Failed" 状态 (5s 自动重置)
- Pipeline 执行失败 → PipelineStatusPanel 显示失败阶段和原因
- 超时 → pollUntilDone 抛出 TimeoutError

---

## 8. 结论

**yuleASR-Configurator ↔ yuleOSH Pipeline 一键触发集成完成。**

- ✅ Configurator UI "Push to Pipeline" 按钮 → 触发 yuleOSH 6 阶段 Pipeline
- ✅ 实时状态轮询（阶段进度、日志、结果）
- ✅ Dashboard 历史运行列表
- ✅ 异步执行（不阻塞 UI）
- ✅ 端到端验证全部通过
- ✅ 启动脚本 + 集成测试

**Pipeline 状态映射:**

| 状态      | UI 表现           | 含义             |
| --------- | ----------------- | ---------------- |
| `queued`  | 等待图标          | 已入队，等待执行 |
| `running` | 旋转加载 + 进度条 | 正在执行某阶段   |
| `passed`  | 绿色勾 ✓          | 所有阶段通过     |
| `failed`  | 红色叉 ✗          | 某阶段失败       |

---

_报告生成: yuleASR-Configurator P1-3 一键触发集成任务 (2026-07-29 10:30 CST)_
