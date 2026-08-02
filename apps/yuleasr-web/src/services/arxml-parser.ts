/**
 * ARXML Parser (Web 薄重导出层, Fix 18)
 *
 * Fix 18 后 core 是 ARXML 解析的唯一领域出口（fast-xml-parser 版，
 * 见 packages/@yuletech/core/src/adapters/arxml-parser.ts）。
 * 本文件仅做薄重导出，避免大改 Editor/测试的 import 面；
 * web 只保留平台适配（arxmlToConfigModules：ParsedModuleDef[] → web ConfigModule[]）。
 */

export {
  parseArxmlContent,
  parseArxml,
  validateArxml,
  convertArxmlToYuleasr,
  type ArxmlParseResult,
  type ParsedModuleDef,
  type ParsedContainerValue,
  type ParsedParamValue,
} from '@yuletech/core/adapters/arxml-parser';

// ---------------------------------------------------------------------------
// Format conversion: ParsedModuleDef[] → ConfigModule[]
// (web 专属平台适配：把 core 的结构化解析结果转成 web UI 的 ConfigModule 模型)
// ---------------------------------------------------------------------------

import type { ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config';
import type { ParsedModuleDef, ParsedContainerValue, ParsedParamValue } from '@yuletech/core/adapters/arxml-parser';

const PARAM_LAYER_MAP: Record<string, string> = {
  Adc: 'MCAL',
  Port: 'MCAL',
  Mcu: 'MCAL',
  Dio: 'MCAL',
  Icu: 'MCAL',
  Gpt: 'MCAL',
  Spi: 'MCAL',
  Mcl: 'MCAL',
  Pwm: 'MCAL',
  Wdg: 'MCAL',
  Lin: 'MCAL',
  Can: 'ECUAL',
  CanTrcv: 'ECUAL',
  Ble: 'ECUAL',
  Eth: 'ECUAL',
  Fr: 'ECUAL',
  CanIf: 'ECUAL',
  CanTp: 'ECUAL',
  LinIf: 'ECUAL',
  EthIf: 'ECUAL',
  FrIf: 'ECUAL',
  MemIf: 'ECUAL',
  IoHwAb: 'ECUAL',
  Fee: 'ECUAL',
  Ea: 'ECUAL',
  Dcm: 'Service',
  Dem: 'Service',
  Det: 'Service',
  Com: 'Service',
  NvM: 'Service',
  EcuM: 'Service',
  BswM: 'Service',
  CanNm: 'Service',
  CanSM: 'Service',
  PduR: 'Service',
  Rte: 'Service',
  Crypto: 'Service',
  Csm: 'Service',
  CryIf: 'Service',
  Nm: 'Service',
  Os: 'OS',
  Sbc: 'ECUAL',
  Arti: 'ECUAL',
};

export function arxmlToConfigModules(parsed: ParsedModuleDef[]): ConfigModule[] {
  return parsed.map(mod => {
    const layer = guessLayer(mod.shortName);
    const containers = parsedContainersToConfig(mod.containers);
    const moduleParams = parsedParametersToConfig(mod.parameters);

    return {
      id: mod.shortName.toLowerCase(),
      name: mod.shortName,
      displayName: mod.shortName,
      description: `Imported from ARXML: ${mod.definitionRef}`,
      vendor: 'NXP',
      version: '4.4.0',
      autosarVersion: '4.4.0',
      layer,
      enabled: true,
      parameters: moduleParams,
      containers,
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configStatus: 'configured',
    };
  });
}

function guessLayer(shortName: string): 'MCAL' | 'ECUAL' | 'Service' | 'OS' {
  return (PARAM_LAYER_MAP[shortName] as any) || 'Service';
}

function parsedContainersToConfig(containers: ParsedContainerValue[]): ConfigContainer[] {
  return containers.map(c => {
    const params = parsedParamsToConfigParams(c.parameters);
    const subs = parsedContainersToConfig(c.subContainers);

    const container: ConfigContainer = {
      id: c.shortName.toLowerCase(),
      name: c.shortName,
      parameters: params,
    };

    if (subs.length > 0) {
      container.subContainers = subs;
    }

    return container;
  });
}

/**
 * Convert module-level or container-level parameters to ConfigParameter[].
 */
function parsedParamsToConfigParams(params: ParsedParamValue[]): ConfigParameter[] {
  return params.map(p => {
    let paramType: ConfigParameter['type'] = 'string';
    // Map parsed type to ConfigParameter type
    switch (p.type) {
      case 'boolean':
        paramType = 'boolean';
        break;
      case 'integer':
        paramType = 'integer';
        break;
      case 'float':
        paramType = 'float';
        break;
      case 'enum':
        paramType = 'enum';
        break;
      case 'numerical':
        // ambiguous — try to refine from value
        if (p.value === 'true' || p.value === 'false') paramType = 'boolean';
        else if (/^\d+$/.test(p.value)) paramType = 'integer';
        else if (/^\d+\.\d+$/.test(p.value)) paramType = 'float';
        else paramType = 'string';
        break;
      case 'textual':
        paramType = 'string';
        break;
      default:
        paramType = 'string';
    }

    // Convert string value to native JS type
    let value: any = p.value;
    if (paramType === 'boolean') value = p.value === 'true' || p.value === '1';
    else if (paramType === 'integer') value = parseInt(p.value) || 0;
    else if (paramType === 'float') value = parseFloat(p.value) || 0;

    return {
      id: p.shortName.toLowerCase(),
      name: p.shortName,
      type: paramType,
      value,
      defaultValue: value,
    };
  });
}

/** Alias for use in module-level and container-level conversion */
function parsedParametersToConfig(params: ParsedParamValue[]): ConfigParameter[] {
  return parsedParamsToConfigParams(params);
}
