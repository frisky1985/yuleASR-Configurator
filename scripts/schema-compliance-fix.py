#!/usr/bin/env python3
"""Schema AUTOSAR 短期合规补全脚本 (sprint-contract 2026-08-01)

1. 给 28 个缺 CPI 的 schema 注入 CommonPublishedInformation (8 字段标准模板)
2. IoHwAb 补全 IoHwAbDio/IoHwAbAdc 参数
3. 已知枚举参数 enum 化 (PortPinDirection / GptChannelMode 等)

用法: python3 scripts/schema-compliance-fix.py
"""
import json
import os
import sys
from copy import deepcopy

GENERATED = os.path.join(os.path.dirname(__file__), '..', 'packages', '@yuletech', 'core', 'src', 'schema', 'generated')

def load(name):
    with open(os.path.join(GENERATED, name), 'r', encoding='utf-8') as f:
        return json.load(f)

def save(name, data):
    with open(os.path.join(GENERATED, name), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')

# ---- 标准 CPI 模板 (对齐 dio.json) ----
CPI_TEMPLATE = {
    "description": "CommonPublishedInformation 配置容器",
    "type": "object",
    "properties": {
        "ArReleaseMajorVersion": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "ArReleaseMajorVersion 参数"},
        "ArReleaseMinorVersion": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "ArReleaseMinorVersion 参数"},
        "ArReleaseRevisionVersion": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "ArReleaseRevisionVersion 参数"},
        "ModuleId": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "ModuleId 参数"},
        "SwMajorVersion": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "SwMajorVersion 参数"},
        "SwMinorVersion": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "SwMinorVersion 参数"},
        "SwPatchVersion": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "SwPatchVersion 参数"},
        "VendorId": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "VendorId 参数"}
    },
    "additionalProperties": True
}

# ---- 1. CPI 注入 ----
CPI_ALREADY = [
    'adc', 'ble', 'crypto', 'dio', 'ea', 'eep', 'eth', 'ethif', 'fls', 'fr', 'frif',
    'gpt', 'i2c', 'icu', 'lin', 'linif', 'mcl', 'mcu', 'port', 'pwm', 'spi', 'uart',
    'wdg', 'wdgif', 'wdgm', 'xcp'
]
# 实际检测缺失，而不是靠手列清单
files = sorted(f for f in os.listdir(GENERATED) if f.endswith('.json'))
missing_cpi = []
for f in files:
    d = load(f)
    if 'CommonPublishedInformation' not in d.get('properties', {}):
        missing_cpi.append(f)

print(f"[1] CPI 检查: {len(files)} 文件, {len(missing_cpi)} 缺 CPI")
fixed_cpi = []
for f in missing_cpi:
    d = load(f)
    d.setdefault('properties', {})
    d['properties']['CommonPublishedInformation'] = deepcopy(CPI_TEMPLATE)
    save(f, d)
    fixed_cpi.append(f)
print(f"    已注入: {', '.join(fixed_cpi)}")

# ---- 2. IoHwAb 补全 ----
IOHWAB_NEW = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://yuletech.io/schemas/modules/iohwab.json",
    "title": "IoHwAb Configuration",
    "description": "I/O 硬件抽象层 (AUTOSAR SWS_IoHwAb)",
    "type": "object",
    "properties": {
        "CommonPublishedInformation": deepcopy(CPI_TEMPLATE),
        "IoHwAbGeneral": {
            "description": "IoHwAb 通用配置",
            "type": "object",
            "additionalProperties": True,
            "properties": {
                "IoHwAbDevErrorDetect": {"type": "boolean", "default": False, "description": "开发错误检测使能 (DET)"},
                "IoHwAbVersionInfoApi": {"type": "boolean", "default": False, "description": "版本信息 API 使能"}
            }
        },
        "IoHwAbChannel": {
            "description": "IoHwAb 通道配置 (映射 Dio/Adc/Pwm 通道)",
            "type": "object",
            "additionalProperties": True,
            "properties": {
                "IoHwAbChannelId": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "通道 ID"},
                "IoHwAbChannelDirection": {"type": "string", "enum": ["IOHWAB_CH_IN", "IOHWAB_CH_OUT", "IOHWAB_CH_INOUT"], "description": "通道方向"},
                "IoHwAbPortPinRef": {"type": "string", "description": "引用的 Dio/Port 引脚"},
                "IoHwAbSignalRef": {"type": "string", "description": "关联信号引用"}
            }
        },
        "IoHwAbSignal": {
            "description": "IoHwAb 信号配置",
            "type": "object",
            "additionalProperties": True,
            "properties": {
                "IoHwAbSignalId": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "信号 ID"},
                "IoHwAbSignalDirection": {"type": "string", "enum": ["IOHWAB_SIG_IN", "IOHWAB_SIG_OUT"], "description": "信号方向"},
                "IoHwAbSignalType": {"type": "string", "enum": ["IOHWAB_SIG_DIGITAL", "IOHWAB_SIG_ANALOG", "IOHWAB_SIG_PWM"], "description": "信号类型"}
            }
        },
        "IoHwAbDio": {
            "description": "数字 I/O 配置",
            "type": "object",
            "additionalProperties": True,
            "properties": {
                "IoHwAbDioChannelId": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "数字通道 ID"},
                "IoHwAbDioPortPin": {"type": "string", "description": "引脚引用 (PortPin)"},
                "IoHwAbDioDirection": {"type": "string", "enum": ["IOHWAB_DIO_IN", "IOHWAB_DIO_OUT"], "description": "数字通道方向"}
            }
        },
        "IoHwAbAdc": {
            "description": "ADC 配置",
            "type": "object",
            "additionalProperties": True,
            "properties": {
                "IoHwAbAdcChannelId": {"type": "integer", "minimum": 0, "maximum": 65535, "description": "ADC 通道 ID"},
                "IoHwAbAdcResolution": {"type": "integer", "minimum": 8, "maximum": 32, "description": "ADC 分辨率 (bit)"},
                "IoHwAbAdcRefVoltage": {"type": "number", "description": "参考电压 (mV)"}
            }
        }
    },
    "required": ["CommonPublishedInformation"],
    "additionalProperties": False,
    "x-layer": "ECUAL",
    "x-version": "4.4.0",
    "x-source": "ARXML-Extracted"
}
save('iohwab.json', IOHWAB_NEW)
print("[2] IoHwAb 补全: IoHwAbGeneral/IoHwAbChannel/IoHwAbSignal/IoHwAbDio/IoHwAbAdc 已定义")

# ---- 3. 枚举化 ----
# (module, 容器路径, 参数名, 枚举值列表, 值类型)
ENUM_FIXES = [
    # Port: PortPinDirection → PORT_PIN_IN / PORT_PIN_OUT (AUTOSAR SWS_Port)
    ('port.json', 'PortPin', 'PortPinDirection',
     ["PORT_PIN_IN", "PORT_PIN_OUT"], 'string'),
    # Gpt: GptChannelMode → CONTINUOUS / ONESHOT (AUTOSAR SWS_Gpt)
    ('gpt.json', 'GptChannel', 'GptChannelMode',
     ["GPT_CHANNEL_MODE_CONTINUOUS", "GPT_CHANNEL_MODE_ONESHOT"], 'string'),
]

def enumize(name, d, container_path, param_name, values, vtype):
    """在 schema 全树中按参数名枚举化 (实例化容器名不定, 按参数名匹配)"""
    changed = []

    def walk(node, depth=0):
        if not isinstance(node, dict) or depth > 12:
            return
        props = node.get('properties', {})
        if param_name in props:
            p = props[param_name]
            old_type = p.get('type', '?')
            p['type'] = vtype
            p['enum'] = list(values)
            if 'minimum' in p: del p['minimum']
            if 'maximum' in p: del p['maximum']
            changed.append(f"OK {param_name} {old_type} → enum({len(values)})")
        for v in props.values():
            walk(v, depth + 1)
        items = node.get('items', {})
        if isinstance(items, dict):
            walk(items, depth + 1)

    walk(d)
    return '\n'.join(changed) if changed else f"!! {name}: 未找到 {param_name}"

results = []
for name, cp, pn, vals, vt in ENUM_FIXES:
    d = load(name)
    results.append(enumize(name, d, cp, pn, vals, vt))
    save(name, d)
print("[3] 枚举化:")
print('\n'.join(results))

# ---- 汇总 ----
print()
print(f"完成: CPI +{len(fixed_cpi)}, IoHwAb 重写, 枚举 {len(ENUM_FIXES)} 处")
