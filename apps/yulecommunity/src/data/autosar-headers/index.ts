import { STD_TYPES_H } from './Std_Types.h.ts';
import { CAN_H } from './Can.h.ts';
import { DIO_H } from './Dio.h.ts';
import { PORT_H } from './Port.h.ts';
import { SPI_H } from './Spi.h.ts';
import { MCU_H } from './Mcu.h.ts';

export interface VirtualHeader {
  name: string;
  content: string;
  module: string;
}

export const VIRTUAL_HEADERS: VirtualHeader[] = [
  { name: 'Std_Types.h', content: STD_TYPES_H, module: 'Common' },
  { name: 'Can.h', content: CAN_H, module: 'Can' },
  { name: 'Dio.h', content: DIO_H, module: 'Dio' },
  { name: 'Port.h', content: PORT_H, module: 'Port' },
  { name: 'Spi.h', content: SPI_H, module: 'Spi' },
  { name: 'Mcu.h', content: MCU_H, module: 'Mcu' },
];

export function getHeaderContent(name: string): string | undefined {
  return VIRTUAL_HEADERS.find(h => h.name === name)?.content;
}

export function getAllHeaderIncludes(): string {
  return VIRTUAL_HEADERS
    .filter(h => h.name !== 'Std_Types.h')
    .map(h => `#include "${h.name}"`)
    .join('\n');
}
