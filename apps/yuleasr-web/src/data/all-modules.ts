/**
 * Auto-generated from JSON Schemas - All 37 BSW Modules
 * Generated: 2025-05-21
 * DO NOT EDIT MANUALLY - Regenerate via scripts/generate-ui-modules.ts
 */

import type { ConfigModule } from '@/types/config'

export const allModules: ConfigModule[] = [
{
  id: "adc",
  name: "Adc",
  displayName: "ADC Driver",
  description: "Adc module configuration - AUTOSAR MCAL",
  vendor: "NXP",
  version: "4.4.0",
  autosarVersion: "4.4.0",
  layer: "MCAL",
  enabled: false,
  parameters: [],
  containers: [
    {
    id: "adcconfigset",
    name: "AdcConfigSet",
    displayName: "AdcConfigSet",
    description: "ADC Configuration Set with HW units and groups",
    parameters: [],
    subContainers: [
      {
      id: "adchwunit_0",
      name: "AdcHwUnit_0",
      displayName: "AdcHwUnit_0",
      shortName: "AdcHwUnit",
      description: "ADC Hardware Unit instance",
      parameters: [
        { id: "adcdozemode", name: "AdcDozeMode", displayName: "AdcDozeMode", type: "boolean", value: true, defaultValue: false },
        { id: "adclogicalunitid", name: "AdcLogicalUnitId", displayName: "AdcLogicalUnitId", type: "integer", value: 0, defaultValue: 0, min: 0, max: 65535 },
        { id: "adcpowerupdelayvalue", name: "AdcPowerUpDelayValue", displayName: "AdcPowerUpDelayValue", type: "integer", value: 128, defaultValue: 0, min: 0, max: 65535 },
        { id: "adcpreenable", name: "AdcPreEnable", displayName: "AdcPreEnable", type: "boolean", value: true, defaultValue: false },
        { id: "adchwunitid", name: "AdcHwUnitId", displayName: "AdcHwUnitId", type: "string", value: "ADC0", defaultValue: "ADC0" },
        { id: "adcresolution", name: "AdcResolution", displayName: "AdcResolution", type: "string", value: "BITS_12", defaultValue: "BITS_12" },
        { id: "adctransfertype", name: "AdcTransferType", displayName: "AdcTransferType", type: "string", value: "ADC_INTERRUPT", defaultValue: "ADC_INTERRUPT" },
        { id: "adcvoltagereferenceselection", name: "AdcVoltageReferenceSelection", displayName: "AdcVoltageReferenceSelection", type: "string", value: "VDD_ANA", defaultValue: "VDD_ANA" },
      ],
      subContainers: [
        {
        id: "adc_a8_bat",
        name: "Adc_A8_BAT",
        displayName: "Adc_A8_BAT",
        shortName: "AdcChannel",
        description: "ADC Channel instance",
        parameters: [
          { id: "adcchannelid_a8", name: "AdcChannelId", displayName: "AdcChannelId", type: "string", value: "CH_A8", defaultValue: "CH_A8" },
          { id: "adclogicalchannelid_a8", name: "AdcLogicalChannelId", displayName: "AdcLogicalChannelId", type: "integer", value: 0, defaultValue: 0, min: 0, max: 65535 },
          { id: "adchardwareaverageselect", name: "AdcHardwareAverageSelect", displayName: "AdcHardwareAverageSelect", type: "string", value: "SAMPLES_8", defaultValue: "SAMPLES_8" },
          { id: "adcsampletimeselect", name: "AdcSampleTimeSelect", displayName: "AdcSampleTimeSelect", type: "string", value: "SAMPLE_TIME_11_ADCK", defaultValue: "SAMPLE_TIME_11_ADCK" },
        ],
        },
        {
        id: "adcgroup_0",
        name: "AdcGroup_0",
        displayName: "AdcGroup_0",
        shortName: "AdcGroup",
        description: "ADC Group instance",
        parameters: [
          { id: "adcenablepause", name: "AdcEnablePause", displayName: "AdcEnablePause", type: "boolean", value: false, defaultValue: false },
          { id: "adcenablersync", name: "AdcEnableRsync", displayName: "AdcEnableRsync", type: "boolean", value: false, defaultValue: false },
          { id: "adcgroupid", name: "AdcGroupId", displayName: "AdcGroupId", type: "integer", value: 0, defaultValue: 0, min: 0, max: 65535 },
          { id: "adcpausedelayvalue", name: "AdcPauseDelayValue", displayName: "AdcPauseDelayValue", type: "integer", value: 0, defaultValue: 0, min: 0, max: 65535 },
          { id: "adcstreamingnumsamples", name: "AdcStreamingNumSamples", displayName: "AdcStreamingNumSamples", type: "integer", value: 1, defaultValue: 1, min: 1, max: 65535 },
          { id: "adctriggerdelayvalue", name: "AdcTriggerDelayValue", displayName: "AdcTriggerDelayValue", type: "integer", value: 0, defaultValue: 0, min: 0, max: 65535 },
          { id: "adcwithoutinterrupts", name: "AdcWithoutInterrupts", displayName: "AdcWithoutInterrupts", type: "boolean", value: false, defaultValue: false },
          { id: "adcextranotification", name: "AdcExtraNotification", displayName: "AdcExtraNotification", type: "string", value: "NULL_PTR", defaultValue: "NULL_PTR" },
          { id: "adcgroupaccessmode", name: "AdcGroupAccessMode", displayName: "AdcGroupAccessMode", type: "string", value: "ADC_ACCESS_MODE_SINGLE", defaultValue: "ADC_ACCESS_MODE_SINGLE" },
          { id: "adcgroupconversionmode", name: "AdcGroupConversionMode", displayName: "AdcGroupConversionMode", type: "string", value: "ADC_CONV_MODE_ONESHOT", defaultValue: "ADC_CONV_MODE_ONESHOT" },
          { id: "adcgrouptriggsrc", name: "AdcGroupTriggSrc", displayName: "AdcGroupTriggSrc", type: "string", value: "ADC_TRIGG_SRC_SW", defaultValue: "ADC_TRIGG_SRC_SW" },
          { id: "adcstreamingbuffermode", name: "AdcStreamingBufferMode", displayName: "AdcStreamingBufferMode", type: "string", value: "ADC_STREAM_BUFFER_LINEAR", defaultValue: "ADC_STREAM_BUFFER_LINEAR" },
        ],
        },
      ],
      },
    ],
    },
    {
    id: "adcgeneral",
    name: "AdcGeneral",
    displayName: "AdcGeneral",
    description: "ADC General Configuration",
    parameters: [
      { id: "adcdeinitapi", name: "AdcDeInitApi", displayName: "AdcDeInitApi", type: "boolean", value: true, defaultValue: false },
      { id: "adcdeverrordetect", name: "AdcDevErrorDetect", displayName: "AdcDevErrorDetect", type: "boolean", value: false, defaultValue: false },
      { id: "adcdmatimeout", name: "AdcDmaTimeout", displayName: "AdcDmaTimeout", type: "integer", value: 65535, defaultValue: 65535, min: 0, max: 65535 },
      { id: "adcenablelimitcheck", name: "AdcEnableLimitCheck", displayName: "AdcEnableLimitCheck", type: "boolean", value: false, defaultValue: false },
      { id: "adcenablequeuing", name: "AdcEnableQueuing", displayName: "AdcEnableQueuing", type: "boolean", value: false, defaultValue: false },
      { id: "adcenablestartstopgroupapi", name: "AdcEnableStartStopGroupApi", displayName: "AdcEnableStartStopGroupApi", type: "boolean", value: true, defaultValue: false },
      { id: "adcgrpnotifcapability", name: "AdcGrpNotifCapability", displayName: "AdcGrpNotifCapability", type: "boolean", value: true, defaultValue: false },
      { id: "adchwtriggerapi", name: "AdcHwTriggerApi", displayName: "AdcHwTriggerApi", type: "boolean", value: false, defaultValue: false },
      { id: "adcpriorityqueuemaxdepth", name: "AdcPriorityQueueMaxDepth", displayName: "AdcPriorityQueueMaxDepth", type: "integer", value: 1, defaultValue: 1, min: 1, max: 255 },
      { id: "adcreadgroupapi", name: "AdcReadGroupApi", displayName: "AdcReadGroupApi", type: "boolean", value: true, defaultValue: false },
      { id: "adcversioninfoapi", name: "AdcVersionInfoApi", displayName: "AdcVersionInfoApi", type: "boolean", value: true, defaultValue: false },
      { id: "adcpriorityimplementation", name: "AdcPriorityImplementation", displayName: "AdcPriorityImplementation", type: "string", value: "ADC_PRIORITY_NONE", defaultValue: "ADC_PRIORITY_NONE" },
      { id: "adcresultalignment", name: "AdcResultAlignment", displayName: "AdcResultAlignment", type: "string", value: "ADC_ALIGN_LEFT", defaultValue: "ADC_ALIGN_LEFT" },
    ],
    },
    {
    id: "adcinterrupt_0",
    name: "AdcInterrupt_0",
    displayName: "AdcInterrupt_0",
    description: "ADC Interrupt 0 Configuration",
    parameters: [
      { id: "adcinterruptenable_0", name: "AdcInterruptEnable", displayName: "AdcInterruptEnable", type: "boolean", value: true, defaultValue: false },
      { id: "adcinterruptsource_0", name: "AdcInterruptSource", displayName: "AdcInterruptSource", type: "string", value: "ADC0_EOC", defaultValue: "ADC0_EOC" },
    ],
    },
    {
    id: "adcinterrupt_1",
    name: "AdcInterrupt_1",
    displayName: "AdcInterrupt_1",
    description: "ADC Interrupt 1 Configuration",
    parameters: [
      { id: "adcinterruptenable_1", name: "AdcInterruptEnable", displayName: "AdcInterruptEnable", type: "boolean", value: true, defaultValue: false },
      { id: "adcinterruptsource_1", name: "AdcInterruptSource", displayName: "AdcInterruptSource", type: "string", value: "ADC0_FOF", defaultValue: "ADC0_FOF" },
    ],
    },
    {
    id: "adcpublishedinformation",
    name: "AdcPublishedInformation",
    displayName: "AdcPublishedInformation",
    description: "ADC Published Information",
    parameters: [
      { id: "adcchannelvaluesigned", name: "AdcChannelValueSigned", displayName: "AdcChannelValueSigned", type: "boolean", value: false, defaultValue: false },
      { id: "adcgroupfirstchannelfixed", name: "AdcGroupFirstChannelFixed", displayName: "AdcGroupFirstChannelFixed", type: "boolean", value: false, defaultValue: false },
      { id: "adcmaxchannelresolution", name: "AdcMaxChannelResolution", displayName: "AdcMaxChannelResolution", type: "integer", value: 12, defaultValue: 12, min: 8, max: 16 },
    ],
    },
    {
    id: "commonpublishedinformation",
    name: "CommonPublishedInformation",
    displayName: "CommonPublishedInformation",
    description: "Common Published Information",
    parameters: [
      { id: "adc_armajor", name: "ArReleaseMajorVersion", displayName: "AR Major Version", type: "integer", value: 4, defaultValue: 4 },
      { id: "adc_arminor", name: "ArReleaseMinorVersion", displayName: "AR Minor Version", type: "integer", value: 3, defaultValue: 3 },
      { id: "adc_moduleid", name: "ModuleId", displayName: "Module ID", type: "integer", value: 123, defaultValue: 123 },
      { id: "adc_vendorid", name: "VendorId", displayName: "Vendor ID", type: "integer", value: 43, defaultValue: 43 },
    ],
    },
    {
    id: "nonautosar",
    name: "NonAutosar",
    displayName: "NonAutosar",
    description: "Non-AUTOSAR Extensions",
    parameters: [
      { id: "adcdisabledemreporterrorstatus", name: "AdcDisableDemReportErrorStatus", displayName: "AdcDisableDemReportErrorStatus", type: "boolean", value: false, defaultValue: false },
      { id: "adcenablecalibration", name: "AdcEnableCalibration", displayName: "AdcEnableCalibration", type: "boolean", value: true, defaultValue: false },
      { id: "adcenabledmatrasfermode", name: "AdcEnableDmaTrasferMode", displayName: "AdcEnableDmaTrasferMode", type: "boolean", value: false, defaultValue: false },
    ],
    },
  ],
  dependencies: [],
  createdAt: "2025-05-25T00:00:00Z",
  updatedAt: "2025-05-25T00:00:00Z",
  configStatus: "unconfigured"
},
{
    id: "arti",
    name: "Arti",
    displayName: "ARTI",
    description: "ARTI 运行时接口",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "activatetask",
        name: "ActivateTask",
        displayName: "ActivateTask",
        description: "ActivateTask 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairinput",
            name: "ArtiParameterTypeMapPairInput",
            displayName: "ArtiParameterTypeMapPairInput",
            description: "ArtiParameterTypeMapPairInput 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "activatetaskasyn",
        name: "ActivateTaskAsyn",
        displayName: "ActivateTaskAsyn",
        description: "ActivateTaskAsyn 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairinput",
            name: "ArtiParameterTypeMapPairInput",
            displayName: "ArtiParameterTypeMapPairInput",
            description: "ArtiParameterTypeMapPairInput 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc0-isr-bat",
        name: "Adc0_Isr_Bat",
        displayName: "Adc0_Isr_Bat",
        description: "Adc0_Isr_Bat 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairinput",
            name: "ArtiParameterTypeMapPairInput",
            displayName: "ArtiParameterTypeMapPairInput",
            description: "ArtiParameterTypeMapPairInput 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc0-isr-bat-input-exp",
        name: "Adc0_Isr_Bat_Input_Exp",
        displayName: "Adc0_Isr_Bat_Input_Exp",
        description: "Adc0_Isr_Bat_Input_Exp 配置容器",
        parameters: [
          {
            id: "artiexpressionstring",
            name: "ArtiExpressionString",
            displayName: "ArtiExpressionString",
            description: "ArtiExpressionString 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "allowaccess",
        name: "AllowAccess",
        displayName: "AllowAccess",
        description: "AllowAccess 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairinput",
            name: "ArtiParameterTypeMapPairInput",
            displayName: "ArtiParameterTypeMapPairInput",
            description: "ArtiParameterTypeMapPairInput 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artigeneral",
        name: "ArtiGeneral",
        displayName: "ArtiGeneral",
        description: "ArtiGeneral 配置容器",
        parameters: [
          {
            id: "artideverrordetect",
            name: "ArtiDevErrorDetect",
            displayName: "ArtiDevErrorDetect",
            description: "ArtiDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "artisafebswchecks",
            name: "ArtiSafeBswChecks",
            displayName: "ArtiSafeBswChecks",
            description: "ArtiSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "artienablevfbtraceclient",
            name: "ArtiEnableVfbTraceClient",
            displayName: "ArtiEnableVfbTraceClient",
            description: "ArtiEnableVfbTraceClient 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "artihardware",
        name: "ArtiHardware",
        displayName: "ArtiHardware",
        description: "ArtiHardware 配置容器",
        parameters: [
          {
            id: "artihardwarecoreinstancecoreid",
            name: "ArtiHardwareCoreInstanceCoreId",
            displayName: "ArtiHardwareCoreInstanceCoreId",
            description: "ArtiHardwareCoreInstanceCoreId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "artihardwarecoreclass-currentapplication-map",
        name: "ArtiHardwareCoreClass_CurrentApplication_Map",
        displayName: "ArtiHardwareCoreClass_CurrentApplication_Map",
        description: "ArtiHardwareCoreClass_CurrentApplication_Map 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artihardwarecoreclass-currentisr-map",
        name: "ArtiHardwareCoreClass_CurrentIsr_Map",
        displayName: "ArtiHardwareCoreClass_CurrentIsr_Map",
        description: "ArtiHardwareCoreClass_CurrentIsr_Map 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artihardwarecoreclass-currenttask-map",
        name: "ArtiHardwareCoreClass_CurrentTask_Map",
        displayName: "ArtiHardwareCoreClass_CurrentTask_Map",
        description: "ArtiHardwareCoreClass_CurrentTask_Map 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artihooktracevariable",
        name: "ArtiHookTraceVariable",
        displayName: "ArtiHookTraceVariable",
        description: "ArtiHookTraceVariable 配置容器",
        parameters: [
          {
            id: "artihookstartbit",
            name: "ArtiHookStartBit",
            displayName: "ArtiHookStartBit",
            description: "ArtiHookStartBit 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artihookbitcount",
            name: "ArtiHookBitCount",
            displayName: "ArtiHookBitCount",
            description: "ArtiHookBitCount 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artihooktracevariableaccesstype",
            name: "ArtiHookTraceVariableAccessType",
            displayName: "ArtiHookTraceVariableAccessType",
            description: "ArtiHookTraceVariableAccessType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "artihookpartpart",
            name: "ArtiHookPartPart",
            displayName: "ArtiHookPartPart",
            description: "ArtiHookPartPart 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artihooktracevariablepart",
        name: "ArtiHookTraceVariablePart",
        displayName: "ArtiHookTraceVariablePart",
        description: "ArtiHookTraceVariablePart 配置容器",
        parameters: [
          {
            id: "artihookstartbit",
            name: "ArtiHookStartBit",
            displayName: "ArtiHookStartBit",
            description: "ArtiHookStartBit 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artihookbitcount",
            name: "ArtiHookBitCount",
            displayName: "ArtiHookBitCount",
            description: "ArtiHookBitCount 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artihookpartpart",
            name: "ArtiHookPartPart",
            displayName: "ArtiHookPartPart",
            description: "ArtiHookPartPart 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artios",
        name: "ArtiOs",
        displayName: "ArtiOs",
        description: "ArtiOs 配置容器",
        parameters: [
          {
            id: "artiosisrinstanceid",
            name: "ArtiOsIsrInstanceId",
            displayName: "ArtiOsIsrInstanceId",
            description: "ArtiOsIsrInstanceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiostaskinstanceid",
            name: "ArtiOsTaskInstanceId",
            displayName: "ArtiOsTaskInstanceId",
            description: "ArtiOsTaskInstanceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiosalarminstancecounter",
            name: "ArtiOsAlarmInstanceCounter",
            displayName: "ArtiOsAlarmInstanceCounter",
            description: "ArtiOsAlarmInstanceCounter 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "artiosalarminstanceaction",
            name: "ArtiOsAlarmInstanceAction",
            displayName: "ArtiOsAlarmInstanceAction",
            description: "ArtiOsAlarmInstanceAction 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "artiosisrinstancecategory",
            name: "ArtiOsIsrInstanceCategory",
            displayName: "ArtiOsIsrInstanceCategory",
            description: "ArtiOsIsrInstanceCategory 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "artiosisrinstancefunction",
            name: "ArtiOsIsrInstanceFunction",
            displayName: "ArtiOsIsrInstanceFunction",
            description: "ArtiOsIsrInstanceFunction 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "artiosresourceinstancepriority",
            name: "ArtiOsResourceInstancePriority",
            displayName: "ArtiOsResourceInstancePriority",
            description: "ArtiOsResourceInstancePriority 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "artiosstackinstancedirection",
            name: "ArtiOsStackInstanceDirection",
            displayName: "ArtiOsStackInstanceDirection",
            description: "ArtiOsStackInstanceDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "artiostaskinstancefunction",
            name: "ArtiOsTaskInstanceFunction",
            displayName: "ArtiOsTaskInstanceFunction",
            description: "ArtiOsTaskInstanceFunction 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artiosalarmclass-state-map",
        name: "ArtiOsAlarmClass_State_Map",
        displayName: "ArtiOsAlarmClass_State_Map",
        description: "ArtiOsAlarmClass_State_Map 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairinput",
            name: "ArtiParameterTypeMapPairInput",
            displayName: "ArtiParameterTypeMapPairInput",
            description: "ArtiParameterTypeMapPairInput 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "artiosclass-appmode-map",
        name: "ArtiOsClass_AppMode_Map",
        displayName: "ArtiOsClass_AppMode_Map",
        description: "ArtiOsClass_AppMode_Map 配置容器",
        parameters: [
          {
            id: "artiparametertypemappairinput",
            name: "ArtiParameterTypeMapPairInput",
            displayName: "ArtiParameterTypeMapPairInput",
            description: "ArtiParameterTypeMapPairInput 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "artiparametertypemappairoutput",
            name: "ArtiParameterTypeMapPairOutput",
            displayName: "ArtiParameterTypeMapPairOutput",
            description: "ArtiParameterTypeMapPairOutput 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "ble",
    name: "Ble",
    displayName: "BLE Driver",
    description: "Bluetooth Low Energy driver - AUTOSAR ECUAL",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "ble_common_pub",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "BLE module metadata",
        parameters: [
          { id: "ble_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 },
          { id: "ble_arminor", name: "ArReleaseMinorVersion", type: "integer", value: 3 },
        ],
      },
      {
        id: "blegeneral",
        name: "BleGeneral",
        displayName: "BleGeneral",
        description: "BLE general configuration",
        parameters: [
          { id: "bledeverrordetect", name: "BleDevErrorDetect", type: "boolean", value: false },
        ],
      },
    ],
    dependencies: [],
    createdAt: "2025-05-25T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "bswm",
    name: "BswM", displayName: "BSW Mode Manager", description: "BswM - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "bswm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "bswm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
      { id: "bswmgeneral", name: "BswMGeneral", parameters: [ { id: "bswmdeverrordetect", name: "BswMDevErrorDetect", type: "boolean", value: true } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "can",
    name: "Can",
    displayName: "CAN Driver",
    description: "CAN driver - AUTOSAR ECUAL",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "can_common_pub",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "CAN module metadata",
        parameters: [
          { id: "can_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 },
          { id: "can_arminor", name: "ArReleaseMinorVersion", type: "integer", value: 3 },
          { id: "can_moduleid", name: "ModuleId", type: "integer", value: 80 },
          { id: "can_vendorid", name: "VendorId", type: "integer", value: 43 },
        ],
      },
      {
        id: "cangeneral",
        name: "CanGeneral",
        displayName: "CanGeneral",
        description: "CAN general configuration",
        parameters: [
          { id: "candeverrordetect", name: "CanDevErrorDetect", type: "boolean", value: true },
          { id: "canversioninfoapi", name: "CanVersionInfoApi", type: "boolean", value: true },
        ],
      },
      {
        id: "canconfigset",
        name: "CanConfigSet",
        displayName: "CanConfigSet",
        description: "CAN Configuration Set",
        parameters: [],
        subContainers: [
          {
            id: "cancontroller_0",
            name: "DKMM_LHBDCANFD1",
            displayName: "DKMM_LHBDCANFD1 (CAN Controller)",
            shortName: "CanController",
            description: "CAN Controller instance",
            parameters: [
              { id: "canctrl_activation", name: "CanControllerActivation", type: "boolean", value: true },
              { id: "canctrl_id", name: "CanControllerId", type: "integer", value: 0 },
              { id: "canctrl_busoff", name: "CanBusoffProcessing", type: "string", value: "INTERRUPT" },
              { id: "canctrl_rxproc", name: "CanRxProcessing", type: "string", value: "INTERRUPT" },
              { id: "canctrl_txproc", name: "CanTxProcessing", type: "string", value: "INTERRUPT" },
              { id: "canctrl_wakeupproc", name: "CanWakeupProcessing", type: "string", value: "INTERRUPT" },
              { id: "canctrl_baseaddr", name: "CanBaseAddress", type: "string", value: "FlexCAN_0" },
            ],
            subContainers: [
              {
                id: "cancontroller_baudrate",
                name: "CanControllerBaudrateConfig",
                displayName: "CanControllerBaudrateConfig",
                shortName: "CanControllerBaudrateConfig",
                description: "CAN controller baud rate",
                parameters: [
                  { id: "can_baudrate", name: "CanControllerBaudRate", type: "integer", value: 500, unit: "kbps" },
                  { id: "can_propseg", name: "CanControllerPropSeg", type: "integer", value: 2 },
                  { id: "can_seg1", name: "CanControllerSeg1", type: "integer", value: 10 },
                  { id: "can_seg2", name: "CanControllerSeg2", type: "integer", value: 3 },
                  { id: "can_sjw", name: "CanControllerSyncJumpWidth", type: "integer", value: 2 },
                  { id: "can_prescaler", name: "CanBaudratePrescaler", type: "integer", value: 4 },
                  { id: "can_sampling", name: "CanSamplingMode", type: "string", value: "OneSample" },
                ],
                subContainers: [
                  {
                    id: "cancontroller_fdbaudrate",
                    name: "CanControllerFdBaudrateConfig",
                    displayName: "CanControllerFdBaudrateConfig (CAN FD)",
                    shortName: "CanControllerFdBaudrateConfig",
                    description: "CAN FD baud rate configuration",
                    parameters: [
                      { id: "can_fdbaudrate", name: "CanControllerFdBaudRate", type: "integer", value: 2000, unit: "kbps" },
                      { id: "can_fdpropseg", name: "CanControllerPropSeg", type: "integer", value: 2 },
                      { id: "can_fdseg1", name: "CanControllerSeg1", type: "integer", value: 9 },
                      { id: "can_fdseg2", name: "CanControllerSeg2", type: "integer", value: 4 },
                      { id: "can_fdsjw", name: "CanControllerSyncJumpWidth", type: "integer", value: 2 },
                      { id: "can_fd_prescaler", name: "CanBaudratePrescaler", type: "integer", value: 1 },
                      { id: "can_txbitswitch", name: "CanControllerTxBitRateSwitch", type: "boolean", value: true },
                    ],
                  },
                ],
              },
              {
                id: "canfiltermask_0",
                name: "CanFilterMask_0",
                displayName: "CanFilterMask_0",
                shortName: "CanFilterMask",
                description: "CAN filter mask (all messages)",
                parameters: [
                  { id: "canfiltermask_0_val", name: "CanFilterMaskValue", type: "integer", value: 2047 },
                  { id: "canfiltercode_0_val", name: "CanFilterCodeValue", type: "integer", value: 89 },
                ],
              },
            ],
          },
        ],
      },
    ],
    dependencies: [],
    createdAt: "2025-05-25T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "canif", name: "CanIf", displayName: "CAN Interface", description: "CanIf - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "canif_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "canif_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "cannm", name: "CanNm", displayName: "CAN Network Manager", description: "CanNm - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "cannm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "cannm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "cansm", name: "CanSM", displayName: "CAN State Manager", description: "CanSM - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "cansm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "cansm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "cantp", name: "CanTp", displayName: "CAN Transport Layer", description: "CanTp - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "cantp_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "cantp_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "cantrcv",
    name: "CanTrcv",
    displayName: "CAN Transceiver Driver",
    description: "CAN Transceiver driver - AUTOSAR ECUAL",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "cantrcv_common_pub",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "CAN Transceiver module metadata",
        parameters: [
          { id: "cantrcv_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 },
          { id: "cantrcv_arminor", name: "ArReleaseMinorVersion", type: "integer", value: 3 },
        ],
      },
      {
        id: "cantrcv_configset",
        name: "CanTrcvConfigSet",
        displayName: "CanTrcvConfigSet",
        description: "CAN Transceiver config set",
        parameters: [],
        subContainers: [
          {
            id: "cantrcv_controller_0",
            name: "CanTrcv_0",
            displayName: "CanTrcv_0",
            shortName: "CanTrcv",
            description: "CAN Transceiver instance",
            parameters: [
              { id: "cantrcv_wakeup", name: "CanTrcvWakeupSupport", type: "boolean", value: true },
            ],
          },
        ],
      },
    ],
    dependencies: [],
    createdAt: "2025-05-25T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "com", name: "Com", displayName: "Communication", description: "Com - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "com_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "com_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
      { id: "comgeneral", name: "ComGeneral", parameters: [ { id: "comdeverrordetect", name: "ComDevErrorDetect", type: "boolean", value: true } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "comm", name: "ComM", displayName: "Communication Manager", description: "ComM - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "comm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "comm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "crc", name: "Crc", displayName: "CRC Library", description: "Crc - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "crc_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "crc_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "cryif", name: "CryIf", displayName: "Crypto Interface", description: "CryIf - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "cryif_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "cryif_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "crypto", name: "Crypto", displayName: "Crypto Driver", description: "Crypto - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "crypto_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "crypto_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "csm", name: "Csm", displayName: "Crypto Service Manager", description: "Csm - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "csm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "csm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "dcm", name: "Dcm", displayName: "Diagnostic Communication Manager", description: "Dcm - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "dcm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "dcm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
      { id: "dcmgeneral", name: "DcmGeneral", parameters: [ { id: "dcmdeverrordetect", name: "DcmDevErrorDetect", type: "boolean", value: false } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "dem", name: "Dem", displayName: "Diagnostic Event Manager", description: "Dem - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "dem_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "dem_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "det", name: "Det", displayName: "Default Error Tracer", description: "Det - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "det_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "det_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "dio",
    name: "Dio",
    displayName: "DIO Driver",
    description: "Dio Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "can-rx",
        name: "CAN_RX",
        displayName: "CAN_RX",
        description: "CAN_RX 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "commonpublishedinformation",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "CommonPublishedInformation 配置容器",
        parameters: [
          {
            id: "arreleasemajorversion",
            name: "ArReleaseMajorVersion",
            displayName: "ArReleaseMajorVersion",
            description: "ArReleaseMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaseminorversion",
            name: "ArReleaseMinorVersion",
            displayName: "ArReleaseMinorVersion",
            description: "ArReleaseMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaserevisionversion",
            name: "ArReleaseRevisionVersion",
            displayName: "ArReleaseRevisionVersion",
            description: "ArReleaseRevisionVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "moduleid",
            name: "ModuleId",
            displayName: "ModuleId",
            description: "ModuleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swmajorversion",
            name: "SwMajorVersion",
            displayName: "SwMajorVersion",
            description: "SwMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swminorversion",
            name: "SwMinorVersion",
            displayName: "SwMinorVersion",
            description: "SwMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swpatchversion",
            name: "SwPatchVersion",
            displayName: "SwPatchVersion",
            description: "SwPatchVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "vendorid",
            name: "VendorId",
            displayName: "VendorId",
            description: "VendorId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "dioconfig",
        name: "DioConfig",
        displayName: "DioConfig",
        description: "DioConfig 配置容器",
        parameters: [
          {
            id: "dioportid",
            name: "DioPortId",
            displayName: "DioPortId",
            description: "DioPortId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "diogeneral",
        name: "DioGeneral",
        displayName: "DioGeneral",
        description: "DioGeneral 配置容器",
        parameters: [
          {
            id: "diodeverrordetect",
            name: "DioDevErrorDetect",
            displayName: "DioDevErrorDetect",
            description: "DioDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dioenableusermodesupport",
            name: "DioEnableUserModeSupport",
            displayName: "DioEnableUserModeSupport",
            description: "DioEnableUserModeSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dioflipchannelapi",
            name: "DioFlipChannelApi",
            displayName: "DioFlipChannelApi",
            description: "DioFlipChannelApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "diomaskedwriteportapi",
            name: "DioMaskedWritePortApi",
            displayName: "DioMaskedWritePortApi",
            description: "DioMaskedWritePortApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dioreadzeroforundefinedportpins",
            name: "DioReadZeroForUndefinedPortPins",
            displayName: "DioReadZeroForUndefinedPortPins",
            description: "DioReadZeroForUndefinedPortPins 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dioreverseportbits",
            name: "DioReversePortBits",
            displayName: "DioReversePortBits",
            description: "DioReversePortBits 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dioversioninfoapi",
            name: "DioVersionInfoApi",
            displayName: "DioVersionInfoApi",
            description: "DioVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "dioport-a",
        name: "DioPort_A",
        displayName: "DioPort_A",
        description: "DioPort_A 配置容器",
        parameters: [
          {
            id: "dioportid",
            name: "DioPortId",
            displayName: "DioPortId",
            description: "DioPortId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "dioport-b",
        name: "DioPort_B",
        displayName: "DioPort_B",
        description: "DioPort_B 配置容器",
        parameters: [
          {
            id: "dioportid",
            name: "DioPortId",
            displayName: "DioPortId",
            description: "DioPortId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "dioport-c",
        name: "DioPort_C",
        displayName: "DioPort_C",
        description: "DioPort_C 配置容器",
        parameters: [
          {
            id: "dioportid",
            name: "DioPortId",
            displayName: "DioPortId",
            description: "DioPortId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "dioport-d",
        name: "DioPort_D",
        displayName: "DioPort_D",
        description: "DioPort_D 配置容器",
        parameters: [
          {
            id: "dioportid",
            name: "DioPortId",
            displayName: "DioPortId",
            description: "DioPortId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "flash-spi-cs",
        name: "FLASH_SPI_CS",
        displayName: "FLASH_SPI_CS",
        description: "FLASH_SPI_CS 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "sbc-clk",
        name: "SBC_CLK",
        displayName: "SBC_CLK",
        description: "SBC_CLK 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "sbc-int",
        name: "SBC_INT",
        displayName: "SBC_INT",
        description: "SBC_INT 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "sbc-mosi",
        name: "SBC_MOSI",
        displayName: "SBC_MOSI",
        description: "SBC_MOSI 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "sbc-rst",
        name: "SBC_RST",
        displayName: "SBC_RST",
        description: "SBC_RST 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "se-irq",
        name: "SE_IRQ",
        displayName: "SE_IRQ",
        description: "SE_IRQ 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "swd-dio",
        name: "SWD_DIO",
        displayName: "SWD_DIO",
        description: "SWD_DIO 配置容器",
        parameters: [
          {
            id: "diochannelid",
            name: "DioChannelId",
            displayName: "DioChannelId",
            description: "DioChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "ecum", name: "EcuM", displayName: "ECU Manager", description: "EcuM - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "ecum_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "ecum_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
      { id: "ecumgeneral", name: "EcuMGeneral", parameters: [ { id: "ecumdeverrordetect", name: "EcuMDevErrorDetect", type: "boolean", value: true } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "fee", name: "Fee", displayName: "Flash EEPROM Emulation", description: "Fee - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "fee_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "fee_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "fls", name: "Fls", displayName: "Flash Driver", description: "Fls - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "fls_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "fls_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "gpt",
    name: "Gpt",
    displayName: "GPT Driver",
    description: "通用定时器",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "commonpublishedinformation",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "CommonPublishedInformation 配置容器",
        parameters: [
          {
            id: "arreleasemajorversion",
            name: "ArReleaseMajorVersion",
            displayName: "ArReleaseMajorVersion",
            description: "ArReleaseMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaseminorversion",
            name: "ArReleaseMinorVersion",
            displayName: "ArReleaseMinorVersion",
            description: "ArReleaseMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaserevisionversion",
            name: "ArReleaseRevisionVersion",
            displayName: "ArReleaseRevisionVersion",
            description: "ArReleaseRevisionVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "moduleid",
            name: "ModuleId",
            displayName: "ModuleId",
            description: "ModuleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swmajorversion",
            name: "SwMajorVersion",
            displayName: "SwMajorVersion",
            description: "SwMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swminorversion",
            name: "SwMinorVersion",
            displayName: "SwMinorVersion",
            description: "SwMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swpatchversion",
            name: "SwPatchVersion",
            displayName: "SwPatchVersion",
            description: "SwPatchVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "vendorid",
            name: "VendorId",
            displayName: "VendorId",
            description: "VendorId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "gptchannelconfigset",
        name: "GptChannelConfigSet",
        displayName: "GptChannelConfigSet",
        description: "GptChannelConfigSet 配置容器",
        parameters: [
          {
            id: "gptchannelid",
            name: "GptChannelId",
            displayName: "GptChannelId",
            description: "GptChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickfrequency",
            name: "GptChannelTickFrequency",
            displayName: "GptChannelTickFrequency",
            description: "GptChannelTickFrequency 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickvaluemax",
            name: "GptChannelTickValueMax",
            displayName: "GptChannelTickValueMax",
            description: "GptChannelTickValueMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptenablewakeup",
            name: "GptEnableWakeup",
            displayName: "GptEnableWakeup",
            description: "GptEnableWakeup 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptfreezeenable",
            name: "GptFreezeEnable",
            displayName: "GptFreezeEnable",
            description: "GptFreezeEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenreloadontrigger",
            name: "GptLPitEnReloadOnTrigger",
            displayName: "GptLPitEnReloadOnTrigger",
            description: "GptLPitEnReloadOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstartontrigger",
            name: "GptLPitEnStartOnTrigger",
            displayName: "GptLPitEnStartOnTrigger",
            description: "GptLPitEnStartOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstoponinterrupt",
            name: "GptLPitEnStopOnInterrupt",
            displayName: "GptLPitEnStopOnInterrupt",
            description: "GptLPitEnStopOnInterrupt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitisexternaltrigger",
            name: "GptLPitIsExternalTrigger",
            displayName: "GptLPitIsExternalTrigger",
            description: "GptLPitIsExternalTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlptmrprescaler",
            name: "GptLptmrPrescaler",
            displayName: "GptLptmrPrescaler",
            description: "GptLptmrPrescaler 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptwakeupenablenotification",
            name: "GptWakeupEnableNotification",
            displayName: "GptWakeupEnableNotification",
            description: "GptWakeupEnableNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptchannelmode",
            name: "GptChannelMode",
            displayName: "GptChannelMode",
            description: "GptChannelMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gpthwchannel",
            name: "GptHwChannel",
            displayName: "GptHwChannel",
            description: "GptHwChannel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptlptmrchannelclksrc",
            name: "GptLptmrChannelClkSrc",
            displayName: "GptLptmrChannelClkSrc",
            description: "GptLptmrChannelClkSrc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptnotification",
            name: "GptNotification",
            displayName: "GptNotification",
            description: "GptNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gptchannelconfiguration-4",
        name: "GptChannelConfiguration_4",
        displayName: "GptChannelConfiguration_4",
        description: "GptChannelConfiguration_4 配置容器",
        parameters: [
          {
            id: "gptchannelid",
            name: "GptChannelId",
            displayName: "GptChannelId",
            description: "GptChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickfrequency",
            name: "GptChannelTickFrequency",
            displayName: "GptChannelTickFrequency",
            description: "GptChannelTickFrequency 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickvaluemax",
            name: "GptChannelTickValueMax",
            displayName: "GptChannelTickValueMax",
            description: "GptChannelTickValueMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptenablewakeup",
            name: "GptEnableWakeup",
            displayName: "GptEnableWakeup",
            description: "GptEnableWakeup 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptfreezeenable",
            name: "GptFreezeEnable",
            displayName: "GptFreezeEnable",
            description: "GptFreezeEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenreloadontrigger",
            name: "GptLPitEnReloadOnTrigger",
            displayName: "GptLPitEnReloadOnTrigger",
            description: "GptLPitEnReloadOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstartontrigger",
            name: "GptLPitEnStartOnTrigger",
            displayName: "GptLPitEnStartOnTrigger",
            description: "GptLPitEnStartOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstoponinterrupt",
            name: "GptLPitEnStopOnInterrupt",
            displayName: "GptLPitEnStopOnInterrupt",
            description: "GptLPitEnStopOnInterrupt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitisexternaltrigger",
            name: "GptLPitIsExternalTrigger",
            displayName: "GptLPitIsExternalTrigger",
            description: "GptLPitIsExternalTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlptmrprescaler",
            name: "GptLptmrPrescaler",
            displayName: "GptLptmrPrescaler",
            description: "GptLptmrPrescaler 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptwakeupenablenotification",
            name: "GptWakeupEnableNotification",
            displayName: "GptWakeupEnableNotification",
            description: "GptWakeupEnableNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptchannelmode",
            name: "GptChannelMode",
            displayName: "GptChannelMode",
            description: "GptChannelMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gpthwchannel",
            name: "GptHwChannel",
            displayName: "GptHwChannel",
            description: "GptHwChannel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptlptmrchannelclksrc",
            name: "GptLptmrChannelClkSrc",
            displayName: "GptLptmrChannelClkSrc",
            description: "GptLptmrChannelClkSrc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptnotification",
            name: "GptNotification",
            displayName: "GptNotification",
            description: "GptNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gptchannelconfiguration-lpit",
        name: "GptChannelConfiguration_LPIT",
        displayName: "GptChannelConfiguration_LPIT",
        description: "GptChannelConfiguration_LPIT 配置容器",
        parameters: [
          {
            id: "gptchannelid",
            name: "GptChannelId",
            displayName: "GptChannelId",
            description: "GptChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickfrequency",
            name: "GptChannelTickFrequency",
            displayName: "GptChannelTickFrequency",
            description: "GptChannelTickFrequency 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickvaluemax",
            name: "GptChannelTickValueMax",
            displayName: "GptChannelTickValueMax",
            description: "GptChannelTickValueMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptenablewakeup",
            name: "GptEnableWakeup",
            displayName: "GptEnableWakeup",
            description: "GptEnableWakeup 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptfreezeenable",
            name: "GptFreezeEnable",
            displayName: "GptFreezeEnable",
            description: "GptFreezeEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenreloadontrigger",
            name: "GptLPitEnReloadOnTrigger",
            displayName: "GptLPitEnReloadOnTrigger",
            description: "GptLPitEnReloadOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstartontrigger",
            name: "GptLPitEnStartOnTrigger",
            displayName: "GptLPitEnStartOnTrigger",
            description: "GptLPitEnStartOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstoponinterrupt",
            name: "GptLPitEnStopOnInterrupt",
            displayName: "GptLPitEnStopOnInterrupt",
            description: "GptLPitEnStopOnInterrupt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitisexternaltrigger",
            name: "GptLPitIsExternalTrigger",
            displayName: "GptLPitIsExternalTrigger",
            description: "GptLPitIsExternalTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlptmrprescaler",
            name: "GptLptmrPrescaler",
            displayName: "GptLptmrPrescaler",
            description: "GptLptmrPrescaler 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptwakeupenablenotification",
            name: "GptWakeupEnableNotification",
            displayName: "GptWakeupEnableNotification",
            description: "GptWakeupEnableNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptchannelmode",
            name: "GptChannelMode",
            displayName: "GptChannelMode",
            description: "GptChannelMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gpthwchannel",
            name: "GptHwChannel",
            displayName: "GptHwChannel",
            description: "GptHwChannel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptlptmrchannelclksrc",
            name: "GptLptmrChannelClkSrc",
            displayName: "GptLptmrChannelClkSrc",
            description: "GptLptmrChannelClkSrc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptnotification",
            name: "GptNotification",
            displayName: "GptNotification",
            description: "GptNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gptchannelconfiguration-5",
        name: "GptChannelConfiguration_5",
        displayName: "GptChannelConfiguration_5",
        description: "GptChannelConfiguration_5 配置容器",
        parameters: [
          {
            id: "gptchannelid",
            name: "GptChannelId",
            displayName: "GptChannelId",
            description: "GptChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickfrequency",
            name: "GptChannelTickFrequency",
            displayName: "GptChannelTickFrequency",
            description: "GptChannelTickFrequency 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptchanneltickvaluemax",
            name: "GptChannelTickValueMax",
            displayName: "GptChannelTickValueMax",
            description: "GptChannelTickValueMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptenablewakeup",
            name: "GptEnableWakeup",
            displayName: "GptEnableWakeup",
            description: "GptEnableWakeup 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptfreezeenable",
            name: "GptFreezeEnable",
            displayName: "GptFreezeEnable",
            description: "GptFreezeEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenreloadontrigger",
            name: "GptLPitEnReloadOnTrigger",
            displayName: "GptLPitEnReloadOnTrigger",
            description: "GptLPitEnReloadOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstartontrigger",
            name: "GptLPitEnStartOnTrigger",
            displayName: "GptLPitEnStartOnTrigger",
            description: "GptLPitEnStartOnTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitenstoponinterrupt",
            name: "GptLPitEnStopOnInterrupt",
            displayName: "GptLPitEnStopOnInterrupt",
            description: "GptLPitEnStopOnInterrupt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlpitisexternaltrigger",
            name: "GptLPitIsExternalTrigger",
            displayName: "GptLPitIsExternalTrigger",
            description: "GptLPitIsExternalTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptlptmrprescaler",
            name: "GptLptmrPrescaler",
            displayName: "GptLptmrPrescaler",
            description: "GptLptmrPrescaler 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "gptwakeupenablenotification",
            name: "GptWakeupEnableNotification",
            displayName: "GptWakeupEnableNotification",
            description: "GptWakeupEnableNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptchannelmode",
            name: "GptChannelMode",
            displayName: "GptChannelMode",
            description: "GptChannelMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gpthwchannel",
            name: "GptHwChannel",
            displayName: "GptHwChannel",
            description: "GptHwChannel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptlptmrchannelclksrc",
            name: "GptLptmrChannelClkSrc",
            displayName: "GptLptmrChannelClkSrc",
            description: "GptLptmrChannelClkSrc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gptconfigurationofoptapiservices",
        name: "GptConfigurationOfOptApiServices",
        displayName: "GptConfigurationOfOptApiServices",
        description: "GptConfigurationOfOptApiServices 配置容器",
        parameters: [
          {
            id: "gptdeinitapi",
            name: "GptDeinitApi",
            displayName: "GptDeinitApi",
            description: "GptDeinitApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptenabledisablenotificationapi",
            name: "GptEnableDisableNotificationApi",
            displayName: "GptEnableDisableNotificationApi",
            description: "GptEnableDisableNotificationApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptpredeftimerfunctionalityapi",
            name: "GptPredefTimerFunctionalityApi",
            displayName: "GptPredefTimerFunctionalityApi",
            description: "GptPredefTimerFunctionalityApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gpttimeelapsedapi",
            name: "GptTimeElapsedApi",
            displayName: "GptTimeElapsedApi",
            description: "GptTimeElapsedApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gpttimeremainingapi",
            name: "GptTimeRemainingApi",
            displayName: "GptTimeRemainingApi",
            description: "GptTimeRemainingApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptversioninfoapi",
            name: "GptVersionInfoApi",
            displayName: "GptVersionInfoApi",
            description: "GptVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptwakeupfunctionalityapi",
            name: "GptWakeupFunctionalityApi",
            displayName: "GptWakeupFunctionalityApi",
            description: "GptWakeupFunctionalityApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "gptdriverconfiguration",
        name: "GptDriverConfiguration",
        displayName: "GptDriverConfiguration",
        description: "GptDriverConfiguration 配置容器",
        parameters: [
          {
            id: "gptdeverrordetect",
            name: "GptDevErrorDetect",
            displayName: "GptDevErrorDetect",
            description: "GptDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptpredeftimer100us32bitenable",
            name: "GptPredefTimer100us32bitEnable",
            displayName: "GptPredefTimer100us32bitEnable",
            description: "GptPredefTimer100us32bitEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptreportwakeupsource",
            name: "GptReportWakeupSource",
            displayName: "GptReportWakeupSource",
            description: "GptReportWakeupSource 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptpredeftimer1usenablinggrade",
            name: "GptPredefTimer1usEnablingGrade",
            displayName: "GptPredefTimer1usEnablingGrade",
            description: "GptPredefTimer1usEnablingGrade 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "gptregisterlockingmode",
            name: "GptRegisterLockingMode",
            displayName: "GptRegisterLockingMode",
            description: "GptRegisterLockingMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gpthwconfiguration-0",
        name: "GptHwConfiguration_0",
        displayName: "GptHwConfiguration_0",
        description: "GptHwConfiguration_0 配置容器",
        parameters: [
          {
            id: "gptisrenable",
            name: "GptIsrEnable",
            displayName: "GptIsrEnable",
            description: "GptIsrEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptmoduleisused",
            name: "GptModuleIsUsed",
            displayName: "GptModuleIsUsed",
            description: "GptModuleIsUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptisrhwid",
            name: "GptIsrHwId",
            displayName: "GptIsrHwId",
            description: "GptIsrHwId 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gpthwconfiguration-1",
        name: "GptHwConfiguration_1",
        displayName: "GptHwConfiguration_1",
        description: "GptHwConfiguration_1 配置容器",
        parameters: [
          {
            id: "gptisrenable",
            name: "GptIsrEnable",
            displayName: "GptIsrEnable",
            description: "GptIsrEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptmoduleisused",
            name: "GptModuleIsUsed",
            displayName: "GptModuleIsUsed",
            description: "GptModuleIsUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptisrhwid",
            name: "GptIsrHwId",
            displayName: "GptIsrHwId",
            description: "GptIsrHwId 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gpthwconfiguration-2",
        name: "GptHwConfiguration_2",
        displayName: "GptHwConfiguration_2",
        description: "GptHwConfiguration_2 配置容器",
        parameters: [
          {
            id: "gptisrenable",
            name: "GptIsrEnable",
            displayName: "GptIsrEnable",
            description: "GptIsrEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptmoduleisused",
            name: "GptModuleIsUsed",
            displayName: "GptModuleIsUsed",
            description: "GptModuleIsUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptisrhwid",
            name: "GptIsrHwId",
            displayName: "GptIsrHwId",
            description: "GptIsrHwId 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gptnonautosar",
        name: "GptNonAUTOSAR",
        displayName: "GptNonAUTOSAR",
        description: "GptNonAUTOSAR 配置容器",
        parameters: [
          {
            id: "gptchangenexttimeoutvalueapi",
            name: "GptChangeNextTimeoutValueApi",
            displayName: "GptChangeNextTimeoutValueApi",
            description: "GptChangeNextTimeoutValueApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptenabledualclockmode",
            name: "GptEnableDualClockMode",
            displayName: "GptEnableDualClockMode",
            description: "GptEnableDualClockMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptenabletriggers",
            name: "GptEnableTriggers",
            displayName: "GptEnableTriggers",
            description: "GptEnableTriggers 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptenableusermodesupport",
            name: "GptEnableUserModeSupport",
            displayName: "GptEnableUserModeSupport",
            description: "GptEnableUserModeSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "gptstandbywakeupsupport",
            name: "GptStandbyWakeupSupport",
            displayName: "GptStandbyWakeupSupport",
            description: "GptStandbyWakeupSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "icu",
    name: "Icu",
    displayName: "ICU Driver",
    description: "Input Capture Unit driver - AUTOSAR MCAL",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "icu_common_pub",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "ICU module metadata",
        parameters: [
          { id: "icu_armajor", name: "ArReleaseMajorVersion", displayName: "AR Major", type: "integer", value: 4, defaultValue: 4 },
          { id: "icu_arminor", name: "ArReleaseMinorVersion", displayName: "AR Minor", type: "integer", value: 3, defaultValue: 3 },
          { id: "icu_moduleid", name: "ModuleId", displayName: "Module ID", type: "integer", value: 122, defaultValue: 122 },
          { id: "icu_vendorid", name: "VendorId", displayName: "Vendor ID", type: "integer", value: 43, defaultValue: 43 },
        ],
      },
      {
        id: "icuconfigset",
        name: "IcuConfigSet",
        displayName: "IcuConfigSet",
        description: "ICU Configuration Set",
        parameters: [
          { id: "icumaxchannel", name: "IcuMaxChannel", displayName: "Max Channel", type: "integer", value: 2, defaultValue: 2 },
        ],
        subContainers: [
          {
            id: "icuchannel_canrx",
            name: "IcuChannel_CANRx",
            displayName: "IcuChannel_CANRx",
            shortName: "IcuChannel",
            description: "ICU channel for CAN Rx detection",
            parameters: [
              { id: "icuchannelid_canrx", name: "IcuChannelId", type: "integer", value: 1 },
              { id: "icuwakeupcapability_canrx", name: "IcuWakeupCapability", type: "boolean", value: true },
              { id: "icumeasurementmode_canrx", name: "IcuMeasurementMode", type: "string", value: "ICU_MODE_SIGNAL_EDGE_DETECT" },
            ],
            subContainers: [
              { id: "icusignaledgedetection_canrx", name: "IcuSignalEdgeDetection", displayName: "IcuSignalEdgeDetection", shortName: "IcuSignalEdgeDetection", parameters: [ { id: "icusignalnotification_canrx", name: "IcuSignalNotification", type: "string", value: "NULL_PTR" } ] },
              { id: "icuwakeup_canrx", name: "IcuWakeup_CANRx", displayName: "IcuWakeup_CANRx", shortName: "IcuWakeup", parameters: [] },
            ],
          },
          {
            id: "icuchannel_sbcint",
            name: "IcuChannel_SBCINT",
            displayName: "IcuChannel_SBCINT",
            shortName: "IcuChannel",
            description: "ICU channel for SBC interrupt",
            parameters: [
              { id: "icuchannelid_sbc", name: "IcuChannelId", type: "integer", value: 0 },
              { id: "icuwakeupcapability_sbc", name: "IcuWakeupCapability", type: "boolean", value: true },
              { id: "icumeasurementmode_sbc", name: "IcuMeasurementMode", type: "string", value: "ICU_MODE_SIGNAL_EDGE_DETECT" },
            ],
            subContainers: [
              { id: "icusignaledgedetection_sbc", name: "IcuSignalEdgeDetection", displayName: "IcuSignalEdgeDetection", shortName: "IcuSignalEdgeDetection", parameters: [ { id: "icusignalnotification_sbc", name: "IcuSignalNotification", type: "string", value: "NULL_PTR" } ] },
              { id: "icuwakeup_sbc", name: "IcuWakeup_SBC", displayName: "IcuWakeup_SBC", shortName: "IcuWakeup", parameters: [] },
            ],
          },
        ],
      },
      {
        id: "icugeneral",
        name: "IcuGeneral",
        displayName: "IcuGeneral",
        description: "ICU general configuration",
        parameters: [
          { id: "icudeverrordetect", name: "IcuDevErrorDetect", type: "boolean", value: true },
          { id: "icureportwakeupsource", name: "IcuReportWakeupSource", type: "boolean", value: true },
        ],
      },
    ],
    dependencies: [],
    createdAt: "2025-05-25T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "iohwab",
    name: "Iohwab",
    displayName: "I/O Hardware Abstraction",
    description: "I/O 硬件抽象层",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "iohwabdio",
        name: "IoHwAbDio",
        displayName: "IoHwAbDio",
        description: "数字 I/O 配置",
        parameters: [],
        multiple: false
      },
      {
        id: "iohwabadc",
        name: "IoHwAbAdc",
        displayName: "IoHwAbAdc",
        description: "ADC 配置",
        parameters: [],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "mcl",
    name: "Mcl",
    displayName: "Microcontroller Library",
    description: "微控制器驱动库",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "commonpublishedinformation",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "CommonPublishedInformation 配置容器",
        parameters: [
          {
            id: "arreleasemajorversion",
            name: "ArReleaseMajorVersion",
            displayName: "ArReleaseMajorVersion",
            description: "ArReleaseMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaseminorversion",
            name: "ArReleaseMinorVersion",
            displayName: "ArReleaseMinorVersion",
            description: "ArReleaseMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaserevisionversion",
            name: "ArReleaseRevisionVersion",
            displayName: "ArReleaseRevisionVersion",
            description: "ArReleaseRevisionVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "moduleid",
            name: "ModuleId",
            displayName: "ModuleId",
            description: "ModuleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swmajorversion",
            name: "SwMajorVersion",
            displayName: "SwMajorVersion",
            description: "SwMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swminorversion",
            name: "SwMinorVersion",
            displayName: "SwMinorVersion",
            description: "SwMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swpatchversion",
            name: "SwPatchVersion",
            displayName: "SwPatchVersion",
            description: "SwPatchVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "vendorid",
            name: "VendorId",
            displayName: "VendorId",
            description: "VendorId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "dmachannel",
        name: "DmaChannel",
        displayName: "DmaChannel",
        description: "DmaChannel 配置容器",
        parameters: [
          {
            id: "dmachannelid",
            name: "DmaChannelId",
            displayName: "DmaChannelId",
            description: "DmaChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dmachannelarbitrationgroup",
            name: "DmaChannelArbitrationGroup",
            displayName: "DmaChannelArbitrationGroup",
            description: "DmaChannelArbitrationGroup 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dmachannelarbitrationpriority",
            name: "DmaChannelArbitrationPriority",
            displayName: "DmaChannelArbitrationPriority",
            description: "DmaChannelArbitrationPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dmachannelecp",
            name: "DmaChannelECP",
            displayName: "DmaChannelECP",
            description: "DmaChannelECP 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmachanneldpa",
            name: "DmaChannelDPA",
            displayName: "DmaChannelDPA",
            description: "DmaChannelDPA 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmachannelhwid",
            name: "DmaChannelHwId",
            displayName: "DmaChannelHwId",
            description: "DmaChannelHwId 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dmachannelmultiplexor",
            name: "DmaChannelMultiplexor",
            displayName: "DmaChannelMultiplexor",
            description: "DmaChannelMultiplexor 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dmachanneltransfercompletionnotif",
            name: "DmaChannelTransferCompletionNotif",
            displayName: "DmaChannelTransferCompletionNotif",
            description: "DmaChannelTransferCompletionNotif 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dmainstance",
        name: "DmaInstance",
        displayName: "DmaInstance",
        description: "DmaInstance 配置容器",
        parameters: [
          {
            id: "dmacx",
            name: "DmaCX",
            displayName: "DmaCX",
            description: "DmaCX 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmaecx",
            name: "DmaECX",
            displayName: "DmaECX",
            description: "DmaECX 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmagmrc",
            name: "DmaGMRC",
            displayName: "DmaGMRC",
            description: "DmaGMRC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmagclc",
            name: "DmaGCLC",
            displayName: "DmaGCLC",
            description: "DmaGCLC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmahalt",
            name: "DmaHALT",
            displayName: "DmaHALT",
            description: "DmaHALT 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmahae",
            name: "DmaHAE",
            displayName: "DmaHAE",
            description: "DmaHAE 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmaerca",
            name: "DmaERCA",
            displayName: "DmaERCA",
            description: "DmaERCA 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmaedbg",
            name: "DmaEDBG",
            displayName: "DmaEDBG",
            description: "DmaEDBG 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmahwinstance",
            name: "DmaHwInstance",
            displayName: "DmaHwInstance",
            description: "DmaHwInstance 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclconfigset",
        name: "MclConfigSet",
        displayName: "MclConfigSet",
        description: "MclConfigSet 配置容器",
        parameters: [
          {
            id: "dmacx",
            name: "DmaCX",
            displayName: "DmaCX",
            description: "DmaCX 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmaecx",
            name: "DmaECX",
            displayName: "DmaECX",
            description: "DmaECX 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmagmrc",
            name: "DmaGMRC",
            displayName: "DmaGMRC",
            description: "DmaGMRC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmagclc",
            name: "DmaGCLC",
            displayName: "DmaGCLC",
            description: "DmaGCLC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmahalt",
            name: "DmaHALT",
            displayName: "DmaHALT",
            description: "DmaHALT 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmahae",
            name: "DmaHAE",
            displayName: "DmaHAE",
            description: "DmaHAE 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmaerca",
            name: "DmaERCA",
            displayName: "DmaERCA",
            description: "DmaERCA 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmaedbg",
            name: "DmaEDBG",
            displayName: "DmaEDBG",
            description: "DmaEDBG 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxtrgmux0locken",
            name: "TrgMuxTrgMux0LockEn",
            displayName: "TrgMuxTrgMux0LockEn",
            description: "TrgMuxTrgMux0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxlpit00locken",
            name: "TrgMuxLPIT00LockEn",
            displayName: "TrgMuxLPIT00LockEn",
            description: "TrgMuxLPIT00LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxtpm0locken",
            name: "TrgMuxTPM0LockEn",
            displayName: "TrgMuxTPM0LockEn",
            description: "TrgMuxTPM0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxtpm1locken",
            name: "TrgMuxTPM1LockEn",
            displayName: "TrgMuxTPM1LockEn",
            description: "TrgMuxTPM1LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxlpi2c0locken",
            name: "TrgMuxLPI2C0LockEn",
            displayName: "TrgMuxLPI2C0LockEn",
            description: "TrgMuxLPI2C0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxlpi2c1locken",
            name: "TrgMuxLPI2C1LockEn",
            displayName: "TrgMuxLPI2C1LockEn",
            description: "TrgMuxLPI2C1LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxlpspi0locken",
            name: "TrgMuxLPSPI0LockEn",
            displayName: "TrgMuxLPSPI0LockEn",
            description: "TrgMuxLPSPI0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxlpspi1locken",
            name: "TrgMuxLPSPI1LockEn",
            displayName: "TrgMuxLPSPI1LockEn",
            description: "TrgMuxLPSPI1LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxlpuart0locken",
            name: "TrgMuxLPUART0LockEn",
            displayName: "TrgMuxLPUART0LockEn",
            description: "TrgMuxLPUART0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxlpuart1locken",
            name: "TrgMuxLPUART1LockEn",
            displayName: "TrgMuxLPUART1LockEn",
            description: "TrgMuxLPUART1LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxflexio0locken",
            name: "TrgMuxFlexio0LockEn",
            displayName: "TrgMuxFlexio0LockEn",
            description: "TrgMuxFlexio0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxadcgp0locken",
            name: "TrgMuxADCGP0LockEn",
            displayName: "TrgMuxADCGP0LockEn",
            description: "TrgMuxADCGP0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxcmpgp0locken",
            name: "TrgMuxCMPGP0LockEn",
            displayName: "TrgMuxCMPGP0LockEn",
            description: "TrgMuxCMPGP0LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "trgmuxcmpgp1locken",
            name: "TrgMuxCMPGP1LockEn",
            displayName: "TrgMuxCMPGP1LockEn",
            description: "TrgMuxCMPGP1LockEn 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmachannelid",
            name: "DmaChannelId",
            displayName: "DmaChannelId",
            description: "DmaChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dmachannelarbitrationgroup",
            name: "DmaChannelArbitrationGroup",
            displayName: "DmaChannelArbitrationGroup",
            description: "DmaChannelArbitrationGroup 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dmachannelarbitrationpriority",
            name: "DmaChannelArbitrationPriority",
            displayName: "DmaChannelArbitrationPriority",
            description: "DmaChannelArbitrationPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dmachannelecp",
            name: "DmaChannelECP",
            displayName: "DmaChannelECP",
            description: "DmaChannelECP 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmachanneldpa",
            name: "DmaChannelDPA",
            displayName: "DmaChannelDPA",
            description: "DmaChannelDPA 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dmahwinstance",
            name: "DmaHwInstance",
            displayName: "DmaHwInstance",
            description: "DmaHwInstance 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtrgmux0input0",
            name: "TrgMuxTrgMux0Input0",
            displayName: "TrgMuxTrgMux0Input0",
            description: "TrgMuxTrgMux0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtrgmux0input1",
            name: "TrgMuxTrgMux0Input1",
            displayName: "TrgMuxTrgMux0Input1",
            description: "TrgMuxTrgMux0Input1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtrgmux0input2",
            name: "TrgMuxTrgMux0Input2",
            displayName: "TrgMuxTrgMux0Input2",
            description: "TrgMuxTrgMux0Input2 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtrgmux0input3",
            name: "TrgMuxTrgMux0Input3",
            displayName: "TrgMuxTrgMux0Input3",
            description: "TrgMuxTrgMux0Input3 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpit0input0",
            name: "TrgMuxLPIT0Input0",
            displayName: "TrgMuxLPIT0Input0",
            description: "TrgMuxLPIT0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpit0input1",
            name: "TrgMuxLPIT0Input1",
            displayName: "TrgMuxLPIT0Input1",
            description: "TrgMuxLPIT0Input1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpit0input2",
            name: "TrgMuxLPIT0Input2",
            displayName: "TrgMuxLPIT0Input2",
            description: "TrgMuxLPIT0Input2 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpit0input3",
            name: "TrgMuxLPIT0Input3",
            displayName: "TrgMuxLPIT0Input3",
            description: "TrgMuxLPIT0Input3 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtpm0input0",
            name: "TrgMuxTPM0Input0",
            displayName: "TrgMuxTPM0Input0",
            description: "TrgMuxTPM0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtpm0input1",
            name: "TrgMuxTPM0Input1",
            displayName: "TrgMuxTPM0Input1",
            description: "TrgMuxTPM0Input1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtpm0input2",
            name: "TrgMuxTPM0Input2",
            displayName: "TrgMuxTPM0Input2",
            description: "TrgMuxTPM0Input2 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtpm1input0",
            name: "TrgMuxTPM1Input0",
            displayName: "TrgMuxTPM1Input0",
            description: "TrgMuxTPM1Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtpm1input1",
            name: "TrgMuxTPM1Input1",
            displayName: "TrgMuxTPM1Input1",
            description: "TrgMuxTPM1Input1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxtpm1input2",
            name: "TrgMuxTPM1Input2",
            displayName: "TrgMuxTPM1Input2",
            description: "TrgMuxTPM1Input2 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpi2c0input0",
            name: "TrgMuxLPI2C0Input0",
            displayName: "TrgMuxLPI2C0Input0",
            description: "TrgMuxLPI2C0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpi2c1input0",
            name: "TrgMuxLPI2C1Input0",
            displayName: "TrgMuxLPI2C1Input0",
            description: "TrgMuxLPI2C1Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpspi0input0",
            name: "TrgMuxLPSPI0Input0",
            displayName: "TrgMuxLPSPI0Input0",
            description: "TrgMuxLPSPI0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpspi1input0",
            name: "TrgMuxLPSPI1Input0",
            displayName: "TrgMuxLPSPI1Input0",
            description: "TrgMuxLPSPI1Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpuart0input0",
            name: "TrgMuxLPUART0Input0",
            displayName: "TrgMuxLPUART0Input0",
            description: "TrgMuxLPUART0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxlpuart1input0",
            name: "TrgMuxLPUART1Input0",
            displayName: "TrgMuxLPUART1Input0",
            description: "TrgMuxLPUART1Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxflexio0input0",
            name: "TrgMuxFlexio0Input0",
            displayName: "TrgMuxFlexio0Input0",
            description: "TrgMuxFlexio0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxflexio0input1",
            name: "TrgMuxFlexio0Input1",
            displayName: "TrgMuxFlexio0Input1",
            description: "TrgMuxFlexio0Input1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxflexio0input2",
            name: "TrgMuxFlexio0Input2",
            displayName: "TrgMuxFlexio0Input2",
            description: "TrgMuxFlexio0Input2 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxflexio0input3",
            name: "TrgMuxFlexio0Input3",
            displayName: "TrgMuxFlexio0Input3",
            description: "TrgMuxFlexio0Input3 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxadcgp0input0",
            name: "TrgMuxADCGP0Input0",
            displayName: "TrgMuxADCGP0Input0",
            description: "TrgMuxADCGP0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxadcgp0input1",
            name: "TrgMuxADCGP0Input1",
            displayName: "TrgMuxADCGP0Input1",
            description: "TrgMuxADCGP0Input1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxadcgp0input2",
            name: "TrgMuxADCGP0Input2",
            displayName: "TrgMuxADCGP0Input2",
            description: "TrgMuxADCGP0Input2 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxadcgp0input3",
            name: "TrgMuxADCGP0Input3",
            displayName: "TrgMuxADCGP0Input3",
            description: "TrgMuxADCGP0Input3 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxcmpgp0input0",
            name: "TrgMuxCMPGP0Input0",
            displayName: "TrgMuxCMPGP0Input0",
            description: "TrgMuxCMPGP0Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "trgmuxcmpgp1input0",
            name: "TrgMuxCMPGP1Input0",
            displayName: "TrgMuxCMPGP1Input0",
            description: "TrgMuxCMPGP1Input0 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dmachannelhwid",
            name: "DmaChannelHwId",
            displayName: "DmaChannelHwId",
            description: "DmaChannelHwId 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dmachannelmultiplexor",
            name: "DmaChannelMultiplexor",
            displayName: "DmaChannelMultiplexor",
            description: "DmaChannelMultiplexor 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dmachanneltransfercompletionnotif",
            name: "DmaChannelTransferCompletionNotif",
            displayName: "DmaChannelTransferCompletionNotif",
            description: "DmaChannelTransferCompletionNotif 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclgeneral",
        name: "MclGeneral",
        displayName: "MclGeneral",
        description: "MclGeneral 配置容器",
        parameters: [
          {
            id: "mcldisabledemreporterrorstatus",
            name: "MclDisableDemReportErrorStatus",
            displayName: "MclDisableDemReportErrorStatus",
            description: "MclDisableDemReportErrorStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcldeverrordetect",
            name: "MclDevErrorDetect",
            displayName: "MclDevErrorDetect",
            description: "MclDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcldmanotificationsupported",
            name: "MclDmaNotificationSupported",
            displayName: "MclDmaNotificationSupported",
            description: "MclDmaNotificationSupported 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclerrorchecking",
            name: "MclErrorChecking",
            displayName: "MclErrorChecking",
            description: "MclErrorChecking 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcl-versioninfoapi",
            name: "Mcl_VersionInfoApi",
            displayName: "Mcl_VersionInfoApi",
            description: "Mcl_VersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcl-dmagetchannelerrorstatusapi",
            name: "Mcl_DmaGetChannelErrorStatusApi",
            displayName: "Mcl_DmaGetChannelErrorStatusApi",
            description: "Mcl_DmaGetChannelErrorStatusApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcl-dmagetglobalerrorstatusapi",
            name: "Mcl_DmaGetGlobalErrorStatusApi",
            displayName: "Mcl_DmaGetGlobalErrorStatusApi",
            description: "Mcl_DmaGetGlobalErrorStatusApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcl-deinitapi",
            name: "Mcl_DeInitApi",
            displayName: "Mcl_DeInitApi",
            description: "Mcl_DeInitApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "enabledma",
            name: "EnableDMA",
            displayName: "EnableDMA",
            description: "EnableDMA 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclenabletrgmux",
            name: "MclEnableTrgMux",
            displayName: "MclEnableTrgMux",
            description: "MclEnableTrgMux 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclenableusermodesupport",
            name: "MclEnableUserModeSupport",
            displayName: "MclEnableUserModeSupport",
            description: "MclEnableUserModeSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcllpcacenablecacheapi",
            name: "MclLpcacEnableCacheApi",
            displayName: "MclLpcacEnableCacheApi",
            description: "MclLpcacEnableCacheApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mcllpcacenablewritebuffer",
            name: "MclLpcacEnableWriteBuffer",
            displayName: "MclLpcacEnableWriteBuffer",
            description: "MclLpcacEnableWriteBuffer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable",
        name: "MclIsrAvailable",
        displayName: "MclIsrAvailable",
        description: "MclIsrAvailable 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-1",
        name: "MclIsrAvailable_1",
        displayName: "MclIsrAvailable_1",
        description: "MclIsrAvailable_1 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-10",
        name: "MclIsrAvailable_10",
        displayName: "MclIsrAvailable_10",
        description: "MclIsrAvailable_10 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-11",
        name: "MclIsrAvailable_11",
        displayName: "MclIsrAvailable_11",
        description: "MclIsrAvailable_11 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-12",
        name: "MclIsrAvailable_12",
        displayName: "MclIsrAvailable_12",
        description: "MclIsrAvailable_12 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-13",
        name: "MclIsrAvailable_13",
        displayName: "MclIsrAvailable_13",
        description: "MclIsrAvailable_13 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-14",
        name: "MclIsrAvailable_14",
        displayName: "MclIsrAvailable_14",
        description: "MclIsrAvailable_14 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-15",
        name: "MclIsrAvailable_15",
        displayName: "MclIsrAvailable_15",
        description: "MclIsrAvailable_15 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-2",
        name: "MclIsrAvailable_2",
        displayName: "MclIsrAvailable_2",
        description: "MclIsrAvailable_2 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "mclisravailable-3",
        name: "MclIsrAvailable_3",
        displayName: "MclIsrAvailable_3",
        description: "MclIsrAvailable_3 配置容器",
        parameters: [
          {
            id: "mclisrenabled",
            name: "MclIsrEnabled",
            displayName: "MclIsrEnabled",
            description: "MclIsrEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "mclisrname",
            name: "MclIsrName",
            displayName: "MclIsrName",
            description: "MclIsrName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "mcu",
    name: "Mcu",
    displayName: "Microcontroller Unit",
    description: "MCU driver - AUTOSAR MCAL",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "mcu_common_pub",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "MCU module metadata",
        parameters: [
          { id: "mcu_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 },
          { id: "mcu_arminor", name: "ArReleaseMinorVersion", type: "integer", value: 3 },
          { id: "mcu_moduleid", name: "ModuleId", type: "integer", value: 80 },
          { id: "mcu_vendorid", name: "VendorId", type: "integer", value: 43 },
        ],
      },
      {
        id: "mcugeneral",
        name: "McuGeneral",
        displayName: "McuGeneral",
        description: "MCU general config",
        parameters: [
          { id: "mcudeverrordetect", name: "McuDevErrorDetect", type: "boolean", value: true },
          { id: "mcuversioninfoapi", name: "McuVersionInfoApi", type: "boolean", value: true },
        ],
      },
      {
        id: "mcuclocksetting",
        name: "McuClockSetting",
        displayName: "McuClockSetting",
        description: "MCU clock & mode settings",
        parameters: [
          { id: "mcucoreclock", name: "McuCoreClock", type: "integer", value: 96000000, min: 1000000, max: 320000000, unit: "Hz" },
        ],
        subContainers: [
          {
            id: "mcumodesetting_run",
            name: "McuModeSettingConf_Run",
            displayName: "McuModeSettingConf_Run",
            shortName: "McuModeSettingConf",
            parameters: [
              { id: "mcumode_run", name: "McuMode", type: "integer", value: 0 },
              { id: "clockmode_run", name: "ClockMode", type: "string", value: "NO_CLOCK_GATE" },
            ],
          },
          {
            id: "mcumodesetting_sleep",
            name: "McuModeSettingConf_Sleep",
            displayName: "McuModeSettingConf_Sleep",
            shortName: "McuModeSettingConf",
            parameters: [
              { id: "mcumode_sleep", name: "McuMode", type: "integer", value: 1 },
              { id: "clockmode_sleep", name: "ClockMode", type: "string", value: "CORE_PLATFORM_PERIPHERAL_CLOCK_GATE_ENTER_LOWPOWER" },
            ],
          },
        ],
      },
      {
        id: "mcuresetconfig",
        name: "McuResetConfig",
        displayName: "McuResetConfig",
        description: "MCU reset config",
        parameters: [
          { id: "mcuresetpinfilterenable", name: "McuResetPinFilterEnable", type: "boolean", value: false },
        ],
      },
    ],
    dependencies: [],
    createdAt: "2025-05-25T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "memif", name: "MemIf", displayName: "Memory Abstraction Interface", description: "MemIf - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "memif_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "memif_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "nm", name: "Nm", displayName: "Network Manager", description: "Nm - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "nm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "nm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "nvm", name: "NvM", displayName: "Non-Volatile Memory Manager", description: "NvM - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "nvm_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "nvm_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
      { id: "nvmgeneral", name: "NvMGeneral", parameters: [ { id: "nvmdeverrordetect", name: "NvMDevErrorDetect", type: "boolean", value: true } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "os",
    name: "Os",
    displayName: "Operating System",
    description: "操作系统",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "adc0-isr-bat",
        name: "Adc0_Isr_Bat",
        displayName: "Adc0_Isr_Bat",
        description: "Adc0_Isr_Bat 配置容器",
        parameters: [
          {
            id: "osisrinterruptsource",
            name: "OsIsrInterruptSource",
            displayName: "OsIsrInterruptSource",
            description: "OsIsrInterruptSource 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrinterruptpriority",
            name: "OsIsrInterruptPriority",
            displayName: "OsIsrInterruptPriority",
            description: "OsIsrInterruptPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrstacksize",
            name: "OsIsrStackSize",
            displayName: "OsIsrStackSize",
            description: "OsIsrStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrenablenesting",
            name: "OsIsrEnableNesting",
            displayName: "OsIsrEnableNesting",
            description: "OsIsrEnableNesting 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrusesfpu",
            name: "OsIsrUsesFpu",
            displayName: "OsIsrUsesFpu",
            description: "OsIsrUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrinitialenableinterruptsource",
            name: "OsIsrInitialEnableInterruptSource",
            displayName: "OsIsrInitialEnableInterruptSource",
            description: "OsIsrInitialEnableInterruptSource 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrcategory",
            name: "OsIsrCategory",
            displayName: "OsIsrCategory",
            description: "OsIsrCategory 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrinterrupttype",
            name: "OsIsrInterruptType",
            displayName: "OsIsrInterruptType",
            description: "OsIsrInterruptType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrspecialfunctionname",
            name: "OsIsrSpecialFunctionName",
            displayName: "OsIsrSpecialFunctionName",
            description: "OsIsrSpecialFunctionName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "ble-host-task",
        name: "BLE_Host_Task",
        displayName: "BLE_Host_Task",
        description: "BLE_Host_Task 配置容器",
        parameters: [
          {
            id: "ostaskactivation",
            name: "OsTaskActivation",
            displayName: "OsTaskActivation",
            description: "OsTaskActivation 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskpriority",
            name: "OsTaskPriority",
            displayName: "OsTaskPriority",
            description: "OsTaskPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskstacksharing",
            name: "OsTaskStackSharing",
            displayName: "OsTaskStackSharing",
            description: "OsTaskStackSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskstacksize",
            name: "OsTaskStackSize",
            displayName: "OsTaskStackSize",
            description: "OsTaskStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskusesfpu",
            name: "OsTaskUsesFpu",
            displayName: "OsTaskUsesFpu",
            description: "OsTaskUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskschedule",
            name: "OsTaskSchedule",
            displayName: "OsTaskSchedule",
            description: "OsTaskSchedule 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ostasktype",
            name: "OsTaskType",
            displayName: "OsTaskType",
            description: "OsTaskType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "ble-host-timertask",
        name: "BLE_Host_TimerTask",
        displayName: "BLE_Host_TimerTask",
        description: "BLE_Host_TimerTask 配置容器",
        parameters: [
          {
            id: "ostaskactivation",
            name: "OsTaskActivation",
            displayName: "OsTaskActivation",
            description: "OsTaskActivation 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskpriority",
            name: "OsTaskPriority",
            displayName: "OsTaskPriority",
            description: "OsTaskPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskstacksharing",
            name: "OsTaskStackSharing",
            displayName: "OsTaskStackSharing",
            description: "OsTaskStackSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskstacksize",
            name: "OsTaskStackSize",
            displayName: "OsTaskStackSize",
            description: "OsTaskStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskusesfpu",
            name: "OsTaskUsesFpu",
            displayName: "OsTaskUsesFpu",
            description: "OsTaskUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskschedule",
            name: "OsTaskSchedule",
            displayName: "OsTaskSchedule",
            description: "OsTaskSchedule 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ostasktype",
            name: "OsTaskType",
            displayName: "OsTaskType",
            description: "OsTaskType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "crypto-cmd-isr",
        name: "CRYPTO_CMD_ISR",
        displayName: "CRYPTO_CMD_ISR",
        description: "CRYPTO_CMD_ISR 配置容器",
        parameters: [
          {
            id: "osisrinterruptsource",
            name: "OsIsrInterruptSource",
            displayName: "OsIsrInterruptSource",
            description: "OsIsrInterruptSource 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrinterruptpriority",
            name: "OsIsrInterruptPriority",
            displayName: "OsIsrInterruptPriority",
            description: "OsIsrInterruptPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrstacksize",
            name: "OsIsrStackSize",
            displayName: "OsIsrStackSize",
            description: "OsIsrStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrenablenesting",
            name: "OsIsrEnableNesting",
            displayName: "OsIsrEnableNesting",
            description: "OsIsrEnableNesting 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrusesfpu",
            name: "OsIsrUsesFpu",
            displayName: "OsIsrUsesFpu",
            description: "OsIsrUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrinitialenableinterruptsource",
            name: "OsIsrInitialEnableInterruptSource",
            displayName: "OsIsrInitialEnableInterruptSource",
            description: "OsIsrInitialEnableInterruptSource 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrcategory",
            name: "OsIsrCategory",
            displayName: "OsIsrCategory",
            description: "OsIsrCategory 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrinterrupttype",
            name: "OsIsrInterruptType",
            displayName: "OsIsrInterruptType",
            description: "OsIsrInterruptType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrspecialfunctionname",
            name: "OsIsrSpecialFunctionName",
            displayName: "OsIsrSpecialFunctionName",
            description: "OsIsrSpecialFunctionName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "can-30-flexcan4isr-0",
        name: "Can_30_Flexcan4Isr_0",
        displayName: "Can_30_Flexcan4Isr_0",
        description: "Can_30_Flexcan4Isr_0 配置容器",
        parameters: [
          {
            id: "osisrinterruptsource",
            name: "OsIsrInterruptSource",
            displayName: "OsIsrInterruptSource",
            description: "OsIsrInterruptSource 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrinterruptpriority",
            name: "OsIsrInterruptPriority",
            displayName: "OsIsrInterruptPriority",
            description: "OsIsrInterruptPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrstacksize",
            name: "OsIsrStackSize",
            displayName: "OsIsrStackSize",
            description: "OsIsrStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrenablenesting",
            name: "OsIsrEnableNesting",
            displayName: "OsIsrEnableNesting",
            description: "OsIsrEnableNesting 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrusesfpu",
            name: "OsIsrUsesFpu",
            displayName: "OsIsrUsesFpu",
            description: "OsIsrUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrinitialenableinterruptsource",
            name: "OsIsrInitialEnableInterruptSource",
            displayName: "OsIsrInitialEnableInterruptSource",
            description: "OsIsrInitialEnableInterruptSource 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrcategory",
            name: "OsIsrCategory",
            displayName: "OsIsrCategory",
            description: "OsIsrCategory 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrinterrupttype",
            name: "OsIsrInterruptType",
            displayName: "OsIsrInterruptType",
            description: "OsIsrInterruptType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrspecialfunctionname",
            name: "OsIsrSpecialFunctionName",
            displayName: "OsIsrSpecialFunctionName",
            description: "OsIsrSpecialFunctionName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "core0",
        name: "Core0",
        displayName: "Core0",
        description: "Core0 配置容器",
        parameters: [
          {
            id: "osphysicalcoreid",
            name: "OsPhysicalCoreId",
            displayName: "OsPhysicalCoreId",
            description: "OsPhysicalCoreId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osphysicalcoreexceptionsources",
            name: "OsPhysicalCoreExceptionSources",
            displayName: "OsPhysicalCoreExceptionSources",
            description: "OsPhysicalCoreExceptionSources 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osphysicalcoreisautostart",
            name: "OsPhysicalCoreIsAutostart",
            displayName: "OsPhysicalCoreIsAutostart",
            description: "OsPhysicalCoreIsAutostart 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osphysicalcoremasterstartallowed",
            name: "OsPhysicalCoreMasterStartAllowed",
            displayName: "OsPhysicalCoreMasterStartAllowed",
            description: "OsPhysicalCoreMasterStartAllowed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osphysicalcoreprivelegedhwaccess",
            name: "OsPhysicalCorePrivelegedHwAccess",
            displayName: "OsPhysicalCorePrivelegedHwAccess",
            description: "OsPhysicalCorePrivelegedHwAccess 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osphysicalcorempumaxregions",
            name: "OsPhysicalCoreMpuMaxRegions",
            displayName: "OsPhysicalCoreMpuMaxRegions",
            description: "OsPhysicalCoreMpuMaxRegions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osphysicalcorempuid",
            name: "OsPhysicalCoreMpuId",
            displayName: "OsPhysicalCoreMpuId",
            description: "OsPhysicalCoreMpuId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osphysicalcoretype",
            name: "OsPhysicalCoreType",
            displayName: "OsPhysicalCoreType",
            description: "OsPhysicalCoreType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osphysicalcoredefaultentrysymbol",
            name: "OsPhysicalCoreDefaultEntrySymbol",
            displayName: "OsPhysicalCoreDefaultEntrySymbol",
            description: "OsPhysicalCoreDefaultEntrySymbol 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osphysicalcoremputype",
            name: "OsPhysicalCoreMpuType",
            displayName: "OsPhysicalCoreMpuType",
            description: "OsPhysicalCoreMpuType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "core0-mpu",
        name: "Core0_MPU",
        displayName: "Core0_MPU",
        description: "Core0_MPU 配置容器",
        parameters: [
          {
            id: "osphysicalcorempumaxregions",
            name: "OsPhysicalCoreMpuMaxRegions",
            displayName: "OsPhysicalCoreMpuMaxRegions",
            description: "OsPhysicalCoreMpuMaxRegions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osphysicalcorempuid",
            name: "OsPhysicalCoreMpuId",
            displayName: "OsPhysicalCoreMpuId",
            description: "OsPhysicalCoreMpuId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osphysicalcoremputype",
            name: "OsPhysicalCoreMpuType",
            displayName: "OsPhysicalCoreMpuType",
            description: "OsPhysicalCoreMpuType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "counterisr-systemtimer",
        name: "CounterIsr_SystemTimer",
        displayName: "CounterIsr_SystemTimer",
        description: "CounterIsr_SystemTimer 配置容器",
        parameters: [
          {
            id: "osisrinterruptpriority",
            name: "OsIsrInterruptPriority",
            displayName: "OsIsrInterruptPriority",
            description: "OsIsrInterruptPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrinterruptsource",
            name: "OsIsrInterruptSource",
            displayName: "OsIsrInterruptSource",
            description: "OsIsrInterruptSource 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrinitialenableinterruptsource",
            name: "OsIsrInitialEnableInterruptSource",
            displayName: "OsIsrInitialEnableInterruptSource",
            description: "OsIsrInitialEnableInterruptSource 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrstacksize",
            name: "OsIsrStackSize",
            displayName: "OsIsrStackSize",
            description: "OsIsrStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrenablenesting",
            name: "OsIsrEnableNesting",
            displayName: "OsIsrEnableNesting",
            description: "OsIsrEnableNesting 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrusesfpu",
            name: "OsIsrUsesFpu",
            displayName: "OsIsrUsesFpu",
            description: "OsIsrUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrcategory",
            name: "OsIsrCategory",
            displayName: "OsIsrCategory",
            description: "OsIsrCategory 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrinterrupttype",
            name: "OsIsrInterruptType",
            displayName: "OsIsrInterruptType",
            description: "OsIsrInterruptType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrspecialfunctionname",
            name: "OsIsrSpecialFunctionName",
            displayName: "OsIsrSpecialFunctionName",
            description: "OsIsrSpecialFunctionName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "default-bsw-async-task",
        name: "Default_BSW_Async_Task",
        displayName: "Default_BSW_Async_Task",
        description: "Default_BSW_Async_Task 配置容器",
        parameters: [
          {
            id: "ostaskactivation",
            name: "OsTaskActivation",
            displayName: "OsTaskActivation",
            description: "OsTaskActivation 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskpriority",
            name: "OsTaskPriority",
            displayName: "OsTaskPriority",
            description: "OsTaskPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskstacksharing",
            name: "OsTaskStackSharing",
            displayName: "OsTaskStackSharing",
            description: "OsTaskStackSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskstacksize",
            name: "OsTaskStackSize",
            displayName: "OsTaskStackSize",
            description: "OsTaskStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskusesfpu",
            name: "OsTaskUsesFpu",
            displayName: "OsTaskUsesFpu",
            description: "OsTaskUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskschedule",
            name: "OsTaskSchedule",
            displayName: "OsTaskSchedule",
            description: "OsTaskSchedule 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ostasktype",
            name: "OsTaskType",
            displayName: "OsTaskType",
            description: "OsTaskType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "default-init-task",
        name: "Default_Init_Task",
        displayName: "Default_Init_Task",
        description: "Default_Init_Task 配置容器",
        parameters: [
          {
            id: "ostaskactivation",
            name: "OsTaskActivation",
            displayName: "OsTaskActivation",
            description: "OsTaskActivation 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskpriority",
            name: "OsTaskPriority",
            displayName: "OsTaskPriority",
            description: "OsTaskPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskstacksharing",
            name: "OsTaskStackSharing",
            displayName: "OsTaskStackSharing",
            description: "OsTaskStackSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskstacksize",
            name: "OsTaskStackSize",
            displayName: "OsTaskStackSize",
            description: "OsTaskStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskusesfpu",
            name: "OsTaskUsesFpu",
            displayName: "OsTaskUsesFpu",
            description: "OsTaskUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskschedule",
            name: "OsTaskSchedule",
            displayName: "OsTaskSchedule",
            description: "OsTaskSchedule 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ostasktype",
            name: "OsTaskType",
            displayName: "OsTaskType",
            description: "OsTaskType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "default-init-task-trusted",
        name: "Default_Init_Task_Trusted",
        displayName: "Default_Init_Task_Trusted",
        description: "Default_Init_Task_Trusted 配置容器",
        parameters: [
          {
            id: "ostaskactivation",
            name: "OsTaskActivation",
            displayName: "OsTaskActivation",
            description: "OsTaskActivation 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskpriority",
            name: "OsTaskPriority",
            displayName: "OsTaskPriority",
            description: "OsTaskPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskstacksharing",
            name: "OsTaskStackSharing",
            displayName: "OsTaskStackSharing",
            description: "OsTaskStackSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskstacksize",
            name: "OsTaskStackSize",
            displayName: "OsTaskStackSize",
            description: "OsTaskStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskusesfpu",
            name: "OsTaskUsesFpu",
            displayName: "OsTaskUsesFpu",
            description: "OsTaskUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskschedule",
            name: "OsTaskSchedule",
            displayName: "OsTaskSchedule",
            description: "OsTaskSchedule 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ostasktype",
            name: "OsTaskType",
            displayName: "OsTaskType",
            description: "OsTaskType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "default-rte-mode-switch-task",
        name: "Default_RTE_Mode_switch_Task",
        displayName: "Default_RTE_Mode_switch_Task",
        description: "Default_RTE_Mode_switch_Task 配置容器",
        parameters: [
          {
            id: "ostaskactivation",
            name: "OsTaskActivation",
            displayName: "OsTaskActivation",
            description: "OsTaskActivation 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskpriority",
            name: "OsTaskPriority",
            displayName: "OsTaskPriority",
            description: "OsTaskPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskstacksharing",
            name: "OsTaskStackSharing",
            displayName: "OsTaskStackSharing",
            description: "OsTaskStackSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskstacksize",
            name: "OsTaskStackSize",
            displayName: "OsTaskStackSize",
            description: "OsTaskStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ostaskusesfpu",
            name: "OsTaskUsesFpu",
            displayName: "OsTaskUsesFpu",
            description: "OsTaskUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "ostaskschedule",
            name: "OsTaskSchedule",
            displayName: "OsTaskSchedule",
            description: "OsTaskSchedule 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ostasktype",
            name: "OsTaskType",
            displayName: "OsTaskType",
            description: "OsTaskType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "execute-allowed",
        name: "EXECUTE_ALLOWED",
        displayName: "EXECUTE_ALLOWED",
        description: "EXECUTE_ALLOWED 配置容器",
        parameters: [
          {
            id: "osmemoryregionaccessrights",
            name: "OsMemoryRegionAccessRights",
            displayName: "OsMemoryRegionAccessRights",
            description: "OsMemoryRegionAccessRights 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osmemoryregionaccesstype",
            name: "OsMemoryRegionAccessType",
            displayName: "OsMemoryRegionAccessType",
            description: "OsMemoryRegionAccessType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gpt-lptmr0-isr",
        name: "GPT_LPTMR0_ISR",
        displayName: "GPT_LPTMR0_ISR",
        description: "GPT_LPTMR0_ISR 配置容器",
        parameters: [
          {
            id: "osisrinterruptsource",
            name: "OsIsrInterruptSource",
            displayName: "OsIsrInterruptSource",
            description: "OsIsrInterruptSource 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrinterruptpriority",
            name: "OsIsrInterruptPriority",
            displayName: "OsIsrInterruptPriority",
            description: "OsIsrInterruptPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrstacksize",
            name: "OsIsrStackSize",
            displayName: "OsIsrStackSize",
            description: "OsIsrStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrenablenesting",
            name: "OsIsrEnableNesting",
            displayName: "OsIsrEnableNesting",
            description: "OsIsrEnableNesting 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrusesfpu",
            name: "OsIsrUsesFpu",
            displayName: "OsIsrUsesFpu",
            description: "OsIsrUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrinitialenableinterruptsource",
            name: "OsIsrInitialEnableInterruptSource",
            displayName: "OsIsrInitialEnableInterruptSource",
            description: "OsIsrInitialEnableInterruptSource 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrcategory",
            name: "OsIsrCategory",
            displayName: "OsIsrCategory",
            description: "OsIsrCategory 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrinterrupttype",
            name: "OsIsrInterruptType",
            displayName: "OsIsrInterruptType",
            description: "OsIsrInterruptType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrspecialfunctionname",
            name: "OsIsrSpecialFunctionName",
            displayName: "OsIsrSpecialFunctionName",
            description: "OsIsrSpecialFunctionName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gpt-lptmr1-isr",
        name: "GPT_LPTMR1_ISR",
        displayName: "GPT_LPTMR1_ISR",
        description: "GPT_LPTMR1_ISR 配置容器",
        parameters: [
          {
            id: "osisrinterruptsource",
            name: "OsIsrInterruptSource",
            displayName: "OsIsrInterruptSource",
            description: "OsIsrInterruptSource 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrinterruptpriority",
            name: "OsIsrInterruptPriority",
            displayName: "OsIsrInterruptPriority",
            description: "OsIsrInterruptPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrstacksize",
            name: "OsIsrStackSize",
            displayName: "OsIsrStackSize",
            description: "OsIsrStackSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "osisrenablenesting",
            name: "OsIsrEnableNesting",
            displayName: "OsIsrEnableNesting",
            description: "OsIsrEnableNesting 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrusesfpu",
            name: "OsIsrUsesFpu",
            displayName: "OsIsrUsesFpu",
            description: "OsIsrUsesFpu 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrinitialenableinterruptsource",
            name: "OsIsrInitialEnableInterruptSource",
            displayName: "OsIsrInitialEnableInterruptSource",
            description: "OsIsrInitialEnableInterruptSource 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "osisrcategory",
            name: "OsIsrCategory",
            displayName: "OsIsrCategory",
            description: "OsIsrCategory 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrinterrupttype",
            name: "OsIsrInterruptType",
            displayName: "OsIsrInterruptType",
            description: "OsIsrInterruptType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "osisrspecialfunctionname",
            name: "OsIsrSpecialFunctionName",
            displayName: "OsIsrSpecialFunctionName",
            description: "OsIsrSpecialFunctionName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "pdur", name: "PduR", displayName: "PDU Router", description: "PduR - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "pdur_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "pdur_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "port",
    name: "Port",
    displayName: "PORT Driver",
    description: "Port driver configuration - AUTOSAR MCAL",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "port_common_pub",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "Port module metadata",
        parameters: [
          { id: "port_armajor", name: "ArReleaseMajorVersion", displayName: "AR Major", type: "integer", value: 4, defaultValue: 4 },
          { id: "port_arminor", name: "ArReleaseMinorVersion", displayName: "AR Minor", type: "integer", value: 3, defaultValue: 3 },
          { id: "port_moduleid", name: "ModuleId", displayName: "Module ID", type: "integer", value: 124, defaultValue: 124 },
          { id: "port_vendorid", name: "VendorId", displayName: "Vendor ID", type: "integer", value: 43, defaultValue: 43 },
        ],
      },
      {
        id: "portconfigset",
        name: "PortConfigSet",
        displayName: "PortConfigSet",
        description: "Port Configuration Set",
        parameters: [],
        subContainers: [
          {
            id: "notusedportpin",
            name: "NotUsedPortPin",
            displayName: "NotUsedPortPin",
            parameters: [
              { id: "unused_dse", name: "PortPinDSE", displayName: "Drive Strength", type: "string", value: "Low_Drive_Strength" },
              { id: "unused_dir", name: "PortPinDirection", displayName: "Direction", type: "string", value: "PORT_PIN_IN" },
              { id: "unused_mode", name: "PortPinMode", displayName: "Mode", type: "string", value: "GPIO" },
            ],
          },
          {
            id: "portcontainer_0",
            name: "PortContainer_0",
            displayName: "PortContainer_0",
            shortName: "PortContainer",
            parameters: [
              { id: "num_pins", name: "PortNumberOfPortPins", displayName: "Number of Pins", type: "integer", value: 29, min: 1, max: 144 },
            ],
            subContainers: [
              {
                id: "flash_se_spi_clk",
                name: "FLASH_SE_SPI_CLK",
                displayName: "FLASH_SE_SPI_CLK",
                shortName: "PortPin",
                parameters: [
                  { id: "flash_clk_id", name: "PortPinId", type: "integer", value: 29, min: 0, max: 143 },
                  { id: "flash_clk_dir", name: "PortPinDirection", type: "string", value: "PORT_PIN_OUT" },
                  { id: "flash_clk_mode", name: "PortPinMode", type: "string", value: "LPSPI1_SCK" },
                ],
              },
              {
                id: "flash_se_spi_miso",
                name: "FLASH_SE_SPI_MISO",
                displayName: "FLASH_SE_SPI_MISO",
                shortName: "PortPin",
                parameters: [
                  { id: "flash_miso_id", name: "PortPinId", type: "integer", value: 23, min: 0, max: 143 },
                  { id: "flash_miso_dir", name: "PortPinDirection", type: "string", value: "PORT_PIN_IN" },
                  { id: "flash_miso_mode", name: "PortPinMode", type: "string", value: "LPSPI1_SIN" },
                ],
              },
              {
                id: "flash_se_spi_mosi",
                name: "FLASH_SE_SPI_MOSI",
                displayName: "FLASH_SE_SPI_MOSI",
                shortName: "PortPin",
                parameters: [
                  { id: "flash_mosi_id", name: "PortPinId", type: "integer", value: 1, min: 0, max: 143 },
                  { id: "flash_mosi_dir", name: "PortPinDirection", type: "string", value: "PORT_PIN_OUT" },
                ],
              },
              {
                id: "flash_spi_cs",
                name: "FLASH_SPI_CS",
                displayName: "FLASH_SPI_CS",
                shortName: "PortPin",
                parameters: [
                  { id: "flash_cs_id", name: "PortPinId", type: "integer", value: 24, min: 0, max: 143 },
                  { id: "flash_cs_dir", name: "PortPinDirection", type: "string", value: "PORT_PIN_OUT" },
                  { id: "flash_cs_mode", name: "PortPinMode", type: "string", value: "GPIO" },
                ],
              },
            ],
          },
        ],
      },
    ],
    dependencies: [],
    createdAt: "2025-05-25T00:00:00Z",
    updatedAt: "2025-05-25T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "rte", name: "Rte", displayName: "Runtime Environment", description: "RTE - AUTOSAR Service",
    vendor: "NXP", version: "4.4.0", autosarVersion: "4.4.0", layer: "Service", enabled: false,
    parameters: [], containers: [
      { id: "rte_common_pub", name: "CommonPublishedInformation", parameters: [ { id: "rte_armajor", name: "ArReleaseMajorVersion", type: "integer", value: 4 } ] },
    ], dependencies: [], createdAt: "2025-05-25T00:00:00Z", updatedAt: "2025-05-25T00:00:00Z", configStatus: "unconfigured"
  },
{
    id: "sbc",
    name: "Sbc",
    displayName: "System Basis Chip",
    description: "系统基础芯片",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "sbcpubliccfg",
        name: "SbcPublicCfg",
        displayName: "SbcPublicCfg",
        description: "SbcPublicCfg 配置容器",
        parameters: [
          {
            id: "sbcsingleinstanceapi",
            name: "SbcSingleInstanceApi",
            displayName: "SbcSingleInstanceApi",
            description: "SbcSingleInstanceApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcdeverrordetect",
            name: "SbcDevErrorDetect",
            displayName: "SbcDevErrorDetect",
            description: "SbcDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcgetversioninfo",
            name: "SbcGetVersionInfo",
            displayName: "SbcGetVersionInfo",
            description: "SbcGetVersionInfo 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcwatchdogsupportinitialtrigger",
            name: "SbcWatchdogSupportInitialTrigger",
            displayName: "SbcWatchdogSupportInitialTrigger",
            description: "SbcWatchdogSupportInitialTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcwatchdogsupportsetmodeaftertrigger",
            name: "SbcWatchdogSupportSetModeAfterTrigger",
            displayName: "SbcWatchdogSupportSetModeAfterTrigger",
            description: "SbcWatchdogSupportSetModeAfterTrigger 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcwatchdogsupportslowmode",
            name: "SbcWatchdogSupportSlowMode",
            displayName: "SbcWatchdogSupportSlowMode",
            description: "SbcWatchdogSupportSlowMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcwatchdogsupportoffmode",
            name: "SbcWatchdogSupportOffMode",
            displayName: "SbcWatchdogSupportOffMode",
            description: "SbcWatchdogSupportOffMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcsafebswchecks",
            name: "SbcSafeBswChecks",
            displayName: "SbcSafeBswChecks",
            description: "SbcSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "sbcuserconfigfile",
            name: "SbcUserConfigFile",
            displayName: "SbcUserConfigFile",
            description: "SbcUserConfigFile 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "tcan2451",
        name: "tcan2451",
        displayName: "tcan2451",
        description: "tcan2451 配置容器",
        parameters: [
          {
            id: "sbcdeviceid",
            name: "SbcDeviceId",
            displayName: "SbcDeviceId",
            description: "SbcDeviceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "sbcwatchdogperipheralid",
            name: "SbcWatchdogPeripheralId",
            displayName: "SbcWatchdogPeripheralId",
            description: "SbcWatchdogPeripheralId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "sbcwatchdogtriggeroffset",
            name: "SbcWatchdogTriggerOffset",
            displayName: "SbcWatchdogTriggerOffset",
            description: "SbcWatchdogTriggerOffset 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "sbccantrcvperipheralid",
            name: "SbcCanTrcvPeripheralId",
            displayName: "SbcCanTrcvPeripheralId",
            description: "SbcCanTrcvPeripheralId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "sbcwatchdoginitialmode",
            name: "SbcWatchdogInitialMode",
            displayName: "SbcWatchdogInitialMode",
            description: "SbcWatchdogInitialMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "sbcwatchdogperipheral",
        name: "SbcWatchdogPeripheral",
        displayName: "SbcWatchdogPeripheral",
        description: "SbcWatchdogPeripheral 配置容器",
        parameters: [
          {
            id: "sbcwatchdogperipheralid",
            name: "SbcWatchdogPeripheralId",
            displayName: "SbcWatchdogPeripheralId",
            description: "SbcWatchdogPeripheralId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "sbcwatchdogtriggeroffset",
            name: "SbcWatchdogTriggerOffset",
            displayName: "SbcWatchdogTriggerOffset",
            description: "SbcWatchdogTriggerOffset 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "sbcwatchdoginitialmode",
            name: "SbcWatchdogInitialMode",
            displayName: "SbcWatchdogInitialMode",
            description: "SbcWatchdogInitialMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "sbccantrcvperipheral",
        name: "SbcCanTrcvPeripheral",
        displayName: "SbcCanTrcvPeripheral",
        description: "SbcCanTrcvPeripheral 配置容器",
        parameters: [
          {
            id: "sbccantrcvperipheralid",
            name: "SbcCanTrcvPeripheralId",
            displayName: "SbcCanTrcvPeripheralId",
            description: "SbcCanTrcvPeripheralId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  },
{
    id: "spi",
    name: "Spi",
    displayName: "SPI Driver",
    description: "Spi Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "commonpublishedinformation",
        name: "CommonPublishedInformation",
        displayName: "CommonPublishedInformation",
        description: "CommonPublishedInformation 配置容器",
        parameters: [
          {
            id: "arreleasemajorversion",
            name: "ArReleaseMajorVersion",
            displayName: "ArReleaseMajorVersion",
            description: "ArReleaseMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaseminorversion",
            name: "ArReleaseMinorVersion",
            displayName: "ArReleaseMinorVersion",
            description: "ArReleaseMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "arreleaserevisionversion",
            name: "ArReleaseRevisionVersion",
            displayName: "ArReleaseRevisionVersion",
            description: "ArReleaseRevisionVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "moduleid",
            name: "ModuleId",
            displayName: "ModuleId",
            description: "ModuleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swmajorversion",
            name: "SwMajorVersion",
            displayName: "SwMajorVersion",
            description: "SwMajorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swminorversion",
            name: "SwMinorVersion",
            displayName: "SwMinorVersion",
            description: "SwMinorVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "swpatchversion",
            name: "SwPatchVersion",
            displayName: "SwPatchVersion",
            description: "SwPatchVersion 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "vendorid",
            name: "VendorId",
            displayName: "VendorId",
            description: "VendorId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "spichannellist-0",
        name: "SpiChannelList_0",
        displayName: "SpiChannelList_0",
        description: "SpiChannelList_0 配置容器",
        parameters: [
          {
            id: "spichannelindex",
            name: "SpiChannelIndex",
            displayName: "SpiChannelIndex",
            description: "SpiChannelIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "spichannel-flash",
        name: "SpiChannel_Flash",
        displayName: "SpiChannel_Flash",
        description: "SpiChannel_Flash 配置容器",
        parameters: [
          {
            id: "spichannelid",
            name: "SpiChannelId",
            displayName: "SpiChannelId",
            description: "SpiChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spidatawidth",
            name: "SpiDataWidth",
            displayName: "SpiDataWidth",
            description: "SpiDataWidth 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiebmaxlength",
            name: "SpiEbMaxLength",
            displayName: "SpiEbMaxLength",
            description: "SpiEbMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiibnbuffers",
            name: "SpiIbNBuffers",
            displayName: "SpiIbNBuffers",
            description: "SpiIbNBuffers 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichanneltype",
            name: "SpiChannelType",
            displayName: "SpiChannelType",
            description: "SpiChannelType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitransferstart",
            name: "SpiTransferStart",
            displayName: "SpiTransferStart",
            description: "SpiTransferStart 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spichannel-se",
        name: "SpiChannel_SE",
        displayName: "SpiChannel_SE",
        description: "SpiChannel_SE 配置容器",
        parameters: [
          {
            id: "spichannelid",
            name: "SpiChannelId",
            displayName: "SpiChannelId",
            description: "SpiChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spidatawidth",
            name: "SpiDataWidth",
            displayName: "SpiDataWidth",
            description: "SpiDataWidth 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiebmaxlength",
            name: "SpiEbMaxLength",
            displayName: "SpiEbMaxLength",
            description: "SpiEbMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiibnbuffers",
            name: "SpiIbNBuffers",
            displayName: "SpiIbNBuffers",
            description: "SpiIbNBuffers 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichanneltype",
            name: "SpiChannelType",
            displayName: "SpiChannelType",
            description: "SpiChannelType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitransferstart",
            name: "SpiTransferStart",
            displayName: "SpiTransferStart",
            description: "SpiTransferStart 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spichannel-uwb",
        name: "SpiChannel_UWB",
        displayName: "SpiChannel_UWB",
        description: "SpiChannel_UWB 配置容器",
        parameters: [
          {
            id: "spichannelid",
            name: "SpiChannelId",
            displayName: "SpiChannelId",
            description: "SpiChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spidatawidth",
            name: "SpiDataWidth",
            displayName: "SpiDataWidth",
            description: "SpiDataWidth 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiebmaxlength",
            name: "SpiEbMaxLength",
            displayName: "SpiEbMaxLength",
            description: "SpiEbMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiibnbuffers",
            name: "SpiIbNBuffers",
            displayName: "SpiIbNBuffers",
            description: "SpiIbNBuffers 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichanneltype",
            name: "SpiChannelType",
            displayName: "SpiChannelType",
            description: "SpiChannelType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitransferstart",
            name: "SpiTransferStart",
            displayName: "SpiTransferStart",
            description: "SpiTransferStart 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spidriver",
        name: "SpiDriver",
        displayName: "SpiDriver",
        description: "SpiDriver 配置容器",
        parameters: [
          {
            id: "spimaxchannel",
            name: "SpiMaxChannel",
            displayName: "SpiMaxChannel",
            description: "SpiMaxChannel 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spimaxjob",
            name: "SpiMaxJob",
            displayName: "SpiMaxJob",
            description: "SpiMaxJob 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spimaxsequence",
            name: "SpiMaxSequence",
            displayName: "SpiMaxSequence",
            description: "SpiMaxSequence 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichannelid",
            name: "SpiChannelId",
            displayName: "SpiChannelId",
            description: "SpiChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spidatawidth",
            name: "SpiDataWidth",
            displayName: "SpiDataWidth",
            description: "SpiDataWidth 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiebmaxlength",
            name: "SpiEbMaxLength",
            displayName: "SpiEbMaxLength",
            description: "SpiEbMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiibnbuffers",
            name: "SpiIbNBuffers",
            displayName: "SpiIbNBuffers",
            description: "SpiIbNBuffers 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spibaudrate",
            name: "SpiBaudrate",
            displayName: "SpiBaudrate",
            description: "SpiBaudrate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spibaudratealternate",
            name: "SpiBaudrateAlternate",
            displayName: "SpiBaudrateAlternate",
            description: "SpiBaudrateAlternate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spienablecs",
            name: "SpiEnableCs",
            displayName: "SpiEnableCs",
            description: "SpiEnableCs 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spislavemode",
            name: "SpiSlaveMode",
            displayName: "SpiSlaveMode",
            description: "SpiSlaveMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spitimeclk2cs",
            name: "SpiTimeClk2Cs",
            displayName: "SpiTimeClk2Cs",
            description: "SpiTimeClk2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2clk",
            name: "SpiTimeCs2Clk",
            displayName: "SpiTimeCs2Clk",
            description: "SpiTimeCs2Clk 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2cs",
            name: "SpiTimeCs2Cs",
            displayName: "SpiTimeCs2Cs",
            description: "SpiTimeCs2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spijobid",
            name: "SpiJobId",
            displayName: "SpiJobId",
            description: "SpiJobId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spijobpriority",
            name: "SpiJobPriority",
            displayName: "SpiJobPriority",
            description: "SpiJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichannelindex",
            name: "SpiChannelIndex",
            displayName: "SpiChannelIndex",
            description: "SpiChannelIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiinterruptiblesequence",
            name: "SpiInterruptibleSequence",
            displayName: "SpiInterruptibleSequence",
            description: "SpiInterruptibleSequence 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spisequenceid",
            name: "SpiSequenceId",
            displayName: "SpiSequenceId",
            description: "SpiSequenceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichanneltype",
            name: "SpiChannelType",
            displayName: "SpiChannelType",
            description: "SpiChannelType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitransferstart",
            name: "SpiTransferStart",
            displayName: "SpiTransferStart",
            description: "SpiTransferStart 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spibyteswap",
            name: "SpiByteSwap",
            displayName: "SpiByteSwap",
            description: "SpiByteSwap 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicscontinous",
            name: "SpiCsContinous",
            displayName: "SpiCsContinous",
            description: "SpiCsContinous 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsidentifier",
            name: "SpiCsIdentifier",
            displayName: "SpiCsIdentifier",
            description: "SpiCsIdentifier 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicspolarity",
            name: "SpiCsPolarity",
            displayName: "SpiCsPolarity",
            description: "SpiCsPolarity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsselection",
            name: "SpiCsSelection",
            displayName: "SpiCsSelection",
            description: "SpiCsSelection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spidatashiftedge",
            name: "SpiDataShiftEdge",
            displayName: "SpiDataShiftEdge",
            description: "SpiDataShiftEdge 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spihwunit",
            name: "SpiHwUnit",
            displayName: "SpiHwUnit",
            description: "SpiHwUnit 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spipinconfig",
            name: "SpiPinConfig",
            displayName: "SpiPinConfig",
            description: "SpiPinConfig 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spishiftclockidlelevel",
            name: "SpiShiftClockIdleLevel",
            displayName: "SpiShiftClockIdleLevel",
            description: "SpiShiftClockIdleLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spiexternaldevice-flash",
        name: "SpiExternalDevice_FLASH",
        displayName: "SpiExternalDevice_FLASH",
        description: "SpiExternalDevice_FLASH 配置容器",
        parameters: [
          {
            id: "spibaudrate",
            name: "SpiBaudrate",
            displayName: "SpiBaudrate",
            description: "SpiBaudrate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spibaudratealternate",
            name: "SpiBaudrateAlternate",
            displayName: "SpiBaudrateAlternate",
            description: "SpiBaudrateAlternate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spienablecs",
            name: "SpiEnableCs",
            displayName: "SpiEnableCs",
            description: "SpiEnableCs 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spislavemode",
            name: "SpiSlaveMode",
            displayName: "SpiSlaveMode",
            description: "SpiSlaveMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spitimeclk2cs",
            name: "SpiTimeClk2Cs",
            displayName: "SpiTimeClk2Cs",
            description: "SpiTimeClk2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2clk",
            name: "SpiTimeCs2Clk",
            displayName: "SpiTimeCs2Clk",
            description: "SpiTimeCs2Clk 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2cs",
            name: "SpiTimeCs2Cs",
            displayName: "SpiTimeCs2Cs",
            description: "SpiTimeCs2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spibyteswap",
            name: "SpiByteSwap",
            displayName: "SpiByteSwap",
            description: "SpiByteSwap 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicscontinous",
            name: "SpiCsContinous",
            displayName: "SpiCsContinous",
            description: "SpiCsContinous 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsidentifier",
            name: "SpiCsIdentifier",
            displayName: "SpiCsIdentifier",
            description: "SpiCsIdentifier 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicspolarity",
            name: "SpiCsPolarity",
            displayName: "SpiCsPolarity",
            description: "SpiCsPolarity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsselection",
            name: "SpiCsSelection",
            displayName: "SpiCsSelection",
            description: "SpiCsSelection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spidatashiftedge",
            name: "SpiDataShiftEdge",
            displayName: "SpiDataShiftEdge",
            description: "SpiDataShiftEdge 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spihwunit",
            name: "SpiHwUnit",
            displayName: "SpiHwUnit",
            description: "SpiHwUnit 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spipinconfig",
            name: "SpiPinConfig",
            displayName: "SpiPinConfig",
            description: "SpiPinConfig 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spishiftclockidlelevel",
            name: "SpiShiftClockIdleLevel",
            displayName: "SpiShiftClockIdleLevel",
            description: "SpiShiftClockIdleLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spiexternaldevice-se",
        name: "SpiExternalDevice_SE",
        displayName: "SpiExternalDevice_SE",
        description: "SpiExternalDevice_SE 配置容器",
        parameters: [
          {
            id: "spibaudrate",
            name: "SpiBaudrate",
            displayName: "SpiBaudrate",
            description: "SpiBaudrate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spibaudratealternate",
            name: "SpiBaudrateAlternate",
            displayName: "SpiBaudrateAlternate",
            description: "SpiBaudrateAlternate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spienablecs",
            name: "SpiEnableCs",
            displayName: "SpiEnableCs",
            description: "SpiEnableCs 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spislavemode",
            name: "SpiSlaveMode",
            displayName: "SpiSlaveMode",
            description: "SpiSlaveMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spitimeclk2cs",
            name: "SpiTimeClk2Cs",
            displayName: "SpiTimeClk2Cs",
            description: "SpiTimeClk2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2clk",
            name: "SpiTimeCs2Clk",
            displayName: "SpiTimeCs2Clk",
            description: "SpiTimeCs2Clk 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2cs",
            name: "SpiTimeCs2Cs",
            displayName: "SpiTimeCs2Cs",
            description: "SpiTimeCs2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spibyteswap",
            name: "SpiByteSwap",
            displayName: "SpiByteSwap",
            description: "SpiByteSwap 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicscontinous",
            name: "SpiCsContinous",
            displayName: "SpiCsContinous",
            description: "SpiCsContinous 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsidentifier",
            name: "SpiCsIdentifier",
            displayName: "SpiCsIdentifier",
            description: "SpiCsIdentifier 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicspolarity",
            name: "SpiCsPolarity",
            displayName: "SpiCsPolarity",
            description: "SpiCsPolarity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsselection",
            name: "SpiCsSelection",
            displayName: "SpiCsSelection",
            description: "SpiCsSelection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spidatashiftedge",
            name: "SpiDataShiftEdge",
            displayName: "SpiDataShiftEdge",
            description: "SpiDataShiftEdge 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spihwunit",
            name: "SpiHwUnit",
            displayName: "SpiHwUnit",
            description: "SpiHwUnit 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spipinconfig",
            name: "SpiPinConfig",
            displayName: "SpiPinConfig",
            description: "SpiPinConfig 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spishiftclockidlelevel",
            name: "SpiShiftClockIdleLevel",
            displayName: "SpiShiftClockIdleLevel",
            description: "SpiShiftClockIdleLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spiexternaldevice-uwb",
        name: "SpiExternalDevice_UWB",
        displayName: "SpiExternalDevice_UWB",
        description: "SpiExternalDevice_UWB 配置容器",
        parameters: [
          {
            id: "spibaudrate",
            name: "SpiBaudrate",
            displayName: "SpiBaudrate",
            description: "SpiBaudrate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spibaudratealternate",
            name: "SpiBaudrateAlternate",
            displayName: "SpiBaudrateAlternate",
            description: "SpiBaudrateAlternate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spienablecs",
            name: "SpiEnableCs",
            displayName: "SpiEnableCs",
            description: "SpiEnableCs 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spislavemode",
            name: "SpiSlaveMode",
            displayName: "SpiSlaveMode",
            description: "SpiSlaveMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spitimeclk2cs",
            name: "SpiTimeClk2Cs",
            displayName: "SpiTimeClk2Cs",
            description: "SpiTimeClk2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2clk",
            name: "SpiTimeCs2Clk",
            displayName: "SpiTimeCs2Clk",
            description: "SpiTimeCs2Clk 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spitimecs2cs",
            name: "SpiTimeCs2Cs",
            displayName: "SpiTimeCs2Cs",
            description: "SpiTimeCs2Cs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spibyteswap",
            name: "SpiByteSwap",
            displayName: "SpiByteSwap",
            description: "SpiByteSwap 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicscontinous",
            name: "SpiCsContinous",
            displayName: "SpiCsContinous",
            description: "SpiCsContinous 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsidentifier",
            name: "SpiCsIdentifier",
            displayName: "SpiCsIdentifier",
            description: "SpiCsIdentifier 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicspolarity",
            name: "SpiCsPolarity",
            displayName: "SpiCsPolarity",
            description: "SpiCsPolarity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spicsselection",
            name: "SpiCsSelection",
            displayName: "SpiCsSelection",
            description: "SpiCsSelection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spidatashiftedge",
            name: "SpiDataShiftEdge",
            displayName: "SpiDataShiftEdge",
            description: "SpiDataShiftEdge 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spihwunit",
            name: "SpiHwUnit",
            displayName: "SpiHwUnit",
            description: "SpiHwUnit 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spipinconfig",
            name: "SpiPinConfig",
            displayName: "SpiPinConfig",
            description: "SpiPinConfig 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spishiftclockidlelevel",
            name: "SpiShiftClockIdleLevel",
            displayName: "SpiShiftClockIdleLevel",
            description: "SpiShiftClockIdleLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spigeneral",
        name: "SpiGeneral",
        displayName: "SpiGeneral",
        description: "SpiGeneral 配置容器",
        parameters: [
          {
            id: "spicancelapi",
            name: "SpiCancelApi",
            displayName: "SpiCancelApi",
            description: "SpiCancelApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spichannelbuffersallowed",
            name: "SpiChannelBuffersAllowed",
            displayName: "SpiChannelBuffersAllowed",
            description: "SpiChannelBuffersAllowed 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spideverrordetect",
            name: "SpiDevErrorDetect",
            displayName: "SpiDevErrorDetect",
            description: "SpiDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spiglobaldmaenable",
            name: "SpiGlobalDmaEnable",
            displayName: "SpiGlobalDmaEnable",
            description: "SpiGlobalDmaEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spihwstatusapi",
            name: "SpiHwStatusApi",
            displayName: "SpiHwStatusApi",
            description: "SpiHwStatusApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spiinterruptibleseqallowed",
            name: "SpiInterruptibleSeqAllowed",
            displayName: "SpiInterruptibleSeqAllowed",
            description: "SpiInterruptibleSeqAllowed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spileveldelivered",
            name: "SpiLevelDelivered",
            displayName: "SpiLevelDelivered",
            description: "SpiLevelDelivered 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spioptimizeonejobsequences",
            name: "SpiOptimizeOneJobSequences",
            displayName: "SpiOptimizeOneJobSequences",
            description: "SpiOptimizeOneJobSequences 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spioptimizedchannelsnumber",
            name: "SpiOptimizedChannelsNumber",
            displayName: "SpiOptimizedChannelsNumber",
            description: "SpiOptimizedChannelsNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spioptimizedseqnumber",
            name: "SpiOptimizedSeqNumber",
            displayName: "SpiOptimizedSeqNumber",
            description: "SpiOptimizedSeqNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spisupportconcurrentsynctransmit",
            name: "SpiSupportConcurrentSyncTransmit",
            displayName: "SpiSupportConcurrentSyncTransmit",
            description: "SpiSupportConcurrentSyncTransmit 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spitransmittimeout",
            name: "SpiTransmitTimeout",
            displayName: "SpiTransmitTimeout",
            description: "SpiTransmitTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spiversioninfoapi",
            name: "SpiVersionInfoApi",
            displayName: "SpiVersionInfoApi",
            description: "SpiVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spiphyunitsync",
            name: "SpiPhyUnitSync",
            displayName: "SpiPhyUnitSync",
            description: "SpiPhyUnitSync 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spiflexioclkpinselect",
            name: "SpiFlexioClkPinSelect",
            displayName: "SpiFlexioClkPinSelect",
            description: "SpiFlexioClkPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexioclkpinselectslave",
            name: "SpiFlexioClkPinSelectSlave",
            displayName: "SpiFlexioClkPinSelectSlave",
            description: "SpiFlexioClkPinSelectSlave 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiocspinselect",
            name: "SpiFlexioCsPinSelect",
            displayName: "SpiFlexioCsPinSelect",
            description: "SpiFlexioCsPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiocspinselectslave",
            name: "SpiFlexioCsPinSelectSlave",
            displayName: "SpiFlexioCsPinSelectSlave",
            description: "SpiFlexioCsPinSelectSlave 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiorxpinselect",
            name: "SpiFlexioRxPinSelect",
            displayName: "SpiFlexioRxPinSelect",
            description: "SpiFlexioRxPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiotxpinselect",
            name: "SpiFlexioTxPinSelect",
            displayName: "SpiFlexioTxPinSelect",
            description: "SpiFlexioTxPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiphyunitasyncmethod",
            name: "SpiPhyUnitAsyncMethod",
            displayName: "SpiPhyUnitAsyncMethod",
            description: "SpiPhyUnitAsyncMethod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiphyunitmapping",
            name: "SpiPhyUnitMapping",
            displayName: "SpiPhyUnitMapping",
            description: "SpiPhyUnitMapping 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiphyunitmode",
            name: "SpiPhyUnitMode",
            displayName: "SpiPhyUnitMode",
            description: "SpiPhyUnitMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "spijob-flash",
        name: "SpiJob_Flash",
        displayName: "SpiJob_Flash",
        description: "SpiJob_Flash 配置容器",
        parameters: [
          {
            id: "spijobid",
            name: "SpiJobId",
            displayName: "SpiJobId",
            description: "SpiJobId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spijobpriority",
            name: "SpiJobPriority",
            displayName: "SpiJobPriority",
            description: "SpiJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichannelindex",
            name: "SpiChannelIndex",
            displayName: "SpiChannelIndex",
            description: "SpiChannelIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "spijob-se",
        name: "SpiJob_SE",
        displayName: "SpiJob_SE",
        description: "SpiJob_SE 配置容器",
        parameters: [
          {
            id: "spijobid",
            name: "SpiJobId",
            displayName: "SpiJobId",
            description: "SpiJobId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spijobpriority",
            name: "SpiJobPriority",
            displayName: "SpiJobPriority",
            description: "SpiJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichannelindex",
            name: "SpiChannelIndex",
            displayName: "SpiChannelIndex",
            description: "SpiChannelIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "spijob-uwb",
        name: "SpiJob_UWB",
        displayName: "SpiJob_UWB",
        description: "SpiJob_UWB 配置容器",
        parameters: [
          {
            id: "spijobid",
            name: "SpiJobId",
            displayName: "SpiJobId",
            description: "SpiJobId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spijobpriority",
            name: "SpiJobPriority",
            displayName: "SpiJobPriority",
            description: "SpiJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "spichannelindex",
            name: "SpiChannelIndex",
            displayName: "SpiChannelIndex",
            description: "SpiChannelIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          }
        ],
        multiple: false
      },
      {
        id: "spinonautosar",
        name: "SpiNonAUTOSAR",
        displayName: "SpiNonAUTOSAR",
        description: "SpiNonAUTOSAR 配置容器",
        parameters: [
          {
            id: "spiallowbigsizecollections",
            name: "SpiAllowBigSizeCollections",
            displayName: "SpiAllowBigSizeCollections",
            description: "SpiAllowBigSizeCollections 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spidisabledemreporterrorstatus",
            name: "SpiDisableDemReportErrorStatus",
            displayName: "SpiDisableDemReportErrorStatus",
            description: "SpiDisableDemReportErrorStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spienablehwunitasyncmode",
            name: "SpiEnableHWUnitAsyncMode",
            displayName: "SpiEnableHWUnitAsyncMode",
            description: "SpiEnableHWUnitAsyncMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spienableusermodesupport",
            name: "SpiEnableUserModeSupport",
            displayName: "SpiEnableUserModeSupport",
            description: "SpiEnableUserModeSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spiforcedatatype",
            name: "SpiForceDataType",
            displayName: "SpiForceDataType",
            description: "SpiForceDataType 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spijobstartnotificationenable",
            name: "SpiJobStartNotificationEnable",
            displayName: "SpiJobStartNotificationEnable",
            description: "SpiJobStartNotificationEnable 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "spiphyunit-0",
        name: "SpiPhyUnit_0",
        displayName: "SpiPhyUnit_0",
        description: "SpiPhyUnit_0 配置容器",
        parameters: [
          {
            id: "spiphyunitsync",
            name: "SpiPhyUnitSync",
            displayName: "SpiPhyUnitSync",
            description: "SpiPhyUnitSync 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "spiflexioclkpinselect",
            name: "SpiFlexioClkPinSelect",
            displayName: "SpiFlexioClkPinSelect",
            description: "SpiFlexioClkPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexioclkpinselectslave",
            name: "SpiFlexioClkPinSelectSlave",
            displayName: "SpiFlexioClkPinSelectSlave",
            description: "SpiFlexioClkPinSelectSlave 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiocspinselect",
            name: "SpiFlexioCsPinSelect",
            displayName: "SpiFlexioCsPinSelect",
            description: "SpiFlexioCsPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiocspinselectslave",
            name: "SpiFlexioCsPinSelectSlave",
            displayName: "SpiFlexioCsPinSelectSlave",
            description: "SpiFlexioCsPinSelectSlave 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiorxpinselect",
            name: "SpiFlexioRxPinSelect",
            displayName: "SpiFlexioRxPinSelect",
            description: "SpiFlexioRxPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiflexiotxpinselect",
            name: "SpiFlexioTxPinSelect",
            displayName: "SpiFlexioTxPinSelect",
            description: "SpiFlexioTxPinSelect 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiphyunitasyncmethod",
            name: "SpiPhyUnitAsyncMethod",
            displayName: "SpiPhyUnitAsyncMethod",
            description: "SpiPhyUnitAsyncMethod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiphyunitmapping",
            name: "SpiPhyUnitMapping",
            displayName: "SpiPhyUnitMapping",
            description: "SpiPhyUnitMapping 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "spiphyunitmode",
            name: "SpiPhyUnitMode",
            displayName: "SpiPhyUnitMode",
            description: "SpiPhyUnitMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      }
    ],
    dependencies: [],
    createdAt: "2025-05-21T00:00:00Z",
    updatedAt: "2025-05-21T00:00:00Z",
    configStatus: "unconfigured"
  }
]

export const moduleNames = allModules.map(m => m.name)
export const moduleCount = allModules.length
