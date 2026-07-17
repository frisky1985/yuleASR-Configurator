/**
 * OS (Operating System) Configuration
 * Based on OSEK/VDX and AUTOSAR OS standard
 */

import type {
  OSConfig,
  OSTask,
  OSEvent,
  OSAlarm,
  OSResource,
  OSCounter,
  OSScheduleTable,
  OSISR,
} from '@/types/config';

export const defaultOSConfig: OSConfig = {
  id: 'os-1',
  name: 'OSEK OS',
  version: '2.2.3',
  enabled: true,

  // OS Configuration Properties
  scalabilityClass: 'SC2',
  statusLevel: 'EXTENDED',
  startupHooks: true,
  shutdownHooks: true,
  errorHooks: true,
  protectionHooks: false,

  // Tasks
  tasks: [
    {
      id: 'task-init',
      name: 'Init_Task',
      priority: 10,
      schedule: 'NON',
      activation: 1,
      autostart: true,
      resources: [],
      events: [],
      stackSize: 1024,
    },
    {
      id: 'task-10ms',
      name: 'Cyclic_10ms',
      priority: 5,
      schedule: 'FULL',
      activation: 1,
      autostart: false,
      resources: ['Resource_1'],
      events: ['Event_10ms'],
      stackSize: 512,
    },
    {
      id: 'task-50ms',
      name: 'Cyclic_50ms',
      priority: 4,
      schedule: 'FULL',
      activation: 1,
      autostart: false,
      resources: ['Resource_1'],
      events: ['Event_50ms'],
      stackSize: 512,
    },
    {
      id: 'task-100ms',
      name: 'Cyclic_100ms',
      priority: 3,
      schedule: 'FULL',
      activation: 1,
      autostart: false,
      resources: [],
      events: ['Event_100ms'],
      stackSize: 512,
    },
    {
      id: 'task-background',
      name: 'Background_Task',
      priority: 1,
      schedule: 'FULL',
      activation: 1,
      autostart: true,
      resources: [],
      events: [],
      stackSize: 256,
    },
    {
      id: 'task-can-rx',
      name: 'CanRx_Task',
      priority: 8,
      schedule: 'FULL',
      activation: 1,
      autostart: false,
      resources: ['Resource_CAN'],
      events: ['Event_CanRx'],
      stackSize: 768,
    },
    {
      id: 'task-can-tx',
      name: 'CanTx_Task',
      priority: 7,
      schedule: 'FULL',
      activation: 1,
      autostart: false,
      resources: ['Resource_CAN'],
      events: ['Event_CanTx'],
      stackSize: 512,
    },
  ],

  // Events
  events: [
    { id: 'evt-10ms', name: 'Event_10ms', mask: '0x01' },
    { id: 'evt-50ms', name: 'Event_50ms', mask: '0x02' },
    { id: 'evt-100ms', name: 'Event_100ms', mask: '0x04' },
    { id: 'evt-can-rx', name: 'Event_CanRx', mask: '0x10' },
    { id: 'evt-can-tx', name: 'Event_CanTx', mask: '0x20' },
  ],

  // Resources
  resources: [
    {
      id: 'res-1',
      name: 'Resource_1',
      linkedResources: [],
    },
    {
      id: 'res-can',
      name: 'Resource_CAN',
      linkedResources: [],
    },
    {
      id: 'res-nvm',
      name: 'Resource_NvM',
      linkedResources: [],
    },
  ],

  // Counters
  counters: [
    {
      id: 'cnt-system',
      name: 'SystemCounter',
      maxAllowedValue: 4294967295,
      ticksPerBase: 1,
      minCycle: 1,
    },
  ],

  // Alarms
  alarms: [
    {
      id: 'alarm-10ms',
      name: 'Alarm_10ms',
      counter: 'SystemCounter',
      autostart: true,
      period: 10,
      action: 'SETEVENT',
      task: 'Cyclic_10ms',
      event: 'Event_10ms',
    },
    {
      id: 'alarm-50ms',
      name: 'Alarm_50ms',
      counter: 'SystemCounter',
      autostart: true,
      period: 50,
      action: 'SETEVENT',
      task: 'Cyclic_50ms',
      event: 'Event_50ms',
    },
    {
      id: 'alarm-100ms',
      name: 'Alarm_100ms',
      counter: 'SystemCounter',
      autostart: true,
      period: 100,
      action: 'SETEVENT',
      task: 'Cyclic_100ms',
      event: 'Event_100ms',
    },
  ],

  // Schedule Tables
  scheduleTables: [
    {
      id: 'st-main',
      name: 'MainScheduleTable',
      counter: 'SystemCounter',
      periodic: true,
      autostart: true,
      expiryPoints: [
        {
          id: 'ep-0',
          offset: 0,
          tasks: ['Init_Task'],
          events: [],
        },
        {
          id: 'ep-10',
          offset: 10,
          tasks: [],
          events: [{ task: 'Cyclic_10ms', event: 'Event_10ms' }],
        },
        {
          id: 'ep-50',
          offset: 50,
          tasks: [],
          events: [{ task: 'Cyclic_50ms', event: 'Event_50ms' }],
        },
        {
          id: 'ep-100',
          offset: 100,
          tasks: [],
          events: [{ task: 'Cyclic_100ms', event: 'Event_100ms' }],
        },
      ],
    },
  ],

  // ISRs
  isrs: [
    {
      id: 'isr-can-rx',
      name: 'Can_Rx_ISR',
      category: 2,
      priority: 50,
      vector: 'CAN_RX_IRQn',
      resource: 'Resource_CAN',
    },
    {
      id: 'isr-can-tx',
      name: 'Can_Tx_ISR',
      category: 2,
      priority: 49,
      vector: 'CAN_TX_IRQn',
      resource: 'Resource_CAN',
    },
    {
      id: 'isr-can-error',
      name: 'Can_Error_ISR',
      category: 2,
      priority: 48,
      vector: 'CAN_ERROR_IRQn',
      resource: 'Resource_CAN',
    },
    {
      id: 'isr-gpt',
      name: 'GPT_ISR',
      category: 2,
      priority: 40,
      vector: 'TIM2_IRQn',
    },
    {
      id: 'isr-uart',
      name: 'UART_ISR',
      category: 2,
      priority: 45,
      vector: 'USART1_IRQn',
    },
  ],
};

// OS validation rules
export const osValidationRules = {
  taskPriority: {
    min: 1,
    max: 255,
    unique: true,
  },
  stackSize: {
    min: 64,
    max: 65536,
  },
  isrCategory: [1, 2] as const,
  isrPriority: {
    min: 1,
    max: 255,
  },
  maxTaskNameLength: 32,
  maxEventNameLength: 32,
};
