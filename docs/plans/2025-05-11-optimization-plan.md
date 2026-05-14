# yuleASR-Configurator 优化实施计划

> 日期: 2025-05-11
> 目标: 并行完成 A/B/C 三项优化
> 预计工期: 3-4 天

---

## 任务 A: 完善代码生成器

### 目标
实现完整的 AutoSAR Ecuc 代码生成，可生成真实可用的 C/H 文件。

### 子任务
1. [ ] Ecuc 代码生成器核心实现
   - 生成 Ecuc_<Module>.c 源文件
   - 生成 Ecuc_<Module>.h 头文件
   - 支持标准 Ecuc 配置结构

2. [ ] RTE 配置生成
   - 生成 RTE 接口配置
   - 支持 Port/Interface 定义
   - 生成 RTE 回调函数框架

3. [ ] 代码验证
   - 生成代码语法检查
   - 与 yuleASR 编译器集成测试
   - 生成代码可编译验证

4. [ ] 导出功能
   - 支持批量导出
   - 生成文件压缩包下载
   - 支持选择性模块导出

### 输出文件
- `packages/@yuletech/core/src/generator/ecuc-generator.ts`
- `packages/@yuletech/core/src/generator/rte-generator.ts`
- `apps/yuleasr-web/src/components/CodeExportPanel.tsx`

---

## 任务 B: 可视化模块关系图

### 目标
实现交互式模块依赖图谱，支持拖拽和可视化配置。

### 子任务
1. [ ] 集成可视化库
   - 安装 React Flow 或 @xyflow/react
   - 配置画布和基础组件

2. [ ] 模块节点组件
   - 设计模块节点 UI
   - 显示模块状态和参数数量
   - 支持节点展开/折叠

3. [ ] 依赖连线
   - 自动计算模块间依赖
   - 绘制带箭头的连线
   - 支持连线高亮和交互

4. [ ] 交互功能
   - 画布拖拽和缩放
   - 节点拖拽调整位置
   - 点击节点打开配置

### 输出文件
- `apps/yuleasr-web/src/components/ModuleGraph.tsx`
- `apps/yuleasr-web/src/components/ModuleNode.tsx`
- `apps/yuleasr-web/src/hooks/useModuleLayout.ts`

---

## 任务 C: 增强版本控制

### 目标
完整 Git 集成，支持配置版本管理和变更追溯。

### 子任务
1. [ ] Git 服务集成
   - 封装 isomorphic-git API
   - 实现配置仓库初始化
   - 支持 commit/diff/log

2. [ ] 变更历史 UI
   - 历史记录列表组件
   - Diff 视图组件
   - 版本回滚功能

3. [ ] 分支管理
   - 分支列表和切换
   - 创建/删除分支
   - 合并分支基础功能

4. [ ] 自动提交
   - 配置变更自动检测
   - 定时自动提交
   - 变更摘要生成

### 输出文件
- `packages/yuleasr-editor-core/src/services/gitService.ts`
- `apps/yuleasr-web/src/components/VersionHistory.tsx`
- `apps/yuleasr-web/src/components/DiffViewer.tsx`

---

## 执行策略

### 并行执行
- 三个任务由独立 Subagent 并行执行
- 共享 `@yuletech/core` 和 `yuleasr-editor-core` 包
- 各自独立提交，最后统一集成

### 依赖关系
```
任务 A ──┬──> @yuletech/core (代码生成器)
         │
任务 B ──┼──> yuleasr-web (UI 组件)
         │
任务 C ──┴──> yuleasr-editor-core (Git 服务)
```

### 每日同步
- 每日 17:00 检查各任务进度
- 解决包之间的接口冲突
- 更新 TODO 状态

---

## 验收标准

### A - 代码生成器
- [ ] 可生成至少 3 个模块的 Ecuc 代码
- [ ] 生成的代码可通过语法检查
- [ ] 支持一键导出 ZIP

### B - 可视化
- [ ] 可渲染完整模块关系图
- [ ] 支持画布缩放和拖拽
- [ ] 点击节点可跳转到配置

### C - 版本控制
- [ ] 支持查看变更历史
- [ ] 支持版本回滚
- [ ] 支持分支切换

---

## 风险预案

| 风险 | 应对措施 |
|------|----------|
| 包之间接口冲突 | 每日同步，统一定义接口 |
| Git 浏览器兼容性 | 使用 isomorphic-git，测试 Chrome/Firefox |
| 性能问题 | 大数据量时使用虚拟滚动 |
| 生成代码格式错误 | 增加单元测试覆盖 |
