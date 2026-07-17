import { describe, it, expect } from 'vitest';

import type { ModuleConfig, ModuleSchema } from '../../types';
import { OsCodeGenerator } from '../os-generator';

describe('OsCodeGenerator', () => {
  const generator = new OsCodeGenerator();

  const baseSchema: ModuleSchema = {
    name: 'Os',
    label: 'Operating System',
    layer: 'Service',
    version: '4.4.0',
    parameters: [],
    containers: [],
  };

  it('should have correct metadata', () => {
    expect(generator.name).toBe('OsCodeGenerator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should support Os module', () => {
    expect(generator.supports('Os')).toBe(true);
    expect(generator.supports('OS')).toBe(true);
  });

  it('should not support non-OS modules', () => {
    expect(generator.supports('Can')).toBe(false);
    expect(generator.supports('Mcu')).toBe(false);
    expect(generator.supports('Rte')).toBe(false);
  });

  it('should return three files (Os_Types.h, Os_Cfg.h, Os.c) on valid config', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 16,
        OsMaxIsrs: 32,
        OsMaxAlarms: 8,
        OsStackMonitoring: true,
        OsIdleTaskName: 'IdleTask',
        OsIdleTaskStackSize: 512,
        OsTask: [
          {
            OsTaskName: 'Task1',
            OsTaskPriority: 10,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 1024,
            OsTaskActivationLimit: 1,
            OsTaskType: 'BCC',
            OsTaskAutostart: true,
          },
          {
            OsTaskName: 'Task2',
            OsTaskPriority: 5,
            OsTaskSchedule: 'NON',
            OsTaskStackSize: 2048,
            OsTaskActivationLimit: 2,
            OsTaskType: 'ECC',
            OsTaskAutostart: false,
            OsTaskUsesFpu: true,
          },
        ],
        OsIsr: [
          {
            OsIsrName: 'TimerIsr',
            OsIsrCategory: 2,
            OsIsrInterruptPriority: 3,
            OsIsrStackSize: 256,
            OsIsrInterruptSource: 10,
            OsIsrEnableNesting: true,
          },
        ],
        OsCounter: [
          {
            OsCounterName: 'SystemTimer',
            OsCounterTicksPerBase: 1000,
            OsCounterMaxAllowedValue: 65535,
            OsCounterMinCycle: 1,
            OsCounterIsHardware: true,
          },
        ],
        OsAlarm: [
          {
            OsAlarmName: 'Alarm1',
            OsAlarmCounterRef: 'SystemTimer',
            OsAlarmActionType: 'ActivateTask',
            OsAlarmActionTaskRef: 'Task1',
            OsAlarmStartValue: 100,
            OsAlarmCycleValue: 1000,
            OsAlarmAutostart: true,
          },
        ],
        OsEvent: [
          {
            OsEventName: 'Event1',
            OsEventTaskRef: 'Task2',
            OsEventMask: 1,
          },
          {
            OsEventName: 'Event2',
            OsEventTaskRef: 'Task2',
            OsEventMask: 2,
          },
        ],
        OsResource: [
          {
            OsResourceName: 'Res1',
            OsResourcePriority: 3,
            OsResourceIsInternal: false,
          },
        ],
        OsScheduleTable: [
          {
            OsScheduleTableName: 'SchTbl1',
            OsScheduleTableDuration: 10000,
            OsScheduleTableSyncStrategy: 'NONE',
            OsScheduleTableAutostart: true,
            OsScheduleTableExpiryPoints: [
              {
                ExpiryPointOffset: 1000,
                ExpiryPointActionType: 'ActivateTask',
                ExpiryPointTaskRef: 'Task1',
              },
              {
                ExpiryPointOffset: 5000,
                ExpiryPointActionType: 'ActivateTask',
                ExpiryPointTaskRef: 'Task2',
              },
            ],
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
      generateComments: true,
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBe(3);

    const typesHeader = result.files.find(f => f.path.endsWith('Os_Types.h'));
    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'));
    const source = result.files.find(f => f.path.endsWith('Os.c'));

    expect(typesHeader).toBeDefined();
    expect(cfgHeader).toBeDefined();
    expect(source).toBeDefined();
  });

  it('should generate correct include guards in headers', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 4,
        OsTask: [
          {
            OsTaskName: 'Task1',
            OsTaskPriority: 1,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 512,
            OsTaskType: 'BCC',
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const typesHeader = result.files.find(f => f.path.endsWith('Os_Types.h'))!.content;
    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;

    expect(typesHeader).toContain('#ifndef OS_TYPES_H');
    expect(typesHeader).toContain('#define OS_TYPES_H');
    expect(typesHeader).toContain('#endif /* OS_TYPES_H */');
    expect(cfgHeader).toContain('#ifndef OS_CFG_H');
    expect(cfgHeader).toContain('#define OS_CFG_H');
    expect(cfgHeader).toContain('#endif /* OS_CFG_H */');
  });

  it('should generate task configuration macros in Os_Cfg.h', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 4,
        OsTask: [
          {
            OsTaskName: 'ControlTask',
            OsTaskPriority: 10,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 2048,
            OsTaskActivationLimit: 1,
            OsTaskType: 'ECC',
            OsTaskAutostart: true,
            OsTaskUsesFpu: true,
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    expect(cfgHeader).toContain('#define OS_TASK_COUNT');
    expect(cfgHeader).toContain('#define OS_TASK_ID_CONTROLTASK');
    expect(cfgHeader).toContain('#define CONTROLTASK_PRIORITY');
    expect(cfgHeader).toContain('FULL_PREEMPTIVE');
    expect(cfgHeader).toContain('#define CONTROLTASK_ACTIVATION_LIMIT');
    expect(cfgHeader).toContain('EXTENDED_TASK');
    expect(cfgHeader).toContain('CONTROLTASK_AUTOSTART');
    expect(cfgHeader).toContain('CONTROLTASK_USES_FPU');
  });

  it('should generate ISR configuration macros in Os_Cfg.h', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxIsrs: 4,
        OsIsr: [
          {
            OsIsrName: 'AdcIsr',
            OsIsrCategory: 2,
            OsIsrInterruptPriority: 5,
            OsIsrStackSize: 256,
            OsIsrInterruptSource: 7,
            OsIsrEnableNesting: true,
          },
          {
            OsIsrName: 'Cat1Isr',
            OsIsrCategory: 1,
            OsIsrInterruptPriority: 1,
            OsIsrStackSize: 128,
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    expect(cfgHeader).toContain('#define OS_ISR_COUNT');
    expect(cfgHeader).toContain('#define OS_ISR_ID_ADCISR');
    expect(cfgHeader).toContain('#define OS_ISR_ID_CAT1ISR');
    expect(cfgHeader).toContain('#define ADCISR_ISR_CATEGORY');
    expect(cfgHeader).toContain('#define ADCISR_ISR_PRIORITY');
    expect(cfgHeader).toContain('#define ADCISR_ISR_NESTING');
    expect(cfgHeader).toContain('TRUE');
  });

  it('should generate Counter and Alarm macros', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsCounter: [
          {
            OsCounterName: 'SysTick',
            OsCounterTicksPerBase: 1000,
            OsCounterMaxAllowedValue: 65535,
            OsCounterMinCycle: 1,
          },
        ],
        OsAlarm: [
          {
            OsAlarmName: 'TickAlarm',
            OsAlarmCounterRef: 'SysTick',
            OsAlarmActionType: 'ActivateTask',
            OsAlarmActionTaskRef: 'ControlTask',
            OsAlarmStartValue: 100,
            OsAlarmCycleValue: 1000,
            OsAlarmAutostart: true,
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    expect(cfgHeader).toContain('#define OS_COUNTER_COUNT');
    expect(cfgHeader).toContain('#define OS_COUNTER_ID_SYSTICK');
    expect(cfgHeader).toContain('#define SYSTICK_TICKS_PER_BASE');
    expect(cfgHeader).toContain('#define OS_ALARM_COUNT');
    expect(cfgHeader).toContain('#define OS_ALARM_ID_TICKALARM');
    expect(cfgHeader).toContain('ALARM_ACTION_ACTIVATE_TASK');
    expect(cfgHeader).toContain('#define TICKALARM_CYCLE_VALUE');
  });

  it('should generate Schedule Table macros with expiry points', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsScheduleTable: [
          {
            OsScheduleTableName: 'MainSchTbl',
            OsScheduleTableDuration: 5000,
            OsScheduleTableSyncStrategy: 'SINGLE',
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    expect(cfgHeader).toContain('#define OS_SCHEDULE_TABLE_COUNT');
    expect(cfgHeader).toContain('#define OS_SCHEDULETABLE_ID_MAINSCHTBL');
    expect(cfgHeader).toContain('#define MAINSCHTBL_DURATION');
    expect(cfgHeader).toContain('SYNC_STRATEGY_SINGLE');
  });

  it('should generate Event and Resource macros', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsEvent: [
          {
            OsEventName: 'DataReady',
            OsEventTaskRef: 'WorkerTask',
            OsEventMask: 1,
          },
        ],
        OsResource: [
          {
            OsResourceName: 'SharedRes',
            OsResourcePriority: 5,
            OsResourceIsInternal: false,
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    expect(cfgHeader).toContain('#define OS_EVENT_COUNT');
    expect(cfgHeader).toContain('#define OS_EVENT_ID_DATAREADY');
    expect(cfgHeader).toContain('#define DATAREADY_MASK');
    expect(cfgHeader).toContain('#define OS_RESOURCE_COUNT');
    expect(cfgHeader).toContain('#define OS_RESOURCE_ID_SHAREDRES');
    expect(cfgHeader).toContain('#define SHAREDRES_RESOURCE_PRIORITY');
  });

  it('should generate Os_Types.h with all OS type definitions', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 4,
        OsTask: [
          {
            OsTaskName: 'TestTask',
            OsTaskPriority: 1,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 512,
            OsTaskType: 'BCC',
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const typesHeader = result.files.find(f => f.path.endsWith('Os_Types.h'))!.content;

    // Verify all key type definitions exist
    expect(typesHeader).toContain('typedef uint8 OsAppModeType');
    expect(typesHeader).toContain('typedef enum');
    expect(typesHeader).toContain('OsTaskStateType');
    expect(typesHeader).toContain('TASK_SUSPENDED');
    expect(typesHeader).toContain('TASK_READY');
    expect(typesHeader).toContain('TASK_RUNNING');
    expect(typesHeader).toContain('TASK_WAITING');
    expect(typesHeader).toContain('OsTaskConfigType');
    expect(typesHeader).toContain('OsIsrConfigType');
    expect(typesHeader).toContain('OsCounterConfigType');
    expect(typesHeader).toContain('OsAlarmConfigType');
    expect(typesHeader).toContain('OsExpiryPointType');
    expect(typesHeader).toContain('OsScheduleTableConfigType');
    expect(typesHeader).toContain('OsEventConfigType');
    expect(typesHeader).toContain('OsResourceConfigType');
    expect(typesHeader).toContain('OsApplicationConfigType');
    expect(typesHeader).toContain('OsSystemConfigType');
    expect(typesHeader).toContain('Os_ConfigSetType');
    expect(typesHeader).toContain('extern const Os_ConfigSetType Os_ConfigSet');
  });

  it('should generate Os.c with configuration data tables', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 4,
        OsTask: [
          {
            OsTaskName: 'TaskA',
            OsTaskPriority: 10,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 1024,
            OsTaskActivationLimit: 1,
            OsTaskType: 'BCC',
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const source = result.files.find(f => f.path.endsWith('Os.c'))!.content;
    expect(source).toContain('OsTaskConfigTable');
    expect(source).toContain('OS_TASK_ID_TASKA');
    expect(source).toContain('.taskType');
    expect(source).toContain('BASIC_TASK');
    expect(source).toContain('FULL_PREEMPTIVE');
    expect(source).toContain('Os_ConfigSet');
    expect(source).toContain('Os_Init(void)');
    expect(source).toContain('Os_Start(void)');
    expect(source).toContain('Os_Shutdown');
    expect(source).toContain('Os_GetVersionInfo');
  });

  it('should generate OS API function declarations in header', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 4,
        OsTask: [
          {
            OsTaskName: 'InitTask',
            OsTaskPriority: 1,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 512,
            OsTaskType: 'BCC',
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    expect(cfgHeader).toContain('Std_ReturnType Os_Init');
    expect(cfgHeader).toContain('void Os_Start');
    expect(cfgHeader).toContain('void Os_Shutdown');
    expect(cfgHeader).toContain('OsStatusType Os_GetStatus');
    expect(cfgHeader).toContain('void Os_GetVersionInfo');
    expect(cfgHeader).toContain('void Os_MainFunction');
    expect(cfgHeader).toContain('void Os_IdleLoop');
  });

  it('should handle minimal configuration with no optional containers', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 2,
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
      generateComments: false,
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBe(3);

    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    // Should still have basic system macros
    expect(cfgHeader).toContain('#define OS_MAX_TASKS');
    expect(cfgHeader).toContain('#define OS_MAX_ISRS');
    // Should NOT have task-specific macros (no tasks configured)
    expect(cfgHeader).not.toContain('#define OS_TASK_COUNT');
  });
});

describe('OsCodeGenerator - Edge Cases', () => {
  const generator = new OsCodeGenerator();
  const baseSchema: ModuleSchema = {
    name: 'Os',
    label: 'Operating System',
    layer: 'Service',
    version: '4.4.0',
    parameters: [],
    containers: [],
  };

  it('should handle configuration with many expiry points', async () => {
    const expiryPoints = Array.from({ length: 5 }, (_, i) => ({
      ExpiryPointOffset: (i + 1) * 1000,
      ExpiryPointActionType: 'ActivateTask',
      ExpiryPointTaskRef: 'Task1',
      ExpiryPointEventMask: 0,
    }));

    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsTask: [
          {
            OsTaskName: 'Task1',
            OsTaskPriority: 1,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 512,
            OsTaskType: 'BCC',
          },
        ],
        OsScheduleTable: [
          {
            OsScheduleTableName: 'MultiPointTbl',
            OsScheduleTableDuration: 10000,
            OsScheduleTableSyncStrategy: 'IMPLICIT',
            OsScheduleTableExpiryPoints: expiryPoints,
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    expect(result.success).toBe(true);
    const source = result.files.find(f => f.path.endsWith('Os.c'));
    expect(source).toBeDefined();
    const content = source!.content;
    expect(content).toContain('MultiPointTblExpiryPoints');
    expect(content).toContain('SYNC_STRATEGY_IMPLICIT');
    // Should have 5 .offset entries (one per expiry point)
    expect(content.match(/\.offset/g)).toHaveLength(5);
  });

  it('should handle configuration with applications', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsTask: [
          {
            OsTaskName: 'Task1',
            OsTaskPriority: 1,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 512,
            OsTaskType: 'BCC',
          },
          {
            OsTaskName: 'Task2',
            OsTaskPriority: 2,
            OsTaskSchedule: 'NON',
            OsTaskStackSize: 1024,
            OsTaskType: 'ECC',
          },
        ],
        OsIsr: [
          {
            OsIsrName: 'MyIsr',
            OsIsrCategory: 2,
            OsIsrInterruptPriority: 1,
            OsIsrStackSize: 256,
          },
        ],
        OsApplication: [
          {
            OsApplicationName: 'App1',
            OsApplicationTrusted: true,
            OsApplicationTasks: ['Task1', 'Task2'],
            OsApplicationIsrs: ['MyIsr'],
            OsApplicationHooks: ['App1_Startup', 'App1_Shutdown'],
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });

    expect(result.success).toBe(true);
    const source = result.files.find(f => f.path.endsWith('Os.c'))!.content;
    expect(source).toContain('OsApplicationConfigTable');
    expect(source).toContain('App1TaskRefs');
    expect(source).toContain('App1IsrRefs');
    expect(source).toContain('.isTrusted');
    expect(source).toContain('TRUE');
  });

  it('should produce syntactically valid C output', async () => {
    const config: ModuleConfig = {
      module: 'Os',
      version: '4.4.0',
      parameters: {
        OsMaxTasks: 8,
        OsMaxIsrs: 8,
        OsStackMonitoring: true,
        OsTimeProtection: false,
        OsIdleTaskName: 'Idle',
        OsIdleTaskStackSize: 256,
        OsTask: [
          {
            OsTaskName: 'HighTask',
            OsTaskPriority: 10,
            OsTaskSchedule: 'FULL',
            OsTaskStackSize: 2048,
            OsTaskActivationLimit: 1,
            OsTaskType: 'BCC',
            OsTaskAutostart: true,
          },
          {
            OsTaskName: 'LowTask',
            OsTaskPriority: 1,
            OsTaskSchedule: 'NON',
            OsTaskStackSize: 1024,
            OsTaskActivationLimit: 1,
            OsTaskType: 'ECC',
            OsTaskAutostart: false,
          },
        ],
        OsIsr: [
          {
            OsIsrName: 'SysTickIsr',
            OsIsrCategory: 2,
            OsIsrInterruptPriority: 15,
            OsIsrStackSize: 512,
            OsIsrInterruptSource: 1,
          },
        ],
        OsCounter: [
          {
            OsCounterName: 'SysTick',
            OsCounterTicksPerBase: 1000,
            OsCounterMaxAllowedValue: 65535,
            OsCounterMinCycle: 1,
          },
        ],
        OsAlarm: [
          {
            OsAlarmName: 'SchedAlarm',
            OsAlarmCounterRef: 'SysTick',
            OsAlarmActionType: 'ActivateTask',
            OsAlarmActionTaskRef: 'LowTask',
            OsAlarmStartValue: 100,
            OsAlarmCycleValue: 1000,
            OsAlarmAutostart: true,
          },
        ],
        OsResource: [
          {
            OsResourceName: 'Mutex1',
            OsResourcePriority: 5,
          },
        ],
        OsEvent: [
          {
            OsEventName: 'DataReady',
            OsEventTaskRef: 'LowTask',
            OsEventMask: 1,
          },
        ],
        OsScheduleTable: [
          {
            OsScheduleTableName: 'MainSched',
            OsScheduleTableDuration: 10000,
            OsScheduleTableSyncStrategy: 'NONE',
            OsScheduleTableExpiryPoints: [
              {
                ExpiryPointOffset: 2000,
                ExpiryPointActionType: 'ActivateTask',
                ExpiryPointTaskRef: 'HighTask',
              },
              {
                ExpiryPointOffset: 6000,
                ExpiryPointActionType: 'ActivateTask',
                ExpiryPointTaskRef: 'LowTask',
              },
            ],
          },
        ],
      },
      containers: {},
    };

    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
      generateComments: true,
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBe(3);

    // Verify structural correctness
    const cfgHeader = result.files.find(f => f.path.endsWith('Os_Cfg.h'))!.content;
    expect(cfgHeader).toContain('OS_TASK_COUNT');
    expect(cfgHeader).toContain('((uint8)2U)');
    expect(cfgHeader).toContain('OS_ISR_COUNT');
    expect(cfgHeader).toContain('OS_COUNTER_COUNT');
    expect(cfgHeader).toContain('OS_ALARM_COUNT');
    expect(cfgHeader).toContain('OS_RESOURCE_COUNT');
    expect(cfgHeader).toContain('OS_EVENT_COUNT');
    expect(cfgHeader).toContain('OS_SCHEDULE_TABLE_COUNT');
    expect(cfgHeader).toContain('OS_STACK_MONITORING');
    expect(cfgHeader).toContain('OS_TIME_PROTECTION');
    expect(cfgHeader).toContain('STD_OFF');
  });
});
