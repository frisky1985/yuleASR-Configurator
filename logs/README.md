# 结构化日志目录

> 依据 .ai-rules.md 第四章第 6 条：所有日志结构化输出（时间、级别、模块名、核心消息），记录 Git Commit ID。

## 日志规范（TypeScript 工程）

| 要素 | 说明 |
|------|------|
| 时间 | ISO 8601 UTC（如 2026-08-15T00:00:00Z） |
| 级别 | TRACE / DEBUG / INFO / WARN / ERROR / FATAL |
| 模块名 | 包名或模块名（yuleasr-desktop / editor-core / yulecommunity） |
| 核心消息 | 单行描述，含上下文 |
| Git Commit ID | 运行时注入（构建时从 git rev-parse 获取） |

## 落地建议

- 统一用 `pino` 或 `winston` 输出结构化 JSON 日志
- 按时间戳生成子目录：`logs/YYYYMMDD/`
- 运行时日志禁止提交（.gitignore 已排除 *.log）
- 本目录仅保留规范文档，不存运行时产物
