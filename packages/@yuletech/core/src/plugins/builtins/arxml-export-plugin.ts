/**
 * Built-in: ARXML Export Plugin
 *
 * Exports yuleASR configurations to AUTOSAR ARXML format.
 * Supports AUTOSAR 4.4 ARXML schema for ECUC module configuration values.
 */
import type { YulePlugin, PluginContext } from '@yuletech/plugin-sdk';

function configToArxml(config: Record<string, unknown>): string {
  const modules = (config.modules as Record<string, unknown>) ?? {};
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<AUTOSAR xmlns="http://autosar.org/schema/r4.0">',
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

  lines.push(
    '      </ELEMENTS>',
    '    </AR-PACKAGE>',
    '  </AR-PACKAGES>',
    '</AUTOSAR>',
  );

  return lines.join('\n');
}

const arxmlExportPlugin: YulePlugin = {
  id: 'yuletech-export-arxml',
  name: 'ARXML Export',
  version: '1.0.0',
  type: 'data-export',
  description: '将 yuleASR 配置导出为标准 AUTOSAR ARXML 格式（支持 AUTOSAR 4.4）',
  author: 'YuleTech',

  async activate(context: PluginContext): Promise<void> {
    context.registerDataExporter({
      name: 'ArxmlExporter',
      description: 'Export configurations to AUTOSAR ARXML format',
      outputExtension: 'arxml',
      async export(config: Record<string, unknown>): Promise<{ content: string; extension: string }> {
        const content = configToArxml(config);
        return { content, extension: 'arxml' };
      },
    });
    context.logger.info('ARXML export plugin activated');
  },

  async deactivate(): Promise<void> {
    // No cleanup needed
  },
};

export default arxmlExportPlugin;
