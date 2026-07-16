// ==================================================================
// Example: JsonExporter
// Type: data-export
//
// Exports the project configuration as a formatted JSON report.
// Demonstrates:
//   - YulePlugin.activate()
//   - PluginContext.registerDataExporter()
//   - DataExporterPlugin.export()
//   - Using PluginContext.config for user settings (e.g. indent level)
// ==================================================================

import type {
  YulePlugin,
  PluginContext,
  DataExporterPlugin,
} from '@yuletech/plugin-sdk';

// ── Plug-in constants ───────────────────────────────────────────────────────

/** Default JSON indentation spaces */
const DEFAULT_INDENT = 2;

/** Keys to exclude from the exported report (internal metadata) */
const EXCLUDED_KEYS = new Set(['_internal', '__meta', '_version']);

// ── Export helper ───────────────────────────────────────────────────────────

/**
 * Deep-clean a config object by removing excluded keys and empty containers.
 */
function cleanConfig(
  obj: unknown,
  depth: number,
): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj
      .map((item) => cleanConfig(item, depth + 1))
      .filter((item) => item !== undefined && item !== null);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (EXCLUDED_KEYS.has(key)) continue;
      const cleanedValue = cleanConfig(value, depth + 1);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj;
}

/**
 * Generate a human-readable JSON report.
 */
function buildJsonReport(
  config: Record<string, unknown>,
  indent: number,
  includeTimestamp: boolean,
): string {
  const cleaned = cleanConfig(config, 0) as Record<string, unknown>;

  // Wrap in a report envelope
  const report: Record<string, unknown> = {
    report: {
      generatedAt: includeTimestamp ? new Date().toISOString() : undefined,
      plugin: 'example-json-exporter',
      version: '1.0.0',
      moduleCount: Object.keys(cleaned).length,
    },
    configuration: cleaned,
  };

  return JSON.stringify(report, null, indent);
}

// ── Plugin Definition ───────────────────────────────────────────────────────

const jsonExporter: YulePlugin = {
  id: 'example-json-exporter',
  name: 'JSON Configuration Exporter',
  version: '1.0.0',
  type: 'data-export',
  description:
    'Exports the yuleASR project configuration as a formatted JSON report with metadata',
  author: 'YuleTech Examples',

  async activate(context: PluginContext): Promise<void> {
    context.logger.info('Activating JsonExporter');

    // Read user preferences from plugin config
    const indent = (context.config.indent as number) ?? DEFAULT_INDENT;
    const includeTimestamp =
      (context.config.includeTimestamp as boolean) ?? true;

    context.logger.info(
      `Configuration: indent=${indent}, includeTimestamp=${includeTimestamp}`,
    );

    const exporter: DataExporterPlugin = {
      name: 'JsonExporter',
      description:
        'Exports the full configuration as a pretty-printed JSON report',
      outputExtension: 'json',

      async export(
        config: Record<string, unknown>,
        options: Record<string, unknown>,
      ): Promise<{ content: string; extension: string }> {
        // Allow per-call override of indentation
        const effectiveIndent =
          (options.indent as number) ?? indent;
        const effectiveTimestamp =
          (options.includeTimestamp as boolean) ?? includeTimestamp;

        const content = buildJsonReport(config, effectiveIndent, effectiveTimestamp);

        context.logger.info(
          `Exported JSON report (${content.length} bytes, ${effectiveIndent}-space indent)`,
        );

        return {
          content,
          extension: 'json',
        };
      },
    };

    context.registerDataExporter(exporter);
    context.logger.info('JsonExporter registered successfully');
  },

  async deactivate(): Promise<void> {
    console.info('[example-json-exporter] Plugin deactivated');
  },
};

export default jsonExporter;
