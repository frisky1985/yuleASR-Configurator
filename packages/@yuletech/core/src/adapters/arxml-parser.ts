/**
 * ARXML Parser
 * Parse AutoSAR ARXML configuration files
 */

import type { ModuleConfig } from '../types';

export interface ArxmlParseResult {
  modules: ModuleConfig[];
  errors: string[];
}

/**
 * Parse ARXML content and extract module configurations
 */
export function parseArxml(content: string): ArxmlParseResult {
  const result: ArxmlParseResult = {
    modules: [],
    errors: [],
  };

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Invalid XML format');
      return result;
    }

    // Extract ECUC modules
    const ecucModules = xmlDoc.querySelectorAll('ECUC-MODULE-CONFIGURATION-VALUES');

    ecucModules.forEach(moduleNode => {
      const moduleName = moduleNode.querySelector('SHORT-NAME')?.textContent || '';
      const moduleDefRef = moduleNode.querySelector('DEFINITION-REF')?.textContent || '';

      if (!moduleName) {
        result.errors.push('Found module without name');
        return;
      }

      // Extract parameters
      const parameters: Record<string, unknown> = {};
      const containers = moduleNode.querySelectorAll('ECUC-CONTAINER-VALUES');

      containers.forEach(container => {
        const paramValues = container.querySelectorAll(
          'ECUC-NUMERICAL-PARAM-VALUE, ECUC-TEXTUAL-PARAM-VALUE, ECUC-BOOLEAN-PARAM-VALUE'
        );

        paramValues.forEach(param => {
          const paramName =
            param.querySelector('DEFINITION-REF')?.textContent?.split('/').pop() || '';
          const value = param.querySelector('VALUE')?.textContent;

          if (paramName && value !== undefined) {
            // Try to parse as number or boolean
            if (value === 'true') {
              parameters[paramName] = true;
            } else if (value === 'false') {
              parameters[paramName] = false;
            } else if (!isNaN(Number(value))) {
              parameters[paramName] = Number(value);
            } else {
              parameters[paramName] = value;
            }
          }
        });
      });

      // Map to ModuleConfig
      const moduleConfig: ModuleConfig = {
        module: moduleName,
        version: extractVersion(moduleDefRef) || '4.4.0',
        parameters,
      };

      result.modules.push(moduleConfig);
    });

    if (result.modules.length === 0) {
      result.errors.push('No valid ECUC modules found in ARXML');
    }
  } catch (error) {
    result.errors.push(`Parse error: ${(error as Error).message}`);
  }

  return result;
}

/**
 * Validate ARXML format
 */
export function validateArxml(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      errors.push('Invalid XML format');
      return { valid: false, errors };
    }

    // Check for AUTOSAR root
    const autosarRoot = xmlDoc.querySelector('AUTOSAR');
    if (!autosarRoot) {
      errors.push('Missing AUTOSAR root element');
    }

    // Check for ECUC modules
    const ecucModules = xmlDoc.querySelectorAll('ECUC-MODULE-CONFIGURATION-VALUES');
    if (ecucModules.length === 0) {
      errors.push('No ECUC module configurations found');
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`Validation error: ${(error as Error).message}`);
    return { valid: false, errors };
  }
}

/**
 * Extract version from module definition reference
 */
function extractVersion(defRef: string): string | null {
  // Match version pattern like /Ep/{version}/Mcu
  const match = defRef.match(/\/Ep\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Convert ARXML to yuleASR format
 */
export function convertArxmlToYuleasr(content: string): Record<string, unknown> {
  const result = parseArxml(content);

  if (result.errors.length > 0) {
    throw new Error(`ARXML parse failed: ${result.errors.join(', ')}`);
  }

  const bswConfig: Record<string, unknown> = {
    schema_version: '1.0',
    target_platform: 'imx8mm',
    modules: {} as Record<string, unknown>,
  };

  result.modules.forEach(module => {
    (bswConfig.modules as Record<string, unknown>)[module.module] = {
      version: module.version,
      parameters: module.parameters,
    };
  });

  return bswConfig;
}
