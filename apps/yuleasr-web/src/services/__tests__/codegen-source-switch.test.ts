import { loadModuleSchemas } from '@yuletech/core/schema/load-generated';
import { describe, expect, it } from 'vitest';

import { generateHeadersFromConfig, generateHeadersFromSchemas } from '../codegen';
import { loadPreferredSchemas } from '../schemaSource';

/**
 * 手写 yuleASR *_Cfg.h 宏清单（V2 验证源，2026-08-09 提取）：
 * 5 个 demo 模块共 139 个宏，值为 C 字面量原文（别名未展开，由 normalizeValue 解析）。
 * 来源：src/bsw/{mcal/can, ecual/canif, ecual/cantp, services/pdur, services/com}/include/*_Cfg.h
 */
export const HAND_WRITTEN_MACROS: Record<string, Record<string, string>> = {
  can: {
    'CAN_DEV_ERROR_DETECT': '(STD_ON)',
    'CAN_VERSION_INFO_API': '(STD_ON)',
    'CAN_NUM_CONTROLLERS': '(2U)',
    'CAN_NUM_HOH': '(16U)',
    'CAN_NUM_BAUDRATE_CONFIGS': '(3U)',
    'CAN_BAUDRATE_500K': '(0U)',
    'CAN_BAUDRATE_250K': '(1U)',
    'CAN_BAUDRATE_125K': '(2U)',
    'CAN_PROCESSING_INTERRUPT': '(0U)',
    'CAN_PROCESSING_POLLING': '(1U)',
    'CAN_CONTROLLER_0': '(0U)',
    'CAN_CONTROLLER_1': '(1U)',
    'CAN_HOH_RX_0': '((Can_HwHandleType)0x0000U)',
    'CAN_HOH_RX_1': '((Can_HwHandleType)0x0001U)',
    'CAN_HOH_RX_2': '((Can_HwHandleType)0x0002U)',
    'CAN_HOH_RX_3': '((Can_HwHandleType)0x0003U)',
    'CAN_HOH_TX_0': '((Can_HwHandleType)0x0004U)',
    'CAN_HOH_TX_1': '((Can_HwHandleType)0x0005U)',
    'CAN_HOH_TX_2': '((Can_HwHandleType)0x0006U)',
    'CAN_HOH_TX_3': '((Can_HwHandleType)0x0007U)',
    'CAN_TIMEOUT_DURATION': '(10000U)',
    'CAN_MAIN_FUNCTION_PERIOD_MS': '(10U)',
  },
  canif: {
    'CANIF_CONTROLLER_CNT': '1U',
    'CANIF_NUM_CONTROLLERS': 'CANIF_CONTROLLER_CNT',
    'CANIF_NUM_TRANSCEIVERS': 'CANIF_CONTROLLER_CNT',
    'CANIF_HOH_CNT': '4U',
    'CANIF_HTH_CNT': '2U',
    'CANIF_LPDU_CNT': '8U',
    'CANIF_TX_LPDU_CNT': '4U',
    'CANIF_NUM_TX_PDUS': 'CANIF_TX_LPDU_CNT',
    'CANIF_RX_LPDU_CNT': '4U',
    'CANIF_NUM_RX_PDUS': 'CANIF_RX_LPDU_CNT',
    'CANIF_DEV_ERROR_DETECT': 'STD_ON',
    'CANIF_VERSION_INFO_API': 'STD_ON',
    'CANIF_TRANSMIT_CANCELLATION': 'STD_OFF',
    'CANIF_RX_INDICATION': 'STD_ON',
    'CANIF_TX_CONFIRMATION': 'STD_ON',
    'CANIF_WAKEUP_SUPPORT': 'STD_ON',
    'CANIF_CONTROLLER_0': '0U',
    'CANIF_DEFAULT_BAUDRATE': '500U',
    'CANIF_HTH_0': '0U',
    'CANIF_HTH_1': '1U',
    'CANIF_HRH_0': '2U',
    'CANIF_HRH_1': '3U',
    'CANIF_TX_LPDU_0': '0U',
    'CANIF_TX_LPDU_1': '1U',
    'CANIF_TX_LPDU_2': '2U',
    'CANIF_TX_LPDU_3': '3U',
    'CANIF_RX_LPDU_0': '4U',
    'CANIF_RX_LPDU_1': '5U',
    'CANIF_RX_LPDU_2': '6U',
    'CANIF_RX_LPDU_3': '7U',
    'CANIF_E_PARAM_CANID': '0x01U',
    'CANIF_E_PARAM_DLC': '0x02U',
  },
  cantp: {
    'CANTP_DEV_ERROR_DETECT': '(STD_ON)',
    'CANTP_VERSION_INFO_API': '(STD_ON)',
    'CANTP_DYNAMIC_CHANNEL_ALLOCATION': '(STD_OFF)',
    'CANTP_PADDING_BYTE': '(STD_ON)',
    'CANTP_PADDING_BYTE_VALUE': '(0xCCU)',
    'CANTP_CHANGE_PARAMETER_API': '(STD_ON)',
    'CANTP_READ_PARAMETER_API': '(STD_ON)',
    'CANTP_MAX_CHANNEL_CNT': '(4U)',
    'CANTP_NUM_CHANNELS': '(2U)',
    'CANTP_NUM_TX_NSDU': '(4U)',
    'CANTP_NUM_RX_NSDU': '(4U)',
    'CANTP_TX_DIAG_PHYSICAL': '((PduIdType)0U)',
    'CANTP_TX_DIAG_FUNCTIONAL': '((PduIdType)1U)',
    'CANTP_TX_UDS_PHYSICAL': '((PduIdType)2U)',
    'CANTP_TX_UDS_FUNCTIONAL': '((PduIdType)3U)',
    'CANTP_RX_DIAG_PHYSICAL': '((PduIdType)0U)',
    'CANTP_RX_DIAG_FUNCTIONAL': '((PduIdType)1U)',
    'CANTP_RX_UDS_PHYSICAL': '((PduIdType)2U)',
    'CANTP_RX_UDS_FUNCTIONAL': '((PduIdType)3U)',
    'CANTP_NAS_DEFAULT': '(25U)',
    'CANTP_NBS_DEFAULT': '(75U)',
    'CANTP_NCS_DEFAULT': '(25U)',
    'CANTP_NAR_DEFAULT': '(25U)',
    'CANTP_NBR_DEFAULT': '(75U)',
    'CANTP_NCR_DEFAULT': '(150U)',
    'CANTP_BS_DEFAULT': '(8U)',
    'CANTP_STMIN_DEFAULT': '(20U)',
    'CANTP_WFT_MAX_DEFAULT': '(8U)',
    'CANTP_ADDRESSING_FORMAT': '(CANTP_STANDARD)',
    'CANTP_TX_ADDRESS': '(0x00U)',
    'CANTP_RX_ADDRESS': '(0x00U)',
    'CANTP_MAX_MESSAGE_LENGTH': '(4095U)',
    'CANTP_CANFD_MAX_MESSAGE_LENGTH': '(4095U)',
    'CANTP_CHANNEL_BUFFER_SIZE': '(64U)',
    'CANTP_CAN_FRAME_LENGTH': '(8U)',
    'CANTP_INVALID_CHANNEL_ID': '(0xFFU)',
    'CANTP_MAIN_FUNCTION_PERIOD_MS': '(5U)',
    'CANTP_CANIF_TX_PDU_ID': '((PduIdType)0U)',
    'CANTP_CANIF_RX_PDU_ID': '((PduIdType)0U)',
    'CANTP_CANIF_FC_TX_PDU_ID': '((PduIdType)1U)',
    'CANTP_CANIF_FC_RX_PDU_ID': '((PduIdType)1U)',
  },
  pdur: {
    'PDUR_DEV_ERROR_DETECT': '(STD_ON)',
    'PDUR_VERSION_INFO_API': '(STD_ON)',
    'PDUR_NUMBER_OF_ROUTING_PATHS': '(16U)',
    'PDUR_NUMBER_OF_ROUTING_PATH_GROUPS': '(4U)',
    'PDUR_MAX_DESTINATIONS_PER_PATH': '(4U)',
    'PDUR_MODULE_CANIF': '(0x3CU)',
    'PDUR_MODULE_CANTP': '(0x3DU)',
    'PDUR_MODULE_LINIF': '(0x3EU)',
    'PDUR_MODULE_COM': '(0x64U)',
    'PDUR_MODULE_DCM': '(0x29U)',
    'PDUR_MODULE_SOAD': '(0x43U)',
    'PDUR_COM_TX_ENGINE_STATUS': '((PduIdType)0U)',
    'PDUR_COM_TX_VEHICLE_SPEED': '((PduIdType)1U)',
    'PDUR_COM_TX_BATTERY_STATUS': '((PduIdType)2U)',
    'PDUR_COM_RX_ENGINE_CMD': '((PduIdType)3U)',
    'PDUR_COM_RX_VEHICLE_CMD': '((PduIdType)4U)',
    'PDUR_DCM_TX_DIAG_RESPONSE': '((PduIdType)5U)',
    'PDUR_DCM_RX_DIAG_REQUEST': '((PduIdType)6U)',
    'PDUR_ROUTING_PATH_GROUP_0': '(0U)',
    'PDUR_ROUTING_PATH_GROUP_1': '(1U)',
    'PDUR_ROUTING_PATH_GROUP_2': '(2U)',
    'PDUR_ROUTING_PATH_GROUP_3': '(3U)',
    'PDUR_GATEWAY_OPERATION_ENABLED': '(STD_ON)',
    'PDUR_FIFO_DEPTH': '(8U)',
    'PDUR_MAX_FIFO_DEPTH': '(PDUR_FIFO_DEPTH)',
    'PDUR_MAIN_FUNCTION_PERIOD_MS': '(10U)',
  },
  com: {
    'COM_DEV_ERROR_DETECT': 'STD_ON',
    'COM_VERSION_INFO_API': 'STD_ON',
    'COM_MAX_SIGNALS': '256U',
    'COM_MAX_IPDUS': '64U',
    'COM_MAX_GROUPS': '16U',
    'COM_MAX_SIGNAL_LENGTH': '64U',
    'COM_TX_MODE_DIRECT': '0x00U',
    'COM_TX_MODE_PERIODIC': '0x01U',
    'COM_TX_MODE_MIXED': '0x02U',
    'COM_LITTLE_ENDIAN': '0x00U',
    'COM_BIG_ENDIAN': '0x01U',
    'COM_NUM_OF_IPDUS': 'COM_MAX_IPDUS',
    'COM_NUM_OF_SIGNALS': 'COM_MAX_SIGNALS',
    'COM_NUM_OF_IPDU_GROUPS': 'COM_MAX_GROUPS',
    'COM_NUM_IPDU_GROUPS': 'COM_NUM_OF_IPDU_GROUPS',
    'COM_NUM_OF_SIGNAL_GROUPS': 'COM_MAX_GROUPS',
    'COM_MAX_IPDU_BUFFER_SIZE': '128U',
    'COM_MAX_IPDU_LENGTH': '64U',
  },
};

const DEMO_MODULES = ['can', 'canif', 'cantp', 'pdur', 'com'];

/** 从生成头解析 #define NAME VALUE 映射（跳过 guard *_CFG_H） */
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

/**
 * C 值语义归一化：去注释/外层括号/cast，布尔与数值转规范 token；
 * 标识符（别名宏）经同文件宏表解析后递归比较。与 V2 备选路径的
 * 语义等价判定一致：cast 丢失、十六进制↔十进制、别名 vs 字面量均视为等价。
 */
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

function filenameToModule(filename: string): string {
  return filename.replace(/_Cfg\.h$/, '').toLowerCase();
}

/**
 * V2.2 — codegen schema 源切换到宏名版。
 *
 * 验收（与 V2 备选路径一致）：generateHeadersFromSchemas 对 5 个 demo 模块
 * （can/canif/cantp/pdur/com）生成结果 = 手写头宏名 139/139 + 值语义等价。
 */
describe('V2.2 — codegen schema 源切换（宏名版优先）', () => {
  it('loadPreferredSchemas：与 loadModuleSchemas 同集合同排序，5 个 demo 模块为宏名版', () => {
    const preferred = loadPreferredSchemas();
    const generated = loadModuleSchemas();
    expect(preferred.length).toBeGreaterThanOrEqual(114);
    expect(preferred.map(s => s.name)).toEqual(generated.map(s => s.name));

    for (const mod of DEMO_MODULES) {
      const schema = preferred.find(s => s.name.toLowerCase() === mod)!;
      const macroParams = (schema.parameters ?? []).filter(p => /^[A-Z][A-Z0-9_]*$/.test(p.name));
      // 宏名版：参数名即宏名，手写宏全集必须全部在 parameters 中
      const handNames = Object.keys(HAND_WRITTEN_MACROS[mod]);
      for (const n of handNames) {
        expect(macroParams.some(p => p.name === n), `${mod}: 缺宏名参数 ${n}`).toBe(true);
      }
      expect(schema.parameters!.length).toBeGreaterThanOrEqual(handNames.length);
    }
  });

  it('generateHeadersFromSchemas（preferred 5 模块）→ 手写宏 139/139 全覆盖 + 值语义等价', async () => {
    const preferred = loadPreferredSchemas();
    const five = preferred.filter(s => DEMO_MODULES.includes(s.name.toLowerCase()));
    const files = await generateHeadersFromSchemas(five);
    expect(files).toHaveLength(5);

    let totalHand = 0;
    for (const [mod, handMacros] of Object.entries(HAND_WRITTEN_MACROS)) {
      const file = files.find(f => filenameToModule(f.filename) === mod);
      expect(file, `${mod}: 未生成 ${mod}_Cfg.h`).toBeDefined();
      const defs = parseDefines(file!.content);
      const aliases = new Map(Object.entries(handMacros));
      const diffs: string[] = [];
      for (const [name, handValue] of Object.entries(handMacros)) {
        totalHand++;
        const genValue = defs.get(name);
        if (genValue === undefined) {
          diffs.push(`${name}: 生成头缺失`);
          continue;
        }
        const hn = normalizeValue(handValue, aliases);
        const gn = normalizeValue(genValue, aliases);
        if (hn !== gn) {
          diffs.push(`${name}: 手写 ${handValue} → ${hn}，生成 ${genValue} → ${gn}`);
        }
      }
      expect(diffs, `${mod} 差异: ${diffs.join('; ')}`).toEqual([]);
    }
    expect(totalHand).toBe(139);
  });

  it('can 走通用 schema 路径（不再硬编码特例）：宏名版默认值与手写头一致，配置可流入', async () => {
    const files = await generateHeadersFromConfig([
      { name: 'can', enabled: true, parameters: [{ name: 'CAN_NUM_CONTROLLERS', value: 4 }] },
    ]);
    const can = files.find(f => f.filename === 'Can_Cfg.h')!;
    expect(can).toBeDefined();
    // 宏名版默认值 = 手写头现值
    expect(can.content).toContain('#define CAN_DEV_ERROR_DETECT    STD_ON');
    expect(can.content).toContain('#define CAN_NUM_HOH    (16U)');
    expect(can.content).toContain('#define CAN_TIMEOUT_DURATION    (10000U)');
    // 配置覆盖流入（V2 硬编码特例做不到的事）
    expect(can.content).toContain('#define CAN_NUM_CONTROLLERS    (4U)');
    expect(can.content).not.toContain('Can_HwHandleType');
  });

  it('未覆盖模块（非 yuleASR Cfg.h 来源）回退 generated/ 原路径', () => {
    const preferred = loadPreferredSchemas();
    // YAC-MAP-002（2026-08-21 老板裁决）：ble/mcl/sbc 无 yuleASR 实现已删除，不再回退
    for (const name of ['AppSwc', 'CompSwc', 'Arti', 'Fr']) {
      expect(preferred.find(s => s.name === name), `${name} 应保留`).toBeDefined();
    }
    for (const name of ['Ble', 'Mcl', 'Sbc']) {
      expect(preferred.find(s => s.name === name), `${name} 应已删除`).toBeUndefined();
    }
    // 4 个回退模块参数仍为 ARXML 风格（非宏名），走原 schema 行为
    const appswc = preferred.find(s => s.name === 'AppSwc')!;
    expect(appswc.parameters!.length).toBeGreaterThan(0);
  });
});
