# yuleASR-Configurator → yuleASR 全面集成冲刺 — Loop Chain 任务

## 执行模式
Loop Chaining：每步做完自动验证，发现问题自动修复，循环直至全绿，最终出报告。

---

## Phase A — Mcu/Port 编译验证 (预估 2-3h)

### Task A1 — Mcu 枚举冲突分析
- 检查 Mcu.h 中哪些枚举名（MCU_MODE_NORMAL 等）与 Mcu_Cfg.h 宏名冲突
- 建议方案：枚举值加 `_ID` 后缀或宏名加 `_VAL` 后缀
- 出分析报告后自动修复

### Task A2 — Mcu 寄存器头文件
- 检查 `Mcu_Reg.h` 缺失 — yuleASR 是否需要这个文件
- 如果必要：基于 S32K312 参考手册生成最小寄存器定义
- 如果不必要：修复 #include 引用

### Task A3 — Mcu Std_VersionInfoType 重复定义
- 检查 Mcu.h 中是否自定义了 Std_VersionInfoType
- 方案：删除自定义，统一用 Std_Types.h

### Task A4 — Port 模块分析
- 检查 Port_ConfigType 缺少 PinConfigs 成员的原因
- 方案：在生成器中添加 PinConfigs 数组字段

### Task A5 — 三模块回归
- Can + Mcu + Port 同时编译
- 0 错误 0 警告

---

## Phase B — 其余 BSW 模块接入 (预估 2.5h)

### Task B1 — Dio 模块
- 检查 yuleASR Dio_Cfg.h 现有宏定义
- Configurator codegen.ts 输出 Dio_Cfg.h
- ecuc-generator 输出 Ecuc_Dio_*.c/h
- 编译验证

### Task B2 — Adc 模块 (同上流程)
### Task B3 — Spi 模块 (同上流程)
### Task B4 — Gpt 模块 (同上流程)
### Task B5 — Pwm 模块 (同上流程)

---

## Phase C — 产物自动化测试 (预估 2h)

### Task C1 — 集成测试框架
- 在 Configurator 项目创建 `tests/integration/` 目录
- 核心测试：generate → write → syntax-check → compare-with-reference
- 覆盖 Can/Mcu/Port/Dio/Adc/Spi/Gpt/Pwm

### Task C2 — 差异回归检测
- 比较新旧两次生成的代码差异
- 非预期变更触发告警

### Task C3 — 参考基线管理
- 存储各模块首次通过的生成物作为基线
- 后续 commit 自动比对

---

## Phase D — CI/CD 集成 (预估 1h)

### Task D1 — GitHub Actions 集成
- 在 Configurator 项目创建 `.github/workflows/integration.yml`
- 每次 push 自动跑集成测试

### Task D2 — yuleASR 构建钩子
- yuleASR 的 build 流程中自动调用 Configurator 生成代码
- 失败则阻断构建

---

## 排期

```
00:00 Phase A1-A3   Mcu 模块修复
01:00 Phase A4-A5   Port 模块修复 + 三模块回归
02:30 Phase B1-B3   Dio/Adc/Spi 接入
04:00 Phase B4-B5   Gpt/Pwm 接入
05:00 Phase C1-C3   自动化测试
07:00 Phase D1-D2   CI/CD
08:00 → 最终报告
```

## 执行指令

每个任务格式：
```markdown
## [Task] <任务名>
### 目标
### 前置条件
### 步骤 1..N
### 验证
### 预期结果
```

失败时：记录原因，修复，重跑。循环直到通过。
