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
    description: "BLE 驱动",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "bleglobalconfig",
        name: "BleGlobalConfig",
        displayName: "BleGlobalConfig",
        description: "BleGlobalConfig 配置容器",
        parameters: [
          {
            id: "bleavertisingdefaulttxpower",
            name: "BleAvertisingDefaultTxPower",
            displayName: "BleAvertisingDefaultTxPower",
            description: "BleAvertisingDefaultTxPower 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bleconnectiondefaulttxpower",
            name: "BleConnectionDefaultTxPower",
            displayName: "BleConnectionDefaultTxPower",
            description: "BleConnectionDefaultTxPower 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blecontrollerwakeupdelay",
            name: "BleControllerWakeUpDelay",
            displayName: "BleControllerWakeUpDelay",
            description: "BleControllerWakeUpDelay 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bledirecttestmode",
            name: "BleDirectTestMode",
            displayName: "BleDirectTestMode",
            description: "BleDirectTestMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bledisablecontrollerlowpower",
            name: "BleDisableControllerLowPower",
            displayName: "BleDisableControllerLowPower",
            description: "BleDisableControllerLowPower 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blehcicommandflowcontrol",
            name: "BleHciCommandFlowControl",
            displayName: "BleHciCommandFlowControl",
            description: "BleHciCommandFlowControl 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blehcitimeoutms",
            name: "BleHciTimeoutMs",
            displayName: "BleHciTimeoutMs",
            description: "BleHciTimeoutMs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bleinvalidpduhandling",
            name: "BleInvalidPduHandling",
            displayName: "BleInvalidPduHandling",
            description: "BleInvalidPduHandling 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blell32mhzwakeupadvancehslot",
            name: "BleLl32MhzWakeupAdvanceHslot",
            displayName: "BleLl32MhzWakeupAdvanceHslot",
            description: "BleLl32MhzWakeupAdvanceHslot 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blemaxtxpower",
            name: "BleMaxTxPower",
            displayName: "BleMaxTxPower",
            description: "BleMaxTxPower 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blerpmsgremotereadyretrycount",
            name: "BleRpmsgRemoteReadyRetryCount",
            displayName: "BleRpmsgRemoteReadyRetryCount",
            description: "BleRpmsgRemoteReadyRetryCount 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blextal32kstartuptimeout",
            name: "BleXtal32KStartupTimeout",
            displayName: "BleXtal32KStartupTimeout",
            description: "BleXtal32KStartupTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blextal32mstartuptimeout",
            name: "BleXtal32MStartupTimeout",
            displayName: "BleXtal32MStartupTimeout",
            description: "BleXtal32MStartupTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blextaltrimvalue",
            name: "BleXtalTrimValue",
            displayName: "BleXtalTrimValue",
            description: "BleXtalTrimValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "controllertriggerreseed",
            name: "ControllerTriggerReseed",
            displayName: "ControllerTriggerReseed",
            description: "ControllerTriggerReseed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "platformactivereqtimeoutus",
            name: "PlatformActiveReqTimeoutUs",
            displayName: "PlatformActiveReqTimeoutUs",
            description: "PlatformActiveReqTimeoutUs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blebdaddress",
            name: "BleBDAddress",
            displayName: "BleBDAddress",
            description: "BleBDAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "blecontrollerversionnotification",
            name: "BleControllerVersionNotification",
            displayName: "BleControllerVersionNotification",
            description: "BleControllerVersionNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "bleerrornotification",
            name: "BleErrorNotification",
            displayName: "BleErrorNotification",
            description: "BleErrorNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "bletimedelay",
            name: "BleTimeDelay",
            displayName: "BleTimeDelay",
            description: "BleTimeDelay 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "controllerissuenotification",
            name: "ControllerIssueNotification",
            displayName: "ControllerIssueNotification",
            description: "ControllerIssueNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "controllermemoryerrornotification",
            name: "ControllerMemoryErrorNotification",
            displayName: "ControllerMemoryErrorNotification",
            description: "ControllerMemoryErrorNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "platformerrornotification",
            name: "PlatformErrorNotification",
            displayName: "PlatformErrorNotification",
            description: "PlatformErrorNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "blehostconfiguration",
        name: "BleHostConfiguration",
        displayName: "BleHostConfiguration",
        description: "BleHostConfiguration 配置容器",
        parameters: [
          {
            id: "ble50compatible",
            name: "Ble50Compatible",
            displayName: "Ble50Compatible",
            description: "Ble50Compatible 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bleappeattdefaultmtu",
            name: "BleAppEattDefaultMtu",
            displayName: "BleAppEattDefaultMtu",
            description: "BleAppEattDefaultMtu 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bleappeattmaxnoofbearers",
            name: "BleAppEattMaxNoOfBearers",
            displayName: "BleAppEattMaxNoOfBearers",
            description: "BleAppEattMaxNoOfBearers 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bleappmaxactiveconnectionseatt",
            name: "BleAppMaxActiveConnectionsEatt",
            displayName: "BleAppMaxActiveConnectionsEatt",
            description: "BleAppMaxActiveConnectionsEatt 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bleappmaxactiveconnectionsgattcaching",
            name: "BleAppMaxActiveConnectionsGattCaching",
            displayName: "BleAppMaxActiveConnectionsGattCaching",
            description: "BleAppMaxActiveConnectionsGattCaching 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bleappmaxconnections",
            name: "BleAppMaxConnections",
            displayName: "BleAppMaxConnections",
            description: "BleAppMaxConnections 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blechannelsounding",
            name: "BleChannelSounding",
            displayName: "BleChannelSounding",
            description: "BleChannelSounding 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blecontrollerprivacytimeout",
            name: "BleControllerPrivacyTimeout",
            displayName: "BleControllerPrivacyTimeout",
            description: "BleControllerPrivacyTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bledefaulttxoctets",
            name: "BleDefaultTxOctets",
            displayName: "BleDefaultTxOctets",
            description: "BleDefaultTxOctets 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bledefaulttxtime",
            name: "BleDefaultTxTime",
            displayName: "BleDefaultTxTime",
            description: "BleDefaultTxTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bleeatt",
            name: "BleEatt",
            displayName: "BleEatt",
            description: "BleEatt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blegapmaxservicespecificsecurityrequirements",
            name: "BleGapMaxServiceSpecificSecurityRequirements",
            displayName: "BleGapMaxServiceSpecificSecurityRequirements",
            description: "BleGapMaxServiceSpecificSecurityRequirements 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blegapmaximumactiveconnections",
            name: "BleGapMaximumActiveConnections",
            displayName: "BleGapMaximumActiveConnections",
            description: "BleGapMaximumActiveConnections 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blegapsimultaneouseachainedreports",
            name: "BleGapSimultaneousEachainedReports",
            displayName: "BleGapSimultaneousEachainedReports",
            description: "BleGapSimultaneousEachainedReports 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blegattcaching",
            name: "BleGattCaching",
            displayName: "BleGattCaching",
            description: "BleGattCaching 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blegcappmaximumbondeddevicesgattcaching",
            name: "BleGcAppMaximumBondedDevicesGattCaching",
            displayName: "BleGcAppMaximumBondedDevicesGattCaching",
            description: "BleGcAppMaximumBondedDevicesGattCaching 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blehostautorejectltkrequestforunbondeddevices",
            name: "BleHostAutoRejectLtkRequestForUnbondedDevices",
            displayName: "BleHostAutoRejectLtkRequestForUnbondedDevices",
            description: "BleHostAutoRejectLtkRequestForUnbondedDevices 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blehostextadvusesamerandomaddr",
            name: "BleHostExtAdvUseSameRandomAddr",
            displayName: "BleHostExtAdvUseSameRandomAddr",
            description: "BleHostExtAdvUseSameRandomAddr 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blehostfreeeareporttimeoutms",
            name: "BleHostFreeEareportTimeoutMs",
            displayName: "BleHostFreeEareportTimeoutMs",
            description: "BleHostFreeEareportTimeoutMs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blehostprivacytimeout",
            name: "BleHostPrivacyTimeout",
            displayName: "BleHostPrivacyTimeout",
            description: "BleHostPrivacyTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blel2calowpeercreditsthreshold",
            name: "BleL2caLowPeerCreditsThreshold",
            displayName: "BleL2caLowPeerCreditsThreshold",
            description: "BleL2caLowPeerCreditsThreshold 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blel2camaxlecbchannels",
            name: "BleL2caMaxLeCbChannels",
            displayName: "BleL2caMaxLeCbChannels",
            description: "BleL2caMaxLeCbChannels 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blel2camaxlepsmsupported",
            name: "BleL2caMaxLePsmSupported",
            displayName: "BleL2caMaxLePsmSupported",
            description: "BleL2caMaxLePsmSupported 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blelescoobhasmitmprotection",
            name: "BleLeScOobHasMitmProtection",
            displayName: "BleLeScOobHasMitmProtection",
            description: "BleLeScOobHasMitmProtection 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "blemaxadvreportqueuesize",
            name: "BleMaxAdvReportQueueSize",
            displayName: "BleMaxAdvReportQueueSize",
            description: "BleMaxAdvReportQueueSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blemaxbondeddevices",
            name: "BleMaxBondedDevices",
            displayName: "BleMaxBondedDevices",
            description: "BleMaxBondedDevices 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blemaxl2caqueuesize",
            name: "BleMaxL2caQueueSize",
            displayName: "BleMaxL2caQueueSize",
            description: "BleMaxL2caQueueSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blemaxnonbondeddevices",
            name: "BleMaxNonBondedDevices",
            displayName: "BleMaxNonBondedDevices",
            description: "BleMaxNonBondedDevices 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blemaxreadnotificationhandles",
            name: "BleMaxReadNotificationHandles",
            displayName: "BleMaxReadNotificationHandles",
            description: "BleMaxReadNotificationHandles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blemaxresolvinglistsize",
            name: "BleMaxResolvingListSize",
            displayName: "BleMaxResolvingListSize",
            description: "BleMaxResolvingListSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blemaxwritenotificationhandles",
            name: "BleMaxWriteNotificationHandles",
            displayName: "BleMaxWriteNotificationHandles",
            description: "BleMaxWriteNotificationHandles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blepreparewritequeuesize",
            name: "BlePrepareWriteQueueSize",
            displayName: "BlePrepareWriteQueueSize",
            description: "BlePrepareWriteQueueSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "blegeneralcallback",
            name: "BleGeneralCallback",
            displayName: "BleGeneralCallback",
            description: "BleGeneralCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "blehostinitreset",
            name: "BleHostInitReset",
            displayName: "BleHostInitReset",
            description: "BleHostInitReset 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
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
          },
          {
            id: "vendorapiinfix",
            name: "VendorApiInfix",
            displayName: "VendorApiInfix",
            description: "VendorApiInfix 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptoconfiguration",
        name: "CryptoConfiguration",
        displayName: "CryptoConfiguration",
        description: "CryptoConfiguration 配置容器",
        parameters: [
          {
            id: "blesecuremode",
            name: "BleSecureMode",
            displayName: "BleSecureMode",
            description: "BleSecureMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptojobidforaescmac",
            name: "CryptoJobIdForAesCmac",
            displayName: "CryptoJobIdForAesCmac",
            description: "CryptoJobIdForAesCmac 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptojobidforaesecb",
            name: "CryptoJobIdForAesEcb",
            displayName: "CryptoJobIdForAesEcb",
            description: "CryptoJobIdForAesEcb 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptojobidforrng",
            name: "CryptoJobIdForRng",
            displayName: "CryptoJobIdForRng",
            description: "CryptoJobIdForRng 参数",
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
        id: "gattdbatt-0",
        name: "GattDBAtt_0",
        displayName: "GattDBAtt_0",
        description: "GattDBAtt_0 配置容器",
        parameters: [
          {
            id: "attcharacteristicproperties",
            name: "AttCharacteristicProperties",
            displayName: "AttCharacteristicProperties",
            description: "AttCharacteristicProperties 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attpermissions",
            name: "AttPermissions",
            displayName: "AttPermissions",
            description: "AttPermissions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attvaluemaxlength",
            name: "AttValueMaxLength",
            displayName: "AttValueMaxLength",
            description: "AttValueMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "atttype",
            name: "AttType",
            displayName: "AttType",
            description: "AttType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attuuid",
            name: "AttUuid",
            displayName: "AttUuid",
            description: "AttUuid 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attvalue",
            name: "AttValue",
            displayName: "AttValue",
            description: "AttValue 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gattdbatt-1",
        name: "GattDBAtt_1",
        displayName: "GattDBAtt_1",
        description: "GattDBAtt_1 配置容器",
        parameters: [
          {
            id: "attcharacteristicproperties",
            name: "AttCharacteristicProperties",
            displayName: "AttCharacteristicProperties",
            description: "AttCharacteristicProperties 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attpermissions",
            name: "AttPermissions",
            displayName: "AttPermissions",
            description: "AttPermissions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attvaluemaxlength",
            name: "AttValueMaxLength",
            displayName: "AttValueMaxLength",
            description: "AttValueMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "atttype",
            name: "AttType",
            displayName: "AttType",
            description: "AttType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attuuid",
            name: "AttUuid",
            displayName: "AttUuid",
            description: "AttUuid 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attvalue",
            name: "AttValue",
            displayName: "AttValue",
            description: "AttValue 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gattdbatt-2",
        name: "GattDBAtt_2",
        displayName: "GattDBAtt_2",
        description: "GattDBAtt_2 配置容器",
        parameters: [
          {
            id: "attcharacteristicproperties",
            name: "AttCharacteristicProperties",
            displayName: "AttCharacteristicProperties",
            description: "AttCharacteristicProperties 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attpermissions",
            name: "AttPermissions",
            displayName: "AttPermissions",
            description: "AttPermissions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attvaluemaxlength",
            name: "AttValueMaxLength",
            displayName: "AttValueMaxLength",
            description: "AttValueMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "atttype",
            name: "AttType",
            displayName: "AttType",
            description: "AttType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attuuid",
            name: "AttUuid",
            displayName: "AttUuid",
            description: "AttUuid 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attvalue",
            name: "AttValue",
            displayName: "AttValue",
            description: "AttValue 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "gattdbconfiguration1",
        name: "GattDBConfiguration1",
        displayName: "GattDBConfiguration1",
        description: "GattDBConfiguration1 配置容器",
        parameters: [
          {
            id: "attcharacteristicproperties",
            name: "AttCharacteristicProperties",
            displayName: "AttCharacteristicProperties",
            description: "AttCharacteristicProperties 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attpermissions",
            name: "AttPermissions",
            displayName: "AttPermissions",
            description: "AttPermissions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attvaluemaxlength",
            name: "AttValueMaxLength",
            displayName: "AttValueMaxLength",
            description: "AttValueMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "atttype",
            name: "AttType",
            displayName: "AttType",
            description: "AttType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attuuid",
            name: "AttUuid",
            displayName: "AttUuid",
            description: "AttUuid 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attvalue",
            name: "AttValue",
            displayName: "AttValue",
            description: "AttValue 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "generalconfiguration",
        name: "GeneralConfiguration",
        displayName: "GeneralConfiguration",
        description: "GeneralConfiguration 配置容器",
        parameters: [
          {
            id: "bledeverrordetect",
            name: "BleDevErrorDetect",
            displayName: "BleDevErrorDetect",
            description: "BleDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bledisabledemreporterrorstatus",
            name: "BleDisableDemReportErrorStatus",
            displayName: "BleDisableDemReportErrorStatus",
            description: "BleDisableDemReportErrorStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bleversioninfoapi",
            name: "BleVersionInfoApi",
            displayName: "BleVersionInfoApi",
            description: "BleVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "lowpowerconfiguration",
        name: "LowPowerConfiguration",
        displayName: "LowPowerConfiguration",
        description: "LowPowerConfiguration 配置容器",
        parameters: [
          {
            id: "bleenterlowpowercritical",
            name: "BleEnterLowPowerCritical",
            displayName: "BleEnterLowPowerCritical",
            description: "BleEnterLowPowerCritical 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "bleexitlowpowercritical",
            name: "BleExitLowPowerCritical",
            displayName: "BleExitLowPowerCritical",
            description: "BleExitLowPowerCritical 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "memoryconfiguration",
        name: "MemoryConfiguration",
        displayName: "MemoryConfiguration",
        description: "MemoryConfiguration 配置容器",
        parameters: [
          {
            id: "memorypoolsize",
            name: "MemoryPoolSize",
            displayName: "MemoryPoolSize",
            description: "MemoryPoolSize 参数",
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
        id: "nvmconfiguration",
        name: "NVMConfiguration",
        displayName: "NVMConfiguration",
        description: "NVMConfiguration 配置容器",
        parameters: [
          {
            id: "nvmdataclear",
            name: "NvmDataClear",
            displayName: "NvmDataClear",
            description: "NvmDataClear 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmdataload",
            name: "NvmDataLoad",
            displayName: "NvmDataLoad",
            description: "NvmDataLoad 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmdatasave",
            name: "NvmDataSave",
            displayName: "NvmDataSave",
            description: "NvmDataSave 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "nbulowpowerconfiguration",
        name: "NbuLowPowerConfiguration",
        displayName: "NbuLowPowerConfiguration",
        description: "NbuLowPowerConfiguration 配置容器",
        parameters: [
          {
            id: "blenbureleaselowpowerconstraint",
            name: "BleNbuReleaseLowPowerConstraint",
            displayName: "BleNbuReleaseLowPowerConstraint",
            description: "BleNbuReleaseLowPowerConstraint 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "blenbusetlowpowerconstraint",
            name: "BleNbuSetLowPowerConstraint",
            displayName: "BleNbuSetLowPowerConstraint",
            description: "BleNbuSetLowPowerConstraint 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "peripheralconfiguration",
        name: "PeripheralConfiguration",
        displayName: "PeripheralConfiguration",
        description: "PeripheralConfiguration 配置容器",
        parameters: [
          {
            id: "bleperipheralinterruptdisable",
            name: "BlePeripheralInterruptDisable",
            displayName: "BlePeripheralInterruptDisable",
            description: "BlePeripheralInterruptDisable 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "bleperipheralinterruptenable",
            name: "BlePeripheralInterruptEnable",
            displayName: "BlePeripheralInterruptEnable",
            description: "BlePeripheralInterruptEnable 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "app-dk-rx-char",
        name: "app_dk_rx_char",
        displayName: "app_dk_rx_char",
        description: "app_dk_rx_char 配置容器",
        parameters: [
          {
            id: "attcharacteristicproperties",
            name: "AttCharacteristicProperties",
            displayName: "AttCharacteristicProperties",
            description: "AttCharacteristicProperties 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attpermissions",
            name: "AttPermissions",
            displayName: "AttPermissions",
            description: "AttPermissions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "attvaluemaxlength",
            name: "AttValueMaxLength",
            displayName: "AttValueMaxLength",
            description: "AttValueMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "atttype",
            name: "AttType",
            displayName: "AttType",
            description: "AttType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attuuid",
            name: "AttUuid",
            displayName: "AttUuid",
            description: "AttUuid 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "attvalue",
            name: "AttValue",
            displayName: "AttValue",
            description: "AttValue 参数",
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
    id: "bswm",
    name: "Bswm",
    displayName: "BSW Mode Manager",
    description: "BSW 模式管理器",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "al-disable-nm",
        name: "AL_Disable_NM",
        displayName: "AL_Disable_NM",
        description: "AL_Disable_NM 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "al-disable-rx",
        name: "AL_Disable_Rx",
        displayName: "AL_Disable_Rx",
        description: "AL_Disable_Rx 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "al-disable-rx-dm",
        name: "AL_Disable_Rx_DM",
        displayName: "AL_Disable_Rx_DM",
        description: "AL_Disable_Rx_DM 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "al-disable-tx",
        name: "AL_Disable_Tx",
        displayName: "AL_Disable_Tx",
        description: "AL_Disable_Tx 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "al-enable-nm",
        name: "AL_Enable_NM",
        displayName: "AL_Enable_NM",
        description: "AL_Enable_NM 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "al-enable-rx",
        name: "AL_Enable_Rx",
        displayName: "AL_Enable_Rx",
        description: "AL_Enable_Rx 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "al-enable-rx-dm",
        name: "AL_Enable_Rx_DM",
        displayName: "AL_Enable_Rx_DM",
        description: "AL_Enable_Rx_DM 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "al-enable-tx",
        name: "AL_Enable_Tx",
        displayName: "AL_Enable_Tx",
        description: "AL_Enable_Tx 配置容器",
        parameters: [
          {
            id: "bswmactionlistpriority",
            name: "BswMActionListPriority",
            displayName: "BswMActionListPriority",
            description: "BswMActionListPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "bswmactionlistexecution",
            name: "BswMActionListExecution",
            displayName: "BswMActionListExecution",
            description: "BswMActionListExecution 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "action-bswm-nm-disable-dkmm-lhbdcanfd-a9ca9096",
        name: "Action_BSWM_NM_DISABLE_DKMM_LHBDCANFD_a9ca9096",
        displayName: "Action_BSWM_NM_DISABLE_DKMM_LHBDCANFD_a9ca9096",
        description: "Action_BSWM_NM_DISABLE_DKMM_LHBDCANFD_a9ca9096 配置容器",
        parameters: [
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
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
        id: "action-bswm-nm-enable-dkmm-lhbdcanfd-a9ca9096",
        name: "Action_BSWM_NM_ENABLE_DKMM_LHBDCANFD_a9ca9096",
        displayName: "Action_BSWM_NM_ENABLE_DKMM_LHBDCANFD_a9ca9096",
        description: "Action_BSWM_NM_ENABLE_DKMM_LHBDCANFD_a9ca9096 配置容器",
        parameters: [
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
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
        id: "action-disable-bpeps-lhbdcanfd-rx-5db50b44",
        name: "Action_DISABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        displayName: "Action_DISABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        description: "Action_DISABLE_BPEPS_LHBDCANFD_Rx_5db50b44 配置容器",
        parameters: [
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
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
        id: "action-disable-bpeps-lhbdcanfd-tx-0befacc2",
        name: "Action_DISABLE_BPEPS_LHBDCANFD_Tx_0befacc2",
        displayName: "Action_DISABLE_BPEPS_LHBDCANFD_Tx_0befacc2",
        description: "Action_DISABLE_BPEPS_LHBDCANFD_Tx_0befacc2 配置容器",
        parameters: [
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
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
        id: "action-dm-disable-bpeps-lhbdcanfd-rx-5db50b44",
        name: "Action_DM_DISABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        displayName: "Action_DM_DISABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        description: "Action_DM_DISABLE_BPEPS_LHBDCANFD_Rx_5db50b44 配置容器",
        parameters: [
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
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
        id: "action-dm-enable-bpeps-lhbdcanfd-rx-5db50b44",
        name: "Action_DM_ENABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        displayName: "Action_DM_ENABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        description: "Action_DM_ENABLE_BPEPS_LHBDCANFD_Rx_5db50b44 配置容器",
        parameters: [
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
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
        id: "action-enable-bpeps-lhbdcanfd-rx-5db50b44",
        name: "Action_ENABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        displayName: "Action_ENABLE_BPEPS_LHBDCANFD_Rx_5db50b44",
        description: "Action_ENABLE_BPEPS_LHBDCANFD_Rx_5db50b44 配置容器",
        parameters: [
          {
            id: "bswmabortonfail",
            name: "BswMAbortOnFail",
            displayName: "BswMAbortOnFail",
            description: "BswMAbortOnFail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "bswmactionlistitemindex",
            name: "BswMActionListItemIndex",
            displayName: "BswMActionListItemIndex",
            description: "BswMActionListItemIndex 参数",
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
    id: "can",
    name: "Can",
    displayName: "CAN Driver",
    description: "Can Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "canconfigset",
        name: "CanConfigSet",
        displayName: "CanConfigSet",
        description: "CanConfigSet 配置容器",
        parameters: [
          {
            id: "cancontrolleractivation",
            name: "CanControllerActivation",
            displayName: "CanControllerActivation",
            description: "CanControllerActivation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cancontrollerbaseaddress",
            name: "CanControllerBaseAddress",
            displayName: "CanControllerBaseAddress",
            description: "CanControllerBaseAddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerid",
            name: "CanControllerId",
            displayName: "CanControllerId",
            description: "CanControllerId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canwakeupsupport",
            name: "CanWakeupSupport",
            displayName: "CanWakeupSupport",
            description: "CanWakeupSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "canwakeupsourceid",
            name: "CanWakeupSourceId",
            displayName: "CanWakeupSourceId",
            description: "CanWakeupSourceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerbaudrate",
            name: "CanControllerBaudRate",
            displayName: "CanControllerBaudRate",
            description: "CanControllerBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerpropseg",
            name: "CanControllerPropSeg",
            displayName: "CanControllerPropSeg",
            description: "CanControllerPropSeg 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerseg1",
            name: "CanControllerSeg1",
            displayName: "CanControllerSeg1",
            description: "CanControllerSeg1 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerseg2",
            name: "CanControllerSeg2",
            displayName: "CanControllerSeg2",
            description: "CanControllerSeg2 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollersyncjumpwidth",
            name: "CanControllerSyncJumpWidth",
            displayName: "CanControllerSyncJumpWidth",
            description: "CanControllerSyncJumpWidth 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerbaudrateconfigid",
            name: "CanControllerBaudRateConfigID",
            displayName: "CanControllerBaudRateConfigID",
            description: "CanControllerBaudRateConfigID 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canbaudrateclock",
            name: "CanBaudrateClock",
            displayName: "CanBaudrateClock",
            description: "CanBaudrateClock 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canbaudrateprescaler",
            name: "CanBaudratePrescaler",
            displayName: "CanBaudratePrescaler",
            description: "CanBaudratePrescaler 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantasdvalue",
            name: "CanTASDValue",
            displayName: "CanTASDValue",
            description: "CanTASDValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerfdbaudrate",
            name: "CanControllerFdBaudRate",
            displayName: "CanControllerFdBaudRate",
            description: "CanControllerFdBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollertxbitrateswitch",
            name: "CanControllerTxBitRateSwitch",
            displayName: "CanControllerTxBitRateSwitch",
            description: "CanControllerTxBitRateSwitch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "canidvalue",
            name: "CanIdValue",
            displayName: "CanIdValue",
            description: "CanIdValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canobjectid",
            name: "CanObjectId",
            displayName: "CanObjectId",
            description: "CanObjectId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canhwprocessing",
            name: "CanHwProcessing",
            displayName: "CanHwProcessing",
            description: "CanHwProcessing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "canobjecthwsize",
            name: "CanObjectHwSize",
            displayName: "CanObjectHwSize",
            description: "CanObjectHwSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canobjecthwhandle",
            name: "CanObjectHwHandle",
            displayName: "CanObjectHwHandle",
            description: "CanObjectHwHandle 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canmaxdatalen",
            name: "CanMaxDataLen",
            displayName: "CanMaxDataLen",
            description: "CanMaxDataLen 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfdpaddingvalue",
            name: "CanFdPaddingValue",
            displayName: "CanFdPaddingValue",
            description: "CanFdPaddingValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canobjectmultiplexedtransmission",
            name: "CanObjectMultiplexedTransmission",
            displayName: "CanObjectMultiplexedTransmission",
            description: "CanObjectMultiplexedTransmission 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "canobjecthwfifo",
            name: "CanObjectHwFifo",
            displayName: "CanObjectHwFifo",
            description: "CanObjectHwFifo 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "canbusoffprocessing",
            name: "CanBusoffProcessing",
            displayName: "CanBusoffProcessing",
            description: "CanBusoffProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canrxprocessing",
            name: "CanRxProcessing",
            displayName: "CanRxProcessing",
            description: "CanRxProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantxprocessing",
            name: "CanTxProcessing",
            displayName: "CanTxProcessing",
            description: "CanTxProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canwakeupprocessing",
            name: "CanWakeupProcessing",
            displayName: "CanWakeupProcessing",
            description: "CanWakeupProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canbaseaddress",
            name: "CanBaseAddress",
            displayName: "CanBaseAddress",
            description: "CanBaseAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cansamplingmode",
            name: "CanSamplingMode",
            displayName: "CanSamplingMode",
            description: "CanSamplingMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canclockselection",
            name: "CanClockSelection",
            displayName: "CanClockSelection",
            description: "CanClockSelection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canhandletype",
            name: "CanHandleType",
            displayName: "CanHandleType",
            description: "CanHandleType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canidtype",
            name: "CanIdType",
            displayName: "CanIdType",
            description: "CanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canobjecttype",
            name: "CanObjectType",
            displayName: "CanObjectType",
            description: "CanObjectType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cancontrollerbaudrateconfig",
        name: "CanControllerBaudrateConfig",
        displayName: "CanControllerBaudrateConfig",
        description: "CanControllerBaudrateConfig 配置容器",
        parameters: [
          {
            id: "cancontrollerbaudrate",
            name: "CanControllerBaudRate",
            displayName: "CanControllerBaudRate",
            description: "CanControllerBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerpropseg",
            name: "CanControllerPropSeg",
            displayName: "CanControllerPropSeg",
            description: "CanControllerPropSeg 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerseg1",
            name: "CanControllerSeg1",
            displayName: "CanControllerSeg1",
            description: "CanControllerSeg1 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerseg2",
            name: "CanControllerSeg2",
            displayName: "CanControllerSeg2",
            description: "CanControllerSeg2 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollersyncjumpwidth",
            name: "CanControllerSyncJumpWidth",
            displayName: "CanControllerSyncJumpWidth",
            description: "CanControllerSyncJumpWidth 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerbaudrateconfigid",
            name: "CanControllerBaudRateConfigID",
            displayName: "CanControllerBaudRateConfigID",
            description: "CanControllerBaudRateConfigID 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canbaudrateclock",
            name: "CanBaudrateClock",
            displayName: "CanBaudrateClock",
            description: "CanBaudrateClock 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canbaudrateprescaler",
            name: "CanBaudratePrescaler",
            displayName: "CanBaudratePrescaler",
            description: "CanBaudratePrescaler 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantasdvalue",
            name: "CanTASDValue",
            displayName: "CanTASDValue",
            description: "CanTASDValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerfdbaudrate",
            name: "CanControllerFdBaudRate",
            displayName: "CanControllerFdBaudRate",
            description: "CanControllerFdBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollertxbitrateswitch",
            name: "CanControllerTxBitRateSwitch",
            displayName: "CanControllerTxBitRateSwitch",
            description: "CanControllerTxBitRateSwitch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansamplingmode",
            name: "CanSamplingMode",
            displayName: "CanSamplingMode",
            description: "CanSamplingMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "canclockselection",
            name: "CanClockSelection",
            displayName: "CanClockSelection",
            description: "CanClockSelection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cancontrollerfdbaudrateconfig",
        name: "CanControllerFdBaudrateConfig",
        displayName: "CanControllerFdBaudrateConfig",
        description: "CanControllerFdBaudrateConfig 配置容器",
        parameters: [
          {
            id: "cancontrollerfdbaudrate",
            name: "CanControllerFdBaudRate",
            displayName: "CanControllerFdBaudRate",
            description: "CanControllerFdBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerpropseg",
            name: "CanControllerPropSeg",
            displayName: "CanControllerPropSeg",
            description: "CanControllerPropSeg 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerseg1",
            name: "CanControllerSeg1",
            displayName: "CanControllerSeg1",
            description: "CanControllerSeg1 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollerseg2",
            name: "CanControllerSeg2",
            displayName: "CanControllerSeg2",
            description: "CanControllerSeg2 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollersyncjumpwidth",
            name: "CanControllerSyncJumpWidth",
            displayName: "CanControllerSyncJumpWidth",
            description: "CanControllerSyncJumpWidth 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cancontrollertxbitrateswitch",
            name: "CanControllerTxBitRateSwitch",
            displayName: "CanControllerTxBitRateSwitch",
            description: "CanControllerTxBitRateSwitch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "canbaudrateprescaler",
            name: "CanBaudratePrescaler",
            displayName: "CanBaudratePrescaler",
            description: "CanBaudratePrescaler 参数",
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
        id: "canfiltermask0",
        name: "CanFilterMask0",
        displayName: "CanFilterMask0",
        description: "CanFilterMask0 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-001",
        name: "CanFilterMask_001",
        displayName: "CanFilterMask_001",
        description: "CanFilterMask_001 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-002",
        name: "CanFilterMask_002",
        displayName: "CanFilterMask_002",
        description: "CanFilterMask_002 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-003",
        name: "CanFilterMask_003",
        displayName: "CanFilterMask_003",
        description: "CanFilterMask_003 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-004",
        name: "CanFilterMask_004",
        displayName: "CanFilterMask_004",
        description: "CanFilterMask_004 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-005",
        name: "CanFilterMask_005",
        displayName: "CanFilterMask_005",
        description: "CanFilterMask_005 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-006",
        name: "CanFilterMask_006",
        displayName: "CanFilterMask_006",
        description: "CanFilterMask_006 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-007",
        name: "CanFilterMask_007",
        displayName: "CanFilterMask_007",
        description: "CanFilterMask_007 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-008",
        name: "CanFilterMask_008",
        displayName: "CanFilterMask_008",
        description: "CanFilterMask_008 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-009",
        name: "CanFilterMask_009",
        displayName: "CanFilterMask_009",
        description: "CanFilterMask_009 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-010",
        name: "CanFilterMask_010",
        displayName: "CanFilterMask_010",
        description: "CanFilterMask_010 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "canfiltermask-011",
        name: "CanFilterMask_011",
        displayName: "CanFilterMask_011",
        description: "CanFilterMask_011 配置容器",
        parameters: [
          {
            id: "canfiltermaskvalue",
            name: "CanFilterMaskValue",
            displayName: "CanFilterMaskValue",
            description: "CanFilterMaskValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "canfiltercodevalue",
            name: "CanFilterCodeValue",
            displayName: "CanFilterCodeValue",
            description: "CanFilterCodeValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "islocked",
            name: "IsLocked",
            displayName: "IsLocked",
            description: "IsLocked 参数",
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
    id: "canif",
    name: "Canif",
    displayName: "CAN Interface",
    description: "CanIf Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "bpeps-100ms-pdu02-abbd7f87-tx",
        name: "BPEPS_100ms_PDU02_abbd7f87_Tx",
        displayName: "BPEPS_100ms_PDU02_abbd7f87_Tx",
        description: "BPEPS_100ms_PDU02_abbd7f87_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-100ms-pdu11-51eccb66-tx",
        name: "BPEPS_100ms_PDU11_51eccb66_Tx",
        displayName: "BPEPS_100ms_PDU11_51eccb66_Tx",
        description: "BPEPS_100ms_PDU11_51eccb66_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-20ms-pdu38-60524887-tx",
        name: "BPEPS_20ms_PDU38_60524887_Tx",
        displayName: "BPEPS_20ms_PDU38_60524887_Tx",
        description: "BPEPS_20ms_PDU38_60524887_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-50ms-pdu06-ca77ee1e-tx",
        name: "BPEPS_50ms_PDU06_ca77ee1e_Tx",
        displayName: "BPEPS_50ms_PDU06_ca77ee1e_Tx",
        description: "BPEPS_50ms_PDU06_ca77ee1e_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu25-7832a9d5-tx",
        name: "BPEPS_Sporadic_PDU25_7832a9d5_Tx",
        displayName: "BPEPS_Sporadic_PDU25_7832a9d5_Tx",
        description: "BPEPS_Sporadic_PDU25_7832a9d5_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu26-4e7d5009-tx",
        name: "BPEPS_Sporadic_PDU26_4e7d5009_Tx",
        displayName: "BPEPS_Sporadic_PDU26_4e7d5009_Tx",
        description: "BPEPS_Sporadic_PDU26_4e7d5009_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu27-5c47f8bd-tx",
        name: "BPEPS_Sporadic_PDU27_5c47f8bd_Tx",
        displayName: "BPEPS_Sporadic_PDU27_5c47f8bd_Tx",
        description: "BPEPS_Sporadic_PDU27_5c47f8bd_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu28-b337e611-tx",
        name: "BPEPS_Sporadic_PDU28_b337e611_Tx",
        displayName: "BPEPS_Sporadic_PDU28_b337e611_Tx",
        description: "BPEPS_Sporadic_PDU28_b337e611_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu29-a10d4ea5-tx",
        name: "BPEPS_Sporadic_PDU29_a10d4ea5_Tx",
        displayName: "BPEPS_Sporadic_PDU29_a10d4ea5_Tx",
        description: "BPEPS_Sporadic_PDU29_a10d4ea5_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu30-eefcee8c-tx",
        name: "BPEPS_Sporadic_PDU30_eefcee8c_Tx",
        displayName: "BPEPS_Sporadic_PDU30_eefcee8c_Tx",
        description: "BPEPS_Sporadic_PDU30_eefcee8c_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu31-fcc64638-tx",
        name: "BPEPS_Sporadic_PDU31_fcc64638_Tx",
        displayName: "BPEPS_Sporadic_PDU31_fcc64638_Tx",
        description: "BPEPS_Sporadic_PDU31_fcc64638_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu32-ca89bfe4-tx",
        name: "BPEPS_Sporadic_PDU32_ca89bfe4_Tx",
        displayName: "BPEPS_Sporadic_PDU32_ca89bfe4_Tx",
        description: "BPEPS_Sporadic_PDU32_ca89bfe4_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu33-d8b31750-tx",
        name: "BPEPS_Sporadic_PDU33_d8b31750_Tx",
        displayName: "BPEPS_Sporadic_PDU33_d8b31750_Tx",
        description: "BPEPS_Sporadic_PDU33_d8b31750_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu34-a6164c5c-tx",
        name: "BPEPS_Sporadic_PDU34_a6164c5c_Tx",
        displayName: "BPEPS_Sporadic_PDU34_a6164c5c_Tx",
        description: "BPEPS_Sporadic_PDU34_a6164c5c_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu37-9059b580-tx",
        name: "BPEPS_Sporadic_PDU37_9059b580_Tx",
        displayName: "BPEPS_Sporadic_PDU37_9059b580_Tx",
        description: "BPEPS_Sporadic_PDU37_9059b580_Tx 配置容器",
        parameters: [
          {
            id: "caniftxpducanid",
            name: "CanIfTxPduCanId",
            displayName: "CanIfTxPduCanId",
            description: "CanIfTxPduCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdudlc",
            name: "CanIfTxPduDlc",
            displayName: "CanIfTxPduDlc",
            description: "CanIfTxPduDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpduid",
            name: "CanIfTxPduId",
            displayName: "CanIfTxPduId",
            description: "CanIfTxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "caniftxpdureadnotifystatus",
            name: "CanIfTxPduReadNotifyStatus",
            displayName: "CanIfTxPduReadNotifyStatus",
            description: "CanIfTxPduReadNotifyStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpdutruncation",
            name: "CanIfTxPduTruncation",
            displayName: "CanIfTxPduTruncation",
            description: "CanIfTxPduTruncation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "caniftxpducanidtype",
            name: "CanIfTxPduCanIdType",
            displayName: "CanIfTxPduCanIdType",
            description: "CanIfTxPduCanIdType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationname",
            name: "CanIfTxPduUserTxConfirmationName",
            displayName: "CanIfTxPduUserTxConfirmationName",
            description: "CanIfTxPduUserTxConfirmationName 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpduusertxconfirmationul",
            name: "CanIfTxPduUserTxConfirmationUL",
            displayName: "CanIfTxPduUserTxConfirmationUL",
            description: "CanIfTxPduUserTxConfirmationUL 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "caniftxpdutype",
            name: "CanIfTxPduType",
            displayName: "CanIfTxPduType",
            description: "CanIfTxPduType 参数",
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
    id: "cannm",
    name: "Cannm",
    displayName: "CAN Network Management",
    description: "CAN 网络管理",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "cannmglobalconfig",
        name: "CanNmGlobalConfig",
        displayName: "CanNmGlobalConfig",
        description: "CanNmGlobalConfig 配置容器",
        parameters: [
          {
            id: "cannmcomcontrolenabled",
            name: "CanNmComControlEnabled",
            displayName: "CanNmComControlEnabled",
            description: "CanNmComControlEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmnodedetectionenabled",
            name: "CanNmNodeDetectionEnabled",
            displayName: "CanNmNodeDetectionEnabled",
            description: "CanNmNodeDetectionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmnodeidenabled",
            name: "CanNmNodeIdEnabled",
            displayName: "CanNmNodeIdEnabled",
            description: "CanNmNodeIdEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmpdurxindicationenabled",
            name: "CanNmPduRxIndicationEnabled",
            displayName: "CanNmPduRxIndicationEnabled",
            description: "CanNmPduRxIndicationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmpneiracalcenabled",
            name: "CanNmPnEiraCalcEnabled",
            displayName: "CanNmPnEiraCalcEnabled",
            description: "CanNmPnEiraCalcEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmrepeatmsgindenabled",
            name: "CanNmRepeatMsgIndEnabled",
            displayName: "CanNmRepeatMsgIndEnabled",
            description: "CanNmRepeatMsgIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmstatechangeindenabled",
            name: "CanNmStateChangeIndEnabled",
            displayName: "CanNmStateChangeIndEnabled",
            description: "CanNmStateChangeIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmuserdataenabled",
            name: "CanNmUserDataEnabled",
            displayName: "CanNmUserDataEnabled",
            description: "CanNmUserDataEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmbusloadreductionenabled",
            name: "CanNmBusLoadReductionEnabled",
            displayName: "CanNmBusLoadReductionEnabled",
            description: "CanNmBusLoadReductionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmbussynchronizationenabled",
            name: "CanNmBusSynchronizationEnabled",
            displayName: "CanNmBusSynchronizationEnabled",
            description: "CanNmBusSynchronizationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmcomuserdatasupport",
            name: "CanNmComUserDataSupport",
            displayName: "CanNmComUserDataSupport",
            description: "CanNmComUserDataSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmcoordinatorsyncsupport",
            name: "CanNmCoordinatorSyncSupport",
            displayName: "CanNmCoordinatorSyncSupport",
            description: "CanNmCoordinatorSyncSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmdeverrordetect",
            name: "CanNmDevErrorDetect",
            displayName: "CanNmDevErrorDetect",
            description: "CanNmDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmimmediatetxconfenabled",
            name: "CanNmImmediateTxconfEnabled",
            displayName: "CanNmImmediateTxconfEnabled",
            description: "CanNmImmediateTxconfEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmmainfunctionperiod",
            name: "CanNmMainFunctionPeriod",
            displayName: "CanNmMainFunctionPeriod",
            description: "CanNmMainFunctionPeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmpassivemodeenabled",
            name: "CanNmPassiveModeEnabled",
            displayName: "CanNmPassiveModeEnabled",
            description: "CanNmPassiveModeEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmremotesleepindenabled",
            name: "CanNmRemoteSleepIndEnabled",
            displayName: "CanNmRemoteSleepIndEnabled",
            description: "CanNmRemoteSleepIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmversioninfoapi",
            name: "CanNmVersionInfoApi",
            displayName: "CanNmVersionInfoApi",
            description: "CanNmVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmdisabletxerrreport",
            name: "CanNmDisableTxErrReport",
            displayName: "CanNmDisableTxErrReport",
            description: "CanNmDisableTxErrReport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmapioptimization",
            name: "CanNmApiOptimization",
            displayName: "CanNmApiOptimization",
            description: "CanNmApiOptimization 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmcanifrangeconfigdlccheck",
            name: "CanNmCanIfRangeConfigDLCCheck",
            displayName: "CanNmCanIfRangeConfigDLCCheck",
            description: "CanNmCanIfRangeConfigDLCCheck 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmruntimemeasurementsupport",
            name: "CanNmRuntimeMeasurementSupport",
            displayName: "CanNmRuntimeMeasurementSupport",
            description: "CanNmRuntimeMeasurementSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmsafebswchecks",
            name: "CanNmSafeBswChecks",
            displayName: "CanNmSafeBswChecks",
            description: "CanNmSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmpnsyncshutdownerrorreactionenabled",
            name: "CanNmPnSyncShutdownErrorReactionEnabled",
            displayName: "CanNmPnSyncShutdownErrorReactionEnabled",
            description: "CanNmPnSyncShutdownErrorReactionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmruntimeerrorreport",
            name: "CanNmRuntimeErrorReport",
            displayName: "CanNmRuntimeErrorReport",
            description: "CanNmRuntimeErrorReport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmoutofboundswritesanitizer",
            name: "CanNmOutOfBoundsWriteSanitizer",
            displayName: "CanNmOutOfBoundsWriteSanitizer",
            description: "CanNmOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmoutofboundsreadsanitizer",
            name: "CanNmOutOfBoundsReadSanitizer",
            displayName: "CanNmOutOfBoundsReadSanitizer",
            description: "CanNmOutOfBoundsReadSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannminterfacesfordeactivateddata",
            name: "CanNmInterfacesForDeactivatedData",
            displayName: "CanNmInterfacesForDeactivatedData",
            description: "CanNmInterfacesForDeactivatedData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmimmediatenmcycletime",
            name: "CanNmImmediateNmCycleTime",
            displayName: "CanNmImmediateNmCycleTime",
            description: "CanNmImmediateNmCycleTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmimmediatenmtransmissions",
            name: "CanNmImmediateNmTransmissions",
            displayName: "CanNmImmediateNmTransmissions",
            description: "CanNmImmediateNmTransmissions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmmsgcycletime",
            name: "CanNmMsgCycleTime",
            displayName: "CanNmMsgCycleTime",
            description: "CanNmMsgCycleTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmmsgtimeouttime",
            name: "CanNmMsgTimeoutTime",
            displayName: "CanNmMsgTimeoutTime",
            description: "CanNmMsgTimeoutTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmnodeid",
            name: "CanNmNodeId",
            displayName: "CanNmNodeId",
            description: "CanNmNodeId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmremotesleepindtime",
            name: "CanNmRemoteSleepIndTime",
            displayName: "CanNmRemoteSleepIndTime",
            description: "CanNmRemoteSleepIndTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmrepeatmessagetime",
            name: "CanNmRepeatMessageTime",
            displayName: "CanNmRepeatMessageTime",
            description: "CanNmRepeatMessageTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmtimeouttime",
            name: "CanNmTimeoutTime",
            displayName: "CanNmTimeoutTime",
            description: "CanNmTimeoutTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmuserdatalength",
            name: "CanNmUserDataLength",
            displayName: "CanNmUserDataLength",
            description: "CanNmUserDataLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmwaitbussleeptime",
            name: "CanNmWaitBusSleepTime",
            displayName: "CanNmWaitBusSleepTime",
            description: "CanNmWaitBusSleepTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmbusloadreductionactive",
            name: "CanNmBusLoadReductionActive",
            displayName: "CanNmBusLoadReductionActive",
            description: "CanNmBusLoadReductionActive 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmcarwakeuprxenabled",
            name: "CanNmCarWakeUpRxEnabled",
            displayName: "CanNmCarWakeUpRxEnabled",
            description: "CanNmCarWakeUpRxEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmmsgcycleoffset",
            name: "CanNmMsgCycleOffset",
            displayName: "CanNmMsgCycleOffset",
            description: "CanNmMsgCycleOffset 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmmsgreducedtime",
            name: "CanNmMsgReducedTime",
            displayName: "CanNmMsgReducedTime",
            description: "CanNmMsgReducedTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmactivewakeupbitenabled",
            name: "CanNmActiveWakeupBitEnabled",
            displayName: "CanNmActiveWakeupBitEnabled",
            description: "CanNmActiveWakeupBitEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmimmediaterestartenabled",
            name: "CanNmImmediateRestartEnabled",
            displayName: "CanNmImmediateRestartEnabled",
            description: "CanNmImmediateRestartEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmcribitalwaysenabled",
            name: "CanNmCriBitAlwaysEnabled",
            displayName: "CanNmCriBitAlwaysEnabled",
            description: "CanNmCriBitAlwaysEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmtxconfirmationpduid",
            name: "CanNmTxConfirmationPduId",
            displayName: "CanNmTxConfirmationPduId",
            description: "CanNmTxConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmtxuserdatapduid",
            name: "CanNmTxUserDataPduId",
            displayName: "CanNmTxUserDataPduId",
            description: "CanNmTxUserDataPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmrxpduid",
            name: "CanNmRxPduId",
            displayName: "CanNmRxPduId",
            description: "CanNmRxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmpducbvposition",
            name: "CanNmPduCbvPosition",
            displayName: "CanNmPduCbvPosition",
            description: "CanNmPduCbvPosition 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmpdunidposition",
            name: "CanNmPduNidPosition",
            displayName: "CanNmPduNidPosition",
            description: "CanNmPduNidPosition 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cannmgeneration",
        name: "CanNmGeneration",
        displayName: "CanNmGeneration",
        description: "CanNmGeneration 配置容器",
        parameters: [
          {
            id: "cannmoutofboundswritesanitizer",
            name: "CanNmOutOfBoundsWriteSanitizer",
            displayName: "CanNmOutOfBoundsWriteSanitizer",
            description: "CanNmOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmoutofboundsreadsanitizer",
            name: "CanNmOutOfBoundsReadSanitizer",
            displayName: "CanNmOutOfBoundsReadSanitizer",
            description: "CanNmOutOfBoundsReadSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannminterfacesfordeactivateddata",
            name: "CanNmInterfacesForDeactivatedData",
            displayName: "CanNmInterfacesForDeactivatedData",
            description: "CanNmInterfacesForDeactivatedData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "lhbdcanfd-cluster-43c3a476",
        name: "LHBDCANFD_Cluster_43c3a476",
        displayName: "LHBDCANFD_Cluster_43c3a476",
        description: "LHBDCANFD_Cluster_43c3a476 配置容器",
        parameters: [
          {
            id: "cannmcomcontrolenabled",
            name: "CanNmComControlEnabled",
            displayName: "CanNmComControlEnabled",
            description: "CanNmComControlEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmimmediatenmcycletime",
            name: "CanNmImmediateNmCycleTime",
            displayName: "CanNmImmediateNmCycleTime",
            description: "CanNmImmediateNmCycleTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmimmediatenmtransmissions",
            name: "CanNmImmediateNmTransmissions",
            displayName: "CanNmImmediateNmTransmissions",
            description: "CanNmImmediateNmTransmissions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmmsgcycletime",
            name: "CanNmMsgCycleTime",
            displayName: "CanNmMsgCycleTime",
            description: "CanNmMsgCycleTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmmsgtimeouttime",
            name: "CanNmMsgTimeoutTime",
            displayName: "CanNmMsgTimeoutTime",
            description: "CanNmMsgTimeoutTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmnodedetectionenabled",
            name: "CanNmNodeDetectionEnabled",
            displayName: "CanNmNodeDetectionEnabled",
            description: "CanNmNodeDetectionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmnodeid",
            name: "CanNmNodeId",
            displayName: "CanNmNodeId",
            description: "CanNmNodeId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmnodeidenabled",
            name: "CanNmNodeIdEnabled",
            displayName: "CanNmNodeIdEnabled",
            description: "CanNmNodeIdEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmremotesleepindtime",
            name: "CanNmRemoteSleepIndTime",
            displayName: "CanNmRemoteSleepIndTime",
            description: "CanNmRemoteSleepIndTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmrepeatmessagetime",
            name: "CanNmRepeatMessageTime",
            displayName: "CanNmRepeatMessageTime",
            description: "CanNmRepeatMessageTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmrepeatmsgindenabled",
            name: "CanNmRepeatMsgIndEnabled",
            displayName: "CanNmRepeatMsgIndEnabled",
            description: "CanNmRepeatMsgIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmtimeouttime",
            name: "CanNmTimeoutTime",
            displayName: "CanNmTimeoutTime",
            description: "CanNmTimeoutTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmuserdatalength",
            name: "CanNmUserDataLength",
            displayName: "CanNmUserDataLength",
            description: "CanNmUserDataLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmwaitbussleeptime",
            name: "CanNmWaitBusSleepTime",
            displayName: "CanNmWaitBusSleepTime",
            description: "CanNmWaitBusSleepTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmbusloadreductionactive",
            name: "CanNmBusLoadReductionActive",
            displayName: "CanNmBusLoadReductionActive",
            description: "CanNmBusLoadReductionActive 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmcarwakeuprxenabled",
            name: "CanNmCarWakeUpRxEnabled",
            displayName: "CanNmCarWakeUpRxEnabled",
            description: "CanNmCarWakeUpRxEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmmsgcycleoffset",
            name: "CanNmMsgCycleOffset",
            displayName: "CanNmMsgCycleOffset",
            description: "CanNmMsgCycleOffset 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmmsgreducedtime",
            name: "CanNmMsgReducedTime",
            displayName: "CanNmMsgReducedTime",
            description: "CanNmMsgReducedTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmactivewakeupbitenabled",
            name: "CanNmActiveWakeupBitEnabled",
            displayName: "CanNmActiveWakeupBitEnabled",
            description: "CanNmActiveWakeupBitEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmimmediaterestartenabled",
            name: "CanNmImmediateRestartEnabled",
            displayName: "CanNmImmediateRestartEnabled",
            description: "CanNmImmediateRestartEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmcribitalwaysenabled",
            name: "CanNmCriBitAlwaysEnabled",
            displayName: "CanNmCriBitAlwaysEnabled",
            description: "CanNmCriBitAlwaysEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cannmtxconfirmationpduid",
            name: "CanNmTxConfirmationPduId",
            displayName: "CanNmTxConfirmationPduId",
            description: "CanNmTxConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmtxuserdatapduid",
            name: "CanNmTxUserDataPduId",
            displayName: "CanNmTxUserDataPduId",
            description: "CanNmTxUserDataPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmrxpduid",
            name: "CanNmRxPduId",
            displayName: "CanNmRxPduId",
            description: "CanNmRxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cannmpducbvposition",
            name: "CanNmPduCbvPosition",
            displayName: "CanNmPduCbvPosition",
            description: "CanNmPduCbvPosition 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cannmpdunidposition",
            name: "CanNmPduNidPosition",
            displayName: "CanNmPduNidPosition",
            description: "CanNmPduNidPosition 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "nmpdu-lhbdcanfd-dkmm-3336d6fc-tx",
        name: "NmPDU_LHBDCANFD_DKMM_3336d6fc_Tx",
        displayName: "NmPDU_LHBDCANFD_DKMM_3336d6fc_Tx",
        description: "NmPDU_LHBDCANFD_DKMM_3336d6fc_Tx 配置容器",
        parameters: [
          {
            id: "cannmtxconfirmationpduid",
            name: "CanNmTxConfirmationPduId",
            displayName: "CanNmTxConfirmationPduId",
            description: "CanNmTxConfirmationPduId 参数",
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
        id: "nmpdu-lhbdcanfd-dkmm-0ffad24c",
        name: "NmPDU_LHBDCANFD_DKMM_0ffad24c",
        displayName: "NmPDU_LHBDCANFD_DKMM_0ffad24c",
        description: "NmPDU_LHBDCANFD_DKMM_0ffad24c 配置容器",
        parameters: [
          {
            id: "cannmtxuserdatapduid",
            name: "CanNmTxUserDataPduId",
            displayName: "CanNmTxUserDataPduId",
            description: "CanNmTxUserDataPduId 参数",
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
        id: "lhbdcanfd-cluster-43c3a476-rx",
        name: "LHBDCANFD_Cluster_43c3a476_Rx",
        displayName: "LHBDCANFD_Cluster_43c3a476_Rx",
        description: "LHBDCANFD_Cluster_43c3a476_Rx 配置容器",
        parameters: [
          {
            id: "cannmrxpduid",
            name: "CanNmRxPduId",
            displayName: "CanNmRxPduId",
            description: "CanNmRxPduId 参数",
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
    id: "cansm",
    name: "Cansm",
    displayName: "CAN State Manager",
    description: "CAN 状态管理",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "cansmconfiguration",
        name: "CanSMConfiguration",
        displayName: "CanSMConfiguration",
        description: "CanSMConfiguration 配置容器",
        parameters: [
          {
            id: "cansmmoderequestrepetitionmax",
            name: "CanSMModeRequestRepetitionMax",
            displayName: "CanSMModeRequestRepetitionMax",
            description: "CanSMModeRequestRepetitionMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cansmmoderequestrepetitiontime",
            name: "CanSMModeRequestRepetitionTime",
            displayName: "CanSMModeRequestRepetitionTime",
            description: "CanSMModeRequestRepetitionTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cansmborcounterl1tol2",
            name: "CanSMBorCounterL1ToL2",
            displayName: "CanSMBorCounterL1ToL2",
            description: "CanSMBorCounterL1ToL2 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cansmbortimel1",
            name: "CanSMBorTimeL1",
            displayName: "CanSMBorTimeL1",
            description: "CanSMBorTimeL1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cansmbortimel2",
            name: "CanSMBorTimeL2",
            displayName: "CanSMBorTimeL2",
            description: "CanSMBorTimeL2 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cansmbortimetxensured",
            name: "CanSMBorTimeTxEnsured",
            displayName: "CanSMBorTimeTxEnsured",
            description: "CanSMBorTimeTxEnsured 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cansmbortxconfirmationpolling",
            name: "CanSMBorTxConfirmationPolling",
            displayName: "CanSMBorTxConfirmationPolling",
            description: "CanSMBorTxConfirmationPolling 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "lhbdcanfd-1e9b6ab9",
        name: "LHBDCANFD_1e9b6ab9",
        displayName: "LHBDCANFD_1e9b6ab9",
        description: "LHBDCANFD_1e9b6ab9 配置容器",
        parameters: [
          {
            id: "cansmborcounterl1tol2",
            name: "CanSMBorCounterL1ToL2",
            displayName: "CanSMBorCounterL1ToL2",
            description: "CanSMBorCounterL1ToL2 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cansmbortimel1",
            name: "CanSMBorTimeL1",
            displayName: "CanSMBorTimeL1",
            description: "CanSMBorTimeL1 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cansmbortimel2",
            name: "CanSMBorTimeL2",
            displayName: "CanSMBorTimeL2",
            description: "CanSMBorTimeL2 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cansmbortimetxensured",
            name: "CanSMBorTimeTxEnsured",
            displayName: "CanSMBorTimeTxEnsured",
            description: "CanSMBorTimeTxEnsured 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cansmbortxconfirmationpolling",
            name: "CanSMBorTxConfirmationPolling",
            displayName: "CanSMBorTxConfirmationPolling",
            description: "CanSMBorTxConfirmationPolling 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "cansmgeneral",
        name: "CanSMGeneral",
        displayName: "CanSMGeneral",
        description: "CanSMGeneral 配置容器",
        parameters: [
          {
            id: "cansmdeverrordetect",
            name: "CanSMDevErrorDetect",
            displayName: "CanSMDevErrorDetect",
            description: "CanSMDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansmmainfunctiontimeperiod",
            name: "CanSMMainFunctionTimePeriod",
            displayName: "CanSMMainFunctionTimePeriod",
            description: "CanSMMainFunctionTimePeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cansmversioninfoapi",
            name: "CanSMVersionInfoApi",
            displayName: "CanSMVersionInfoApi",
            description: "CanSMVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansmborchecklevel",
            name: "CanSMBorCheckLevel",
            displayName: "CanSMBorCheckLevel",
            description: "CanSMBorCheckLevel 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansmsafebswchecks",
            name: "CanSMSafeBswChecks",
            displayName: "CanSMSafeBswChecks",
            description: "CanSMSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansmsetbaudrateapi",
            name: "CanSMSetBaudrateApi",
            displayName: "CanSMSetBaudrateApi",
            description: "CanSMSetBaudrateApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansmoutofboundswritesanitizer",
            name: "CanSMOutOfBoundsWriteSanitizer",
            displayName: "CanSMOutOfBoundsWriteSanitizer",
            description: "CanSMOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansmoutofboundsreadsanitizer",
            name: "CanSMOutOfBoundsReadSanitizer",
            displayName: "CanSMOutOfBoundsReadSanitizer",
            description: "CanSMOutOfBoundsReadSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "cansmgeneration",
        name: "CanSMGeneration",
        displayName: "CanSMGeneration",
        description: "CanSMGeneration 配置容器",
        parameters: [
          {
            id: "cansmoutofboundswritesanitizer",
            name: "CanSMOutOfBoundsWriteSanitizer",
            displayName: "CanSMOutOfBoundsWriteSanitizer",
            description: "CanSMOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cansmoutofboundsreadsanitizer",
            name: "CanSMOutOfBoundsReadSanitizer",
            displayName: "CanSMOutOfBoundsReadSanitizer",
            description: "CanSMOutOfBoundsReadSanitizer 参数",
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
    id: "cantp",
    name: "Cantp",
    displayName: "CAN Transport Protocol",
    description: "CAN 传输协议",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "cantpgeneral",
        name: "CanTpGeneral",
        displayName: "CanTpGeneral",
        description: "CanTpGeneral 配置容器",
        parameters: [
          {
            id: "cantpchangeparameterapi",
            name: "CanTpChangeParameterApi",
            displayName: "CanTpChangeParameterApi",
            description: "CanTpChangeParameterApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpdeverrordetect",
            name: "CanTpDevErrorDetect",
            displayName: "CanTpDevErrorDetect",
            description: "CanTpDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantppaddingbyte",
            name: "CanTpPaddingByte",
            displayName: "CanTpPaddingByte",
            description: "CanTpPaddingByte 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpreadparameterapi",
            name: "CanTpReadParameterApi",
            displayName: "CanTpReadParameterApi",
            description: "CanTpReadParameterApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpversioninfoapi",
            name: "CanTpVersionInfoApi",
            displayName: "CanTpVersionInfoApi",
            description: "CanTpVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantppaddingactive",
            name: "CanTpPaddingActive",
            displayName: "CanTpPaddingActive",
            description: "CanTpPaddingActive 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantphavepaddingbyte",
            name: "CanTpHavePaddingByte",
            displayName: "CanTpHavePaddingByte",
            description: "CanTpHavePaddingByte 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpenablesplitmainfunction",
            name: "CanTpEnableSplitMainFunction",
            displayName: "CanTpEnableSplitMainFunction",
            description: "CanTpEnableSplitMainFunction 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsupportstandardaddressing",
            name: "CanTpSupportStandardAddressing",
            displayName: "CanTpSupportStandardAddressing",
            description: "CanTpSupportStandardAddressing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsupportextendedaddressing",
            name: "CanTpSupportExtendedAddressing",
            displayName: "CanTpSupportExtendedAddressing",
            description: "CanTpSupportExtendedAddressing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsupportmixed11addressing",
            name: "CanTpSupportMixed11Addressing",
            displayName: "CanTpSupportMixed11Addressing",
            description: "CanTpSupportMixed11Addressing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsupportmixed29addressing",
            name: "CanTpSupportMixed29Addressing",
            displayName: "CanTpSupportMixed29Addressing",
            description: "CanTpSupportMixed29Addressing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsupportnormalfixedaddressing",
            name: "CanTpSupportNormalFixedAddressing",
            displayName: "CanTpSupportNormalFixedAddressing",
            description: "CanTpSupportNormalFixedAddressing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsupportcustomaddressing",
            name: "CanTpSupportCustomAddressing",
            displayName: "CanTpSupportCustomAddressing",
            description: "CanTpSupportCustomAddressing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantponlynotifyinformedappl",
            name: "CanTpOnlyNotifyInformedAppl",
            displayName: "CanTpOnlyNotifyInformedAppl",
            description: "CanTpOnlyNotifyInformedAppl 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantprc",
            name: "CanTpRc",
            displayName: "CanTpRc",
            description: "CanTpRc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantptc",
            name: "CanTpTc",
            displayName: "CanTpTc",
            description: "CanTpTc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsafebswchecks",
            name: "CanTpSafeBswChecks",
            displayName: "CanTpSafeBswChecks",
            description: "CanTpSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpuseonlyfirstfc",
            name: "CanTpUseOnlyFirstFc",
            displayName: "CanTpUseOnlyFirstFc",
            description: "CanTpUseOnlyFirstFc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpflexibledataratesupport",
            name: "CanTpFlexibleDataRateSupport",
            displayName: "CanTpFlexibleDataRateSupport",
            description: "CanTpFlexibleDataRateSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpsupportlongfirstframes",
            name: "CanTpSupportLongFirstFrames",
            displayName: "CanTpSupportLongFirstFrames",
            description: "CanTpSupportLongFirstFrames 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpenablesynchronoustransmit",
            name: "CanTpEnableSynchronousTransmit",
            displayName: "CanTpEnableSynchronousTransmit",
            description: "CanTpEnableSynchronousTransmit 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpenabletransmitqueue",
            name: "CanTpEnableTransmitQueue",
            displayName: "CanTpEnableTransmitQueue",
            description: "CanTpEnableTransmitQueue 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantpenablenonstrictlengthcheck",
            name: "CanTpEnableNonStrictLengthCheck",
            displayName: "CanTpEnableNonStrictLengthCheck",
            description: "CanTpEnableNonStrictLengthCheck 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "cantpconfig",
        name: "CanTpConfig",
        displayName: "CanTpConfig",
        description: "CanTpConfig 配置容器",
        parameters: [
          {
            id: "cantpmainfunctionperiod",
            name: "CanTpMainFunctionPeriod",
            displayName: "CanTpMainFunctionPeriod",
            description: "CanTpMainFunctionPeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantpbs",
            name: "CanTpBs",
            displayName: "CanTpBs",
            description: "CanTpBs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnar",
            name: "CanTpNar",
            displayName: "CanTpNar",
            description: "CanTpNar 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncr",
            name: "CanTpNcr",
            displayName: "CanTpNcr",
            description: "CanTpNcr 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxdl",
            name: "CanTpRxDl",
            displayName: "CanTpRxDl",
            description: "CanTpRxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxwftmax",
            name: "CanTpRxWftMax",
            displayName: "CanTpRxWftMax",
            description: "CanTpRxWftMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpstmin",
            name: "CanTpSTmin",
            displayName: "CanTpSTmin",
            description: "CanTpSTmin 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbr",
            name: "CanTpNbr",
            displayName: "CanTpNbr",
            description: "CanTpNbr 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxnsduid",
            name: "CanTpRxNSduId",
            displayName: "CanTpRxNSduId",
            description: "CanTpRxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxfcnpduconfirmationpduid",
            name: "CanTpTxFcNPduConfirmationPduId",
            displayName: "CanTpTxFcNPduConfirmationPduId",
            description: "CanTpTxFcNPduConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxnpduid",
            name: "CanTpRxNPduId",
            displayName: "CanTpRxNPduId",
            description: "CanTpRxNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnas",
            name: "CanTpNas",
            displayName: "CanTpNas",
            description: "CanTpNas 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbs",
            name: "CanTpNbs",
            displayName: "CanTpNbs",
            description: "CanTpNbs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxdl",
            name: "CanTpTxDl",
            displayName: "CanTpTxDl",
            description: "CanTpTxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncs",
            name: "CanTpNcs",
            displayName: "CanTpNcs",
            description: "CanTpNcs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptc",
            name: "CanTpTc",
            displayName: "CanTpTc",
            description: "CanTpTc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantptxnsduid",
            name: "CanTpTxNSduId",
            displayName: "CanTpTxNSduId",
            description: "CanTpTxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxnpduconfirmationpduid",
            name: "CanTpTxNPduConfirmationPduId",
            displayName: "CanTpTxNPduConfirmationPduId",
            description: "CanTpTxNPduConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxfcnpduid",
            name: "CanTpRxFcNPduId",
            displayName: "CanTpRxFcNPduId",
            description: "CanTpRxFcNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpchannelmode",
            name: "CanTpChannelMode",
            displayName: "CanTpChannelMode",
            description: "CanTpChannelMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxaddressingformat",
            name: "CanTpRxAddressingFormat",
            displayName: "CanTpRxAddressingFormat",
            description: "CanTpRxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxpaddingactivation",
            name: "CanTpRxPaddingActivation",
            displayName: "CanTpRxPaddingActivation",
            description: "CanTpRxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxtatype",
            name: "CanTpRxTaType",
            displayName: "CanTpRxTaType",
            description: "CanTpRxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxaddressingformat",
            name: "CanTpTxAddressingFormat",
            displayName: "CanTpTxAddressingFormat",
            description: "CanTpTxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxpaddingactivation",
            name: "CanTpTxPaddingActivation",
            displayName: "CanTpTxPaddingActivation",
            description: "CanTpTxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxtatype",
            name: "CanTpTxTaType",
            displayName: "CanTpTxTaType",
            description: "CanTpTxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "lhbdcanfdtpchannel-fc1f7a07",
        name: "LHBDCANFDTpChannel_fc1f7a07",
        displayName: "LHBDCANFDTpChannel_fc1f7a07",
        description: "LHBDCANFDTpChannel_fc1f7a07 配置容器",
        parameters: [
          {
            id: "cantpbs",
            name: "CanTpBs",
            displayName: "CanTpBs",
            description: "CanTpBs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnar",
            name: "CanTpNar",
            displayName: "CanTpNar",
            description: "CanTpNar 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncr",
            name: "CanTpNcr",
            displayName: "CanTpNcr",
            description: "CanTpNcr 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxdl",
            name: "CanTpRxDl",
            displayName: "CanTpRxDl",
            description: "CanTpRxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxwftmax",
            name: "CanTpRxWftMax",
            displayName: "CanTpRxWftMax",
            description: "CanTpRxWftMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpstmin",
            name: "CanTpSTmin",
            displayName: "CanTpSTmin",
            description: "CanTpSTmin 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbr",
            name: "CanTpNbr",
            displayName: "CanTpNbr",
            description: "CanTpNbr 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxnsduid",
            name: "CanTpRxNSduId",
            displayName: "CanTpRxNSduId",
            description: "CanTpRxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxfcnpduconfirmationpduid",
            name: "CanTpTxFcNPduConfirmationPduId",
            displayName: "CanTpTxFcNPduConfirmationPduId",
            description: "CanTpTxFcNPduConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxnpduid",
            name: "CanTpRxNPduId",
            displayName: "CanTpRxNPduId",
            description: "CanTpRxNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnas",
            name: "CanTpNas",
            displayName: "CanTpNas",
            description: "CanTpNas 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbs",
            name: "CanTpNbs",
            displayName: "CanTpNbs",
            description: "CanTpNbs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxdl",
            name: "CanTpTxDl",
            displayName: "CanTpTxDl",
            description: "CanTpTxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncs",
            name: "CanTpNcs",
            displayName: "CanTpNcs",
            description: "CanTpNcs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptc",
            name: "CanTpTc",
            displayName: "CanTpTc",
            description: "CanTpTc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantptxnsduid",
            name: "CanTpTxNSduId",
            displayName: "CanTpTxNSduId",
            description: "CanTpTxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxnpduconfirmationpduid",
            name: "CanTpTxNPduConfirmationPduId",
            displayName: "CanTpTxNPduConfirmationPduId",
            description: "CanTpTxNPduConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxfcnpduid",
            name: "CanTpRxFcNPduId",
            displayName: "CanTpRxFcNPduId",
            description: "CanTpRxFcNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpchannelmode",
            name: "CanTpChannelMode",
            displayName: "CanTpChannelMode",
            description: "CanTpChannelMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxaddressingformat",
            name: "CanTpRxAddressingFormat",
            displayName: "CanTpRxAddressingFormat",
            description: "CanTpRxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxpaddingactivation",
            name: "CanTpRxPaddingActivation",
            displayName: "CanTpRxPaddingActivation",
            description: "CanTpRxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxtatype",
            name: "CanTpRxTaType",
            displayName: "CanTpRxTaType",
            description: "CanTpRxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxaddressingformat",
            name: "CanTpTxAddressingFormat",
            displayName: "CanTpTxAddressingFormat",
            description: "CanTpTxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxpaddingactivation",
            name: "CanTpTxPaddingActivation",
            displayName: "CanTpTxPaddingActivation",
            description: "CanTpTxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxtatype",
            name: "CanTpTxTaType",
            displayName: "CanTpTxTaType",
            description: "CanTpTxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantprxnsdu-2563bfd5",
        name: "CanTpRxNSdu_2563bfd5",
        displayName: "CanTpRxNSdu_2563bfd5",
        description: "CanTpRxNSdu_2563bfd5 配置容器",
        parameters: [
          {
            id: "cantpbs",
            name: "CanTpBs",
            displayName: "CanTpBs",
            description: "CanTpBs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnar",
            name: "CanTpNar",
            displayName: "CanTpNar",
            description: "CanTpNar 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncr",
            name: "CanTpNcr",
            displayName: "CanTpNcr",
            description: "CanTpNcr 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxdl",
            name: "CanTpRxDl",
            displayName: "CanTpRxDl",
            description: "CanTpRxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxwftmax",
            name: "CanTpRxWftMax",
            displayName: "CanTpRxWftMax",
            description: "CanTpRxWftMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpstmin",
            name: "CanTpSTmin",
            displayName: "CanTpSTmin",
            description: "CanTpSTmin 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbr",
            name: "CanTpNbr",
            displayName: "CanTpNbr",
            description: "CanTpNbr 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxnsduid",
            name: "CanTpRxNSduId",
            displayName: "CanTpRxNSduId",
            description: "CanTpRxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxfcnpduconfirmationpduid",
            name: "CanTpTxFcNPduConfirmationPduId",
            displayName: "CanTpTxFcNPduConfirmationPduId",
            description: "CanTpTxFcNPduConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxnpduid",
            name: "CanTpRxNPduId",
            displayName: "CanTpRxNPduId",
            description: "CanTpRxNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxaddressingformat",
            name: "CanTpRxAddressingFormat",
            displayName: "CanTpRxAddressingFormat",
            description: "CanTpRxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxpaddingactivation",
            name: "CanTpRxPaddingActivation",
            displayName: "CanTpRxPaddingActivation",
            description: "CanTpRxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxtatype",
            name: "CanTpRxTaType",
            displayName: "CanTpRxTaType",
            description: "CanTpRxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantptxfcnpdu-15b9b3c6",
        name: "CanTpTxFcNPdu_15b9b3c6",
        displayName: "CanTpTxFcNPdu_15b9b3c6",
        description: "CanTpTxFcNPdu_15b9b3c6 配置容器",
        parameters: [
          {
            id: "cantptxfcnpduconfirmationpduid",
            name: "CanTpTxFcNPduConfirmationPduId",
            displayName: "CanTpTxFcNPduConfirmationPduId",
            description: "CanTpTxFcNPduConfirmationPduId 参数",
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
        id: "cantprxnpdu-15b9b3c6",
        name: "CanTpRxNPdu_15b9b3c6",
        displayName: "CanTpRxNPdu_15b9b3c6",
        description: "CanTpRxNPdu_15b9b3c6 配置容器",
        parameters: [
          {
            id: "cantprxnpduid",
            name: "CanTpRxNPduId",
            displayName: "CanTpRxNPduId",
            description: "CanTpRxNPduId 参数",
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
        id: "cantptxnsdu-2563bfd5",
        name: "CanTpTxNSdu_2563bfd5",
        displayName: "CanTpTxNSdu_2563bfd5",
        description: "CanTpTxNSdu_2563bfd5 配置容器",
        parameters: [
          {
            id: "cantpnas",
            name: "CanTpNas",
            displayName: "CanTpNas",
            description: "CanTpNas 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbs",
            name: "CanTpNbs",
            displayName: "CanTpNbs",
            description: "CanTpNbs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxdl",
            name: "CanTpTxDl",
            displayName: "CanTpTxDl",
            description: "CanTpTxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncs",
            name: "CanTpNcs",
            displayName: "CanTpNcs",
            description: "CanTpNcs 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptc",
            name: "CanTpTc",
            displayName: "CanTpTc",
            description: "CanTpTc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantptxnsduid",
            name: "CanTpTxNSduId",
            displayName: "CanTpTxNSduId",
            description: "CanTpTxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxnpduconfirmationpduid",
            name: "CanTpTxNPduConfirmationPduId",
            displayName: "CanTpTxNPduConfirmationPduId",
            description: "CanTpTxNPduConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxfcnpduid",
            name: "CanTpRxFcNPduId",
            displayName: "CanTpRxFcNPduId",
            description: "CanTpRxFcNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantptxaddressingformat",
            name: "CanTpTxAddressingFormat",
            displayName: "CanTpTxAddressingFormat",
            description: "CanTpTxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxpaddingactivation",
            name: "CanTpTxPaddingActivation",
            displayName: "CanTpTxPaddingActivation",
            description: "CanTpTxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantptxtatype",
            name: "CanTpTxTaType",
            displayName: "CanTpTxTaType",
            description: "CanTpTxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantptxnpdu-37436734",
        name: "CanTpTxNPdu_37436734",
        displayName: "CanTpTxNPdu_37436734",
        description: "CanTpTxNPdu_37436734 配置容器",
        parameters: [
          {
            id: "cantptxnpduconfirmationpduid",
            name: "CanTpTxNPduConfirmationPduId",
            displayName: "CanTpTxNPduConfirmationPduId",
            description: "CanTpTxNPduConfirmationPduId 参数",
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
        id: "cantprxfcnpdu-37436734",
        name: "CanTpRxFcNPdu_37436734",
        displayName: "CanTpRxFcNPdu_37436734",
        description: "CanTpRxFcNPdu_37436734 配置容器",
        parameters: [
          {
            id: "cantprxfcnpduid",
            name: "CanTpRxFcNPduId",
            displayName: "CanTpRxFcNPduId",
            description: "CanTpRxFcNPduId 参数",
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
        id: "lhbdcanfdtpchannel-82b40f25",
        name: "LHBDCANFDTpChannel_82b40f25",
        displayName: "LHBDCANFDTpChannel_82b40f25",
        description: "LHBDCANFDTpChannel_82b40f25 配置容器",
        parameters: [
          {
            id: "cantpbs",
            name: "CanTpBs",
            displayName: "CanTpBs",
            description: "CanTpBs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnar",
            name: "CanTpNar",
            displayName: "CanTpNar",
            description: "CanTpNar 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncr",
            name: "CanTpNcr",
            displayName: "CanTpNcr",
            description: "CanTpNcr 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxdl",
            name: "CanTpRxDl",
            displayName: "CanTpRxDl",
            description: "CanTpRxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxwftmax",
            name: "CanTpRxWftMax",
            displayName: "CanTpRxWftMax",
            description: "CanTpRxWftMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpstmin",
            name: "CanTpSTmin",
            displayName: "CanTpSTmin",
            description: "CanTpSTmin 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbr",
            name: "CanTpNbr",
            displayName: "CanTpNbr",
            description: "CanTpNbr 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxnsduid",
            name: "CanTpRxNSduId",
            displayName: "CanTpRxNSduId",
            description: "CanTpRxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxnpduid",
            name: "CanTpRxNPduId",
            displayName: "CanTpRxNPduId",
            description: "CanTpRxNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpchannelmode",
            name: "CanTpChannelMode",
            displayName: "CanTpChannelMode",
            description: "CanTpChannelMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxaddressingformat",
            name: "CanTpRxAddressingFormat",
            displayName: "CanTpRxAddressingFormat",
            description: "CanTpRxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxpaddingactivation",
            name: "CanTpRxPaddingActivation",
            displayName: "CanTpRxPaddingActivation",
            description: "CanTpRxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxtatype",
            name: "CanTpRxTaType",
            displayName: "CanTpRxTaType",
            description: "CanTpRxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantprxnsdu-6c047742",
        name: "CanTpRxNSdu_6c047742",
        displayName: "CanTpRxNSdu_6c047742",
        description: "CanTpRxNSdu_6c047742 配置容器",
        parameters: [
          {
            id: "cantpbs",
            name: "CanTpBs",
            displayName: "CanTpBs",
            description: "CanTpBs 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnar",
            name: "CanTpNar",
            displayName: "CanTpNar",
            description: "CanTpNar 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpncr",
            name: "CanTpNcr",
            displayName: "CanTpNcr",
            description: "CanTpNcr 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxdl",
            name: "CanTpRxDl",
            displayName: "CanTpRxDl",
            description: "CanTpRxDl 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxwftmax",
            name: "CanTpRxWftMax",
            displayName: "CanTpRxWftMax",
            description: "CanTpRxWftMax 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpstmin",
            name: "CanTpSTmin",
            displayName: "CanTpSTmin",
            description: "CanTpSTmin 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantpnbr",
            name: "CanTpNbr",
            displayName: "CanTpNbr",
            description: "CanTpNbr 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxnsduid",
            name: "CanTpRxNSduId",
            displayName: "CanTpRxNSduId",
            description: "CanTpRxNSduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxnpduid",
            name: "CanTpRxNPduId",
            displayName: "CanTpRxNPduId",
            description: "CanTpRxNPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantprxaddressingformat",
            name: "CanTpRxAddressingFormat",
            displayName: "CanTpRxAddressingFormat",
            description: "CanTpRxAddressingFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxpaddingactivation",
            name: "CanTpRxPaddingActivation",
            displayName: "CanTpRxPaddingActivation",
            description: "CanTpRxPaddingActivation 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantprxtatype",
            name: "CanTpRxTaType",
            displayName: "CanTpRxTaType",
            description: "CanTpRxTaType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantprxnpdu-b0a36b39",
        name: "CanTpRxNPdu_b0a36b39",
        displayName: "CanTpRxNPdu_b0a36b39",
        description: "CanTpRxNPdu_b0a36b39 配置容器",
        parameters: [
          {
            id: "cantprxnpduid",
            name: "CanTpRxNPduId",
            displayName: "CanTpRxNPduId",
            description: "CanTpRxNPduId 参数",
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
    id: "cantrcv",
    name: "Cantrcv",
    displayName: "CAN Transceiver",
    description: "CAN 收发器",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "cantrcvconfigset",
        name: "CanTrcvConfigSet",
        displayName: "CanTrcvConfigSet",
        description: "CanTrcvConfigSet 配置容器",
        parameters: [
          {
            id: "cantrcvchannelid",
            name: "CanTrcvChannelId",
            displayName: "CanTrcvChannelId",
            description: "CanTrcvChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvchannelused",
            name: "CanTrcvChannelUsed",
            displayName: "CanTrcvChannelUsed",
            description: "CanTrcvChannelUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvcontrolspowersupply",
            name: "CanTrcvControlsPowerSupply",
            displayName: "CanTrcvControlsPowerSupply",
            description: "CanTrcvControlsPowerSupply 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvhwpnsupport",
            name: "CanTrcvHwPnSupport",
            displayName: "CanTrcvHwPnSupport",
            description: "CanTrcvHwPnSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvmaxbaudrate",
            name: "CanTrcvMaxBaudrate",
            displayName: "CanTrcvMaxBaudrate",
            description: "CanTrcvMaxBaudrate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvwakeupbybusused",
            name: "CanTrcvWakeupByBusUsed",
            displayName: "CanTrcvWakeupByBusUsed",
            description: "CanTrcvWakeupByBusUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvbaudrate",
            name: "CanTrcvBaudRate",
            displayName: "CanTrcvBaudRate",
            description: "CanTrcvBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvbuserrflag",
            name: "CanTrcvBusErrFlag",
            displayName: "CanTrcvBusErrFlag",
            description: "CanTrcvBusErrFlag 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpncanidisextended",
            name: "CanTrcvPnCanIdIsExtended",
            displayName: "CanTrcvPnCanIdIsExtended",
            description: "CanTrcvPnCanIdIsExtended 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpnenabled",
            name: "CanTrcvPnEnabled",
            displayName: "CanTrcvPnEnabled",
            description: "CanTrcvPnEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpnframecanid",
            name: "CanTrcvPnFrameCanId",
            displayName: "CanTrcvPnFrameCanId",
            description: "CanTrcvPnFrameCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpnframecanidmask",
            name: "CanTrcvPnFrameCanIdMask",
            displayName: "CanTrcvPnFrameCanIdMask",
            description: "CanTrcvPnFrameCanIdMask 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpnframedlc",
            name: "CanTrcvPnFrameDlc",
            displayName: "CanTrcvPnFrameDlc",
            description: "CanTrcvPnFrameDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpoweronflag",
            name: "CanTrcvPowerOnFlag",
            displayName: "CanTrcvPowerOnFlag",
            description: "CanTrcvPowerOnFlag 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvinitstate",
            name: "CanTrcvInitState",
            displayName: "CanTrcvInitState",
            description: "CanTrcvInitState 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantrcvchannel",
        name: "CanTrcvChannel",
        displayName: "CanTrcvChannel",
        description: "CanTrcvChannel 配置容器",
        parameters: [
          {
            id: "cantrcvchannelid",
            name: "CanTrcvChannelId",
            displayName: "CanTrcvChannelId",
            description: "CanTrcvChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvchannelused",
            name: "CanTrcvChannelUsed",
            displayName: "CanTrcvChannelUsed",
            description: "CanTrcvChannelUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvcontrolspowersupply",
            name: "CanTrcvControlsPowerSupply",
            displayName: "CanTrcvControlsPowerSupply",
            description: "CanTrcvControlsPowerSupply 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvhwpnsupport",
            name: "CanTrcvHwPnSupport",
            displayName: "CanTrcvHwPnSupport",
            description: "CanTrcvHwPnSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvmaxbaudrate",
            name: "CanTrcvMaxBaudrate",
            displayName: "CanTrcvMaxBaudrate",
            description: "CanTrcvMaxBaudrate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvwakeupbybusused",
            name: "CanTrcvWakeupByBusUsed",
            displayName: "CanTrcvWakeupByBusUsed",
            description: "CanTrcvWakeupByBusUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvbaudrate",
            name: "CanTrcvBaudRate",
            displayName: "CanTrcvBaudRate",
            description: "CanTrcvBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvbuserrflag",
            name: "CanTrcvBusErrFlag",
            displayName: "CanTrcvBusErrFlag",
            description: "CanTrcvBusErrFlag 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpncanidisextended",
            name: "CanTrcvPnCanIdIsExtended",
            displayName: "CanTrcvPnCanIdIsExtended",
            description: "CanTrcvPnCanIdIsExtended 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpnenabled",
            name: "CanTrcvPnEnabled",
            displayName: "CanTrcvPnEnabled",
            description: "CanTrcvPnEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpnframecanid",
            name: "CanTrcvPnFrameCanId",
            displayName: "CanTrcvPnFrameCanId",
            description: "CanTrcvPnFrameCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpnframecanidmask",
            name: "CanTrcvPnFrameCanIdMask",
            displayName: "CanTrcvPnFrameCanIdMask",
            description: "CanTrcvPnFrameCanIdMask 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpnframedlc",
            name: "CanTrcvPnFrameDlc",
            displayName: "CanTrcvPnFrameDlc",
            description: "CanTrcvPnFrameDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpoweronflag",
            name: "CanTrcvPowerOnFlag",
            displayName: "CanTrcvPowerOnFlag",
            description: "CanTrcvPowerOnFlag 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvinitstate",
            name: "CanTrcvInitState",
            displayName: "CanTrcvInitState",
            description: "CanTrcvInitState 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantrcvpartialnetwork",
        name: "CanTrcvPartialNetwork",
        displayName: "CanTrcvPartialNetwork",
        description: "CanTrcvPartialNetwork 配置容器",
        parameters: [
          {
            id: "cantrcvbaudrate",
            name: "CanTrcvBaudRate",
            displayName: "CanTrcvBaudRate",
            description: "CanTrcvBaudRate 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvbuserrflag",
            name: "CanTrcvBusErrFlag",
            displayName: "CanTrcvBusErrFlag",
            description: "CanTrcvBusErrFlag 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpncanidisextended",
            name: "CanTrcvPnCanIdIsExtended",
            displayName: "CanTrcvPnCanIdIsExtended",
            description: "CanTrcvPnCanIdIsExtended 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpnenabled",
            name: "CanTrcvPnEnabled",
            displayName: "CanTrcvPnEnabled",
            description: "CanTrcvPnEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvpnframecanid",
            name: "CanTrcvPnFrameCanId",
            displayName: "CanTrcvPnFrameCanId",
            description: "CanTrcvPnFrameCanId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpnframecanidmask",
            name: "CanTrcvPnFrameCanIdMask",
            displayName: "CanTrcvPnFrameCanIdMask",
            description: "CanTrcvPnFrameCanIdMask 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpnframedlc",
            name: "CanTrcvPnFrameDlc",
            displayName: "CanTrcvPnFrameDlc",
            description: "CanTrcvPnFrameDlc 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvpoweronflag",
            name: "CanTrcvPowerOnFlag",
            displayName: "CanTrcvPowerOnFlag",
            description: "CanTrcvPowerOnFlag 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "cantrcvgeneral",
        name: "CanTrcvGeneral",
        displayName: "CanTrcvGeneral",
        description: "CanTrcvGeneral 配置容器",
        parameters: [
          {
            id: "cantrcvdeverrordetect",
            name: "CanTrcvDevErrorDetect",
            displayName: "CanTrcvDevErrorDetect",
            description: "CanTrcvDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvgetversioninfo",
            name: "CanTrcvGetVersionInfo",
            displayName: "CanTrcvGetVersionInfo",
            description: "CanTrcvGetVersionInfo 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cantrcvindex",
            name: "CanTrcvIndex",
            displayName: "CanTrcvIndex",
            description: "CanTrcvIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cantrcvmainfunctionperiod",
            name: "CanTrcvMainFunctionPeriod",
            displayName: "CanTrcvMainFunctionPeriod",
            description: "CanTrcvMainFunctionPeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cantrcvwakeupsupport",
            name: "CanTrcvWakeUpSupport",
            displayName: "CanTrcvWakeUpSupport",
            description: "CanTrcvWakeUpSupport 参数",
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
    id: "com",
    name: "Com",
    displayName: "COM",
    description: "Com Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "bpeps-100ms-pdu02-6c6b86b4-tx",
        name: "BPEPS_100ms_PDU02_6c6b86b4_Tx",
        displayName: "BPEPS_100ms_PDU02_6c6b86b4_Tx",
        description: "BPEPS_100ms_PDU02_6c6b86b4_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodetimeperiod",
            name: "ComTxModeTimePeriod",
            displayName: "ComTxModeTimePeriod",
            description: "ComTxModeTimePeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodetimeoffset",
            name: "ComTxModeTimeOffset",
            displayName: "ComTxModeTimeOffset",
            description: "ComTxModeTimeOffset 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipducallout",
            name: "ComIPduCallout",
            displayName: "ComIPduCallout",
            description: "ComIPduCallout 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-100ms-pdu11-ec79e64f-tx",
        name: "BPEPS_100ms_PDU11_ec79e64f_Tx",
        displayName: "BPEPS_100ms_PDU11_ec79e64f_Tx",
        description: "BPEPS_100ms_PDU11_ec79e64f_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodetimeperiod",
            name: "ComTxModeTimePeriod",
            displayName: "ComTxModeTimePeriod",
            description: "ComTxModeTimePeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodetimeoffset",
            name: "ComTxModeTimeOffset",
            displayName: "ComTxModeTimeOffset",
            description: "ComTxModeTimeOffset 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-20ms-pdu38-7d518cc7-tx",
        name: "BPEPS_20ms_PDU38_7d518cc7_Tx",
        displayName: "BPEPS_20ms_PDU38_7d518cc7_Tx",
        description: "BPEPS_20ms_PDU38_7d518cc7_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodetimeperiod",
            name: "ComTxModeTimePeriod",
            displayName: "ComTxModeTimePeriod",
            description: "ComTxModeTimePeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodetimeoffset",
            name: "ComTxModeTimeOffset",
            displayName: "ComTxModeTimeOffset",
            description: "ComTxModeTimeOffset 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipducallout",
            name: "ComIPduCallout",
            displayName: "ComIPduCallout",
            description: "ComIPduCallout 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-50ms-pdu06-5318e97a-tx",
        name: "BPEPS_50ms_PDU06_5318e97a_Tx",
        displayName: "BPEPS_50ms_PDU06_5318e97a_Tx",
        description: "BPEPS_50ms_PDU06_5318e97a_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodetimeperiod",
            name: "ComTxModeTimePeriod",
            displayName: "ComTxModeTimePeriod",
            description: "ComTxModeTimePeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodetimeoffset",
            name: "ComTxModeTimeOffset",
            displayName: "ComTxModeTimeOffset",
            description: "ComTxModeTimeOffset 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-lhbdcanfd-rx-5db50b44",
        name: "BPEPS_LHBDCANFD_Rx_5db50b44",
        displayName: "BPEPS_LHBDCANFD_Rx_5db50b44",
        description: "BPEPS_LHBDCANFD_Rx_5db50b44 配置容器",
        parameters: [
          {
            id: "comipdugrouphandleid",
            name: "ComIPduGroupHandleId",
            displayName: "ComIPduGroupHandleId",
            description: "ComIPduGroupHandleId 参数",
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
        id: "bpeps-lhbdcanfd-tx-0befacc2",
        name: "BPEPS_LHBDCANFD_Tx_0befacc2",
        displayName: "BPEPS_LHBDCANFD_Tx_0befacc2",
        description: "BPEPS_LHBDCANFD_Tx_0befacc2 配置容器",
        parameters: [
          {
            id: "comipdugrouphandleid",
            name: "ComIPduGroupHandleId",
            displayName: "ComIPduGroupHandleId",
            description: "ComIPduGroupHandleId 参数",
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
        id: "bpeps-sporadic-pdu25-919eb00c-tx",
        name: "BPEPS_Sporadic_PDU25_919eb00c_Tx",
        displayName: "BPEPS_Sporadic_PDU25_919eb00c_Tx",
        description: "BPEPS_Sporadic_PDU25_919eb00c_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu26-0897e1b6-tx",
        name: "BPEPS_Sporadic_PDU26_0897e1b6_Tx",
        displayName: "BPEPS_Sporadic_PDU26_0897e1b6_Tx",
        description: "BPEPS_Sporadic_PDU26_0897e1b6_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu27-7f90d120-tx",
        name: "BPEPS_Sporadic_PDU27_7f90d120_Tx",
        displayName: "BPEPS_Sporadic_PDU27_7f90d120_Tx",
        description: "BPEPS_Sporadic_PDU27_7f90d120_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu28-ef2fccb1-tx",
        name: "BPEPS_Sporadic_PDU28_ef2fccb1_Tx",
        displayName: "BPEPS_Sporadic_PDU28_ef2fccb1_Tx",
        description: "BPEPS_Sporadic_PDU28_ef2fccb1_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu29-9828fc27-tx",
        name: "BPEPS_Sporadic_PDU29_9828fc27_Tx",
        displayName: "BPEPS_Sporadic_PDU29_9828fc27_Tx",
        description: "BPEPS_Sporadic_PDU29_9828fc27_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu30-f8ef75c2-tx",
        name: "BPEPS_Sporadic_PDU30_f8ef75c2_Tx",
        displayName: "BPEPS_Sporadic_PDU30_f8ef75c2_Tx",
        description: "BPEPS_Sporadic_PDU30_f8ef75c2_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu31-8fe84554-tx",
        name: "BPEPS_Sporadic_PDU31_8fe84554_Tx",
        displayName: "BPEPS_Sporadic_PDU31_8fe84554_Tx",
        description: "BPEPS_Sporadic_PDU31_8fe84554_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu32-16e114ee-tx",
        name: "BPEPS_Sporadic_PDU32_16e114ee_Tx",
        displayName: "BPEPS_Sporadic_PDU32_16e114ee_Tx",
        description: "BPEPS_Sporadic_PDU32_16e114ee_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu33-61e62478-tx",
        name: "BPEPS_Sporadic_PDU33_61e62478_Tx",
        displayName: "BPEPS_Sporadic_PDU33_61e62478_Tx",
        description: "BPEPS_Sporadic_PDU33_61e62478_Tx 配置容器",
        parameters: [
          {
            id: "comipduhandleid",
            name: "ComIPduHandleId",
            displayName: "ComIPduHandleId",
            description: "ComIPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipducancellationsupport",
            name: "ComIPduCancellationSupport",
            displayName: "ComIPduCancellationSupport",
            description: "ComIPduCancellationSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "comtxipduunusedareasdefault",
            name: "ComTxIPduUnusedAreasDefault",
            displayName: "ComTxIPduUnusedAreasDefault",
            description: "ComTxIPduUnusedAreasDefault 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comminimumdelaytime",
            name: "ComMinimumDelayTime",
            displayName: "ComMinimumDelayTime",
            description: "ComMinimumDelayTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comtxmodenumberofrepetitions",
            name: "ComTxModeNumberOfRepetitions",
            displayName: "ComTxModeNumberOfRepetitions",
            description: "ComTxModeNumberOfRepetitions 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "comipdudirection",
            name: "ComIPduDirection",
            displayName: "ComIPduDirection",
            description: "ComIPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdutype",
            name: "ComIPduType",
            displayName: "ComIPduType",
            description: "ComIPduType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comipdusignalprocessing",
            name: "ComIPduSignalProcessing",
            displayName: "ComIPduSignalProcessing",
            description: "ComIPduSignalProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "comtxmodemode",
            name: "ComTxModeMode",
            displayName: "ComTxModeMode",
            description: "ComTxModeMode 参数",
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
    id: "comm",
    name: "Comm",
    displayName: "Communication Manager",
    description: "通信管理器",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "commgeneral",
        name: "ComMGeneral",
        displayName: "ComMGeneral",
        description: "ComMGeneral 配置容器",
        parameters: [
          {
            id: "commpncsupport",
            name: "ComMPncSupport",
            displayName: "ComMPncSupport",
            description: "ComMPncSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commdeverrordetect",
            name: "ComMDevErrorDetect",
            displayName: "ComMDevErrorDetect",
            description: "ComMDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commecugroupclassification",
            name: "ComMEcuGroupClassification",
            displayName: "ComMEcuGroupClassification",
            description: "ComMEcuGroupClassification 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "commmodelimitationenabled",
            name: "ComMModeLimitationEnabled",
            displayName: "ComMModeLimitationEnabled",
            description: "ComMModeLimitationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commsynchronouswakeup",
            name: "ComMSynchronousWakeUp",
            displayName: "ComMSynchronousWakeUp",
            description: "ComMSynchronousWakeUp 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commtminfullcommodeduration",
            name: "ComMTMinFullComModeDuration",
            displayName: "ComMTMinFullComModeDuration",
            description: "ComMTMinFullComModeDuration 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "commversioninfoapi",
            name: "ComMVersionInfoApi",
            displayName: "ComMVersionInfoApi",
            description: "ComMVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commwakeupinhibitionenabled",
            name: "ComMWakeupInhibitionEnabled",
            displayName: "ComMWakeupInhibitionEnabled",
            description: "ComMWakeupInhibitionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commsafebswchecks",
            name: "ComMSafeBswChecks",
            displayName: "ComMSafeBswChecks",
            description: "ComMSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commoutofboundswritesanitizer",
            name: "ComMOutOfBoundsWriteSanitizer",
            displayName: "ComMOutOfBoundsWriteSanitizer",
            description: "ComMOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commoutofboundsreadsanitizer",
            name: "ComMOutOfBoundsReadSanitizer",
            displayName: "ComMOutOfBoundsReadSanitizer",
            description: "ComMOutOfBoundsReadSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commpncidcounting",
            name: "ComMPncIdCounting",
            displayName: "ComMPncIdCounting",
            description: "ComMPncIdCounting 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "commgeneration",
        name: "ComMGeneration",
        displayName: "ComMGeneration",
        description: "ComMGeneration 配置容器",
        parameters: [
          {
            id: "commoutofboundswritesanitizer",
            name: "ComMOutOfBoundsWriteSanitizer",
            displayName: "ComMOutOfBoundsWriteSanitizer",
            description: "ComMOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commoutofboundsreadsanitizer",
            name: "ComMOutOfBoundsReadSanitizer",
            displayName: "ComMOutOfBoundsReadSanitizer",
            description: "ComMOutOfBoundsReadSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "commconfigset",
        name: "ComMConfigSet",
        displayName: "ComMConfigSet",
        description: "ComMConfigSet 配置容器",
        parameters: [
          {
            id: "commpncenabled",
            name: "ComMPncEnabled",
            displayName: "ComMPncEnabled",
            description: "ComMPncEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commchannelid",
            name: "ComMChannelId",
            displayName: "ComMChannelId",
            description: "ComMChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "commfullcommrequestnotificationenabled",
            name: "ComMFullCommRequestNotificationEnabled",
            displayName: "ComMFullCommRequestNotificationEnabled",
            description: "ComMFullCommRequestNotificationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commmainfunctionperiod",
            name: "ComMMainFunctionPeriod",
            displayName: "ComMMainFunctionPeriod",
            description: "ComMMainFunctionPeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "commnocom",
            name: "ComMNoCom",
            displayName: "ComMNoCom",
            description: "ComMNoCom 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commnowakeup",
            name: "ComMNoWakeup",
            displayName: "ComMNoWakeup",
            description: "ComMNoWakeup 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commpncnmrequest",
            name: "ComMPncNmRequest",
            displayName: "ComMPncNmRequest",
            description: "ComMPncNmRequest 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commuseridentifier",
            name: "ComMUserIdentifier",
            displayName: "ComMUserIdentifier",
            description: "ComMUserIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "commusermodenotification",
            name: "ComMUserModeNotification",
            displayName: "ComMUserModeNotification",
            description: "ComMUserModeNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commbustype",
            name: "ComMBusType",
            displayName: "ComMBusType",
            description: "ComMBusType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "commnmvariant",
            name: "ComMNmVariant",
            displayName: "ComMNmVariant",
            description: "ComMNmVariant 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dkmm-lhbdcanfd-a9ca9096",
        name: "DKMM_LHBDCANFD_a9ca9096",
        displayName: "DKMM_LHBDCANFD_a9ca9096",
        description: "DKMM_LHBDCANFD_a9ca9096 配置容器",
        parameters: [
          {
            id: "commchannelid",
            name: "ComMChannelId",
            displayName: "ComMChannelId",
            description: "ComMChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "commfullcommrequestnotificationenabled",
            name: "ComMFullCommRequestNotificationEnabled",
            displayName: "ComMFullCommRequestNotificationEnabled",
            description: "ComMFullCommRequestNotificationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commmainfunctionperiod",
            name: "ComMMainFunctionPeriod",
            displayName: "ComMMainFunctionPeriod",
            description: "ComMMainFunctionPeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "commnocom",
            name: "ComMNoCom",
            displayName: "ComMNoCom",
            description: "ComMNoCom 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commnowakeup",
            name: "ComMNoWakeup",
            displayName: "ComMNoWakeup",
            description: "ComMNoWakeup 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commpncnmrequest",
            name: "ComMPncNmRequest",
            displayName: "ComMPncNmRequest",
            description: "ComMPncNmRequest 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commbustype",
            name: "ComMBusType",
            displayName: "ComMBusType",
            description: "ComMBusType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "commnmvariant",
            name: "ComMNmVariant",
            displayName: "ComMNmVariant",
            description: "ComMNmVariant 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "commnetworkmanagement",
        name: "ComMNetworkManagement",
        displayName: "ComMNetworkManagement",
        description: "ComMNetworkManagement 配置容器",
        parameters: [
          {
            id: "commpncnmrequest",
            name: "ComMPncNmRequest",
            displayName: "ComMPncNmRequest",
            description: "ComMPncNmRequest 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "commnmvariant",
            name: "ComMNmVariant",
            displayName: "ComMNmVariant",
            description: "ComMNmVariant 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dkmm-lhbdcanfd-49934aba",
        name: "DKMM_LHBDCANFD_49934aba",
        displayName: "DKMM_LHBDCANFD_49934aba",
        description: "DKMM_LHBDCANFD_49934aba 配置容器",
        parameters: [
          {
            id: "commuseridentifier",
            name: "ComMUserIdentifier",
            displayName: "ComMUserIdentifier",
            description: "ComMUserIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "commusermodenotification",
            name: "ComMUserModeNotification",
            displayName: "ComMUserModeNotification",
            description: "ComMUserModeNotification 参数",
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
    id: "crc",
    name: "Crc",
    displayName: "CRC",
    description: "CRC 计算服务",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "crcgeneral",
        name: "CrcGeneral",
        displayName: "CrcGeneral",
        description: "CrcGeneral 配置容器",
        parameters: [
          {
            id: "crcversioninfoapi",
            name: "CrcVersionInfoApi",
            displayName: "CrcVersionInfoApi",
            description: "CrcVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "crc16mode",
            name: "Crc16Mode",
            displayName: "Crc16Mode",
            description: "Crc16Mode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "crc32mode",
            name: "Crc32Mode",
            displayName: "Crc32Mode",
            description: "Crc32Mode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "crc8h2fmode",
            name: "Crc8H2FMode",
            displayName: "Crc8H2FMode",
            description: "Crc8H2FMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "crc8mode",
            name: "Crc8Mode",
            displayName: "Crc8Mode",
            description: "Crc8Mode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "crc32p4mode",
            name: "Crc32P4Mode",
            displayName: "Crc32P4Mode",
            description: "Crc32P4Mode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "crc64mode",
            name: "Crc64Mode",
            displayName: "Crc64Mode",
            description: "Crc64Mode 参数",
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
    id: "cryif",
    name: "Cryif",
    displayName: "Crypto Interface",
    description: "加密接口",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "cryifchannel",
        name: "CryIfChannel",
        displayName: "CryIfChannel",
        description: "CryIfChannel 配置容器",
        parameters: [
          {
            id: "cryifchannelid",
            name: "CryIfChannelId",
            displayName: "CryIfChannelId",
            description: "CryIfChannelId 参数",
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
        id: "cryifgeneral",
        name: "CryIfGeneral",
        displayName: "CryIfGeneral",
        description: "CryIfGeneral 配置容器",
        parameters: [
          {
            id: "cryifdeverrordetect",
            name: "CryIfDevErrorDetect",
            displayName: "CryIfDevErrorDetect",
            description: "CryIfDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryifversioninfoapi",
            name: "CryIfVersionInfoApi",
            displayName: "CryIfVersionInfoApi",
            description: "CryIfVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryifmaxnumberofkeyelements",
            name: "CryIfMaxNumberOfKeyElements",
            displayName: "CryIfMaxNumberOfKeyElements",
            description: "CryIfMaxNumberOfKeyElements 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryifmaxsizeofkeyelement",
            name: "CryIfMaxSizeOfKeyElement",
            displayName: "CryIfMaxSizeOfKeyElement",
            description: "CryIfMaxSizeOfKeyElement 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryifredirection",
            name: "CryIfRedirection",
            displayName: "CryIfRedirection",
            description: "CryIfRedirection 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryifsafebswchecks",
            name: "CryIfSafeBswChecks",
            displayName: "CryIfSafeBswChecks",
            description: "CryIfSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "cryifkey",
        name: "CryIfKey",
        displayName: "CryIfKey",
        description: "CryIfKey 配置容器",
        parameters: [
          {
            id: "cryifkeyid",
            name: "CryIfKeyId",
            displayName: "CryIfKeyId",
            description: "CryIfKeyId 参数",
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
        id: "cryifcryptomodule",
        name: "CryIfCryptoModule",
        displayName: "CryIfCryptoModule",
        description: "CryIfCryptoModule 配置容器",
        parameters: [
          {
            id: "cryifsupportskeyelementcopypartial",
            name: "CryIfSupportsKeyElementCopyPartial",
            displayName: "CryIfSupportsKeyElementCopyPartial",
            description: "CryIfSupportsKeyElementCopyPartial 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryifcanceljobapiusesjobtype",
            name: "CryIfCancelJobApiUsesJobType",
            displayName: "CryIfCancelJobApiUsesJobType",
            description: "CryIfCancelJobApiUsesJobType 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryifsupportscertificateapi",
            name: "CryIfSupportsCertificateAPI",
            displayName: "CryIfSupportsCertificateAPI",
            description: "CryIfSupportsCertificateAPI 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryifsupportskeystatusapi",
            name: "CryIfSupportsKeyStatusAPI",
            displayName: "CryIfSupportsKeyStatusAPI",
            description: "CryIfSupportsKeyStatusAPI 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryifcryptokeysetvalidapi",
            name: "CryIfCryptoKeySetValidAPI",
            displayName: "CryIfCryptoKeySetValidAPI",
            description: "CryIfCryptoKeySetValidAPI 参数",
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
    id: "crypto",
    name: "Crypto",
    displayName: "Crypto Services",
    description: "硬件加密服务",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
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
          },
          {
            id: "vendorapiinfix",
            name: "VendorApiInfix",
            displayName: "VendorApiInfix",
            description: "VendorApiInfix 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptodriverobject-0",
        name: "CryptoDriverObject_0",
        displayName: "CryptoDriverObject_0",
        description: "CryptoDriverObject_0 配置容器",
        parameters: [
          {
            id: "cryptodriverobjectid",
            name: "CryptoDriverObjectId",
            displayName: "CryptoDriverObjectId",
            description: "CryptoDriverObjectId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptoqueuesize",
            name: "CryptoQueueSize",
            displayName: "CryptoQueueSize",
            description: "CryptoQueueSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptoprimitivetype",
            name: "CryptoPrimitiveType",
            displayName: "CryptoPrimitiveType",
            description: "CryptoPrimitiveType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptodriverobjects",
        name: "CryptoDriverObjects",
        displayName: "CryptoDriverObjects",
        description: "CryptoDriverObjects 配置容器",
        parameters: [
          {
            id: "cryptodriverobjectid",
            name: "CryptoDriverObjectId",
            displayName: "CryptoDriverObjectId",
            description: "CryptoDriverObjectId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptoqueuesize",
            name: "CryptoQueueSize",
            displayName: "CryptoQueueSize",
            description: "CryptoQueueSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptoprimitivetype",
            name: "CryptoPrimitiveType",
            displayName: "CryptoPrimitiveType",
            description: "CryptoPrimitiveType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptogeneral",
        name: "CryptoGeneral",
        displayName: "CryptoGeneral",
        description: "CryptoGeneral 配置容器",
        parameters: [
          {
            id: "cryptodeverrordetect",
            name: "CryptoDevErrorDetect",
            displayName: "CryptoDevErrorDetect",
            description: "CryptoDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptoenableusermodesupport",
            name: "CryptoEnableUserModeSupport",
            displayName: "CryptoEnableUserModeSupport",
            description: "CryptoEnableUserModeSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptohardwaresemaphore",
            name: "CryptoHardwareSemaphore",
            displayName: "CryptoHardwareSemaphore",
            description: "CryptoHardwareSemaphore 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptoinstanceid",
            name: "CryptoInstanceId",
            displayName: "CryptoInstanceId",
            description: "CryptoInstanceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptotimeoutduration",
            name: "CryptoTimeoutDuration",
            displayName: "CryptoTimeoutDuration",
            description: "CryptoTimeoutDuration 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptoversioninfoapi",
            name: "CryptoVersionInfoApi",
            displayName: "CryptoVersionInfoApi",
            description: "CryptoVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptohostversion",
            name: "CryptoHostVersion",
            displayName: "CryptoHostVersion",
            description: "CryptoHostVersion 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvanceproperties",
        name: "CryptoKeyElementAdvanceProperties",
        displayName: "CryptoKeyElementAdvanceProperties",
        description: "CryptoKeyElementAdvanceProperties 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertydummy",
        name: "CryptoKeyElementAdvancePropertyDummy",
        displayName: "CryptoKeyElementAdvancePropertyDummy",
        description: "CryptoKeyElementAdvancePropertyDummy 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforbledeobfuscatekey",
        name: "CryptoKeyElementAdvancePropertyForBleDeobfuscateKey",
        displayName: "CryptoKeyElementAdvancePropertyForBleDeobfuscateKey",
        description: "CryptoKeyElementAdvancePropertyForBleDeobfuscateKey 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforbleexporta2bltkelke",
        name: "CryptoKeyElementAdvancePropertyForBleExportA2BLtkElke",
        displayName: "CryptoKeyElementAdvancePropertyForBleExportA2BLtkElke",
        description: "CryptoKeyElementAdvancePropertyForBleExportA2BLtkElke 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforblef5ltkkeyblob",
        name: "CryptoKeyElementAdvancePropertyForBleF5LtkKeyBlob",
        displayName: "CryptoKeyElementAdvancePropertyForBleF5LtkKeyBlob",
        description: "CryptoKeyElementAdvancePropertyForBleF5LtkKeyBlob 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforblef5mackey",
        name: "CryptoKeyElementAdvancePropertyForBleF5MacKey",
        displayName: "CryptoKeyElementAdvancePropertyForBleF5MacKey",
        description: "CryptoKeyElementAdvancePropertyForBleF5MacKey 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforbleimporta2bltkelke",
        name: "CryptoKeyElementAdvancePropertyForBleImportA2BLtkElke",
        displayName: "CryptoKeyElementAdvancePropertyForBleImportA2BLtkElke",
        description: "CryptoKeyElementAdvancePropertyForBleImportA2BLtkElke 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforbleltkblob",
        name: "CryptoKeyElementAdvancePropertyForBleLtkBlob",
        displayName: "CryptoKeyElementAdvancePropertyForBleLtkBlob",
        description: "CryptoKeyElementAdvancePropertyForBleLtkBlob 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforbleobfuscatekey",
        name: "CryptoKeyElementAdvancePropertyForBleObfuscateKey",
        displayName: "CryptoKeyElementAdvancePropertyForBleObfuscateKey",
        description: "CryptoKeyElementAdvancePropertyForBleObfuscateKey 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementadvancepropertyforbleskdblob",
        name: "CryptoKeyElementAdvancePropertyForBleSkdBlob",
        displayName: "CryptoKeyElementAdvancePropertyForBleSkdBlob",
        description: "CryptoKeyElementAdvancePropertyForBleSkdBlob 配置容器",
        parameters: [
          {
            id: "cryptokeylock",
            name: "CryptoKeyLock",
            displayName: "CryptoKeyLock",
            description: "CryptoKeyLock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaead",
            name: "CryptoKeyValidForAEAD",
            displayName: "CryptoKeyValidForAEAD",
            description: "CryptoKeyValidForAEAD 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforaes",
            name: "CryptoKeyValidForAES",
            displayName: "CryptoKeyValidForAES",
            description: "CryptoKeyValidForAES 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidfordecrypt",
            name: "CryptoKeyValidForDecrypt",
            displayName: "CryptoKeyValidForDecrypt",
            description: "CryptoKeyValidForDecrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforencrypt",
            name: "CryptoKeyValidForEncrypt",
            displayName: "CryptoKeyValidForEncrypt",
            description: "CryptoKeyValidForEncrypt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforexchange",
            name: "CryptoKeyValidForExchange",
            displayName: "CryptoKeyValidForExchange",
            description: "CryptoKeyValidForExchange 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforimportexport",
            name: "CryptoKeyValidForImportExport",
            displayName: "CryptoKeyValidForImportExport",
            description: "CryptoKeyValidForImportExport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidformac",
            name: "CryptoKeyValidForMAC",
            displayName: "CryptoKeyValidForMAC",
            description: "CryptoKeyValidForMAC 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainread",
            name: "CryptoKeyValidForPlainRead",
            displayName: "CryptoKeyValidForPlainRead",
            description: "CryptoKeyValidForPlainRead 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforplainwrite",
            name: "CryptoKeyValidForPlainWrite",
            displayName: "CryptoKeyValidForPlainWrite",
            description: "CryptoKeyValidForPlainWrite 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsign",
            name: "CryptoKeyValidForSign",
            displayName: "CryptoKeyValidForSign",
            description: "CryptoKeyValidForSign 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforsignverify",
            name: "CryptoKeyValidForSignVerify",
            displayName: "CryptoKeyValidForSignVerify",
            description: "CryptoKeyValidForSignVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyvalidforverify",
            name: "CryptoKeyValidForVerify",
            displayName: "CryptoKeyValidForVerify",
            description: "CryptoKeyValidForVerify 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyaccesssecurelevel",
            name: "CryptoKeyAccessSecureLevel",
            displayName: "CryptoKeyAccessSecureLevel",
            description: "CryptoKeyAccessSecureLevel 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cryptokeyelementforblea2balgorithem",
        name: "CryptoKeyElementForBleA2BAlgorithem",
        displayName: "CryptoKeyElementForBleA2BAlgorithem",
        description: "CryptoKeyElementForBleA2BAlgorithem 配置容器",
        parameters: [
          {
            id: "cryptokeyelementallowpartialaccess",
            name: "CryptoKeyElementAllowPartialAccess",
            displayName: "CryptoKeyElementAllowPartialAccess",
            description: "CryptoKeyElementAllowPartialAccess 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyelementbitssize",
            name: "CryptoKeyElementBitsSize",
            displayName: "CryptoKeyElementBitsSize",
            description: "CryptoKeyElementBitsSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptokeyelementid",
            name: "CryptoKeyElementId",
            displayName: "CryptoKeyElementId",
            description: "CryptoKeyElementId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptokeyelementloadtoram",
            name: "CryptoKeyElementLoadToRAM",
            displayName: "CryptoKeyElementLoadToRAM",
            description: "CryptoKeyElementLoadToRAM 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyelementpersist",
            name: "CryptoKeyElementPersist",
            displayName: "CryptoKeyElementPersist",
            description: "CryptoKeyElementPersist 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "cryptokeyelementsize",
            name: "CryptoKeyElementSize",
            displayName: "CryptoKeyElementSize",
            description: "CryptoKeyElementSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptokeyelementuniqueindex",
            name: "CryptoKeyElementUniqueIndex",
            displayName: "CryptoKeyElementUniqueIndex",
            description: "CryptoKeyElementUniqueIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "cryptokeyelementformat",
            name: "CryptoKeyElementFormat",
            displayName: "CryptoKeyElementFormat",
            description: "CryptoKeyElementFormat 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cryptokeyelementfreetype",
            name: "CryptoKeyElementFreeType",
            displayName: "CryptoKeyElementFreeType",
            description: "CryptoKeyElementFreeType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cryptokeyelementinitvalue",
            name: "CryptoKeyElementInitValue",
            displayName: "CryptoKeyElementInitValue",
            description: "CryptoKeyElementInitValue 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cryptokeyelementreadaccess",
            name: "CryptoKeyElementReadAccess",
            displayName: "CryptoKeyElementReadAccess",
            description: "CryptoKeyElementReadAccess 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cryptokeyelementtype",
            name: "CryptoKeyElementType",
            displayName: "CryptoKeyElementType",
            description: "CryptoKeyElementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "cryptokeyelementwriteaccess",
            name: "CryptoKeyElementWriteAccess",
            displayName: "CryptoKeyElementWriteAccess",
            description: "CryptoKeyElementWriteAccess 参数",
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
    id: "csm",
    name: "Csm",
    displayName: "Crypto Services Manager",
    description: "加密服务管理",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "csmgeneral",
        name: "CsmGeneral",
        displayName: "CsmGeneral",
        description: "CsmGeneral 配置容器",
        parameters: [
          {
            id: "csmasymprivatekeymaxlength",
            name: "CsmAsymPrivateKeyMaxLength",
            displayName: "CsmAsymPrivateKeyMaxLength",
            description: "CsmAsymPrivateKeyMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmasympublickeymaxlength",
            name: "CsmAsymPublicKeyMaxLength",
            displayName: "CsmAsymPublicKeyMaxLength",
            description: "CsmAsymPublicKeyMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmdeverrordetect",
            name: "CsmDevErrorDetect",
            displayName: "CsmDevErrorDetect",
            description: "CsmDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmsymkeymaxlength",
            name: "CsmSymKeyMaxLength",
            displayName: "CsmSymKeyMaxLength",
            description: "CsmSymKeyMaxLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmusedeprecated",
            name: "CsmUseDeprecated",
            displayName: "CsmUseDeprecated",
            description: "CsmUseDeprecated 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmversioninfoapi",
            name: "CsmVersionInfoApi",
            displayName: "CsmVersionInfoApi",
            description: "CsmVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmcallbackstartnotification",
            name: "CsmCallbackStartNotification",
            displayName: "CsmCallbackStartNotification",
            description: "CsmCallbackStartNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmcancelationduringprocessing",
            name: "CsmCancelationDuringProcessing",
            displayName: "CsmCancelationDuringProcessing",
            description: "CsmCancelationDuringProcessing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmsafebswchecks",
            name: "CsmSafeBswChecks",
            displayName: "CsmSafeBswChecks",
            description: "CsmSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmmultipartitionruntimechecks",
            name: "CsmMultiPartitionRuntimeChecks",
            displayName: "CsmMultiPartitionRuntimeChecks",
            description: "CsmMultiPartitionRuntimeChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutasr430compatibility",
            name: "CsmJobTypeLayoutAsr430Compatibility",
            displayName: "CsmJobTypeLayoutAsr430Compatibility",
            description: "CsmJobTypeLayoutAsr430Compatibility 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutvarmembers",
            name: "CsmJobTypeLayoutVarMembers",
            displayName: "CsmJobTypeLayoutVarMembers",
            description: "CsmJobTypeLayoutVarMembers 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutinput64",
            name: "CsmJobTypeLayoutInput64",
            displayName: "CsmJobTypeLayoutInput64",
            description: "CsmJobTypeLayoutInput64 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutoutput64ptr",
            name: "CsmJobTypeLayoutOutput64Ptr",
            displayName: "CsmJobTypeLayoutOutput64Ptr",
            description: "CsmJobTypeLayoutOutput64Ptr 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutredirectioninforef",
            name: "CsmJobTypeLayoutRedirectionInfoRef",
            displayName: "CsmJobTypeLayoutRedirectionInfoRef",
            description: "CsmJobTypeLayoutRedirectionInfoRef 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutjobinfoptr",
            name: "CsmJobTypeLayoutJobInfoPtr",
            displayName: "CsmJobTypeLayoutJobInfoPtr",
            description: "CsmJobTypeLayoutJobInfoPtr 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutsecurecounterid",
            name: "CsmJobTypeLayoutSecureCounterId",
            displayName: "CsmJobTypeLayoutSecureCounterId",
            description: "CsmJobTypeLayoutSecureCounterId 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutcallbackupdatenotification",
            name: "CsmJobTypeLayoutCallbackUpdateNotification",
            displayName: "CsmJobTypeLayoutCallbackUpdateNotification",
            description: "CsmJobTypeLayoutCallbackUpdateNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutresultlength",
            name: "CsmJobTypeLayoutResultLength",
            displayName: "CsmJobTypeLayoutResultLength",
            description: "CsmJobTypeLayoutResultLength 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmswcmaininterfaceversion",
            name: "CsmSwcMainInterfaceVersion",
            displayName: "CsmSwcMainInterfaceVersion",
            description: "CsmSwcMainInterfaceVersion 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmjobtypelayoutfieldordering",
            name: "CsmJobTypeLayoutFieldOrdering",
            displayName: "CsmJobTypeLayoutFieldOrdering",
            description: "CsmJobTypeLayoutFieldOrdering 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmdefaultjobkeyapiversion",
            name: "CsmDefaultJobKeyApiVersion",
            displayName: "CsmDefaultJobKeyApiVersion",
            description: "CsmDefaultJobKeyApiVersion 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmjobtypelayout",
        name: "CsmJobTypeLayout",
        displayName: "CsmJobTypeLayout",
        description: "CsmJobTypeLayout 配置容器",
        parameters: [
          {
            id: "csmjobtypelayoutasr430compatibility",
            name: "CsmJobTypeLayoutAsr430Compatibility",
            displayName: "CsmJobTypeLayoutAsr430Compatibility",
            description: "CsmJobTypeLayoutAsr430Compatibility 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutvarmembers",
            name: "CsmJobTypeLayoutVarMembers",
            displayName: "CsmJobTypeLayoutVarMembers",
            description: "CsmJobTypeLayoutVarMembers 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutinput64",
            name: "CsmJobTypeLayoutInput64",
            displayName: "CsmJobTypeLayoutInput64",
            description: "CsmJobTypeLayoutInput64 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutoutput64ptr",
            name: "CsmJobTypeLayoutOutput64Ptr",
            displayName: "CsmJobTypeLayoutOutput64Ptr",
            description: "CsmJobTypeLayoutOutput64Ptr 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutredirectioninforef",
            name: "CsmJobTypeLayoutRedirectionInfoRef",
            displayName: "CsmJobTypeLayoutRedirectionInfoRef",
            description: "CsmJobTypeLayoutRedirectionInfoRef 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutjobinfoptr",
            name: "CsmJobTypeLayoutJobInfoPtr",
            displayName: "CsmJobTypeLayoutJobInfoPtr",
            description: "CsmJobTypeLayoutJobInfoPtr 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutsecurecounterid",
            name: "CsmJobTypeLayoutSecureCounterId",
            displayName: "CsmJobTypeLayoutSecureCounterId",
            description: "CsmJobTypeLayoutSecureCounterId 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutcallbackupdatenotification",
            name: "CsmJobTypeLayoutCallbackUpdateNotification",
            displayName: "CsmJobTypeLayoutCallbackUpdateNotification",
            description: "CsmJobTypeLayoutCallbackUpdateNotification 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutresultlength",
            name: "CsmJobTypeLayoutResultLength",
            displayName: "CsmJobTypeLayoutResultLength",
            description: "CsmJobTypeLayoutResultLength 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobtypelayoutfieldordering",
            name: "CsmJobTypeLayoutFieldOrdering",
            displayName: "CsmJobTypeLayoutFieldOrdering",
            description: "CsmJobTypeLayoutFieldOrdering 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmbswapicompatibility",
        name: "CsmBswApiCompatibility",
        displayName: "CsmBswApiCompatibility",
        description: "CsmBswApiCompatibility 配置容器",
        parameters: [
          {
            id: "csmdefaultjobkeyapiversion",
            name: "CsmDefaultJobKeyApiVersion",
            displayName: "CsmDefaultJobKeyApiVersion",
            description: "CsmDefaultJobKeyApiVersion 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmkeys",
        name: "CsmKeys",
        displayName: "CsmKeys",
        description: "CsmKeys 配置容器",
        parameters: [
          {
            id: "csmkeyid",
            name: "CsmKeyId",
            displayName: "CsmKeyId",
            description: "CsmKeyId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmkeyuseport",
            name: "CsmKeyUsePort",
            displayName: "CsmKeyUsePort",
            description: "CsmKeyUsePort 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "csmkey-cryifkey",
        name: "CsmKey_CryIfKey",
        displayName: "CsmKey_CryIfKey",
        description: "CsmKey_CryIfKey 配置容器",
        parameters: [
          {
            id: "csmkeyid",
            name: "CsmKeyId",
            displayName: "CsmKeyId",
            description: "CsmKeyId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmkeyuseport",
            name: "CsmKeyUsePort",
            displayName: "CsmKeyUsePort",
            description: "CsmKeyUsePort 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "csmmainfunction",
        name: "CsmMainFunction",
        displayName: "CsmMainFunction",
        description: "CsmMainFunction 配置容器",
        parameters: [
          {
            id: "csmmainfunctionperiod",
            name: "CsmMainFunctionPeriod",
            displayName: "CsmMainFunctionPeriod",
            description: "CsmMainFunctionPeriod 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmjobs",
        name: "CsmJobs",
        displayName: "CsmJobs",
        description: "CsmJobs 配置容器",
        parameters: [
          {
            id: "csmjobid",
            name: "CsmJobId",
            displayName: "CsmJobId",
            description: "CsmJobId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmjobpriority",
            name: "CsmJobPriority",
            displayName: "CsmJobPriority",
            description: "CsmJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmjobuseport",
            name: "CsmJobUsePort",
            displayName: "CsmJobUsePort",
            description: "CsmJobUsePort 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmprocessingmode",
            name: "CsmProcessingMode",
            displayName: "CsmProcessingMode",
            description: "CsmProcessingMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmjobinterfaceuseport",
            name: "CsmJobInterfaceUsePort",
            displayName: "CsmJobInterfaceUsePort",
            description: "CsmJobInterfaceUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmjob",
        name: "CsmJob",
        displayName: "CsmJob",
        description: "CsmJob 配置容器",
        parameters: [
          {
            id: "csmjobid",
            name: "CsmJobId",
            displayName: "CsmJobId",
            description: "CsmJobId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmjobpriority",
            name: "CsmJobPriority",
            displayName: "CsmJobPriority",
            description: "CsmJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmjobuseport",
            name: "CsmJobUsePort",
            displayName: "CsmJobUsePort",
            description: "CsmJobUsePort 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmprocessingmode",
            name: "CsmProcessingMode",
            displayName: "CsmProcessingMode",
            description: "CsmProcessingMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmjobinterfaceuseport",
            name: "CsmJobInterfaceUsePort",
            displayName: "CsmJobInterfaceUsePort",
            description: "CsmJobInterfaceUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmqueues",
        name: "CsmQueues",
        displayName: "CsmQueues",
        description: "CsmQueues 配置容器",
        parameters: [
          {
            id: "csmqueuesize",
            name: "CsmQueueSize",
            displayName: "CsmQueueSize",
            description: "CsmQueueSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmtriggerasynchjobsincallback",
            name: "CsmTriggerAsynchJobsInCallback",
            displayName: "CsmTriggerAsynchJobsInCallback",
            description: "CsmTriggerAsynchJobsInCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobsharing",
            name: "CsmJobSharing",
            displayName: "CsmJobSharing",
            description: "CsmJobSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmoperationmodelimitation",
            name: "CsmOperationModeLimitation",
            displayName: "CsmOperationModeLimitation",
            description: "CsmOperationModeLimitation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmqueueprocessingmode",
            name: "CsmQueueProcessingMode",
            displayName: "CsmQueueProcessingMode",
            description: "CsmQueueProcessingMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmqueue",
        name: "CsmQueue",
        displayName: "CsmQueue",
        description: "CsmQueue 配置容器",
        parameters: [
          {
            id: "csmqueuesize",
            name: "CsmQueueSize",
            displayName: "CsmQueueSize",
            description: "CsmQueueSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmtriggerasynchjobsincallback",
            name: "CsmTriggerAsynchJobsInCallback",
            displayName: "CsmTriggerAsynchJobsInCallback",
            description: "CsmTriggerAsynchJobsInCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmjobsharing",
            name: "CsmJobSharing",
            displayName: "CsmJobSharing",
            description: "CsmJobSharing 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmoperationmodelimitation",
            name: "CsmOperationModeLimitation",
            displayName: "CsmOperationModeLimitation",
            description: "CsmOperationModeLimitation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "csmqueueprocessingmode",
            name: "CsmQueueProcessingMode",
            displayName: "CsmQueueProcessingMode",
            description: "CsmQueueProcessingMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmprimitives",
        name: "CsmPrimitives",
        displayName: "CsmPrimitives",
        description: "CsmPrimitives 配置容器",
        parameters: [
          {
            id: "csmhashresultlength",
            name: "CsmHashResultLength",
            displayName: "CsmHashResultLength",
            description: "CsmHashResultLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmhashalgorithmfamiliy",
            name: "CsmHashAlgorithmFamiliy",
            displayName: "CsmHashAlgorithmFamiliy",
            description: "CsmHashAlgorithmFamiliy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashalgorithmfamily",
            name: "CsmHashAlgorithmFamily",
            displayName: "CsmHashAlgorithmFamily",
            description: "CsmHashAlgorithmFamily 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashalgorithmmode",
            name: "CsmHashAlgorithmMode",
            displayName: "CsmHashAlgorithmMode",
            description: "CsmHashAlgorithmMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashalgorithmsecondaryfamily",
            name: "CsmHashAlgorithmSecondaryFamily",
            displayName: "CsmHashAlgorithmSecondaryFamily",
            description: "CsmHashAlgorithmSecondaryFamily 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashprocessing",
            name: "CsmHashProcessing",
            displayName: "CsmHashProcessing",
            description: "CsmHashProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "csmhash",
        name: "CsmHash",
        displayName: "CsmHash",
        description: "CsmHash 配置容器",
        parameters: [
          {
            id: "csmhashresultlength",
            name: "CsmHashResultLength",
            displayName: "CsmHashResultLength",
            description: "CsmHashResultLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "csmhashalgorithmfamiliy",
            name: "CsmHashAlgorithmFamiliy",
            displayName: "CsmHashAlgorithmFamiliy",
            description: "CsmHashAlgorithmFamiliy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashalgorithmfamily",
            name: "CsmHashAlgorithmFamily",
            displayName: "CsmHashAlgorithmFamily",
            description: "CsmHashAlgorithmFamily 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashalgorithmmode",
            name: "CsmHashAlgorithmMode",
            displayName: "CsmHashAlgorithmMode",
            description: "CsmHashAlgorithmMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashalgorithmsecondaryfamily",
            name: "CsmHashAlgorithmSecondaryFamily",
            displayName: "CsmHashAlgorithmSecondaryFamily",
            description: "CsmHashAlgorithmSecondaryFamily 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "csmhashprocessing",
            name: "CsmHashProcessing",
            displayName: "CsmHashProcessing",
            description: "CsmHashProcessing 参数",
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
    id: "dcm",
    name: "Dcm",
    displayName: "Diagnostic Communication Manager",
    description: "Dcm Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "active-diagnostic-session",
        name: "Active_Diagnostic_Session",
        displayName: "Active_Diagnostic_Session",
        description: "Active_Diagnostic_Session 配置容器",
        parameters: [
          {
            id: "dcmdspdiddatapos",
            name: "DcmDspDidDataPos",
            displayName: "DcmDspDidDataPos",
            description: "DcmDspDidDataPos 参数",
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
        id: "active-diagnostic-session-active-diagnostic-session",
        name: "Active_Diagnostic_Session_Active_Diagnostic_Session",
        displayName: "Active_Diagnostic_Session_Active_Diagnostic_Session",
        description: "Active_Diagnostic_Session_Active_Diagnostic_Session 配置容器",
        parameters: [
          {
            id: "dcmdspdatasize",
            name: "DcmDspDataSize",
            displayName: "DcmDspDataSize",
            description: "DcmDspDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdspdatatype",
            name: "DcmDspDataType",
            displayName: "DcmDspDataType",
            description: "DcmDspDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdatauseport",
            name: "DcmDspDataUsePort",
            displayName: "DcmDspDataUsePort",
            description: "DcmDspDataUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdataconditioncheckreadfnc",
            name: "DcmDspDataConditionCheckReadFnc",
            displayName: "DcmDspDataConditionCheckReadFnc",
            description: "DcmDspDataConditionCheckReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdatareadfnc",
            name: "DcmDspDataReadFnc",
            displayName: "DcmDspDataReadFnc",
            description: "DcmDspDataReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "ble-ranging-calibration-data",
        name: "BLE_Ranging_Calibration_data",
        displayName: "BLE_Ranging_Calibration_data",
        description: "BLE_Ranging_Calibration_data 配置容器",
        parameters: [
          {
            id: "dcmdspdiddatapos",
            name: "DcmDspDidDataPos",
            displayName: "DcmDspDidDataPos",
            description: "DcmDspDidDataPos 参数",
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
        id: "ble-ranging-calibration-data-ble-ranging-calibration-data",
        name: "BLE_Ranging_Calibration_data_BLE_Ranging_Calibration_data",
        displayName: "BLE_Ranging_Calibration_data_BLE_Ranging_Calibration_data",
        description: "BLE_Ranging_Calibration_data_BLE_Ranging_Calibration_data 配置容器",
        parameters: [
          {
            id: "dcmdspdatasize",
            name: "DcmDspDataSize",
            displayName: "DcmDspDataSize",
            description: "DcmDspDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdspdatatype",
            name: "DcmDspDataType",
            displayName: "DcmDspDataType",
            description: "DcmDspDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdatauseport",
            name: "DcmDspDataUsePort",
            displayName: "DcmDspDataUsePort",
            description: "DcmDspDataUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdataconditioncheckreadfnc",
            name: "DcmDspDataConditionCheckReadFnc",
            displayName: "DcmDspDataConditionCheckReadFnc",
            description: "DcmDspDataConditionCheckReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdatareadfnc",
            name: "DcmDspDataReadFnc",
            displayName: "DcmDspDataReadFnc",
            description: "DcmDspDataReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-workingstatus",
        name: "BPEPS_WorkingStatus",
        displayName: "BPEPS_WorkingStatus",
        description: "BPEPS_WorkingStatus 配置容器",
        parameters: [
          {
            id: "dcmdspdiddatapos",
            name: "DcmDspDidDataPos",
            displayName: "DcmDspDidDataPos",
            description: "DcmDspDidDataPos 参数",
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
        id: "bpeps-workingstatus-bpeps-workingstatus",
        name: "BPEPS_WorkingStatus_BPEPS_WorkingStatus",
        displayName: "BPEPS_WorkingStatus_BPEPS_WorkingStatus",
        description: "BPEPS_WorkingStatus_BPEPS_WorkingStatus 配置容器",
        parameters: [
          {
            id: "dcmdspdatasize",
            name: "DcmDspDataSize",
            displayName: "DcmDspDataSize",
            description: "DcmDspDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdspdatatype",
            name: "DcmDspDataType",
            displayName: "DcmDspDataType",
            description: "DcmDspDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdatauseport",
            name: "DcmDspDataUsePort",
            displayName: "DcmDspDataUsePort",
            description: "DcmDspDataUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdataconditioncheckreadfnc",
            name: "DcmDspDataConditionCheckReadFnc",
            displayName: "DcmDspDataConditionCheckReadFnc",
            description: "DcmDspDataConditionCheckReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdspdatareadfnc",
            name: "DcmDspDataReadFnc",
            displayName: "DcmDspDataReadFnc",
            description: "DcmDspDataReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cleardiaginfo",
        name: "ClearDiagInfo",
        displayName: "ClearDiagInfo",
        description: "ClearDiagInfo 配置容器",
        parameters: [
          {
            id: "dcmdsdsidtabserviceid",
            name: "DcmDsdSidTabServiceId",
            displayName: "DcmDsdSidTabServiceId",
            description: "DcmDsdSidTabServiceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdsdsidtabsubfuncavail",
            name: "DcmDsdSidTabSubfuncAvail",
            displayName: "DcmDsdSidTabSubfuncAvail",
            description: "DcmDsdSidTabSubfuncAvail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dcmdsdsidtabused",
            name: "DcmDsdSidTabUsed",
            displayName: "DcmDsdSidTabUsed",
            description: "DcmDsdSidTabUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "communicationcontrol",
        name: "CommunicationControl",
        displayName: "CommunicationControl",
        description: "CommunicationControl 配置容器",
        parameters: [
          {
            id: "dcmdsdsidtabserviceid",
            name: "DcmDsdSidTabServiceId",
            displayName: "DcmDsdSidTabServiceId",
            description: "DcmDsdSidTabServiceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdsdsidtabsubfuncavail",
            name: "DcmDsdSidTabSubfuncAvail",
            displayName: "DcmDsdSidTabSubfuncAvail",
            description: "DcmDsdSidTabSubfuncAvail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dcmdsdsidtabused",
            name: "DcmDsdSidTabUsed",
            displayName: "DcmDsdSidTabUsed",
            description: "DcmDsdSidTabUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dcmdsdsubserviceid",
            name: "DcmDsdSubServiceId",
            displayName: "DcmDsdSubServiceId",
            description: "DcmDsdSubServiceId 参数",
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
        id: "controldtcsetting",
        name: "ControlDtcSetting",
        displayName: "ControlDtcSetting",
        description: "ControlDtcSetting 配置容器",
        parameters: [
          {
            id: "dcmdsdsidtabserviceid",
            name: "DcmDsdSidTabServiceId",
            displayName: "DcmDsdSidTabServiceId",
            description: "DcmDsdSidTabServiceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdsdsidtabsubfuncavail",
            name: "DcmDsdSidTabSubfuncAvail",
            displayName: "DcmDsdSidTabSubfuncAvail",
            description: "DcmDsdSidTabSubfuncAvail 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dcmdsdsidtabused",
            name: "DcmDsdSidTabUsed",
            displayName: "DcmDsdSidTabUsed",
            description: "DcmDsdSidTabUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dcmdsdsubserviceid",
            name: "DcmDsdSubServiceId",
            displayName: "DcmDsdSubServiceId",
            description: "DcmDsdSubServiceId 参数",
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
        id: "dc-0xe001-omyecu-ocan-9c85e87b",
        name: "DC_0xE001_oMyECU_oCAN_9c85e87b",
        displayName: "DC_0xE001_oMyECU_oCAN_9c85e87b",
        description: "DC_0xE001_oMyECU_oCAN_9c85e87b 配置容器",
        parameters: [
          {
            id: "dcmdslprotocolrxtestersourceaddr",
            name: "DcmDslProtocolRxTesterSourceAddr",
            displayName: "DcmDslProtocolRxTesterSourceAddr",
            description: "DcmDslProtocolRxTesterSourceAddr 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdslprotocolrxconnectionid",
            name: "DcmDslProtocolRxConnectionId",
            displayName: "DcmDslProtocolRxConnectionId",
            description: "DcmDslProtocolRxConnectionId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdslprotocolrxpduid",
            name: "DcmDslProtocolRxPduId",
            displayName: "DcmDslProtocolRxPduId",
            description: "DcmDslProtocolRxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdslprotocolrxchannelid",
            name: "DcmDslProtocolRxChannelId",
            displayName: "DcmDslProtocolRxChannelId",
            description: "DcmDslProtocolRxChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdsltxconfirmationpduid",
            name: "DcmDslTxConfirmationPduId",
            displayName: "DcmDslTxConfirmationPduId",
            description: "DcmDslTxConfirmationPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdsladdressingtype",
            name: "DcmDslAddressingType",
            displayName: "DcmDslAddressingType",
            description: "DcmDslAddressingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "dcmdslprotocolrxaddrtype",
            name: "DcmDslProtocolRxAddrType",
            displayName: "DcmDslProtocolRxAddrType",
            description: "DcmDslProtocolRxAddrType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "diag-lhbdcanfd-funcreq-sdu-269ed755-rx-477d06eb",
        name: "DIAG_LHBDCANFD_FuncReq_SDU_269ed755_Rx_477d06eb",
        displayName: "DIAG_LHBDCANFD_FuncReq_SDU_269ed755_Rx_477d06eb",
        description: "DIAG_LHBDCANFD_FuncReq_SDU_269ed755_Rx_477d06eb 配置容器",
        parameters: [
          {
            id: "dcmdslprotocolrxpduid",
            name: "DcmDslProtocolRxPduId",
            displayName: "DcmDslProtocolRxPduId",
            description: "DcmDslProtocolRxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdslprotocolrxchannelid",
            name: "DcmDslProtocolRxChannelId",
            displayName: "DcmDslProtocolRxChannelId",
            description: "DcmDslProtocolRxChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdslprotocolrxaddrtype",
            name: "DcmDslProtocolRxAddrType",
            displayName: "DcmDslProtocolRxAddrType",
            description: "DcmDslProtocolRxAddrType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "diag-lhbdcanfd-phyreq-dkmm-sdu-8c6e0837-rx-066ae7fd",
        name: "DIAG_LHBDCANFD_PhyReq_DKMM_SDU_8c6e0837_Rx_066ae7fd",
        displayName: "DIAG_LHBDCANFD_PhyReq_DKMM_SDU_8c6e0837_Rx_066ae7fd",
        description: "DIAG_LHBDCANFD_PhyReq_DKMM_SDU_8c6e0837_Rx_066ae7fd 配置容器",
        parameters: [
          {
            id: "dcmdslprotocolrxpduid",
            name: "DcmDslProtocolRxPduId",
            displayName: "DcmDslProtocolRxPduId",
            description: "DcmDslProtocolRxPduId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdslprotocolrxchannelid",
            name: "DcmDslProtocolRxChannelId",
            displayName: "DcmDslProtocolRxChannelId",
            description: "DcmDslProtocolRxChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdslprotocolrxaddrtype",
            name: "DcmDslProtocolRxAddrType",
            displayName: "DcmDslProtocolRxAddrType",
            description: "DcmDslProtocolRxAddrType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "diag-lhbdcanfd-phyresp-dkmm-sdu-192b76e8-tx-87ad90a2",
        name: "DIAG_LHBDCANFD_PhyResp_DKMM_SDU_192b76e8_Tx_87ad90a2",
        displayName: "DIAG_LHBDCANFD_PhyResp_DKMM_SDU_192b76e8_Tx_87ad90a2",
        description: "DIAG_LHBDCANFD_PhyResp_DKMM_SDU_192b76e8_Tx_87ad90a2 配置容器",
        parameters: [
          {
            id: "dcmdsltxconfirmationpduid",
            name: "DcmDslTxConfirmationPduId",
            displayName: "DcmDslTxConfirmationPduId",
            description: "DcmDslTxConfirmationPduId 参数",
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
        id: "did-ble-ranging-info",
        name: "DID_BLE_Ranging_Info",
        displayName: "DID_BLE_Ranging_Info",
        description: "DID_BLE_Ranging_Info 配置容器",
        parameters: [
          {
            id: "dcmdspdididentifier",
            name: "DcmDspDidIdentifier",
            displayName: "DcmDspDidIdentifier",
            description: "DcmDspDidIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdspdidused",
            name: "DcmDspDidUsed",
            displayName: "DcmDspDidUsed",
            description: "DcmDspDidUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dcmdspdiddatapos",
            name: "DcmDspDidDataPos",
            displayName: "DcmDspDidDataPos",
            description: "DcmDspDidDataPos 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdspdiduseport",
            name: "DcmDspDidUsePort",
            displayName: "DcmDspDidUsePort",
            description: "DcmDspDidUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "did-bpeps-bluetooth-address",
        name: "DID_BPEPS_Bluetooth_Address",
        displayName: "DID_BPEPS_Bluetooth_Address",
        description: "DID_BPEPS_Bluetooth_Address 配置容器",
        parameters: [
          {
            id: "dcmdspdididentifier",
            name: "DcmDspDidIdentifier",
            displayName: "DcmDspDidIdentifier",
            description: "DcmDspDidIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdspdidused",
            name: "DcmDspDidUsed",
            displayName: "DcmDspDidUsed",
            description: "DcmDspDidUsed 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "dcmdspdiddatapos",
            name: "DcmDspDidDataPos",
            displayName: "DcmDspDidDataPos",
            description: "DcmDspDidDataPos 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "dcmdspdiduseport",
            name: "DcmDspDidUsePort",
            displayName: "DcmDspDidUsePort",
            description: "DcmDspDidUsePort 参数",
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
    id: "dem",
    name: "Dem",
    displayName: "Diagnostic Event Manager",
    description: "Dem Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "agedcounter",
        name: "AgedCounter",
        displayName: "AgedCounter",
        description: "AgedCounter 配置容器",
        parameters: [
          {
            id: "demdataelementdatasize",
            name: "DemDataElementDataSize",
            displayName: "DemDataElementDataSize",
            description: "DemDataElementDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdataelementstorenonvolatile",
            name: "DemDataElementStoreNonVolatile",
            displayName: "DemDataElementStoreNonVolatile",
            description: "DemDataElementStoreNonVolatile 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdataelementuseport",
            name: "DemDataElementUsePort",
            displayName: "DemDataElementUsePort",
            description: "DemDataElementUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementinternaldata",
            name: "DemDataElementInternalData",
            displayName: "DemDataElementInternalData",
            description: "DemDataElementInternalData 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "agingcounter",
        name: "AgingCounter",
        displayName: "AgingCounter",
        description: "AgingCounter 配置容器",
        parameters: [
          {
            id: "demdataelementdatasize",
            name: "DemDataElementDataSize",
            displayName: "DemDataElementDataSize",
            description: "DemDataElementDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdataelementstorenonvolatile",
            name: "DemDataElementStoreNonVolatile",
            displayName: "DemDataElementStoreNonVolatile",
            description: "DemDataElementStoreNonVolatile 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdataelementuseport",
            name: "DemDataElementUsePort",
            displayName: "DemDataElementUsePort",
            description: "DemDataElementUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementinternaldata",
            name: "DemDataElementInternalData",
            displayName: "DemDataElementInternalData",
            description: "DemDataElementInternalData 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "did-0x10b-date-time",
        name: "DID_0x10b_Date_time",
        displayName: "DID_0x10b_Date_time",
        description: "DID_0x10b_Date_time 配置容器",
        parameters: [
          {
            id: "demdataelementdatasize",
            name: "DemDataElementDataSize",
            displayName: "DemDataElementDataSize",
            description: "DemDataElementDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdataelementstorenonvolatile",
            name: "DemDataElementStoreNonVolatile",
            displayName: "DemDataElementStoreNonVolatile",
            description: "DemDataElementStoreNonVolatile 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdataelementdatatype",
            name: "DemDataElementDataType",
            displayName: "DemDataElementDataType",
            description: "DemDataElementDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementendianness",
            name: "DemDataElementEndianness",
            displayName: "DemDataElementEndianness",
            description: "DemDataElementEndianness 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementuseport",
            name: "DemDataElementUsePort",
            displayName: "DemDataElementUsePort",
            description: "DemDataElementUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementreadfnc",
            name: "DemDataElementReadFnc",
            displayName: "DemDataElementReadFnc",
            description: "DemDataElementReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "did-0x112-supply-voltage",
        name: "DID_0x112_Supply_voltage",
        displayName: "DID_0x112_Supply_voltage",
        description: "DID_0x112_Supply_voltage 配置容器",
        parameters: [
          {
            id: "demdataelementdatasize",
            name: "DemDataElementDataSize",
            displayName: "DemDataElementDataSize",
            description: "DemDataElementDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdataelementstorenonvolatile",
            name: "DemDataElementStoreNonVolatile",
            displayName: "DemDataElementStoreNonVolatile",
            description: "DemDataElementStoreNonVolatile 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdataelementdatatype",
            name: "DemDataElementDataType",
            displayName: "DemDataElementDataType",
            description: "DemDataElementDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementendianness",
            name: "DemDataElementEndianness",
            displayName: "DemDataElementEndianness",
            description: "DemDataElementEndianness 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementuseport",
            name: "DemDataElementUsePort",
            displayName: "DemDataElementUsePort",
            description: "DemDataElementUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementreadfnc",
            name: "DemDataElementReadFnc",
            displayName: "DemDataElementReadFnc",
            description: "DemDataElementReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "did-0xd002-vehicle-state",
        name: "DID_0xd002_Vehicle_State",
        displayName: "DID_0xd002_Vehicle_State",
        description: "DID_0xd002_Vehicle_State 配置容器",
        parameters: [
          {
            id: "demdataelementdatasize",
            name: "DemDataElementDataSize",
            displayName: "DemDataElementDataSize",
            description: "DemDataElementDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdataelementstorenonvolatile",
            name: "DemDataElementStoreNonVolatile",
            displayName: "DemDataElementStoreNonVolatile",
            description: "DemDataElementStoreNonVolatile 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdataelementdatatype",
            name: "DemDataElementDataType",
            displayName: "DemDataElementDataType",
            description: "DemDataElementDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementendianness",
            name: "DemDataElementEndianness",
            displayName: "DemDataElementEndianness",
            description: "DemDataElementEndianness 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementuseport",
            name: "DemDataElementUsePort",
            displayName: "DemDataElementUsePort",
            description: "DemDataElementUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementreadfnc",
            name: "DemDataElementReadFnc",
            displayName: "DemDataElementReadFnc",
            description: "DemDataElementReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "did-0xe010-vehicle-speed",
        name: "DID_0xe010_Vehicle_Speed",
        displayName: "DID_0xe010_Vehicle_Speed",
        description: "DID_0xe010_Vehicle_Speed 配置容器",
        parameters: [
          {
            id: "demdataelementdatasize",
            name: "DemDataElementDataSize",
            displayName: "DemDataElementDataSize",
            description: "DemDataElementDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdataelementstorenonvolatile",
            name: "DemDataElementStoreNonVolatile",
            displayName: "DemDataElementStoreNonVolatile",
            description: "DemDataElementStoreNonVolatile 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdataelementdatatype",
            name: "DemDataElementDataType",
            displayName: "DemDataElementDataType",
            description: "DemDataElementDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementendianness",
            name: "DemDataElementEndianness",
            displayName: "DemDataElementEndianness",
            description: "DemDataElementEndianness 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementuseport",
            name: "DemDataElementUsePort",
            displayName: "DemDataElementUsePort",
            description: "DemDataElementUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementreadfnc",
            name: "DemDataElementReadFnc",
            displayName: "DemDataElementReadFnc",
            description: "DemDataElementReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "did-0xe101-odometer-reading",
        name: "DID_0xe101_Odometer_reading",
        displayName: "DID_0xe101_Odometer_reading",
        description: "DID_0xe101_Odometer_reading 配置容器",
        parameters: [
          {
            id: "demdataelementdatasize",
            name: "DemDataElementDataSize",
            displayName: "DemDataElementDataSize",
            description: "DemDataElementDataSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdataelementstorenonvolatile",
            name: "DemDataElementStoreNonVolatile",
            displayName: "DemDataElementStoreNonVolatile",
            description: "DemDataElementStoreNonVolatile 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdataelementdatatype",
            name: "DemDataElementDataType",
            displayName: "DemDataElementDataType",
            description: "DemDataElementDataType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementendianness",
            name: "DemDataElementEndianness",
            displayName: "DemDataElementEndianness",
            description: "DemDataElementEndianness 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementuseport",
            name: "DemDataElementUsePort",
            displayName: "DemDataElementUsePort",
            description: "DemDataElementUsePort 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "demdataelementreadfnc",
            name: "DemDataElementReadFnc",
            displayName: "DemDataElementReadFnc",
            description: "DemDataElementReadFnc 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dtcclass-dtc-0x978700",
        name: "DTCClass_DTC_0x978700",
        displayName: "DTCClass_DTC_0x978700",
        description: "DTCClass_DTC_0x978700 配置容器",
        parameters: [
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdtcseverity",
            name: "DemDTCSeverity",
            displayName: "DemDTCSeverity",
            description: "DemDTCSeverity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dtcclass-dtc-0x978704",
        name: "DTCClass_DTC_0x978704",
        displayName: "DTCClass_DTC_0x978704",
        description: "DTCClass_DTC_0x978704 配置容器",
        parameters: [
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdtcseverity",
            name: "DemDTCSeverity",
            displayName: "DemDTCSeverity",
            description: "DemDTCSeverity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dtcclass-dtc-0x978745",
        name: "DTCClass_DTC_0x978745",
        displayName: "DTCClass_DTC_0x978745",
        description: "DTCClass_DTC_0x978745 配置容器",
        parameters: [
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdtcseverity",
            name: "DemDTCSeverity",
            displayName: "DemDTCSeverity",
            description: "DemDTCSeverity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dtcclass-dtc-0x978f04",
        name: "DTCClass_DTC_0x978f04",
        displayName: "DTCClass_DTC_0x978f04",
        description: "DTCClass_DTC_0x978f04 配置容器",
        parameters: [
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdtcseverity",
            name: "DemDTCSeverity",
            displayName: "DemDTCSeverity",
            description: "DemDTCSeverity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dtcclass-dtc-0x979300",
        name: "DTCClass_DTC_0x979300",
        displayName: "DTCClass_DTC_0x979300",
        description: "DTCClass_DTC_0x979300 配置容器",
        parameters: [
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdtcseverity",
            name: "DemDTCSeverity",
            displayName: "DemDTCSeverity",
            description: "DemDTCSeverity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dtcclass-dtc-0x979400",
        name: "DTCClass_DTC_0x979400",
        displayName: "DTCClass_DTC_0x979400",
        description: "DTCClass_DTC_0x979400 配置容器",
        parameters: [
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
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
        id: "dtcclass-dtc-0x979500",
        name: "DTCClass_DTC_0x979500",
        displayName: "DTCClass_DTC_0x979500",
        description: "DTCClass_DTC_0x979500 配置容器",
        parameters: [
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demdtcseverity",
            name: "DemDTCSeverity",
            displayName: "DemDTCSeverity",
            description: "DemDTCSeverity 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "dtcclass-dtc-0xc07388",
        name: "DTCClass_DTC_0xc07388",
        displayName: "DTCClass_DTC_0xc07388",
        description: "DTCClass_DTC_0xc07388 配置容器",
        parameters: [
          {
            id: "demudsdtc",
            name: "DemUdsDTC",
            displayName: "DemUdsDTC",
            description: "DemUdsDTC 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "demimmediatenvstorage",
            name: "DemImmediateNvStorage",
            displayName: "DemImmediateNvStorage",
            description: "DemImmediateNvStorage 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "demdtcseverity",
            name: "DemDTCSeverity",
            displayName: "DemDTCSeverity",
            description: "DemDTCSeverity 参数",
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
    id: "det",
    name: "Det",
    displayName: "Default Error Tracer",
    description: "错误跟踪",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "detgeneral",
        name: "DetGeneral",
        displayName: "DetGeneral",
        description: "DetGeneral 配置容器",
        parameters: [
          {
            id: "detversioninfoapi",
            name: "DetVersionInfoApi",
            displayName: "DetVersionInfoApi",
            description: "DetVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "detenabledet",
            name: "DetEnableDet",
            displayName: "DetEnableDet",
            description: "DetEnableDet 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "detextdebugsupport",
            name: "DetExtDebugSupport",
            displayName: "DetExtDebugSupport",
            description: "DetExtDebugSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "detglobalfiltersize",
            name: "DetGlobalFilterSize",
            displayName: "DetGlobalFilterSize",
            description: "DetGlobalFilterSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "detbreakfiltersize",
            name: "DetBreakFilterSize",
            displayName: "DetBreakFilterSize",
            description: "DetBreakFilterSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "detlogbuffersize",
            name: "DetLogBufferSize",
            displayName: "DetLogBufferSize",
            description: "DetLogBufferSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "detreporterrorrecursionlimit",
            name: "DetReportErrorRecursionLimit",
            displayName: "DetReportErrorRecursionLimit",
            description: "DetReportErrorRecursionLimit 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "detreportruntimeerrorrecursionlimit",
            name: "DetReportRuntimeErrorRecursionLimit",
            displayName: "DetReportRuntimeErrorRecursionLimit",
            description: "DetReportRuntimeErrorRecursionLimit 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "detreporttransientfaultrecursionlimit",
            name: "DetReportTransientFaultRecursionLimit",
            displayName: "DetReportTransientFaultRecursionLimit",
            description: "DetReportTransientFaultRecursionLimit 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "detdltfiltersize",
            name: "DetDltFilterSize",
            displayName: "DetDltFilterSize",
            description: "DetDltFilterSize 参数",
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
    id: "ecum",
    name: "Ecum",
    displayName: "ECU State Manager",
    description: "ECU 状态管理器",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "adc-init",
        name: "Adc_Init",
        displayName: "Adc_Init",
        description: "Adc_Init 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bswm-initmemory",
        name: "BswM_InitMemory",
        displayName: "BswM_InitMemory",
        description: "BswM_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bswm-preinit",
        name: "BswM_PreInit",
        displayName: "BswM_PreInit",
        description: "BswM_PreInit 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "canif-initmemory",
        name: "CanIf_InitMemory",
        displayName: "CanIf_InitMemory",
        description: "CanIf_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cannm-initmemory",
        name: "CanNm_InitMemory",
        displayName: "CanNm_InitMemory",
        description: "CanNm_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cansm-initmemory",
        name: "CanSM_InitMemory",
        displayName: "CanSM_InitMemory",
        description: "CanSM_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantp-initmemory",
        name: "CanTp_InitMemory",
        displayName: "CanTp_InitMemory",
        description: "CanTp_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantp-preinit",
        name: "CanTp_PreInit",
        displayName: "CanTp_PreInit",
        description: "CanTp_PreInit 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantrcvchannel",
        name: "CanTrcvChannel",
        displayName: "CanTrcvChannel",
        description: "CanTrcvChannel 配置容器",
        parameters: [
          {
            id: "ecumwakeupsourceid",
            name: "EcuMWakeupSourceId",
            displayName: "EcuMWakeupSourceId",
            description: "EcuMWakeupSourceId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "ecumwakeupsourcepolling",
            name: "EcuMWakeupSourcePolling",
            displayName: "EcuMWakeupSourcePolling",
            description: "EcuMWakeupSourcePolling 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "cantrcv-30-sbc-init",
        name: "CanTrcv_30_Sbc_Init",
        displayName: "CanTrcv_30_Sbc_Init",
        description: "CanTrcv_30_Sbc_Init 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "cantrcv-30-sbc-initmemory",
        name: "CanTrcv_30_Sbc_InitMemory",
        displayName: "CanTrcv_30_Sbc_InitMemory",
        description: "CanTrcv_30_Sbc_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "can-30-flexcan4-initmemory",
        name: "Can_30_Flexcan4_InitMemory",
        displayName: "Can_30_Flexcan4_InitMemory",
        description: "Can_30_Flexcan4_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "comm-initmemory",
        name: "ComM_InitMemory",
        displayName: "ComM_InitMemory",
        description: "ComM_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "comm-preinit",
        name: "ComM_PreInit",
        displayName: "ComM_PreInit",
        description: "ComM_PreInit 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "com-initmemory",
        name: "Com_InitMemory",
        displayName: "Com_InitMemory",
        description: "Com_InitMemory 配置容器",
        parameters: [
          {
            id: "ecummoduleid",
            name: "EcuMModuleID",
            displayName: "EcuMModuleID",
            description: "EcuMModuleID 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleservice",
            name: "EcuMModuleService",
            displayName: "EcuMModuleService",
            description: "EcuMModuleService 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "ecummoduleheader",
            name: "EcuMModuleHeader",
            displayName: "EcuMModuleHeader",
            description: "EcuMModuleHeader 参数",
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
    id: "fee",
    name: "Fee",
    displayName: "Flash EEPROM Emulation",
    description: "Flash EEPROM 模拟",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "feeblockconfiguration",
        name: "FeeBlockConfiguration",
        displayName: "FeeBlockConfiguration",
        description: "FeeBlockConfiguration 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockconfiguration-01",
        name: "FeeBlockConfiguration_01",
        displayName: "FeeBlockConfiguration_01",
        description: "FeeBlockConfiguration_01 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor",
        name: "FeeBlockDescriptor",
        displayName: "FeeBlockDescriptor",
        description: "FeeBlockDescriptor 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-applicationnvmblockdata",
        name: "FeeBlockDescriptor_ApplicationNVMBlockData",
        displayName: "FeeBlockDescriptor_ApplicationNVMBlockData",
        description: "FeeBlockDescriptor_ApplicationNVMBlockData 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid0",
        name: "FeeBlockDescriptor_BleShortID0",
        displayName: "FeeBlockDescriptor_BleShortID0",
        description: "FeeBlockDescriptor_BleShortID0 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid1",
        name: "FeeBlockDescriptor_BleShortID1",
        displayName: "FeeBlockDescriptor_BleShortID1",
        description: "FeeBlockDescriptor_BleShortID1 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid10",
        name: "FeeBlockDescriptor_BleShortID10",
        displayName: "FeeBlockDescriptor_BleShortID10",
        description: "FeeBlockDescriptor_BleShortID10 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid11",
        name: "FeeBlockDescriptor_BleShortID11",
        displayName: "FeeBlockDescriptor_BleShortID11",
        description: "FeeBlockDescriptor_BleShortID11 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid12",
        name: "FeeBlockDescriptor_BleShortID12",
        displayName: "FeeBlockDescriptor_BleShortID12",
        description: "FeeBlockDescriptor_BleShortID12 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid13",
        name: "FeeBlockDescriptor_BleShortID13",
        displayName: "FeeBlockDescriptor_BleShortID13",
        description: "FeeBlockDescriptor_BleShortID13 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid14",
        name: "FeeBlockDescriptor_BleShortID14",
        displayName: "FeeBlockDescriptor_BleShortID14",
        description: "FeeBlockDescriptor_BleShortID14 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid15",
        name: "FeeBlockDescriptor_BleShortID15",
        displayName: "FeeBlockDescriptor_BleShortID15",
        description: "FeeBlockDescriptor_BleShortID15 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid16",
        name: "FeeBlockDescriptor_BleShortID16",
        displayName: "FeeBlockDescriptor_BleShortID16",
        description: "FeeBlockDescriptor_BleShortID16 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid17",
        name: "FeeBlockDescriptor_BleShortID17",
        displayName: "FeeBlockDescriptor_BleShortID17",
        description: "FeeBlockDescriptor_BleShortID17 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "feeblockdescriptor-bleshortid18",
        name: "FeeBlockDescriptor_BleShortID18",
        displayName: "FeeBlockDescriptor_BleShortID18",
        description: "FeeBlockDescriptor_BleShortID18 配置容器",
        parameters: [
          {
            id: "feeblocknumber",
            name: "FeeBlockNumber",
            displayName: "FeeBlockNumber",
            description: "FeeBlockNumber 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblocksize",
            name: "FeeBlockSize",
            displayName: "FeeBlockSize",
            description: "FeeBlockSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeimmediatedata",
            name: "FeeImmediateData",
            displayName: "FeeImmediateData",
            description: "FeeImmediateData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "feenumberofwritecycles",
            name: "FeeNumberOfWriteCycles",
            displayName: "FeeNumberOfWriteCycles",
            description: "FeeNumberOfWriteCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeblockid",
            name: "FeeBlockId",
            displayName: "FeeBlockId",
            description: "FeeBlockId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "feeislookuptableblock",
            name: "FeeIsLookupTableBlock",
            displayName: "FeeIsLookupTableBlock",
            description: "FeeIsLookupTableBlock 参数",
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
    id: "fls",
    name: "Fls",
    displayName: "Flash Driver",
    description: "Flash 驱动",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "MCAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "autosarext",
        name: "AutosarExt",
        displayName: "AutosarExt",
        description: "AutosarExt 配置容器",
        parameters: [
          {
            id: "flsdisabledemreporterrorstatus",
            name: "FlsDisableDemReportErrorStatus",
            displayName: "FlsDisableDemReportErrorStatus",
            description: "FlsDisableDemReportErrorStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsenableusermodesupport",
            name: "FlsEnableUserModeSupport",
            displayName: "FlsEnableUserModeSupport",
            description: "FlsEnableUserModeSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsextendedreaderrorcheck",
            name: "FlsExtendedReadErrorCheck",
            displayName: "FlsExtendedReadErrorCheck",
            description: "FlsExtendedReadErrorCheck 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsexternalsectorsconfigured",
            name: "FlsExternalSectorsConfigured",
            displayName: "FlsExternalSectorsConfigured",
            description: "FlsExternalSectorsConfigured 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsinternalsectorsconfigured",
            name: "FlsInternalSectorsConfigured",
            displayName: "FlsInternalSectorsConfigured",
            description: "FlsInternalSectorsConfigured 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssynchronizecache",
            name: "FlsSynchronizeCache",
            displayName: "FlsSynchronizeCache",
            description: "FlsSynchronizeCache 参数",
            type: "boolean",
            value: false,
            defaultValue: false
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
          },
          {
            id: "vendorapiinfix",
            name: "VendorApiInfix",
            displayName: "VendorApiInfix",
            description: "VendorApiInfix 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flsconfigset",
        name: "FlsConfigSet",
        displayName: "FlsConfigSet",
        description: "FlsConfigSet 配置容器",
        parameters: [
          {
            id: "flsacerase",
            name: "FlsAcErase",
            displayName: "FlsAcErase",
            description: "FlsAcErase 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsacwrite",
            name: "FlsAcWrite",
            displayName: "FlsAcWrite",
            description: "FlsAcWrite 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flscallcycle",
            name: "FlsCallCycle",
            displayName: "FlsCallCycle",
            description: "FlsCallCycle 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsmaxreadfastmode",
            name: "FlsMaxReadFastMode",
            displayName: "FlsMaxReadFastMode",
            description: "FlsMaxReadFastMode 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsmaxreadnormalmode",
            name: "FlsMaxReadNormalMode",
            displayName: "FlsMaxReadNormalMode",
            description: "FlsMaxReadNormalMode 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsmaxwritefastmode",
            name: "FlsMaxWriteFastMode",
            displayName: "FlsMaxWriteFastMode",
            description: "FlsMaxWriteFastMode 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsmaxwritenormalmode",
            name: "FlsMaxWriteNormalMode",
            displayName: "FlsMaxWriteNormalMode",
            description: "FlsMaxWriteNormalMode 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsprotection",
            name: "FlsProtection",
            displayName: "FlsProtection",
            description: "FlsProtection 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsacerasepointer",
            name: "FlsAcErasePointer",
            displayName: "FlsAcErasePointer",
            description: "FlsAcErasePointer 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsacwritepointer",
            name: "FlsAcWritePointer",
            displayName: "FlsAcWritePointer",
            description: "FlsAcWritePointer 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsdefaultmode",
            name: "FlsDefaultMode",
            displayName: "FlsDefaultMode",
            description: "FlsDefaultMode 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsjobendnotification",
            name: "FlsJobEndNotification",
            displayName: "FlsJobEndNotification",
            description: "FlsJobEndNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsjoberrornotification",
            name: "FlsJobErrorNotification",
            displayName: "FlsJobErrorNotification",
            description: "FlsJobErrorNotification 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flsgeneral",
        name: "FlsGeneral",
        displayName: "FlsGeneral",
        description: "FlsGeneral 配置容器",
        parameters: [
          {
            id: "flsacloadonjobstart",
            name: "FlsAcLoadOnJobStart",
            displayName: "FlsAcLoadOnJobStart",
            description: "FlsAcLoadOnJobStart 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsbaseaddress",
            name: "FlsBaseAddress",
            displayName: "FlsBaseAddress",
            description: "FlsBaseAddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsblankcheckapi",
            name: "FlsBlankCheckApi",
            displayName: "FlsBlankCheckApi",
            description: "FlsBlankCheckApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flscancelapi",
            name: "FlsCancelApi",
            displayName: "FlsCancelApi",
            description: "FlsCancelApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flscompareapi",
            name: "FlsCompareApi",
            displayName: "FlsCompareApi",
            description: "FlsCompareApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsdeverrordetect",
            name: "FlsDevErrorDetect",
            displayName: "FlsDevErrorDetect",
            description: "FlsDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsdriverindex",
            name: "FlsDriverIndex",
            displayName: "FlsDriverIndex",
            description: "FlsDriverIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsdsihandlerapi",
            name: "FlsDsiHandlerApi",
            displayName: "FlsDsiHandlerApi",
            description: "FlsDsiHandlerApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flseraseverificationenabled",
            name: "FlsEraseVerificationEnabled",
            displayName: "FlsEraseVerificationEnabled",
            description: "FlsEraseVerificationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsgetjobresultapi",
            name: "FlsGetJobResultApi",
            displayName: "FlsGetJobResultApi",
            description: "FlsGetJobResultApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsgetstatusapi",
            name: "FlsGetStatusApi",
            displayName: "FlsGetStatusApi",
            description: "FlsGetStatusApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsmaxeraseblankcheck",
            name: "FlsMaxEraseBlankCheck",
            displayName: "FlsMaxEraseBlankCheck",
            description: "FlsMaxEraseBlankCheck 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsruntimeerrordetect",
            name: "FlsRuntimeErrorDetect",
            displayName: "FlsRuntimeErrorDetect",
            description: "FlsRuntimeErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssetmodeapi",
            name: "FlsSetModeApi",
            displayName: "FlsSetModeApi",
            description: "FlsSetModeApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flstimeoutsupervisionenabled",
            name: "FlsTimeoutSupervisionEnabled",
            displayName: "FlsTimeoutSupervisionEnabled",
            description: "FlsTimeoutSupervisionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flstotalsize",
            name: "FlsTotalSize",
            displayName: "FlsTotalSize",
            description: "FlsTotalSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flstransientfaultdetect",
            name: "FlsTransientFaultDetect",
            displayName: "FlsTransientFaultDetect",
            description: "FlsTransientFaultDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsuseinterrupts",
            name: "FlsUseInterrupts",
            displayName: "FlsUseInterrupts",
            description: "FlsUseInterrupts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsversioninfoapi",
            name: "FlsVersionInfoApi",
            displayName: "FlsVersionInfoApi",
            description: "FlsVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flswriteblankcheck",
            name: "FlsWriteBlankCheck",
            displayName: "FlsWriteBlankCheck",
            description: "FlsWriteBlankCheck 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flswriteverificationenabled",
            name: "FlsWriteVerificationEnabled",
            displayName: "FlsWriteVerificationEnabled",
            description: "FlsWriteVerificationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsaborttimeout",
            name: "FlsAbortTimeout",
            displayName: "FlsAbortTimeout",
            description: "FlsAbortTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsasyncerasetimeout",
            name: "FlsAsyncEraseTimeout",
            displayName: "FlsAsyncEraseTimeout",
            description: "FlsAsyncEraseTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsasyncwritetimeout",
            name: "FlsAsyncWriteTimeout",
            displayName: "FlsAsyncWriteTimeout",
            description: "FlsAsyncWriteTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssyncerasetimeout",
            name: "FlsSyncEraseTimeout",
            displayName: "FlsSyncEraseTimeout",
            description: "FlsSyncEraseTimeout 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssyncwritetimeout",
            name: "FlsSyncWriteTimeout",
            displayName: "FlsSyncWriteTimeout",
            description: "FlsSyncWriteTimeout 参数",
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
        id: "flspublishedinformation",
        name: "FlsPublishedInformation",
        displayName: "FlsPublishedInformation",
        description: "FlsPublishedInformation 配置容器",
        parameters: [
          {
            id: "flsaclocationerase",
            name: "FlsAcLocationErase",
            displayName: "FlsAcLocationErase",
            description: "FlsAcLocationErase 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsaclocationwrite",
            name: "FlsAcLocationWrite",
            displayName: "FlsAcLocationWrite",
            description: "FlsAcLocationWrite 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsacsizeerase",
            name: "FlsAcSizeErase",
            displayName: "FlsAcSizeErase",
            description: "FlsAcSizeErase 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsacsizewrite",
            name: "FlsAcSizeWrite",
            displayName: "FlsAcSizeWrite",
            description: "FlsAcSizeWrite 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flserasetime",
            name: "FlsEraseTime",
            displayName: "FlsEraseTime",
            description: "FlsEraseTime 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flserasedvalue",
            name: "FlsErasedValue",
            displayName: "FlsErasedValue",
            description: "FlsErasedValue 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsspecifiederasecycles",
            name: "FlsSpecifiedEraseCycles",
            displayName: "FlsSpecifiedEraseCycles",
            description: "FlsSpecifiedEraseCycles 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flswritetime",
            name: "FlsWriteTime",
            displayName: "FlsWriteTime",
            description: "FlsWriteTime 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsexpectedhwid",
            name: "FlsExpectedHwId",
            displayName: "FlsExpectedHwId",
            description: "FlsExpectedHwId 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssectorlist",
        name: "FlsSectorList",
        displayName: "FlsSectorList",
        description: "FlsSectorList 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-0",
        name: "FlsSector_0",
        displayName: "FlsSector_0",
        description: "FlsSector_0 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-1",
        name: "FlsSector_1",
        displayName: "FlsSector_1",
        description: "FlsSector_1 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-2",
        name: "FlsSector_2",
        displayName: "FlsSector_2",
        description: "FlsSector_2 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-3",
        name: "FlsSector_3",
        displayName: "FlsSector_3",
        description: "FlsSector_3 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-4",
        name: "FlsSector_4",
        displayName: "FlsSector_4",
        description: "FlsSector_4 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-5",
        name: "FlsSector_5",
        displayName: "FlsSector_5",
        description: "FlsSector_5 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-6",
        name: "FlsSector_6",
        displayName: "FlsSector_6",
        description: "FlsSector_6 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-7",
        name: "FlsSector_7",
        displayName: "FlsSector_7",
        description: "FlsSector_7 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "flssector-8",
        name: "FlsSector_8",
        displayName: "FlsSector_8",
        description: "FlsSector_8 配置容器",
        parameters: [
          {
            id: "flsnumberofsectors",
            name: "FlsNumberOfSectors",
            displayName: "FlsNumberOfSectors",
            description: "FlsNumberOfSectors 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagesize",
            name: "FlsPageSize",
            displayName: "FlsPageSize",
            description: "FlsPageSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flspagewriteasynch",
            name: "FlsPageWriteAsynch",
            displayName: "FlsPageWriteAsynch",
            description: "FlsPageWriteAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flsphysicalsectorsize",
            name: "FlsPhysicalSectorSize",
            displayName: "FlsPhysicalSectorSize",
            description: "FlsPhysicalSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flsphysicalsectorunlock",
            name: "FlsPhysicalSectorUnlock",
            displayName: "FlsPhysicalSectorUnlock",
            description: "FlsPhysicalSectorUnlock 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectoreraseasynch",
            name: "FlsSectorEraseAsynch",
            displayName: "FlsSectorEraseAsynch",
            description: "FlsSectorEraseAsynch 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorindex",
            name: "FlsSectorIndex",
            displayName: "FlsSectorIndex",
            description: "FlsSectorIndex 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorirqmode",
            name: "FlsSectorIrqMode",
            displayName: "FlsSectorIrqMode",
            description: "FlsSectorIrqMode 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "flssectorsize",
            name: "FlsSectorSize",
            displayName: "FlsSectorSize",
            description: "FlsSectorSize 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flssectorstartaddress",
            name: "FlsSectorStartaddress",
            displayName: "FlsSectorStartaddress",
            description: "FlsSectorStartaddress 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "flshwch",
            name: "FlsHwCh",
            displayName: "FlsHwCh",
            description: "FlsHwCh 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsphysicalsector",
            name: "FlsPhysicalSector",
            displayName: "FlsPhysicalSector",
            description: "FlsPhysicalSector 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsprogrammingsize",
            name: "FlsProgrammingSize",
            displayName: "FlsProgrammingSize",
            description: "FlsProgrammingSize 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "flsqspisectorch",
            name: "FlsQspiSectorCh",
            displayName: "FlsQspiSectorCh",
            description: "FlsQspiSectorCh 参数",
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
  },  {
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
  },  {
    id: "memif",
    name: "Memif",
    displayName: "Memory Abstraction Interface",
    description: "存储器接口",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "memifgeneral",
        name: "MemIfGeneral",
        displayName: "MemIfGeneral",
        description: "MemIfGeneral 配置容器",
        parameters: [
          {
            id: "memifdeverrordetect",
            name: "MemIfDevErrorDetect",
            displayName: "MemIfDevErrorDetect",
            description: "MemIfDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "memifversioninfoapi",
            name: "MemIfVersionInfoApi",
            displayName: "MemIfVersionInfoApi",
            description: "MemIfVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "memifsafebswchecks",
            name: "MemIfSafeBswChecks",
            displayName: "MemIfSafeBswChecks",
            description: "MemIfSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "memifmemhwa",
        name: "MemIfMemHwA",
        displayName: "MemIfMemHwA",
        description: "MemIfMemHwA 配置容器",
        parameters: [
          {
            id: "memifmemhwaid",
            name: "MemIfMemHwAId",
            displayName: "MemIfMemHwAId",
            description: "MemIfMemHwAId 参数",
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
    id: "nm",
    name: "Nm",
    displayName: "Network Management",
    description: "网络管理通用",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "ECUAL",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "nmglobalconfig",
        name: "NmGlobalConfig",
        displayName: "NmGlobalConfig",
        description: "NmGlobalConfig 配置容器",
        parameters: [
          {
            id: "nmcomcontrolenabled",
            name: "NmComControlEnabled",
            displayName: "NmComControlEnabled",
            description: "NmComControlEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcomuserdatasupport",
            name: "NmComUserDataSupport",
            displayName: "NmComUserDataSupport",
            description: "NmComUserDataSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmnodedetectionenabled",
            name: "NmNodeDetectionEnabled",
            displayName: "NmNodeDetectionEnabled",
            description: "NmNodeDetectionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmnodeidenabled",
            name: "NmNodeIdEnabled",
            displayName: "NmNodeIdEnabled",
            description: "NmNodeIdEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmpdurxindicationenabled",
            name: "NmPduRxIndicationEnabled",
            displayName: "NmPduRxIndicationEnabled",
            description: "NmPduRxIndicationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmstatechangeindenabled",
            name: "NmStateChangeIndEnabled",
            displayName: "NmStateChangeIndEnabled",
            description: "NmStateChangeIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmuserdataenabled",
            name: "NmUserDataEnabled",
            displayName: "NmUserDataEnabled",
            description: "NmUserDataEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmbussynchronizationenabled",
            name: "NmBusSynchronizationEnabled",
            displayName: "NmBusSynchronizationEnabled",
            description: "NmBusSynchronizationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcarwakeuprxenabled",
            name: "NmCarWakeUpRxEnabled",
            displayName: "NmCarWakeUpRxEnabled",
            description: "NmCarWakeUpRxEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorsupportenabled",
            name: "NmCoordinatorSupportEnabled",
            displayName: "NmCoordinatorSupportEnabled",
            description: "NmCoordinatorSupportEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmremotesleepindenabled",
            name: "NmRemoteSleepIndEnabled",
            displayName: "NmRemoteSleepIndEnabled",
            description: "NmRemoteSleepIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmrepeatmsgindenabled",
            name: "NmRepeatMsgIndEnabled",
            displayName: "NmRepeatMsgIndEnabled",
            description: "NmRepeatMsgIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmmacrolayerenabled",
            name: "NmMacroLayerEnabled",
            displayName: "NmMacroLayerEnabled",
            description: "NmMacroLayerEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorsyncsupport",
            name: "NmCoordinatorSyncSupport",
            displayName: "NmCoordinatorSyncSupport",
            description: "NmCoordinatorSyncSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmruntimemeasurementsupport",
            name: "NmRuntimeMeasurementSupport",
            displayName: "NmRuntimeMeasurementSupport",
            description: "NmRuntimeMeasurementSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorrequestchannelsinbussleep",
            name: "NmCoordinatorRequestChannelsInBusSleep",
            displayName: "NmCoordinatorRequestChannelsInBusSleep",
            description: "NmCoordinatorRequestChannelsInBusSleep 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorpassivestartupforwarding",
            name: "NmCoordinatorPassiveStartUpForwarding",
            displayName: "NmCoordinatorPassiveStartUpForwarding",
            description: "NmCoordinatorPassiveStartUpForwarding 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmoutofboundswritesanitizer",
            name: "NmOutOfBoundsWriteSanitizer",
            displayName: "NmOutOfBoundsWriteSanitizer",
            description: "NmOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmoutofboundsreadsanitizer",
            name: "NmOutOfBoundsReadSanitizer",
            displayName: "NmOutOfBoundsReadSanitizer",
            description: "NmOutOfBoundsReadSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmshortsymbols",
            name: "NmShortSymbols",
            displayName: "NmShortSymbols",
            description: "NmShortSymbols 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nminterfacesfordeactivateddata",
            name: "NmInterfacesForDeactivatedData",
            displayName: "NmInterfacesForDeactivatedData",
            description: "NmInterfacesForDeactivatedData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmreferringkeysincomments",
            name: "NmReferringKeysInComments",
            displayName: "NmReferringKeysInComments",
            description: "NmReferringKeysInComments 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmdeverrordetect",
            name: "NmDevErrorDetect",
            displayName: "NmDevErrorDetect",
            description: "NmDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmversioninfoapi",
            name: "NmVersionInfoApi",
            displayName: "NmVersionInfoApi",
            description: "NmVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmsafebswchecks",
            name: "NmSafeBswChecks",
            displayName: "NmSafeBswChecks",
            description: "NmSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmstatechangeindcallback",
            name: "NmStateChangeIndCallback",
            displayName: "NmStateChangeIndCallback",
            description: "NmStateChangeIndCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nmcallbacksprototypeheader",
            name: "NmCallbacksPrototypeHeader",
            displayName: "NmCallbacksPrototypeHeader",
            description: "NmCallbacksPrototypeHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nmrepeatmessageindcallback",
            name: "NmRepeatMessageIndCallback",
            displayName: "NmRepeatMessageIndCallback",
            description: "NmRepeatMessageIndCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nmpdureceiveindcallback",
            name: "NmPduReceiveIndCallback",
            displayName: "NmPduReceiveIndCallback",
            description: "NmPduReceiveIndCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "nmglobalfeatures",
        name: "NmGlobalFeatures",
        displayName: "NmGlobalFeatures",
        description: "NmGlobalFeatures 配置容器",
        parameters: [
          {
            id: "nmcomcontrolenabled",
            name: "NmComControlEnabled",
            displayName: "NmComControlEnabled",
            description: "NmComControlEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcomuserdatasupport",
            name: "NmComUserDataSupport",
            displayName: "NmComUserDataSupport",
            description: "NmComUserDataSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmnodedetectionenabled",
            name: "NmNodeDetectionEnabled",
            displayName: "NmNodeDetectionEnabled",
            description: "NmNodeDetectionEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmnodeidenabled",
            name: "NmNodeIdEnabled",
            displayName: "NmNodeIdEnabled",
            description: "NmNodeIdEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmpdurxindicationenabled",
            name: "NmPduRxIndicationEnabled",
            displayName: "NmPduRxIndicationEnabled",
            description: "NmPduRxIndicationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmstatechangeindenabled",
            name: "NmStateChangeIndEnabled",
            displayName: "NmStateChangeIndEnabled",
            description: "NmStateChangeIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmuserdataenabled",
            name: "NmUserDataEnabled",
            displayName: "NmUserDataEnabled",
            description: "NmUserDataEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmbussynchronizationenabled",
            name: "NmBusSynchronizationEnabled",
            displayName: "NmBusSynchronizationEnabled",
            description: "NmBusSynchronizationEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcarwakeuprxenabled",
            name: "NmCarWakeUpRxEnabled",
            displayName: "NmCarWakeUpRxEnabled",
            description: "NmCarWakeUpRxEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorsupportenabled",
            name: "NmCoordinatorSupportEnabled",
            displayName: "NmCoordinatorSupportEnabled",
            description: "NmCoordinatorSupportEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmremotesleepindenabled",
            name: "NmRemoteSleepIndEnabled",
            displayName: "NmRemoteSleepIndEnabled",
            description: "NmRemoteSleepIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmrepeatmsgindenabled",
            name: "NmRepeatMsgIndEnabled",
            displayName: "NmRepeatMsgIndEnabled",
            description: "NmRepeatMsgIndEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmmacrolayerenabled",
            name: "NmMacroLayerEnabled",
            displayName: "NmMacroLayerEnabled",
            description: "NmMacroLayerEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorsyncsupport",
            name: "NmCoordinatorSyncSupport",
            displayName: "NmCoordinatorSyncSupport",
            description: "NmCoordinatorSyncSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmruntimemeasurementsupport",
            name: "NmRuntimeMeasurementSupport",
            displayName: "NmRuntimeMeasurementSupport",
            description: "NmRuntimeMeasurementSupport 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorrequestchannelsinbussleep",
            name: "NmCoordinatorRequestChannelsInBusSleep",
            displayName: "NmCoordinatorRequestChannelsInBusSleep",
            description: "NmCoordinatorRequestChannelsInBusSleep 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmcoordinatorpassivestartupforwarding",
            name: "NmCoordinatorPassiveStartUpForwarding",
            displayName: "NmCoordinatorPassiveStartUpForwarding",
            description: "NmCoordinatorPassiveStartUpForwarding 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmstatechangeindcallback",
            name: "NmStateChangeIndCallback",
            displayName: "NmStateChangeIndCallback",
            description: "NmStateChangeIndCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nmcallbacksprototypeheader",
            name: "NmCallbacksPrototypeHeader",
            displayName: "NmCallbacksPrototypeHeader",
            description: "NmCallbacksPrototypeHeader 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nmrepeatmessageindcallback",
            name: "NmRepeatMessageIndCallback",
            displayName: "NmRepeatMessageIndCallback",
            description: "NmRepeatMessageIndCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nmpdureceiveindcallback",
            name: "NmPduReceiveIndCallback",
            displayName: "NmPduReceiveIndCallback",
            description: "NmPduReceiveIndCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "nmgeneration",
        name: "NmGeneration",
        displayName: "NmGeneration",
        description: "NmGeneration 配置容器",
        parameters: [
          {
            id: "nmoutofboundswritesanitizer",
            name: "NmOutOfBoundsWriteSanitizer",
            displayName: "NmOutOfBoundsWriteSanitizer",
            description: "NmOutOfBoundsWriteSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmoutofboundsreadsanitizer",
            name: "NmOutOfBoundsReadSanitizer",
            displayName: "NmOutOfBoundsReadSanitizer",
            description: "NmOutOfBoundsReadSanitizer 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmshortsymbols",
            name: "NmShortSymbols",
            displayName: "NmShortSymbols",
            description: "NmShortSymbols 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nminterfacesfordeactivateddata",
            name: "NmInterfacesForDeactivatedData",
            displayName: "NmInterfacesForDeactivatedData",
            description: "NmInterfacesForDeactivatedData 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmreferringkeysincomments",
            name: "NmReferringKeysInComments",
            displayName: "NmReferringKeysInComments",
            description: "NmReferringKeysInComments 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "nmglobalproperties",
        name: "NmGlobalProperties",
        displayName: "NmGlobalProperties",
        description: "NmGlobalProperties 配置容器",
        parameters: [
          {
            id: "nmdeverrordetect",
            name: "NmDevErrorDetect",
            displayName: "NmDevErrorDetect",
            description: "NmDevErrorDetect 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmversioninfoapi",
            name: "NmVersionInfoApi",
            displayName: "NmVersionInfoApi",
            description: "NmVersionInfoApi 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmsafebswchecks",
            name: "NmSafeBswChecks",
            displayName: "NmSafeBswChecks",
            description: "NmSafeBswChecks 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          }
        ],
        multiple: false
      },
      {
        id: "dkmm-lhbdcanfd-a9ca9096",
        name: "DKMM_LHBDCANFD_a9ca9096",
        displayName: "DKMM_LHBDCANFD_a9ca9096",
        description: "DKMM_LHBDCANFD_a9ca9096 配置容器",
        parameters: [
          {
            id: "nmpassivemodeenabled",
            name: "NmPassiveModeEnabled",
            displayName: "NmPassiveModeEnabled",
            description: "NmPassiveModeEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmchannelid",
            name: "NmChannelId",
            displayName: "NmChannelId",
            description: "NmChannelId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nmchannelsleepmaster",
            name: "NmChannelSleepMaster",
            displayName: "NmChannelSleepMaster",
            description: "NmChannelSleepMaster 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmstatereportenabled",
            name: "NmStateReportEnabled",
            displayName: "NmStateReportEnabled",
            description: "NmStateReportEnabled 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmsynchronizingnetwork",
            name: "NmSynchronizingNetwork",
            displayName: "NmSynchronizingNetwork",
            description: "NmSynchronizingNetwork 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nmstandardbustype",
            name: "NmStandardBusType",
            displayName: "NmStandardBusType",
            description: "NmStandardBusType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "lhbdcanfd-cluster-43c3a476",
        name: "LHBDCANFD_Cluster_43c3a476",
        displayName: "LHBDCANFD_Cluster_43c3a476",
        description: "LHBDCANFD_Cluster_43c3a476 配置容器",
        parameters: [
          {
            id: "nmstandardbustype",
            name: "NmStandardBusType",
            displayName: "NmStandardBusType",
            description: "NmStandardBusType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "nmstandardbusnmconfig",
        name: "NmStandardBusNmConfig",
        displayName: "NmStandardBusNmConfig",
        description: "NmStandardBusNmConfig 配置容器",
        parameters: [
          {
            id: "nmstandardbustype",
            name: "NmStandardBusType",
            displayName: "NmStandardBusType",
            description: "NmStandardBusType 参数",
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
    id: "nvm",
    name: "Nvm",
    displayName: "NVRAM Manager",
    description: "NvM Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "bleshortid0",
        name: "BleShortID0",
        displayName: "BleShortID0",
        description: "BleShortID0 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid1",
        name: "BleShortID1",
        displayName: "BleShortID1",
        description: "BleShortID1 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid10",
        name: "BleShortID10",
        displayName: "BleShortID10",
        description: "BleShortID10 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid11",
        name: "BleShortID11",
        displayName: "BleShortID11",
        description: "BleShortID11 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid12",
        name: "BleShortID12",
        displayName: "BleShortID12",
        description: "BleShortID12 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid13",
        name: "BleShortID13",
        displayName: "BleShortID13",
        description: "BleShortID13 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid14",
        name: "BleShortID14",
        displayName: "BleShortID14",
        description: "BleShortID14 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid15",
        name: "BleShortID15",
        displayName: "BleShortID15",
        description: "BleShortID15 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid16",
        name: "BleShortID16",
        displayName: "BleShortID16",
        description: "BleShortID16 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid17",
        name: "BleShortID17",
        displayName: "BleShortID17",
        description: "BleShortID17 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid18",
        name: "BleShortID18",
        displayName: "BleShortID18",
        description: "BleShortID18 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid19",
        name: "BleShortID19",
        displayName: "BleShortID19",
        description: "BleShortID19 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid2",
        name: "BleShortID2",
        displayName: "BleShortID2",
        description: "BleShortID2 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid20",
        name: "BleShortID20",
        displayName: "BleShortID20",
        description: "BleShortID20 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bleshortid21",
        name: "BleShortID21",
        displayName: "BleShortID21",
        description: "BleShortID21 配置容器",
        parameters: [
          {
            id: "nvmselectblockforwriteall",
            name: "NvMSelectBlockForWriteAll",
            displayName: "NvMSelectBlockForWriteAll",
            description: "NvMSelectBlockForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrc",
            name: "NvMBlockUseCrc",
            displayName: "NvMBlockUseCrc",
            description: "NvMBlockUseCrc 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockjobpriority",
            name: "NvMBlockJobPriority",
            displayName: "NvMBlockJobPriority",
            description: "NvMBlockJobPriority 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmblockusesyncmechanism",
            name: "NvMBlockUseSyncMechanism",
            displayName: "NvMBlockUseSyncMechanism",
            description: "NvMBlockUseSyncMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockwriteprot",
            name: "NvMBlockWriteProt",
            displayName: "NvMBlockWriteProt",
            description: "NvMBlockWriteProt 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmbswmblockstatusinformation",
            name: "NvMBswMBlockStatusInformation",
            displayName: "NvMBswMBlockStatusInformation",
            description: "NvMBswMBlockStatusInformation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmnvblocklength",
            name: "NvMNvBlockLength",
            displayName: "NvMNvBlockLength",
            description: "NvMNvBlockLength 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvblocknum",
            name: "NvMNvBlockNum",
            displayName: "NvMNvBlockNum",
            description: "NvMNvBlockNum 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmnvramblockidentifier",
            name: "NvMNvramBlockIdentifier",
            displayName: "NvMNvramBlockIdentifier",
            description: "NvMNvramBlockIdentifier 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "nvmresistanttochangedsw",
            name: "NvMResistantToChangedSw",
            displayName: "NvMResistantToChangedSw",
            description: "NvMResistantToChangedSw 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmwriteblockonce",
            name: "NvMWriteBlockOnce",
            displayName: "NvMWriteBlockOnce",
            description: "NvMWriteBlockOnce 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseserviceports",
            name: "NvMUseServicePorts",
            displayName: "NvMUseServicePorts",
            description: "NvMUseServicePorts 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmusejobendcallback",
            name: "NvMUseJobendCallback",
            displayName: "NvMUseJobendCallback",
            description: "NvMUseJobendCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmuseinitcallback",
            name: "NvMUseInitCallback",
            displayName: "NvMUseInitCallback",
            description: "NvMUseInitCallback 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusecrccompmechanism",
            name: "NvMBlockUseCRCCompMechanism",
            displayName: "NvMBlockUseCRCCompMechanism",
            description: "NvMBlockUseCRCCompMechanism 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockusesetramblockstatus",
            name: "NvMBlockUseSetRamBlockStatus",
            displayName: "NvMBlockUseSetRamBlockStatus",
            description: "NvMBlockUseSetRamBlockStatus 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforreadall",
            name: "NvMInvokeCallbacksForReadAll",
            displayName: "NvMInvokeCallbacksForReadAll",
            description: "NvMInvokeCallbacksForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvminvokecallbacksforwriteall",
            name: "NvMInvokeCallbacksForWriteAll",
            displayName: "NvMInvokeCallbacksForWriteAll",
            description: "NvMInvokeCallbacksForWriteAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmchecklossofredundancy",
            name: "NvMCheckLossOfRedundancy",
            displayName: "NvMCheckLossOfRedundancy",
            description: "NvMCheckLossOfRedundancy 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmselectblockforreadall",
            name: "NvMSelectBlockForReadAll",
            displayName: "NvMSelectBlockForReadAll",
            description: "NvMSelectBlockForReadAll 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "nvmblockcrctype",
            name: "NvMBlockCrcType",
            displayName: "NvMBlockCrcType",
            description: "NvMBlockCrcType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmblockmanagementtype",
            name: "NvMBlockManagementType",
            displayName: "NvMBlockManagementType",
            description: "NvMBlockManagementType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmramblockdataaddress",
            name: "NvMRamBlockDataAddress",
            displayName: "NvMRamBlockDataAddress",
            description: "NvMRamBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmromblockdataaddress",
            name: "NvMRomBlockDataAddress",
            displayName: "NvMRomBlockDataAddress",
            description: "NvMRomBlockDataAddress 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "nvmsingleblockcallback",
            name: "NvMSingleBlockCallback",
            displayName: "NvMSingleBlockCallback",
            description: "NvMSingleBlockCallback 参数",
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
    id: "pdur",
    name: "Pdur",
    displayName: "PDU Router",
    description: "PduR Configuration",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "Service",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "bpeps-100ms-pdu02-6c6b86b4-tx",
        name: "BPEPS_100ms_PDU02_6c6b86b4_Tx",
        displayName: "BPEPS_100ms_PDU02_6c6b86b4_Tx",
        description: "BPEPS_100ms_PDU02_6c6b86b4_Tx 配置容器",
        parameters: [
          {
            id: "pdurmulticoreroutingpath",
            name: "PduRMulticoreRoutingPath",
            displayName: "PduRMulticoreRoutingPath",
            description: "PduRMulticoreRoutingPath 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdursourcepduhandleid",
            name: "PduRSourcePduHandleId",
            displayName: "PduRSourcePduHandleId",
            description: "PduRSourcePduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurroutingpathcommunicationtype",
            name: "PduRRoutingPathCommunicationType",
            displayName: "PduRRoutingPathCommunicationType",
            description: "PduRRoutingPathCommunicationType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdursrcpdudirection",
            name: "PduRSrcPduDirection",
            displayName: "PduRSrcPduDirection",
            description: "PduRSrcPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-100ms-pdu02-e5aa2847-tx",
        name: "BPEPS_100ms_PDU02_e5aa2847_Tx",
        displayName: "BPEPS_100ms_PDU02_e5aa2847_Tx",
        description: "BPEPS_100ms_PDU02_e5aa2847_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-100ms-pdu11-afece58e-tx",
        name: "BPEPS_100ms_PDU11_afece58e_Tx",
        displayName: "BPEPS_100ms_PDU11_afece58e_Tx",
        description: "BPEPS_100ms_PDU11_afece58e_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-100ms-pdu11-ec79e64f-tx",
        name: "BPEPS_100ms_PDU11_ec79e64f_Tx",
        displayName: "BPEPS_100ms_PDU11_ec79e64f_Tx",
        description: "BPEPS_100ms_PDU11_ec79e64f_Tx 配置容器",
        parameters: [
          {
            id: "pdurmulticoreroutingpath",
            name: "PduRMulticoreRoutingPath",
            displayName: "PduRMulticoreRoutingPath",
            description: "PduRMulticoreRoutingPath 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdursourcepduhandleid",
            name: "PduRSourcePduHandleId",
            displayName: "PduRSourcePduHandleId",
            description: "PduRSourcePduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurroutingpathcommunicationtype",
            name: "PduRRoutingPathCommunicationType",
            displayName: "PduRRoutingPathCommunicationType",
            description: "PduRRoutingPathCommunicationType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdursrcpdudirection",
            name: "PduRSrcPduDirection",
            displayName: "PduRSrcPduDirection",
            description: "PduRSrcPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-20ms-pdu38-7d518cc7-tx",
        name: "BPEPS_20ms_PDU38_7d518cc7_Tx",
        displayName: "BPEPS_20ms_PDU38_7d518cc7_Tx",
        description: "BPEPS_20ms_PDU38_7d518cc7_Tx 配置容器",
        parameters: [
          {
            id: "pdurmulticoreroutingpath",
            name: "PduRMulticoreRoutingPath",
            displayName: "PduRMulticoreRoutingPath",
            description: "PduRMulticoreRoutingPath 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdursourcepduhandleid",
            name: "PduRSourcePduHandleId",
            displayName: "PduRSourcePduHandleId",
            description: "PduRSourcePduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurroutingpathcommunicationtype",
            name: "PduRRoutingPathCommunicationType",
            displayName: "PduRRoutingPathCommunicationType",
            description: "PduRRoutingPathCommunicationType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdursrcpdudirection",
            name: "PduRSrcPduDirection",
            displayName: "PduRSrcPduDirection",
            description: "PduRSrcPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-20ms-pdu38-d8b71e78-tx",
        name: "BPEPS_20ms_PDU38_d8b71e78_Tx",
        displayName: "BPEPS_20ms_PDU38_d8b71e78_Tx",
        description: "BPEPS_20ms_PDU38_d8b71e78_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-50ms-pdu06-48654724-tx",
        name: "BPEPS_50ms_PDU06_48654724_Tx",
        displayName: "BPEPS_50ms_PDU06_48654724_Tx",
        description: "BPEPS_50ms_PDU06_48654724_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-50ms-pdu06-5318e97a-tx",
        name: "BPEPS_50ms_PDU06_5318e97a_Tx",
        displayName: "BPEPS_50ms_PDU06_5318e97a_Tx",
        description: "BPEPS_50ms_PDU06_5318e97a_Tx 配置容器",
        parameters: [
          {
            id: "pdurmulticoreroutingpath",
            name: "PduRMulticoreRoutingPath",
            displayName: "PduRMulticoreRoutingPath",
            description: "PduRMulticoreRoutingPath 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdursourcepduhandleid",
            name: "PduRSourcePduHandleId",
            displayName: "PduRSourcePduHandleId",
            description: "PduRSourcePduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurroutingpathcommunicationtype",
            name: "PduRRoutingPathCommunicationType",
            displayName: "PduRRoutingPathCommunicationType",
            description: "PduRRoutingPathCommunicationType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdursrcpdudirection",
            name: "PduRSrcPduDirection",
            displayName: "PduRSrcPduDirection",
            description: "PduRSrcPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu25-249d52a6-tx",
        name: "BPEPS_Sporadic_PDU25_249d52a6_Tx",
        displayName: "BPEPS_Sporadic_PDU25_249d52a6_Tx",
        description: "BPEPS_Sporadic_PDU25_249d52a6_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu25-919eb00c-tx",
        name: "BPEPS_Sporadic_PDU25_919eb00c_Tx",
        displayName: "BPEPS_Sporadic_PDU25_919eb00c_Tx",
        description: "BPEPS_Sporadic_PDU25_919eb00c_Tx 配置容器",
        parameters: [
          {
            id: "pdurmulticoreroutingpath",
            name: "PduRMulticoreRoutingPath",
            displayName: "PduRMulticoreRoutingPath",
            description: "PduRMulticoreRoutingPath 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdursourcepduhandleid",
            name: "PduRSourcePduHandleId",
            displayName: "PduRSourcePduHandleId",
            description: "PduRSourcePduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurroutingpathcommunicationtype",
            name: "PduRRoutingPathCommunicationType",
            displayName: "PduRRoutingPathCommunicationType",
            description: "PduRRoutingPathCommunicationType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdursrcpdudirection",
            name: "PduRSrcPduDirection",
            displayName: "PduRSrcPduDirection",
            description: "PduRSrcPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu26-0897e1b6-tx",
        name: "BPEPS_Sporadic_PDU26_0897e1b6_Tx",
        displayName: "BPEPS_Sporadic_PDU26_0897e1b6_Tx",
        description: "BPEPS_Sporadic_PDU26_0897e1b6_Tx 配置容器",
        parameters: [
          {
            id: "pdurmulticoreroutingpath",
            name: "PduRMulticoreRoutingPath",
            displayName: "PduRMulticoreRoutingPath",
            description: "PduRMulticoreRoutingPath 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdursourcepduhandleid",
            name: "PduRSourcePduHandleId",
            displayName: "PduRSourcePduHandleId",
            description: "PduRSourcePduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurroutingpathcommunicationtype",
            name: "PduRRoutingPathCommunicationType",
            displayName: "PduRRoutingPathCommunicationType",
            description: "PduRRoutingPathCommunicationType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdursrcpdudirection",
            name: "PduRSrcPduDirection",
            displayName: "PduRSrcPduDirection",
            description: "PduRSrcPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu26-603c77be-tx",
        name: "BPEPS_Sporadic_PDU26_603c77be_Tx",
        displayName: "BPEPS_Sporadic_PDU26_603c77be_Tx",
        description: "BPEPS_Sporadic_PDU26_603c77be_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu27-5c5c94b6-tx",
        name: "BPEPS_Sporadic_PDU27_5c5c94b6_Tx",
        displayName: "BPEPS_Sporadic_PDU27_5c5c94b6_Tx",
        description: "BPEPS_Sporadic_PDU27_5c5c94b6_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu27-7f90d120-tx",
        name: "BPEPS_Sporadic_PDU27_7f90d120_Tx",
        displayName: "BPEPS_Sporadic_PDU27_7f90d120_Tx",
        description: "BPEPS_Sporadic_PDU27_7f90d120_Tx 配置容器",
        parameters: [
          {
            id: "pdurmulticoreroutingpath",
            name: "PduRMulticoreRoutingPath",
            displayName: "PduRMulticoreRoutingPath",
            description: "PduRMulticoreRoutingPath 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdursourcepduhandleid",
            name: "PduRSourcePduHandleId",
            displayName: "PduRSourcePduHandleId",
            description: "PduRSourcePduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurroutingpathcommunicationtype",
            name: "PduRRoutingPathCommunicationType",
            displayName: "PduRRoutingPathCommunicationType",
            description: "PduRRoutingPathCommunicationType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdursrcpdudirection",
            name: "PduRSrcPduDirection",
            displayName: "PduRSrcPduDirection",
            description: "PduRSrcPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "bpeps-sporadic-pdu28-d108238f-tx",
        name: "BPEPS_Sporadic_PDU28_d108238f_Tx",
        displayName: "BPEPS_Sporadic_PDU28_d108238f_Tx",
        description: "BPEPS_Sporadic_PDU28_d108238f_Tx 配置容器",
        parameters: [
          {
            id: "pdurdestpduhandleid",
            name: "PduRDestPduHandleId",
            displayName: "PduRDestPduHandleId",
            description: "PduRDestPduHandleId 参数",
            type: "integer",
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 65535
          },
          {
            id: "pdurdestpducrosspartitiondestination",
            name: "PduRDestPduCrossPartitionDestination",
            displayName: "PduRDestPduCrossPartitionDestination",
            description: "PduRDestPduCrossPartitionDestination 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurtransmissionconfirmation",
            name: "PduRTransmissionConfirmation",
            displayName: "PduRTransmissionConfirmation",
            description: "PduRTransmissionConfirmation 参数",
            type: "boolean",
            value: false,
            defaultValue: false
          },
          {
            id: "pdurdestpdudirection",
            name: "PduRDestPduDirection",
            displayName: "PduRDestPduDirection",
            description: "PduRDestPduDirection 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpduroutingtype",
            name: "PduRDestPduRoutingType",
            displayName: "PduRDestPduRoutingType",
            description: "PduRDestPduRoutingType 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprocessing",
            name: "PduRDestPduDataProcessing",
            displayName: "PduRDestPduDataProcessing",
            description: "PduRDestPduDataProcessing 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurpdulengthhandlingstrategy",
            name: "PduRPduLengthHandlingStrategy",
            displayName: "PduRPduLengthHandlingStrategy",
            description: "PduRPduLengthHandlingStrategy 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          },
          {
            id: "pdurdestpdudataprovision",
            name: "PduRDestPduDataProvision",
            displayName: "PduRDestPduDataProvision",
            description: "PduRDestPduDataProvision 参数",
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
    id: "rte",
    name: "Rte",
    displayName: "Runtime Environment",
    description: "运行时环境",
    vendor: "NXP",
    version: "4.4.0",
    autosarVersion: "4.4.0",
    layer: "RTE",
    enabled: false,
    parameters: [],
    containers: [
      {
        id: "adc-exclusive-area-00",
        name: "ADC_EXCLUSIVE_AREA_00",
        displayName: "ADC_EXCLUSIVE_AREA_00",
        description: "ADC_EXCLUSIVE_AREA_00 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-01",
        name: "ADC_EXCLUSIVE_AREA_01",
        displayName: "ADC_EXCLUSIVE_AREA_01",
        description: "ADC_EXCLUSIVE_AREA_01 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-02",
        name: "ADC_EXCLUSIVE_AREA_02",
        displayName: "ADC_EXCLUSIVE_AREA_02",
        description: "ADC_EXCLUSIVE_AREA_02 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-03",
        name: "ADC_EXCLUSIVE_AREA_03",
        displayName: "ADC_EXCLUSIVE_AREA_03",
        description: "ADC_EXCLUSIVE_AREA_03 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-04",
        name: "ADC_EXCLUSIVE_AREA_04",
        displayName: "ADC_EXCLUSIVE_AREA_04",
        description: "ADC_EXCLUSIVE_AREA_04 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-05",
        name: "ADC_EXCLUSIVE_AREA_05",
        displayName: "ADC_EXCLUSIVE_AREA_05",
        description: "ADC_EXCLUSIVE_AREA_05 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-06",
        name: "ADC_EXCLUSIVE_AREA_06",
        displayName: "ADC_EXCLUSIVE_AREA_06",
        description: "ADC_EXCLUSIVE_AREA_06 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-07",
        name: "ADC_EXCLUSIVE_AREA_07",
        displayName: "ADC_EXCLUSIVE_AREA_07",
        description: "ADC_EXCLUSIVE_AREA_07 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-08",
        name: "ADC_EXCLUSIVE_AREA_08",
        displayName: "ADC_EXCLUSIVE_AREA_08",
        description: "ADC_EXCLUSIVE_AREA_08 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-09",
        name: "ADC_EXCLUSIVE_AREA_09",
        displayName: "ADC_EXCLUSIVE_AREA_09",
        description: "ADC_EXCLUSIVE_AREA_09 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-10",
        name: "ADC_EXCLUSIVE_AREA_10",
        displayName: "ADC_EXCLUSIVE_AREA_10",
        description: "ADC_EXCLUSIVE_AREA_10 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-11",
        name: "ADC_EXCLUSIVE_AREA_11",
        displayName: "ADC_EXCLUSIVE_AREA_11",
        description: "ADC_EXCLUSIVE_AREA_11 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-12",
        name: "ADC_EXCLUSIVE_AREA_12",
        displayName: "ADC_EXCLUSIVE_AREA_12",
        description: "ADC_EXCLUSIVE_AREA_12 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-13",
        name: "ADC_EXCLUSIVE_AREA_13",
        displayName: "ADC_EXCLUSIVE_AREA_13",
        description: "ADC_EXCLUSIVE_AREA_13 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
            type: "string",
            value: "",
            defaultValue: "",
            max: 255
          }
        ],
        multiple: false
      },
      {
        id: "adc-exclusive-area-14",
        name: "ADC_EXCLUSIVE_AREA_14",
        displayName: "ADC_EXCLUSIVE_AREA_14",
        description: "ADC_EXCLUSIVE_AREA_14 配置容器",
        parameters: [
          {
            id: "rteexclusiveareaimplmechanism",
            name: "RteExclusiveAreaImplMechanism",
            displayName: "RteExclusiveAreaImplMechanism",
            description: "RteExclusiveAreaImplMechanism 参数",
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
