# Changelog

## [0.2.1] - 2026-07-17

### Added
- 新增 5 个 E2E 测试：Save 下拉 / Export 展开 / Import 展开 / Overflow 展开及关闭 (#13)
- GH Pages 部署 CI 适配 `/configurator/` 子路径

### Changed
- Save 按钮改造为 Split Button：左键直接保存，右键箭头展开 Save as Template (#12)
- 工具栏下拉菜单选择器优化，Page Object 新增 dropdown locators

### Fixed
- CrossModuleValidator 全局状态风险 — 添加 TODO 标记，记录多配置并行时的重构路径 (#11)

## [0.2.0] - 2026-07-16

### Added
- ADR 文档体系: 6 份架构决策记录 (ConfigType 分层、条件引擎、跨模块验证器、GeneratorRegistry、熔断策略)
- 条件 DSL BNF 语法文档 (CONDITIONS-DSL.md)
- ARXML 双向往导 + 导出按钮
- Escape 键关闭创建配置弹窗
- 创建配置时自动更新列表

### Fixed
- E2E 测试全面修复: 64/64 全部通过 (Playwright, 中文 locale, 选择器重写)
- 编辑器工具栏图标按钮改用 role/text/attribute 选择器
- 配置路径 URL 修复 (baseURL 去掉子路径前缀)
- 条件引擎同步传播熔断保护 (MAX_DEPTH=20)

### Changed
- 工具栏简化: 10 个元素 → 7 个 (Save 合并 Template, Share/Diff 移入 ⋯ 菜单)
- ConfigType flat 结构 → 三层分层 (ContainerType → ConfigSetType → ConfigType)
- 条件引擎同步传播替代异步 (AppConfiguration → CoreConfiguration)
- Export/Import 按功能分组（不按格式分组）

### Technical
- Playwright 1.59.1, Chromium 1223 (symlink 避免网络下载)
- Chinese locale (zh-CN) 默认测试语言
- 265 单元测试 + 64 E2E 全部通过

