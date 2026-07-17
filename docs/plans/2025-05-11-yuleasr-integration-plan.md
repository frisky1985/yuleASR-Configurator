# yuleASR 集成实施计划

> 日期:
> 2025-05-11 目标: 让 yuleASR-Configurator 支持 yuleASR 工程配置格式预计工期:
> 1-2 天

---

## 任务 P0-1: 配置格式对齐

### 目标

实现 yuleASR-Configurator 与 yuleASR 配置文件的读写互通。

### 子任务

1. [ ] 分析 yuleASR 配置格式
   - 读取 `config/bsw_config.json`
   - 理解模块参数结构
   - 识别配置约束规则

2. [ ] 创建配置适配层
   - `packages/@yuletech/core/src/adapters/yuleasr-adapter.ts`
   - 转换 yuleASR JSON ↔ 内部模型

3. [ ] 实现导入功能
   - 支持从 yuleASR 导入配置
   - 保持配置完整性

4. [ ] 实现导出功能
   - 导出为 yuleASR 兼容格式
   - 保留注释和格式

---

## 任务 P0-2: RTE Generator 集成

### 目标

集成 yuleASR 的 rte_generator.py，实现一键代码生成。

### 子任务

1. [ ] 封装 RTE Generator 调用
   - `packages/yuleasr-editor-core/src/generators/rte-generator.ts`
   - 支持 Node.js 调用 Python 脚本

2. [ ] 创建配置转换器
   - 将内部模型转为 rte_generator.py 输入格式

3. [ ] 实现生成结果处理
   - 读取生成的 C/H 文件
   - 展示生成日志

---

## 验证标准

- [ ] 能成功导入 yuleASR 示例配置
- [ ] 能成功导出 yuleASR 兼容配置
- [ ] RTE 代码生成功能正常
- [ ] 构建通过，部署成功
