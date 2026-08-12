#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
yuleASR-Configurator MCAL schema 归一化修复脚本 (2026-08-12)

背景（详见 reports/yuleasr-configurator-mcal-schema-vs-arxml-20260812.md）：
51 个 ARXML-Extracted schema 的容器名错用了值层实例名（如 AdcHwUnit_0 / PwmChannel_0 /
CAN_RX / BLE_3V3 / MCU_DAP_RESET），而 AUTOSAR 定义层容器名应为定义名
（AdcHwUnit / PwmChannel / DioChannel / PortPin / McuResetSetting）。

本脚本修复（第一优先级，100% 机械可确定）：
  1. 容器名归一化：实例名 → 定义名（精确映射表 + 数字后缀自动规则）
  2. 多实例容器合并：同定义名的多个实例容器合并为一个（参数并集去重）
  3. x-layer 分层修正：adc/spi/dio/port/mcu/can/lin → MCAL
  4. 已知重复清理：AdcConfigSet 与 AdcHwUnit 参数重复问题由合并天然解决

不做（第二优先级，需定义层数据/人工确认）：
  - 缺失标准容器补全（AdcChannel/SpiSequence/PortPin 等，本脚本由实例合并产生一部分）
  - 枚举/类型补全（string → enum）
  - SpiDriver 父容器参数污染拆分

用法: python3 scripts/fix-schema-normalization.py
备份: /tmp/schema-backup-20260812/（脚本运行前已备份全部 117 个 schema）
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERATED = ROOT / 'packages/@yuletech/core/src/schema/generated'

# ============================================================================
# 1. 实例名 → 定义名 精确映射表（按模块）
#    键: 原始容器名 → 目标定义名；None 值 = 仅去后缀（自动规则），特殊键 '__auto__' = 启用数字后缀自动归一
# ============================================================================
INSTANCE_TO_DEF = {
    'adc': {
        '__auto__': True,          # AdcHwUnit_0 → AdcHwUnit, AdcGroup_0 → AdcGroup, AdcInterrupt_0 → AdcInterrupt
        'Adc_A8_BAT': 'AdcChannel',   # 通道实例（参数为通道特征）→ AdcChannel（补标准缺失容器）
    },
    'spi': {
        '__auto__': True,          # SpiChannelList_0 → SpiChannelList, SpiPhyUnit_0 → SpiPhyUnit
        'SpiChannel_Flash': 'SpiChannel',
        'SpiChannel_SE': 'SpiChannel',
        'SpiChannel_UWB': 'SpiChannel',
        'SpiExternalDevice_FLASH': 'SpiExternalDevice',
        'SpiExternalDevice_SE': 'SpiExternalDevice',
        'SpiExternalDevice_UWB': 'SpiExternalDevice',
        'SpiJob_Flash': 'SpiJob',
        'SpiJob_SE': 'SpiJob',
        'SpiJob_UWB': 'SpiJob',
    },
    'dio': {
        'CAN_RX': 'DioChannel',
        'FLASH_SPI_CS': 'DioChannel',
        'SBC_CLK': 'DioChannel',
        'SBC_INT': 'DioChannel',
        'SBC_MOSI': 'DioChannel',
        'SBC_RST': 'DioChannel',
        'SE_IRQ': 'DioChannel',
        'SWD_DIO': 'DioChannel',
        'DioPort_A': 'DioPort',
        'DioPort_B': 'DioPort',
        'DioPort_C': 'DioPort',
        'DioPort_D': 'DioPort',
    },
    'icu': {
        '__auto__': True,          # IcuGpioChannels_0/1, IcuGpio_0, IcuHwInterruptConfigList_0..6
        'IcuChannel_CANRx': 'IcuChannel',
        'IcuChannel_SBCINT': 'IcuChannel',
        'IcuGpioChannels_0': 'IcuGpioChannel',
        'IcuGpioChannels_1': 'IcuGpioChannel',
        'IcuGpio_0': 'IcuGpioChannel',
        'IcuHwInterruptConfigList_0': 'IcuHwInterruptConfig',
        'IcuHwInterruptConfigList_1': 'IcuHwInterruptConfig',
        'IcuHwInterruptConfigList_2': 'IcuHwInterruptConfig',
        'IcuHwInterruptConfigList_3': 'IcuHwInterruptConfig',
        'IcuHwInterruptConfigList_4': 'IcuHwInterruptConfig',
        'IcuHwInterruptConfigList_5': 'IcuHwInterruptConfig',
        'IcuHwInterruptConfigList_6': 'IcuHwInterruptConfig',
    },
    'gpt': {
        '__auto__': True,          # GptHwConfiguration_0/1/2
        'GptChannelConfiguration_4': 'GptChannelConfiguration',
        'GptChannelConfiguration_5': 'GptChannelConfiguration',
        'GptChannelConfiguration_LPIT': 'GptChannelConfiguration',
    },
    'pwm': {
        '__auto__': True,          # PwmChannel_0..7 → PwmChannel
    },
    'port': {
        'BLE_3V3': 'PortPin',
        'CAN_SPI_CLK': 'PortPin',
        'CAN_SPI_CS': 'PortPin',
        'CAN_SPI_MISO': 'PortPin',
        'CAN_SPI_MOSI': 'PortPin',
        'FLASH_SE_SPI_CLK': 'PortPin',
        'FLASH_SE_SPI_MISO': 'PortPin',
        'FLASH_SE_SPI_MOSI': 'PortPin',
        'FLASH_SPI_CS': 'PortPin',
        'FLASH_WP': 'PortPin',
        'KW45_RST': 'PortPin',
        'KW45_SWD_CLK': 'PortPin',
        'KW45_SWD_DIO': 'PortPin',
        'NotUsedPortPin': 'PortPin',
    },
    'mcu': {
        'MCU_DAP_RESET': 'McuResetSetting',
        'MCU_FATAL_RESET': 'McuResetSetting',
        'MCU_HVD_RESET': 'McuResetSetting',
        'MCU_JTAG_SYSTEM_RESET': 'McuResetSetting',
        'MCU_LOCKUP_RESET': 'McuResetSetting',
        'MCU_LOW_POWER_ACKNOWLEDGE_TIMEOUT_RESET': 'McuResetSetting',
    },
    'can': {
        '__auto__': True,          # CanFilterMask_001..011 → CanFilterMask
        'CanFilterMask0': 'CanFilterMask',
    },
    'cantp': {
        'CanTpTxNPdu_37436734': 'CanTpTxNPdu',
        'CanTpRxFcNPdu_37436734': 'CanTpRxFcNPdu',
    },
    'crypto': {
        'CryptoDriverObject_0': 'CryptoDriverObject',
    },
    'fee': {
        'FeeBlockConfiguration_01': 'FeeBlockConfiguration',
    },
    'fls': {
        '__auto__': True,          # FlsSector_0..8 → FlsSector
    },
    'i2c': {
        '__auto__': True,          # I2cChannel_0..3 → I2cChannel
    },
    'uart': {
        '__auto__': True,          # UartChannel_0..7 → UartChannel
    },
    'mcl': {
        '__auto__': True,          # MclIsrAvailable_1..15 → MclIsrAvailable（去后缀）
        'MclIsrAvailable': 'MclIsr',
        'MclIsrAvailable_1': 'MclIsr',
        'MclIsrAvailable_2': 'MclIsr',
        'MclIsrAvailable_3': 'MclIsr',
        'MclIsrAvailable_10': 'MclIsr',
        'MclIsrAvailable_11': 'MclIsr',
        'MclIsrAvailable_12': 'MclIsr',
        'MclIsrAvailable_13': 'MclIsr',
        'MclIsrAvailable_14': 'MclIsr',
        'MclIsrAvailable_15': 'MclIsr',
    },
    'ble': {
        'GattDBAtt_0': 'GattDBAtt',
        'GattDBAtt_1': 'GattDBAtt',
        'GattDBAtt_2': 'GattDBAtt',
    },
    'rte': {
        '__auto__': True,          # ADC_EXCLUSIVE_AREA_00..14 → ADC_EXCLUSIVE_AREA
    },
}

# x-layer 分层修正（AUTOSAR 标准分层）
LAYER_FIXES = {
    'adc': 'MCAL', 'spi': 'MCAL', 'dio': 'MCAL', 'port': 'MCAL',
    'mcu': 'MCAL', 'can': 'MCAL', 'lin': 'MCAL',
}


def normalize_instance_name(name: str) -> str | None:
    """数字后缀自动归一：Foo_0 / Foo_001 / Foo_10 → Foo；无数字后缀返回 None"""
    m = re.match(r'^(.*?)_(\d+)$', name)
    return m.group(1) if m else None


def resolve_target(module: str, container: str, mapping: dict) -> str:
    """解析容器名的目标定义名（精确映射优先，其次自动规则）"""
    if container in mapping:
        return mapping[container]
    if mapping.get('__auto__'):
        base = normalize_instance_name(container)
        if base and base not in ('',):
            return base
    return container  # 无需归一


def merge_params(target_props: dict, source_props: dict) -> None:
    """把 source 容器的参数并入 target（同名保留先出现的定义，不同名追加）"""
    for k, v in source_props.items():
        if k not in target_props:
            target_props[k] = v


def fix_module(module: str, d: dict) -> dict:
    mapping = INSTANCE_TO_DEF.get(module, {})
    props = d.get('properties', {})
    if not mapping or not props:
        return d

    # 1) 计算每个容器目标名
    targets: dict[str, dict] = {}   # 目标容器名 → 合并后的 properties
    order: list[str] = []           # 保持首次出现顺序
    renamed = 0
    for key in list(props.keys()):
        node = props[key]
        if node.get('type') != 'object':
            continue
        target = resolve_target(module, key, mapping)
        if target != key:
            renamed += 1
        if target not in targets:
            targets[target] = {'_src': key}
            order.append(target)
        # 合并参数
        src_props = node.get('properties', {})
        tgt_props = targets[target].setdefault('properties', {})
        merge_params(tgt_props, src_props)

    # 2) 重建 properties：非容器参数保留原位，容器按合并结果重建
    new_props: dict = {}
    for key, node in props.items():
        if node.get('type') == 'object':
            continue  # 容器统一在下面按 order 重建
        new_props[key] = node
    for target in order:
        merged = targets[target]
        src_key = merged['_src']
        # 保留原容器的 description 等元数据（取第一个来源容器的描述；若目标名已存在非容器属性则跳过）
        src_node = props[src_key]
        new_node = {
            'description': src_node.get('description', f'{target} 配置容器'),
            'type': 'object',
            'properties': merged['properties'],
            'additionalProperties': src_node.get('additionalProperties', True),
        }
        # 保留 choice / multiplicity / config-class 等元数据（若来源容器有）
        for xk in ('x-choice-container', 'x-choice-params', 'x-choice-description',
                   'x-multiplicity', 'x-config-class', 'x-min-instances', 'x-max-instances'):
            if xk in src_node:
                new_node[xk] = src_node[xk]
        new_props[target] = new_node

    d['properties'] = new_props
    d['_fix_renamed'] = renamed
    return d


def main() -> int:
    changed = []
    for f in sorted(GENERATED.glob('*.json')):
        module = f.stem
        d = json.loads(f.read_text(encoding='utf-8'))
        before = json.dumps(d, sort_keys=True)
        d = fix_module(module, d)
        # x-layer 修正
        if module in LAYER_FIXES:
            d['x-layer'] = LAYER_FIXES[module]
        after = json.dumps(d, sort_keys=True)
        if before != after:
            f.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
            changed.append((module, d.get('_fix_renamed', 0)))
            d.pop('_fix_renamed', None)

    print(f'✅ 修改 {len(changed)} 个模块:')
    for m, r in changed:
        print(f'  {m}.json (容器归一 {r} 处)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
