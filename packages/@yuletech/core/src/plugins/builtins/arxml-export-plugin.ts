/**
 * Built-in: ARXML Export Plugin
 *
 * Exports yuleASR configurations to AUTOSAR ARXML format.
 *
 * A4-1 版本化导出：通过 export options 接收目标 AUTOSAR schema 版本
 * （48=R19-11 / 49=R20-11 / 50=R21-11 / 51=R22-11，默认 51），
 * 版本注册表与 VERSION_GATES 见 @yuletech/core/arxml-export。
 */
import {
  DEFAULT_SCHEMA_VERSION,
  assertSupportedSchemaVersion,
  schemaLocationFor,
  type AutosarSchemaVersion,
} from '@yuletech/core/arxml-export';
import type { YulePlugin, PluginContext } from '@yuletech/plugin-sdk';

const ARXML_NS = 'http://autosar.org/schema/r4.0';

function configToArxml(
  config: Record<string, unknown>,
  schemaVersion: AutosarSchemaVersion
): string {
  const modules = (config.modules as Record<string, unknown>) ?? {};
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<AUTOSAR xmlns="${ARXML_NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${schemaLocationFor(schemaVersion)}">`,
    '  <AR-PACKAGES>',
    '    <AR-PACKAGE>',
    '      <SHORT-NAME>yuleASR</SHORT-NAME>',
    '      <ELEMENTS>',
    '        <ECUC-MODULE-CONFIGURATION-VALUES>',
  ];

  for (const [moduleName, moduleData] of Object.entries(modules)) {
    const data = moduleData as Record<string, unknown>;
    const params = (data.parameters as Record<string, unknown>) ?? {};

    lines.push(`          <SHORT-NAME>${moduleName}</SHORT-NAME>`);
    lines.push('          <DEFINITION-REF>');
    lines.push(`            /${data.version ?? '4.4.0'}/${moduleName}/${moduleName}`);
    lines.push('          </DEFINITION-REF>');
    lines.push(`          <ECUC-CONTAINER-VALUES>`);

    for (const [key, value] of Object.entries(params)) {
      lines.push('            <ECUC-NUMERICAL-PARAM-VALUE>');
      lines.push(`              <DEFINITION-REF>/${moduleName}/${key}</DEFINITION-REF>`);
      lines.push(`              <VALUE>${String(value)}</VALUE>`);
      lines.push('            </ECUC-NUMERICAL-PARAM-VALUE>');
    }

    lines.push('          </ECUC-CONTAINER-VALUES>');
    lines.push('        </ECUC-MODULE-CONFIGURATION-VALUES>');
  }

  lines.push('      </ELEMENTS>', '    </AR-PACKAGE>', '  </AR-PACKAGES>', '</AUTOSAR>');

  return lines.join('\n');
}

const arxmlExportPlugin: YulePlugin = {
  id: 'yuletech-export-arxml',
  name: 'ARXML Export',
  version: '1.1.0',
  type: 'data-export',
  description:
    '将 yuleASR 配置导出为标准 AUTOSAR ARXML 格式（目标版本 48=R19-11 ~ 51=R22-11 可选）',
  author: 'YuleTech',

  async activate(context: PluginContext): Promise<void> {
    context.registerDataExporter({
      name: 'ArxmlExporter',
      description: 'Export configurations to AUTOSAR ARXML format (versioned)',
      outputExtension: 'arxml',
      async export(
        config: Record<string, unknown>,
        options: Record<string, unknown>
      ): Promise<{ content: string; extension: string }> {
        // 目标 AUTOSAR 版本来自导出选项（如插件面板 "目标 AUTOSAR 版本" 参数）
        const schemaVersion = assertSupportedSchemaVersion(
          (options.schemaVersion as number | undefined) ?? DEFAULT_SCHEMA_VERSION
        );
        const content = configToArxml(config, schemaVersion);
        return { content, extension: 'arxml' };
      },
    });
    context.logger.info('ARXML export plugin activated (versioned)');
  },

  async deactivate(): Promise<void> {
    // No cleanup needed
  },
};

export default arxmlExportPlugin;
