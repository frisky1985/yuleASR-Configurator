import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  extractNonMacroSegment,
  generateHeadersFromConfig,
  generateHeadersFromSchemas,
  hasNonMacroContent,
  spliceGeneratedWithNonMacro,
} from '../codegen';
import { loadPreferredSchemas } from '../schemaSource';

/**
 * V3.2 — 混合头拼接（splice）测试。
 *
 * 背景：canif 手写头除宏段外含 typedef(7) + struct(4) + extern 配置表(5)，
 * 纯宏生成头缺非宏段，直接替换手写头会导致编译失败。
 * V3.1 demo 验证拼接头可编译（5/5 0 error + ctest 45/45），本测试把方案
 * 固化进 codegen 的行为锁死：
 *   - 探测护栏：手写头含 typedef/struct/extern 非注释行 → 走拼接路径；
 *   - 拼接产物与 V3.1 手工拼接产物（fixtures/*.merged-v31）宏等价 + 非宏段逐行一致；
 *   - 兜底护栏：拼接模式下已知混合头缺手写头 → 抛错，不产出残缺头。
 *
 * 夹具：fixtures/canif/ 下
 *   CanIf_Cfg.h.handwritten    — yuleASR 手写头（src/bsw/ecual/canif/include/）
 *   CanIf_Cfg.h.merged-v31     — V3.1 手工拼接产物（/tmp/demo-cfgh/canif-merged/）
 *   Can_Cfg.h.handwritten      — 纯宏手写头（src/bsw/mcal/can/include/，探测负例）
 */
const FIXTURES = fileURLToPath(new URL('./fixtures/canif/', import.meta.url));

function fixture(name: string): string {
  return readFileSync(FIXTURES + name, 'utf8');
}

const HANDWRITTEN_CANIF = fixture('CanIf_Cfg.h.handwritten');
const MERGED_V31 = fixture('CanIf_Cfg.h.merged-v31');
const HANDWRITTEN_CAN = fixture('Can_Cfg.h.handwritten');

/** 从生成头解析 #define NAME VALUE（跳过 guard） */
function parseDefines(content: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*#define\s+([A-Za-z_][A-Za-z0-9_]*)\s+(.*)$/);
    if (!m) continue;
    if (m[1].endsWith('_CFG_H')) continue;
    out.set(m[1], m[2].trim());
  }
  return out;
}

function parenDepth(s: string): number {
  let d = 0;
  for (const c of s) {
    if (c === '(') d++;
    else if (c === ')') d--;
  }
  return d;
}

/** C 值语义归一化（与 codegen-source-switch 测试同一语义）：去注释/外层括号/cast，别名递归解析 */
function normalizeValue(raw: string, aliases: Map<string, string>, depth = 0): string {
  if (depth > 4) return 'id:' + raw.trim();
  let s = raw.replace(/\/\*.*?\*\//g, ' ').trim();
  while (s.startsWith('(') && s.endsWith(')') && parenDepth(s) === 0) {
    const inner = s.slice(1, -1).trim();
    const cast = inner.match(/^\(([A-Za-z_][A-Za-z0-9_]*)\)\s*(.*)$/);
    if (cast && cast[2] !== '') s = cast[2].trim();
    else {
      s = inner;
      break;
    }
  }
  const cast = s.match(/^\(([A-Za-z_][A-Za-z0-9_]*)\)\s*(.*)$/);
  if (cast && cast[2] !== '') s = cast[2].trim();
  if (s === '') return 'empty';
  if (['STD_ON', 'TRUE', 'STD_HIGH'].includes(s)) return 'bool:1';
  if (['STD_OFF', 'FALSE', 'STD_LOW'].includes(s)) return 'bool:0';
  const hex = s.match(/^0[xX]([0-9a-fA-F]+)[uUlL]*$/);
  if (hex) return 'int:' + parseInt(hex[1], 16);
  const dec = s.match(/^(\d+)[uUlL]*$/);
  if (dec) return 'int:' + parseInt(dec[1], 10);
  const flt = s.match(/^-?\d*\.\d+[fF]?$/);
  if (flt) return 'float:' + flt[0].replace(/[fF]$/, '');
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) {
    const target = aliases.get(s);
    if (target !== undefined) return normalizeValue(target, aliases, depth + 1);
    return 'id:' + s;
  }
  return 'raw:' + s;
}

/** 提取内容中非宏段连续切片（首非宏行 → 末非宏行），用于逐行比对 */
function nonMacroSpan(content: string): string[] {
  const lines = content.split('\n');
  const isNonMacro = (l: string) => {
    const t = l.trim();
    if (!t || t.startsWith('*') || t.startsWith('/*') || t.startsWith('//')) return false;
    return /^\s*(?:typedef\b|struct\b|extern\b(?!\s*"))/.test(l);
  };
  const idxs = lines.map((l, i) => (isNonMacro(l) ? i : -1)).filter(i => i >= 0);
  return idxs.length > 0 ? lines.slice(idxs[0], idxs[idxs.length - 1] + 1) : [];
}

describe('V3.2 — 混合头拼接（codegen splice）', () => {
  describe('护栏 1：混合头探测（typedef/struct/extern 非注释行）', () => {
    it('canif 手写头 → 混合（含 typedef/struct/extern 配置表）', () => {
      expect(hasNonMacroContent(HANDWRITTEN_CANIF)).toBe(true);
    });

    it('can 手写头 → 纯宏（无 typedef/struct/extern）', () => {
      expect(hasNonMacroContent(HANDWRITTEN_CAN)).toBe(false);
    });

    it('注释行不触发探测（块注释内的 typedef/extern 忽略）', () => {
      const sample = [
        '/*',
        ' * typedef uint32 Dummy;  -- 块注释内',
        ' */',
        '// extern const X Y;      -- 行注释',
        '#define PURE 1U',
        '#ifndef G_H',
        '#define G_H',
        '#endif',
      ].join('\n');
      expect(hasNonMacroContent(sample)).toBe(false);
    });

    it('extern "C" 链接声明不误判为配置表 extern', () => {
      const sample = ['#ifdef __cplusplus', 'extern "C" {', '#endif', '#define A 1U'].join('\n');
      expect(hasNonMacroContent(sample)).toBe(false);
    });
  });

  describe('非宏段提取（extractNonMacroSegment）', () => {
    it('canif：typedef(7)+struct(4)+extern(5)，切片内无 #define', () => {
      const seg = extractNonMacroSegment(HANDWRITTEN_CANIF);
      expect(seg).not.toBeNull();
      expect(seg!.typedefs).toBe(7);
      expect(seg!.structs).toBe(4);
      expect(seg!.externs).toBe(5);
      expect(seg!.segment).toContain('typedef uint32 CanIf_CanIdType;');
      expect(seg!.segment).toContain('extern const CanIf_PduIdType CanIf_RxPduHohMap[CANIF_HOH_CNT][CANIF_RX_LPDU_CNT];');
      expect(seg!.segment).not.toContain('#define');
    });

    it('纯宏头 → null（无需拼接）', () => {
      expect(extractNonMacroSegment(HANDWRITTEN_CAN)).toBeNull();
    });

    it('护栏（demo-fixA）：非宏段混入普通 #define → 剔除并记录，不抛错（生成头宏段提供同名宏）', () => {
      const bad = [
        'typedef uint32 T;',
        '#define CANIF_E_PARAM_CANID 0x01U',
        'extern const T Arr[1];',
      ].join('\n');
      const seg = extractNonMacroSegment(bad);
      expect(seg).not.toBeNull();
      expect(seg!.segment).not.toContain('#define');
      expect(seg!.droppedDefines).toEqual(['CANIF_E_PARAM_CANID']);
      expect(seg!.segment).toContain('typedef uint32 T;');
      expect(seg!.segment).toContain('extern const T Arr[1];');
    });

    it('护栏（demo-fixA）：MemMap 段宏（START/STOP_SEC）→ 原样保留，不剔除、不拒绝', () => {
      const sample = [
        '#define WDGM_START_SEC_CODE', // 首个非宏行之前：不在切片内（其 STOP 在切片内，reset 无害）
        '#include "WdgM_MemMap.h"',
        'extern void WdgM_WatchdogTrigger(void);',
        '#define WDGM_STOP_SEC_CODE', // 非宏语句之后：在切片内，原样保留
        '#include "WdgM_MemMap.h"',
      ].join('\n');
      const seg = extractNonMacroSegment(sample);
      expect(seg).not.toBeNull();
      expect(seg!.segment).toContain('extern void WdgM_WatchdogTrigger(void);');
      expect(seg!.segment).toContain('#define WDGM_STOP_SEC_CODE');
      expect(seg!.segment).toContain('#include "WdgM_MemMap.h"');
      expect(seg!.segment).not.toContain('WDGM_START_SEC_CODE');
      expect(seg!.droppedDefines).toEqual([]);
    });

    it('（demo-fixA 修截断）：末个非宏行为多行 typedef struct 开头 → 切片扩展到完整闭合', () => {
      const sample = [
        'typedef uint16 IdType;',
        'typedef struct {',
        '    IdType Fid;',
        '    boolean availability;',
        '} FiM_FidConfigType;',
        '#endif /* guard */',
      ].join('\n');
      const seg = extractNonMacroSegment(sample);
      expect(seg).not.toBeNull();
      expect(seg!.segment).toBe(sample.slice(0, sample.indexOf('\n#endif')));
      expect(seg!.segment).toContain('} FiM_FidConfigType;');
      expect(seg!.segment).not.toContain('#endif');
    });

    it('（demo-fixA 修截断）：多行 extern 函数声明完整保留到 );', () => {
      const sample = [
        'extern Std_ReturnType Csm_Cfg_KeyWrite(',
        '    uint32 keyId,',
        '    const uint8* data',
        ');',
        '#define CSM_STOP_SEC_CODE',
        '#include "Csm_MemMap.h"',
      ].join('\n');
      const seg = extractNonMacroSegment(sample);
      expect(seg).not.toBeNull();
      // 多行 extern 完整保留，; 出现在 MemMap 段标记之前
      const stmtPart = seg!.segment.split('#define CSM_STOP_SEC_CODE')[0];
      expect(stmtPart).toContain('extern Std_ReturnType Csm_Cfg_KeyWrite(');
      expect(stmtPart.trimEnd().endsWith(');')).toBe(true);
      // 尾部 MemMap 段标记对一并纳入（段 pragma 开合平衡）
      expect(seg!.segment).toContain('#define CSM_STOP_SEC_CODE');
      expect(seg!.segment).toContain('#include "Csm_MemMap.h"');
      expect(seg!.droppedDefines).toEqual([]);
    });

    it('（demo-fixA）：extern "C" 闭合块（裸 }，#ifdef __cplusplus）→ 剔除，避免悬空 }', () => {
      const sample = [
        'typedef uint32 T;',
        '#ifdef __cplusplus',
        '}',
        '#endif',
        'extern const T Fls_Config;',
      ].join('\n');
      const seg = extractNonMacroSegment(sample);
      expect(seg).not.toBeNull();
      expect(seg!.segment).not.toContain('__cplusplus');
      expect(seg!.segment).not.toContain('\n}');
      expect(seg!.segment).toContain('extern const T Fls_Config;');
    });

    it('（demo-fixA）：切片内 #ifdef __cplusplus 块含 extern "C" { 配对 → 不剔除', () => {
      const sample = [
        'typedef uint32 T;',
        '#ifdef __cplusplus',
        'extern "C" {',
        '#endif',
        'extern const T Fls_Config;',
        '#ifdef __cplusplus',
        '}',
        '#endif',
      ].join('\n');
      const seg = extractNonMacroSegment(sample);
      expect(seg).not.toBeNull();
      // 开合配对在切片内 → 保留块（裸 } 剔除规则仅作用于缺配对的闭合块）
      expect(seg!.segment).toContain('extern "C" {');
      expect(seg!.segment).toContain('extern const T Fls_Config;');
    });

    it('护栏：生成头缺 guard/#endif → splice 抛错', () => {
      expect(() => spliceGeneratedWithNonMacro('#define X 1U\n', HANDWRITTEN_CANIF, 'CanIf_Cfg.h')).toThrow(
        /结构异常/
      );
    });
  });

  describe('拼接产物 = V3.1 拼接产物（宏等价 + 非宏段逐行一致）', () => {
    it('canif 生成 + 拼接：宏段与 V3.1 merged 全量宏语义等价', async () => {
      const schemas = loadPreferredSchemas().filter(s => s.name.toLowerCase() === 'canif');
      expect(schemas).toHaveLength(1);
      const files = await generateHeadersFromSchemas(schemas, {
        handwrittenHeaders: new Map([['CanIf_Cfg.h', HANDWRITTEN_CANIF]]),
      });
      expect(files).toHaveLength(1);

      const gen = files[0].content;
      const genDefs = parseDefines(gen);
      const v31Defs = parseDefines(MERGED_V31);
      // D 类修复（2026-08-10）：生成器不再强加 8 个 CPI 版本宏（AR_RELEASE_*/MODULE_ID/
      // SW_*/VENDOR_ID）——V3.1 fixture 是旧生成器产物含这些宏，对比时从 V3.1 侧过滤
      const CPI_VERSION_RE = /_(?:AR_RELEASE_(?:MAJOR|MINOR|REVISION)_VERSION|MODULE_ID|SW_(?:MAJOR|MINOR|PATCH)_VERSION|VENDOR_ID)$/;
      const v31Filtered = new Map([...v31Defs].filter(([k]) => !CPI_VERSION_RE.test(k)));
      // 宏名集合一致
      expect([...genDefs.keys()].sort()).toEqual([...v31Filtered.keys()].sort());
      // 值语义等价（别名/hex↔dec/cast 归一）
      const diffs: string[] = [];
      for (const [name, v31Value] of v31Filtered) {
        const g = normalizeValue(genDefs.get(name)!, v31Filtered);
        const v = normalizeValue(v31Value, v31Filtered);
        if (g !== v) diffs.push(`${name}: v31 ${v31Value} → ${v}，gen ${genDefs.get(name)} → ${g}`);
      }
      expect(diffs, `宏语义差异: ${diffs.join('; ')}`).toEqual([]);
    });

    it('canif 拼接：非宏段与 V3.1 merged 逐行一致 + 顺序约束（宏段先行）', async () => {
      const schemas = loadPreferredSchemas().filter(s => s.name.toLowerCase() === 'canif');
      const files = await generateHeadersFromSchemas(schemas, {
        handwrittenHeaders: new Map([['CanIf_Cfg.h', HANDWRITTEN_CANIF]]),
      });
      const gen = files[0].content;

      expect(nonMacroSpan(gen)).toEqual(nonMacroSpan(MERGED_V31));

      // Std_Types.h include（非宏段 uint32/uint8/uint16/boolean 依赖）
      expect(gen).toContain('#include "Std_Types.h"');
      // 顺序约束：guard → 宏段 → 非宏段 → #endif
      const gi = gen.indexOf('#define CANIF_CFG_H');
      const mi = gen.indexOf('#define CANIF_E_PARAM_DLC');
      const ni = gen.indexOf('typedef uint32 CanIf_CanIdType;');
      const ei = gen.indexOf('#endif');
      expect(gi).toBeGreaterThanOrEqual(0);
      expect(mi).toBeGreaterThan(gi);
      expect(ni).toBeGreaterThan(mi);
      expect(ei).toBeGreaterThan(ni);
      // extern 数组尺寸引用宏段计数宏（拼接后仍成立）
      expect(gen).toContain('extern const CanIf_HohCfgType CanIf_HohCfg[CANIF_HOH_CNT];');
      expect(gen).toContain('extern const CanIf_TxPduCfgType CanIf_TxPduCfg[CANIF_TX_LPDU_CNT];');
      expect(gen).toContain('extern const CanIf_PduIdType CanIf_RxPduHohMap[CANIF_HOH_CNT][CANIF_RX_LPDU_CNT];');
      // 错误码仍由宏段提供，不重复拼接（防重定义）
      expect(gen).toContain('#define CANIF_E_PARAM_CANID');
      expect(gen.split('#define CANIF_E_PARAM_CANID').length).toBe(2);
    });
  });

  describe('护栏兜底（无手写头备份可读 → 不产出残缺头）', () => {
    it('拼接模式 + 已知混合头（canif）缺手写头 → 抛错', async () => {
      await expect(
        generateHeadersFromSchemas(
          loadPreferredSchemas().filter(s => s.name.toLowerCase() === 'canif'),
          { handwrittenHeaders: new Map() }
        )
      ).rejects.toThrow(/已知混合头 CanIf_Cfg.h 缺少手写头内容/);
    });

    it('非拼接模式（默认）：已知混合头附警告，产物仍为纯宏（既有行为，零回归）', async () => {
      const files = await generateHeadersFromSchemas(
        loadPreferredSchemas().filter(s => s.name.toLowerCase() === 'canif')
      );
      expect(files[0].warnings?.[0]).toMatch(/手写头含非宏内容/);
      expect(files[0].content).not.toContain('typedef');
    });
  });

  describe('纯宏模块不受拼接路径影响（零回归）', () => {
    it('can：手写头为纯宏 → 输出与不提供 handwrittenHeaders 完全一致', async () => {
      const schemas = loadPreferredSchemas().filter(s => s.name.toLowerCase() === 'can');
      const plain = await generateHeadersFromSchemas(schemas);
      const spliced = await generateHeadersFromSchemas(schemas, {
        handwrittenHeaders: new Map([['Can_Cfg.h', HANDWRITTEN_CAN]]),
      });
      expect(spliced[0].content).toBe(plain[0].content);
      expect(spliced[0].warnings).toBeUndefined();
    });

    it('generateHeadersFromConfig 拼接选项贯通', async () => {
      // P0-1（2026-08-11）：schema 收窄到 canif——护栏已补齐 27 个拼接模块，
      // 全量 110 schema + 仅 CanIf 手写头会正确触发“缺手写头”报错（防残缺纯宏头）。
      const schemas = loadPreferredSchemas().filter(s => s.name.toLowerCase() === 'canif');
      const files = await generateHeadersFromConfig(
        [{ name: 'canif', enabled: true }],
        schemas,
        { handwrittenHeaders: new Map([['CanIf_Cfg.h', HANDWRITTEN_CANIF]]) }
      );
      const canif = files.find(f => f.filename === 'CanIf_Cfg.h')!;
      expect(canif).toBeDefined();
      expect(canif.content).toContain('typedef uint32 CanIf_CanIdType;');
      expect(canif.content).toContain('extern const CanIf_HohCfgType CanIf_HohCfg[CANIF_HOH_CNT];');
    });
  });
});
