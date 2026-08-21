/**
 * @yuletech/core - P2-3 ChoiceContainerDef 标注脚本
 *
 * 给确凿的 AUTOSAR ChoiceContainerDef 场景打标:
 * - wdg.WdgDevice / wdgif.WdgIfDevice: 看门狗触发模式 (预触发/无预触发 二选一)
 * - spi.SpiDriver: SPI 通道主从模式 (SPI_MASTER/SPI_SLAVE 二选一)
 * - cantp.CanTpChannel: 传输层通道寻址模式 (二选一)
 *
 * 运行: ./packages/@yuletech/core/node_modules/.bin/tsx scripts/annotate-choice-containers.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '../packages/@yuletech/core/src/schema/generated');

/**
 * ChoiceContainerDef 标注矩阵
 * [模块, 容器, 互斥参数名列表, 描述]
 */
const CHOICE_MATRIX: Array<[string, string, string[], string]> = [
  [
    'wdg',
    'WdgDevice',
    ['WdgTriggeredMode', 'WdgTriggerConditionValue'],
    '看门狗触发模式与触发条件互斥 (预触发/无预触发 二选一)',
  ],
  ['wdgif', 'WdgIfDevice', ['WdgIfTriggeredMode'], '看门狗接口触发模式二选一 (预触发/无预触发)'],
  ['spi', 'SpiDriver', ['SpiChannelType'], 'SPI 通道类型互斥 (SPI_MASTER/SPI_SLAVE 二选一)'],
  ['cantp', 'CanTpConfig', ['CanTpChannelMode'], 'CanTp 通道模式二选一 (标准/扩展寻址)'],
];

function main() {
  for (const [mod, container, params, desc] of CHOICE_MATRIX) {
    const file = join(GENERATED_DIR, `${mod}.json`);
    const d = JSON.parse(readFileSync(file, 'utf-8'));
    const c = d.properties?.[container];
    if (!c || c.type !== 'object') {
      console.error(`❌ ${mod}.${container} 容器不存在`);
      process.exit(1);
    }
    // 验证参数存在
    for (const p of params) {
      if (!c.properties?.[p]) {
        console.error(`❌ ${mod}.${container}.${p} 参数不存在`);
        process.exit(1);
      }
    }
    c['x-choice-container'] = true;
    c['x-choice-params'] = params;
    c['x-choice-description'] = desc;
    writeFileSync(file, JSON.stringify(d, null, 2) + '\n');
    console.log(`✅ ${mod}.${container}: choice 标注完成 (${params.join(', ')})`);
  }
  console.log('全部完成');
}

main();
