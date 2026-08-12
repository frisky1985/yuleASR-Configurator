#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
yuleASR-Configurator MCAL schema 枚举补全脚本 (2026-08-12, 第二批)

背景（reports/yuleasr-configurator-mcal-schema-vs-arxml-20260812.md P3）：
schema 从值层提取时无类型信息，大量枚举参数被推断成 string（port 63% / spi 48%）。
本脚本按 yuleASR 真实驱动头文件（src/bsw/mcal/*/include/*.h）的 typedef enum
补全为 enum 类型（type 保持 string + enum 值列表，兼容 JSON Schema 2020-12）。

原则（工程诚实）：
  - 只补有确凿头文件依据的枚举；依据不足的参数保持 string 不动
  - 枚举值 = 头文件真实宏名（如 ADC_RESOLUTION_12BIT），不发明新值
  - 已带 enum 的参数跳过（如 PortPinDirection/GptChannelMode 已有）

用法: python3 scripts/fix-schema-enums.py
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERATED = ROOT / 'packages/@yuletech/core/src/schema/generated'

# ============================================================================
# 枚举映射表：模块 → {参数名: 枚举值列表}
# 枚举值来源：yuleASR src/bsw/mcal/<drv>/include/<Drv>.h typedef enum
# ============================================================================
ENUM_MAP = {
    'adc': {
        # Adc_ResolutionType (Adc.h:150)
        'AdcResolution': [
            'ADC_RESOLUTION_6BIT', 'ADC_RESOLUTION_8BIT',
            'ADC_RESOLUTION_10BIT', 'ADC_RESOLUTION_12BIT',
        ],
        # Adc_TriggerSourceType (Adc.h:118)
        'AdcGroupTriggSrc': ['ADC_TRIGG_SRC_SW', 'ADC_TRIGG_SRC_HW'],
        # Adc_ConversionModeType (Adc.h:126)
        'AdcGroupConversionMode': ['ADC_CONV_MODE_ONESHOT', 'ADC_CONV_MODE_CONTINUOUS'],
        # Adc_StreamBufferModeType (Adc.h:134)
        'AdcStreamingBufferMode': ['ADC_STREAM_BUFFER_LINEAR', 'ADC_STREAM_BUFFER_CIRCULAR'],
        # Adc_GroupAccessModeType (Adc.h:142)
        'AdcGroupAccessMode': ['ADC_ACCESS_MODE_SINGLE', 'ADC_ACCESS_MODE_STREAMING'],
        # Adc_SamplingTimeType (Adc.h:146-153)
        'AdcSampleTimeSelect': [
            'ADC_SAMPLING_TIME_3CYCLES', 'ADC_SAMPLING_TIME_15CYCLES',
            'ADC_SAMPLING_TIME_28CYCLES', 'ADC_SAMPLING_TIME_56CYCLES',
            'ADC_SAMPLING_TIME_84CYCLES', 'ADC_SAMPLING_TIME_112CYCLES',
            'ADC_SAMPLING_TIME_144CYCLES', 'ADC_SAMPLING_TIME_480CYCLES',
        ],
    },
    'spi': {
        # Spi_DataModeType (Spi.h)
        'SpiDataWidth': ['SPI_DATA_MODE_8BIT', 'SPI_DATA_MODE_16BIT', 'SPI_DATA_MODE_32BIT'],
        # Spi_ClockModeType (Spi.h)
        'SpiShiftClockIdleLevel': [
            'SPI_CLOCK_MODE_0', 'SPI_CLOCK_MODE_1', 'SPI_CLOCK_MODE_2', 'SPI_CLOCK_MODE_3',
        ],
    },
    'port': {
        # Port_PinLevelType (Port.h)
        'PortPinLevelValue': ['PORT_PIN_LEVEL_LOW', 'PORT_PIN_LEVEL_HIGH'],
    },
    'icu': {
        # Icu_SignalEdgeType (Icu.h)
        'IcuDefaultStartEdge': ['ICU_EDGE_NONE', 'ICU_EDGE_RISING', 'ICU_EDGE_FALLING', 'ICU_EDGE_BOTH'],
        # Icu_MeasurementModeType (Icu.h)
        'IcuMeasurementMode': [
            'ICU_MODE_SIGNAL_EDGE_DETECT', 'ICU_MODE_SIGNAL_MEASUREMENT',
            'ICU_MODE_TIMESTAMP', 'ICU_MODE_EDGE_COUNTER',
        ],
    },
    'pwm': {
        # Pwm_ChannelClassType (Pwm.h)
        'PwmChannelClass': ['PWM_VARIABLE_PERIOD', 'PWM_FIXED_PERIOD', 'PWM_FIXED_PERIOD_SHIFTED'],
        # Pwm_IdleStateType (Pwm.h)
        'PwmIdleState': ['PWM_IDLE_LOW', 'PWM_IDLE_HIGH'],
    },
    'mcu': {
        # Mcu_ResetType (Mcu.h)
        'McuResetReason': [
            'MCU_RST_UNDEFINED', 'MCU_RST_POWER_ON', 'MCU_RST_WATCHDOG',
            'MCU_RST_SOFTWARE', 'MCU_RST_EXTERNAL', 'MCU_RST_BROWN_OUT', 'MCU_RST_LOCKUP',
        ],
    },
    'fls': {
        # Fls_OpModeType (Fls.h)
        'FlsDefaultMode': ['FLS_MODE_NORMAL', 'FLS_MODE_FAST'],
    },
    'uart': {
        # Uart_DataBitsType (Uart.h)
        'UartDataBits': ['UART_DATA_BITS_5', 'UART_DATA_BITS_6', 'UART_DATA_BITS_7', 'UART_DATA_BITS_8'],
        # Uart_StopBitsType (Uart.h)
        'UartStopBits': ['UART_STOP_BITS_1', 'UART_STOP_BITS_1_5', 'UART_STOP_BITS_2'],
        # Uart_HwHandshakeType (Uart.h)
        'UartHardwareFlowControl': [
            'UART_HW_HANDSHAKE_NONE', 'UART_HW_HANDSHAKE_RTS',
            'UART_HW_HANDSHAKE_CTS', 'UART_HW_HANDSHAKE_RTS_CTS',
        ],
    },
    'i2c': {
        # I2c_OpModeType (I2c.h)
        'I2cOperationMode': ['I2C_MODE_MASTER', 'I2C_MODE_SLAVE'],
    },
}


def apply_enums(module: str, d: dict) -> tuple[int, int]:
    """遍历模块 schema 全部容器，按参数名补枚举。返回 (命中数, 跳过已有 enum 数)"""
    mapping = ENUM_MAP.get(module, {})
    if not mapping:
        return 0, 0
    hits = 0
    skipped = 0

    def walk(node):
        nonlocal hits, skipped
        if not isinstance(node, dict):
            return
        props = node.get('properties', {})
        for k, v in props.items():
            if v.get('type') == 'object':
                walk(v)
                continue
            if k not in mapping:
                continue
            if 'enum' in v:
                skipped += 1
                continue
            v['enum'] = list(mapping[k])
            hits += 1

    walk(d)
    return hits, skipped


def main() -> int:
    total_hits = 0
    for f in sorted(GENERATED.glob('*.json')):
        module = f.stem
        if module not in ENUM_MAP:
            continue
        d = json.loads(f.read_text(encoding='utf-8'))
        hits, skipped = apply_enums(module, d)
        if hits > 0:
            f.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
            print(f'  {module}.json: 补全 {hits} 处枚举 (跳过已有 {skipped} 处)')
            total_hits += hits
    print(f'✅ 共补全 {total_hits} 处枚举')
    return 0


if __name__ == '__main__':
    sys.exit(main())
