# Code Generator → yuleASR BSW 集成验证 — 子任务清单

> **发起:** 2026-07-23 17:40 老板指令
> **目标:** Configurator 生成的 C 代码能在 yuleASR 工程中编译通过
> **核心理念:** 每个子任务 < 30分钟，专注、可验证

---

## 现状

yuleASR 的 `Can_Cfg.h` 是纯宏定义文件（编译期常量），而 Configurator 的 ecuc-generator
输出的是 AUTOSAR ECUC 完整代码包（类型+函数+宏）。两者是互补关系：

| 角色 | 文件 | 来源 |
|------|------|------|
| 配置宏（现有 yuleASR） | `Can_Cfg.h` | codegen.ts (Web 层) |
| 类型+函数（新增） | `Can.h` / `Can.c` + PBcfg + Lcfg | ecuc-generator |

**集成验证 = 确认新增文件能和现有 yuleASR 共存编译**

---

## 子任务清单

### Task 1 — 确认 yuleASR 的 CAN 驱动实际引用哪些宏 (20min)

- [ ] 读取 `yuleASR/src/bsw/mcal/can/src/Can.c` 查找所有 `#ifdef` / `#if` 引用宏
- [ ] 读取 `yuleASR/src/bsw/mcal/can/include/Can.h` 了解驱动接口声明
- [ ] 对照 `Can_Cfg.h` 确认现有宏定义覆盖了哪些需求
- [ ] 输出「宏依赖清单」

### Task 2 — codegen.ts 输出对齐 yuleASR Can_Cfg.h (30min)

- [ ] 确认 `apps/yuleasr-web/src/services/codegen.ts` 生成的 `Can_Cfg.h` 包含全部宏
- [ ] 补缺失宏（比如 `CAN_TIMEOUT_DURATION`, `CAN_MAIN_FUNCTION_PERIOD_MS` 等）
- [ ] 调整输出格式（注释风格、缩进、分组）对齐 yuleASR 风格
- [ ] 跑测试确保 7 个 codegen.test.ts 全部通过

### Task 3 — ecuc-generator Can_Cfg.h 降级为不覆盖 yuleASR 版本 (15min)

- [ ] ecuc-generator 的头文件输出改为 `Ecuc_Can_Cfg.h`（非 `Can_Cfg.h`）避免文件名冲突
- [ ] 确认 `getModuleHeaderName()` 不做覆盖
- [ ] 写一个测试验证头文件不冲突

### Task 4 — 生成 ecuc 额外 .c 文件并写入 yuleASR (30min)

- [ ] 用 ecuc-generator 生成 Can 的 4 个文件（.h/.c/PBcfg/Lcfg）
- [ ] 写入 `yuleASR/config/generated/` 目录
- [ ] 验证文件存在且结构完整

### Task 5 — 单模块语法检查 (30min)

- [ ] 用 `arm-none-eabi-gcc -fsyntax-only` 对生成的头文件做语法检查
- [ ] 无 `arm-none-eabi-gcc` 则用 `clang -fsyntax-only -target arm` 替代
- [ ] 修复发现的语法错误
- [ ] 输出检查结果

### Task 6 — CMakeLists.txt 集成 (20min)

- [ ] 在 `yuleASR/tools/build/CMakeLists.txt` 添加 `config/generated/` 到 include 路径
- [ ] 添加 Source Group 将生成文件纳入构建
- [ ] 添加 `-include` 选项兼容新旧配置头文件

### Task 7 — yuleASR 编译验证 (30min)

- [ ] 跑 `cd yuleASR && mkdir -p build && cd build && cmake ../tools/build && make` 或类似流程
- [ ] 确认 CAN 模块编译无错误、无警告
- [ ] 修复所有编译报错

### Task 8 — 多模块扩展（Can/Mcu/Port） (30min)

- [ ] 重复 Task 4-7 流程到 Mcu 模块
- [ ] 重复到 Port 模块
- [ ] 确认 3 个模块全部编译通过

### Task 9 — 集成测试 + 最终报告 (20min)

- [ ] 在 Configurator 中写集成测试（生成→写入→语法检查）
- [ ] 输出最终报告到 `docs/reports/yuleasr-integration-verification.md`
- [ ] 总结完成的模块、修复的差异、遗留的 gap

---

## 排期

| 时间 | 任务 | 类型 |
|------|------|------|
| 18:00-18:20 | Task 1 — 驱动宏依赖分析 | 分析 |
| 18:20-18:50 | Task 2 — codegen.ts 对齐 | 修复 |
| 18:50-19:05 | Task 3 — ecuc 头文件降级 | 修复 |
| 19:05-19:35 | Task 4 — 生成写入 yuleASR | 集成 |
| 19:35-20:05 | Task 5 — 语法检查 | 验证 |
| 20:05-20:25 | Task 6 — CMake 集成 | 集成 |
| 20:25-20:55 | Task 7 — 编译验证 | 验证 |
| 20:55-21:25 | Task 8 — 多模块扩展 | 扩展 |
| 21:25-21:45 | Task 9 — 最终报告 | 交付 |

**总计: ~3.5h**（单个模块路径） / **~4.5h**（3 模块完整）
