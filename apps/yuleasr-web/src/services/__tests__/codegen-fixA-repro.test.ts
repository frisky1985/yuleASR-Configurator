import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { generatedJsonToModuleSchema } from '@yuletech/core/schema/load-generated';
import type { ModuleSchema } from '@yuletech/core';

import { extractNonMacroSegment, generateHeadersFromSchemas } from '../codegen';

/**
 * demo-fixA — A 类 splice 修复回归（11 模块，2026-08-10）。
 *
 * 修复内容（codegen.ts extractNonMacroSegment / spliceGeneratedWithNonMacro）：
 * 1. 语句闭合扩展：末个非宏语句完整保留（多行 typedef struct/enum、多行 extern），修 7 个截断；
 * 2. MemMap 段宏豁免：`#define XXX_START_SEC/STOP_SEC[_*]` 原样保留 + 段开合平衡；
 * 3. 非段宏 #define 剔除（生成头宏段提供同名宏，防重复定义）；
 * 4. 条件编译平衡（#if 补 #endif、悬空 #endif 剔除、extern "C" 闭合块剔除）；
 * 5. 手写头序部类型 include 携带（Csm_Types.h/Os.h 等）。
 *
 * 依赖外部 yuleASR 仓库（YULEASR_DIR，默认工作区同级），缺失时整组跳过。
 */
const CFGH_DIR = join(__dirname, '../../../../../verification/extracted-cfgh');
const YULEASR_DIR = process.env.YULEASR_DIR || join(__dirname, '../../../../../..', 'yuleASR');
const HAS_YULEASR = existsSync(YULEASR_DIR);

interface AClassCase {
  json: string;
  moduleName: string;
  sourcePath: string;
  headerName: string;
  kind: 'truncation' | 'guardrail';
}

const A_CASES: AClassCase[] = [
  {
    json: 'doip.json',
    moduleName: 'DoIP',
    sourcePath: 'src/bsw/services/doip/include/DoIP_Cfg.h',
    headerName: 'DoIP_Cfg.h',
    kind: 'truncation',
  },
  {
    json: 'doip_ecual.json',
    moduleName: 'DoIP',
    sourcePath: 'src/bsw/ecual/doIP/include/DoIP_Cfg.h',
    headerName: 'DoIP_Cfg.h',
    kind: 'truncation',
  },
  {
    json: 'fim_ecual.json',
    moduleName: 'FiM',
    sourcePath: 'src/bsw/ecual/fim/include/FiM_Cfg.h',
    headerName: 'FiM_Cfg.h',
    kind: 'truncation',
  },
  {
    json: 'mqtt.json',
    moduleName: 'Mqtt',
    sourcePath: 'src/bsw/services/mqtt/include/Mqtt_Cfg.h',
    headerName: 'Mqtt_Cfg.h',
    kind: 'truncation',
  },
  {
    json: 'ostimingprotection.json',
    moduleName: 'Os_TimingProtection',
    sourcePath: 'src/bsw/os/include/Os_TimingProtection_Cfg.h',
    headerName: 'Os_TimingProtection_Cfg.h',
    kind: 'truncation',
  },
  {
    json: 'swc.json',
    moduleName: 'Swc',
    sourcePath: 'src/bsw/services/swc/include/Swc_Cfg.h',
    headerName: 'Swc_Cfg.h',
    kind: 'truncation',
  },
  {
    json: 'xcp_ecual.json',
    moduleName: 'Xcp',
    sourcePath: 'src/bsw/ecual/xcp/include/Xcp_Cfg.h',
    headerName: 'Xcp_Cfg.h',
    kind: 'truncation',
  },
  {
    json: 'csm.json',
    moduleName: 'Csm',
    sourcePath: 'src/bsw/services/csm/include/Csm_Cfg.h',
    headerName: 'Csm_Cfg.h',
    kind: 'guardrail',
  },
  {
    json: 'flash.json',
    moduleName: 'Flash',
    sourcePath: 'src/bsw/mcal/flash/include/Flash_Cfg.h',
    headerName: 'Flash_Cfg.h',
    kind: 'guardrail',
  },
  {
    json: 'linker.json',
    moduleName: 'Linker',
    sourcePath: 'src/platform/s32k312/linker/Linker_Cfg.h',
    headerName: 'Linker_Cfg.h',
    kind: 'guardrail',
  },
  {
    json: 'wdgm.json',
    moduleName: 'WdgM',
    sourcePath: 'src/bsw/services/wdgm/include/WdgM_Cfg.h',
    headerName: 'WdgM_Cfg.h',
    kind: 'guardrail',
  },
];

function readHandwritten(c: AClassCase): string {
  return readFileSync(join(YULEASR_DIR, c.sourcePath), 'utf8');
}

function loadSchema(c: AClassCase): ModuleSchema {
  const raw = JSON.parse(readFileSync(join(CFGH_DIR, c.json), 'utf8'));
  return generatedJsonToModuleSchema(c.moduleName, raw);
}

describe.skipIf(!HAS_YULEASR)(
  'demo-fixA — A 类 11 模块（splice 修复后回归，需 yuleASR 仓库）',
  () => {
    for (const c of A_CASES) {
      it(`${c.kind}: ${c.moduleName} (${c.json})`, async () => {
        const schema = loadSchema(c);
        const handwritten = readHandwritten(c);
        let error = '';
        let content = '';
        try {
          const files = await generateHeadersFromSchemas([schema], {
            handwrittenHeaders: new Map([[c.headerName, handwritten]]),
          });
          content = files[0].content;
        } catch (e) {
          error = (e as Error).message;
        }
        expect(error, `生成抛错: ${error}`).toBe('');

        // 非宏段完整性：拼接产物中保留的非宏段，与手写头提取的非宏段逐行一致
        const bannerIdx = content.indexOf('NON-MACRO SEGMENT');
        expect(bannerIdx, '应含非宏段 banner').toBeGreaterThanOrEqual(0);
        // banner 为多行注释，取注释闭合行（*==...*/）之后的内容
        const closeIdx = content.indexOf('*========', bannerIdx);
        const segStart = content.indexOf('\n', closeIdx) + 1;
        const splicedSeg = content.slice(segStart);
        // 取最后一个 #endif（生成头尾部），段内防重定义守卫的 #endif 不计
        const segEnd = splicedSeg.lastIndexOf('#endif');
        const splicedNonMacro = (segEnd >= 0 ? splicedSeg.slice(0, segEnd) : splicedSeg).trimEnd();

        const handwrittenSeg = extractNonMacroSegment(handwritten);
        expect(handwrittenSeg, '手写头应含非宏段').not.toBeNull();
        expect(splicedNonMacro).toBe(handwrittenSeg!.segment.trimEnd());

        // 语句闭合完整性：末行必须以 ; 或 } 或 MemMap.h include 或 #endif 结尾（不截断）
        const lastLine = splicedNonMacro.split('\n').pop()!.trim();
        expect(
          lastLine.endsWith(';') ||
            lastLine.endsWith('}') ||
            /_MemMap\.h"$/.test(lastLine) ||
            /^#endif/.test(lastLine),
          `末行未闭合: ${lastLine}`
        ).toBe(true);
      });
    }
  }
);
