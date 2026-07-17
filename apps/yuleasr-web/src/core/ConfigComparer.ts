/**
 * Configuration Comparison Engine
 * Compare two configurations and generate diff report
 */

import type { ConfigFile, ConfigModule, ConfigParameter, ConfigContainer } from '../types/config';

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface ConfigDiff {
  type: DiffType;
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
  module?: string;
  parameter?: string;
  description?: string;
}

export interface ComparisonResult {
  configA: { id: string; name: string };
  configB: { id: string; name: string };
  differences: ConfigDiff[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
    total: number;
  };
  modulesCompared: string[];
}

export class ConfigComparer {
  /**
   * Compare two complete configurations
   */
  compareConfigs(configA: ConfigFile, configB: ConfigFile): ComparisonResult {
    const differences: ConfigDiff[] = [];
    const modulesCompared = new Set<string>();

    // Compare modules
    const allModuleIds = new Set([
      ...configA.modules.map(m => m.id),
      ...configB.modules.map(m => m.id),
    ]);

    for (const moduleId of Array.from(allModuleIds)) {
      const moduleA = configA.modules.find(m => m.id === moduleId);
      const moduleB = configB.modules.find(m => m.id === moduleId);

      if (moduleA && moduleB) {
        // Module exists in both - compare
        const moduleDiffs = this.compareModules(moduleA, moduleB);
        differences.push(...moduleDiffs);
        modulesCompared.add(moduleA.name);
      } else if (moduleA && !moduleB) {
        // Module removed
        differences.push({
          type: 'removed',
          path: `modules.${moduleA.name}`,
          oldValue: moduleA.name,
          module: moduleA.name,
          description: `Module ${moduleA.name} removed`,
        });
        modulesCompared.add(moduleA.name);
      } else if (!moduleA && moduleB) {
        // Module added
        differences.push({
          type: 'added',
          path: `modules.${moduleB.name}`,
          newValue: moduleB.name,
          module: moduleB.name,
          description: `Module ${moduleB.name} added`,
        });
        modulesCompared.add(moduleB.name);
      }
    }

    // Calculate summary
    const summary = {
      added: differences.filter(d => d.type === 'added').length,
      removed: differences.filter(d => d.type === 'removed').length,
      modified: differences.filter(d => d.type === 'modified').length,
      unchanged: differences.filter(d => d.type === 'unchanged').length,
      total: differences.length,
    };

    return {
      configA: { id: configA.id, name: configA.name },
      configB: { id: configB.id, name: configB.name },
      differences,
      summary,
      modulesCompared: Array.from(modulesCompared),
    };
  }

  /**
   * Compare two modules
   */
  private compareModules(moduleA: ConfigModule, moduleB: ConfigModule): ConfigDiff[] {
    const differences: ConfigDiff[] = [];

    // Compare enabled status
    if (moduleA.enabled !== moduleB.enabled) {
      differences.push({
        type: 'modified',
        path: `modules.${moduleA.name}.enabled`,
        oldValue: moduleA.enabled,
        newValue: moduleB.enabled,
        module: moduleA.name,
        description: `Module ${moduleA.name} ${moduleB.enabled ? 'enabled' : 'disabled'}`,
      });
    }

    // Compare module-level parameters
    const paramDiffs = this.compareParameters(moduleA.parameters, moduleB.parameters, moduleA.name);
    differences.push(...paramDiffs);

    // Compare containers
    const containerDiffs = this.compareContainers(
      moduleA.containers,
      moduleB.containers,
      moduleA.name
    );
    differences.push(...containerDiffs);

    return differences;
  }

  /**
   * Compare containers
   */
  private compareContainers(
    containersA: ConfigContainer[],
    containersB: ConfigContainer[],
    moduleName: string,
    parentPath = ''
  ): ConfigDiff[] {
    const differences: ConfigDiff[] = [];
    const allContainerIds = new Set([...containersA.map(c => c.id), ...containersB.map(c => c.id)]);

    for (const containerId of Array.from(allContainerIds)) {
      const containerA = containersA.find(c => c.id === containerId);
      const containerB = containersB.find(c => c.id === containerId);
      const path = parentPath
        ? `${parentPath}.containers.${containerA?.name || containerB?.name}`
        : `modules.${moduleName}.containers.${containerA?.name || containerB?.name}`;

      if (containerA && containerB) {
        // Compare parameters in container
        const paramDiffs = this.compareParameters(
          containerA.parameters,
          containerB.parameters,
          moduleName,
          path
        );
        differences.push(...paramDiffs);

        // Compare sub-containers
        if (containerA.subContainers || containerB.subContainers) {
          const subDiffs = this.compareContainers(
            containerA.subContainers || [],
            containerB.subContainers || [],
            moduleName,
            path
          );
          differences.push(...subDiffs);
        }
      } else if (containerA && !containerB) {
        differences.push({
          type: 'removed',
          path,
          oldValue: containerA.name,
          module: moduleName,
          description: `Container ${containerA.name} removed`,
        });
      } else if (!containerA && containerB) {
        differences.push({
          type: 'added',
          path,
          newValue: containerB.name,
          module: moduleName,
          description: `Container ${containerB.name} added`,
        });
      }
    }

    return differences;
  }

  /**
   * Compare parameters
   */
  private compareParameters(
    paramsA: ConfigParameter[],
    paramsB: ConfigParameter[],
    moduleName: string,
    parentPath = ''
  ): ConfigDiff[] {
    const differences: ConfigDiff[] = [];
    const allParamIds = new Set([...paramsA.map(p => p.id), ...paramsB.map(p => p.id)]);

    for (const paramId of Array.from(allParamIds)) {
      const paramA = paramsA.find(p => p.id === paramId);
      const paramB = paramsB.find(p => p.id === paramId);
      const paramName = paramA?.name || paramB?.name || paramId;
      const path = parentPath
        ? `${parentPath}.parameters.${paramName}`
        : `modules.${moduleName}.parameters.${paramName}`;

      if (paramA && paramB) {
        // Parameter exists in both - compare values
        if (JSON.stringify(paramA.value) !== JSON.stringify(paramB.value)) {
          differences.push({
            type: 'modified',
            path,
            oldValue: paramA.value,
            newValue: paramB.value,
            module: moduleName,
            parameter: paramName,
            description: `Parameter ${paramName} changed from ${paramA.value} to ${paramB.value}`,
          });
        }
      } else if (paramA && !paramB) {
        differences.push({
          type: 'removed',
          path,
          oldValue: paramA.value,
          module: moduleName,
          parameter: paramName,
          description: `Parameter ${paramName} removed`,
        });
      } else if (!paramA && paramB) {
        differences.push({
          type: 'added',
          path,
          newValue: paramB.value,
          module: moduleName,
          parameter: paramName,
          description: `Parameter ${paramName} added with value ${paramB.value}`,
        });
      }
    }

    return differences;
  }

  /**
   * Generate a human-readable diff summary
   */
  generateSummaryText(result: ComparisonResult): string {
    const { summary, configA, configB } = result;

    let text = `Configuration Comparison: ${configA.name} vs ${configB.name}\n`;
    text += `=====================================

`;
    text += `Summary:\n`;
    text += `  - Added: ${summary.added}\n`;
    text += `  - Removed: ${summary.removed}\n`;
    text += `  - Modified: ${summary.modified}\n`;
    text += `  - Total changes: ${summary.total}\n\n`;

    // Group by type
    const byType = {
      added: result.differences.filter(d => d.type === 'added'),
      removed: result.differences.filter(d => d.type === 'removed'),
      modified: result.differences.filter(d => d.type === 'modified'),
    };

    if (byType.added.length > 0) {
      text += `Added (${byType.added.length}):\n`;
      byType.added.forEach(d => {
        text += `  + ${d.path}${d.newValue !== undefined ? `: ${d.newValue}` : ''}\n`;
      });
      text += '\n';
    }

    if (byType.removed.length > 0) {
      text += `Removed (${byType.removed.length}):\n`;
      byType.removed.forEach(d => {
        text += `  - ${d.path}${d.oldValue !== undefined ? `: ${d.oldValue}` : ''}\n`;
      });
      text += '\n';
    }

    if (byType.modified.length > 0) {
      text += `Modified (${byType.modified.length}):\n`;
      byType.modified.forEach(d => {
        text += `  ~ ${d.path}\n`;
        text += `    - ${d.oldValue} → ${d.newValue}\n`;
      });
    }

    return text;
  }

  /**
   * Export comparison result to JSON
   */
  exportToJSON(result: ComparisonResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Export comparison result to Markdown
   */
  exportToMarkdown(result: ComparisonResult): string {
    const { summary, configA, configB, differences } = result;

    let md = `# Configuration Comparison\n\n`;
    md += `**${configA.name}** vs **${configB.name}**\n\n`;

    md += `## Summary\n\n`;
    md += `- **Added:** ${summary.added}\n`;
    md += `- **Removed:** ${summary.removed}\n`;
    md += `- **Modified:** ${summary.modified}\n`;
    md += `- **Total Changes:** ${summary.total}\n\n`;

    // Group by module
    const byModule = new Map<string, ConfigDiff[]>();
    differences.forEach(diff => {
      const module = diff.module || 'General';
      if (!byModule.has(module)) {
        byModule.set(module, []);
      }
      byModule.get(module)!.push(diff);
    });

    md += `## Changes by Module\n\n`;
    for (const [module, diffs] of Array.from(byModule.entries())) {
      md += `### ${module}\n\n`;
      diffs.forEach(diff => {
        const icon = diff.type === 'added' ? '✅' : diff.type === 'removed' ? '❌' : '📝';
        md += `- ${icon} **${diff.type.toUpperCase()}** ${diff.path}\n`;
        if (diff.type === 'modified') {
          md += `  - Old: \`${JSON.stringify(diff.oldValue)}\`\n`;
          md += `  - New: \`${JSON.stringify(diff.newValue)}\`\n`;
        }
      });
      md += '\n';
    }

    return md;
  }
}

// Singleton instance
export const configComparer = new ConfigComparer();
