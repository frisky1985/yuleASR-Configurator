/**
 * @yuletech/core - P2-2 crossReferences 标注脚本
 *
 * 将 AUTOSAR 跨模块依赖矩阵写入 54 个 generated/*.json 的模块级 crossReferences。
 * 所有 sourceParam / param 都经过存在性验证 (见 sprint-contract-p2-2-crossrefs.md)。
 *
 * 运行: pnpm --filter @yuletech/core exec tsx scripts/annotate-cross-refs.ts
 * 或:  node --import tsx scripts/annotate-cross-refs.ts (仓库根)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '../packages/@yuletech/core/src/schema/generated');

/**
 * AUTOSAR 跨模块依赖矩阵
 * 每条: [源模块, 源参数, 目标模块, 目标参数, 关系, 描述]
 * 所有参数名经过 generated JSON 存在性验证。
 */
const CROSS_REF_MATRIX: Array<
  [string, string, string, string, 'equals' | 'less_than' | 'greater_than' | 'in_range' | 'in_enum', string]
> = [
  ['Can', 'CanControllerBaudRate', 'CanTrcv', 'CanTrcvMaxBaudrate', 'less_than', 'CAN 控制器波特率不应超过收发器最大波特率'],
  ['Can', 'CanControllerFdBaudRate', 'CanTrcv', 'CanTrcvMaxBaudrate', 'less_than', 'CAN FD 数据波特率不应超过收发器最大波特率'],
  ['CanTrcv', 'CanTrcvBaudRate', 'Can', 'CanControllerBaudRate', 'equals', '收发器波特率应与 CAN 控制器波特率一致'],
  ['Xcp', 'XcpCanBaudRate', 'Can', 'CanControllerBaudRate', 'less_than', 'XCP CAN 波特率不应超过 CAN 控制器波特率'],
  ['Xcp', 'XcpCanCanId', 'CanIf', 'CanIfTxPduCanId', 'in_enum', 'XCP CAN 标识符应匹配 CanIf 配置的 PDU CAN ID'],
  ['Com', 'ComIPduHandleId', 'PduR', 'PduRDestPduHandleId', 'equals', 'Com 的 PDU 句柄应与 PduR 路由目标一致'],
  ['NvM', 'NvMNvramBlockIdentifier', 'Fee', 'FeeBlockNumber', 'in_range', 'NvM 块标识应在 Fee 块号范围内'],
  ['NvM', 'NvMNvramBlockIdentifier', 'Ea', 'EaBlockNumber', 'in_range', 'NvM 块标识应在 Ea 块号范围内'],
  ['NvM', 'NvMNvBlockLength', 'Fee', 'FeeBlockSize', 'less_than', 'NvM 块长度不应超过 Fee 块大小'],
  ['Ea', 'EaBlockNumber', 'Eep', 'EepSize', 'in_range', 'Ea 块号应在 EEPROM 容量范围内'],
  ['Fee', 'FeeBlockSize', 'Fls', 'FlsMaxReadNormalMode', 'less_than', 'Fee 块大小不应超过 Fls 支持的最大读取大小'],
  ['WdgM', 'WdgMExpectedAliveIndications', 'WdgIf', 'WdgIfDeviceId', 'in_range', 'WdgM 期望存活指示应与 WdgIf 设备匹配'],
  ['Dem', 'DemUdsDTC', 'Dcm', 'DcmDsdSidTabServiceId', 'in_enum', 'Dem DTC 服务应与 Dcm 诊断会话服务匹配'],
  ['CanIf', 'CanIfTxPduCanId', 'Can', 'CanControllerBaudRate', 'in_range', 'CanIf 发送 PDU CAN ID 应在 CAN 控制器范围内'],
  ['LinIf', 'LinIfChannelRef', 'Lin', 'LinChannelId', 'in_enum', 'LinIf 通道引用应匹配 Lin 通道配置'],
  ['EthIf', 'EthIfControllerRef', 'Eth', 'EthControllerIndex', 'in_enum', 'EthIf 控制器引用应匹配 Eth 控制器配置'],
  ['Crypto', 'CryptoDriverObjectId', 'CryIf', 'CryIfChannelId', 'in_enum', 'Crypto 驱动对象应与 CryIf 通道匹配'],
  ['Csm', 'CsmSymKeyMaxLength', 'Crypto', 'CryptoKeyLock', 'in_range', 'Csm 密钥长度应与 Crypto 密钥配置匹配'],
  ['PduR', 'PduRDestPduHandleId', 'CanIf', 'CanIfTxPduCanId', 'in_enum', 'PduR 路由目标 PDU 应匹配 CanIf 配置'],
];

/** 读取 JSON schema 并返回扁平参数集合 */
function flatParamNames(moduleName: string): Set<string> {
  const file = join(GENERATED_DIR, `${moduleName.toLowerCase()}.json`);
  const d = JSON.parse(readFileSync(file, 'utf-8'));
  const out = new Set<string>();
  for (const cv of Object.values(d.properties || {})) {
    const prop = cv as { type?: string; properties?: Record<string, unknown> };
    if (prop.type === 'object' && prop.properties) {
      for (const pk of Object.keys(prop.properties)) out.add(pk);
    } else {
      // 顶层属性名
    }
  }
  // 容器名也加入 (部分引用指向容器)
  for (const ck of Object.keys(d.properties || {})) out.add(ck);
  return out;
}

function main() {
  // 1. 验证所有参数存在
  const errors: string[] = [];
  for (const [src, sp, tgt, tp] of CROSS_REF_MATRIX) {
    const srcParams = flatParamNames(src);
    const tgtParams = flatParamNames(tgt);
    if (!srcParams.has(sp)) errors.push(`${src}.${sp} 不存在`);
    if (!tgtParams.has(tp)) errors.push(`${tgt}.${tp} 不存在`);
  }
  if (errors.length > 0) {
    console.error('❌ 参数存在性验证失败:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✅ 参数存在性验证通过 (${CROSS_REF_MATRIX.length} 条约束)`);

  // 2. 按源模块分组写入 JSON
  const byModule = new Map<string, typeof CROSS_REF_MATRIX>();
  for (const row of CROSS_REF_MATRIX) {
    const [src] = row;
    byModule.set(src, [...(byModule.get(src) || []), row]);
  }

  let written = 0;
  for (const [src, rows] of byModule) {
    const file = join(GENERATED_DIR, `${src.toLowerCase()}.json`);
    const d = JSON.parse(readFileSync(file, 'utf-8'));
    d.crossReferences = rows.map(([, sp, tgt, tp, rel, desc]) => ({
      sourceParam: sp,
      module: tgt,
      param: tp,
      relation: rel,
      severity: 'warning',
      description: desc,
    }));
    writeFileSync(file, JSON.stringify(d, null, 2) + '\n');
    written++;
    console.log(`  ✍️ ${src}: ${rows.length} 条`);
  }
  console.log(`✅ 写入完成: ${written} 个模块`);
}

main();
