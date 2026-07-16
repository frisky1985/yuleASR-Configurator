/**
 * Configuration Audit Report Generator
 * Produces a readable HTML report for configuration review and auditing.
 * Input: ConfigFile with all modules, containers, and parameters.
 * Output: Beautiful HTML string suitable for download or print.
 */

import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config'
import { formatDate } from '@/lib/utils'

/**
 * Format a parameter value for display in HTML
 */
function formatParamValue(value: unknown): string {
  if (value === undefined || value === null) return '<span class="val-null">—</span>'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (Array.isArray(value)) return `[${value.map(v => String(v)).join(', ')}]`
  return String(value)
}

/**
 * Get module status badge HTML
 */
function moduleStatusBadge(status: ConfigModule['configStatus']): string {
  const badges: Record<string, { label: string; cls: string }> = {
    configured: { label: 'Configured', cls: 'badge-green' },
    configuring: { label: 'Configuring', cls: 'badge-blue' },
    partial: { label: 'Partial', cls: 'badge-yellow' },
    unconfigured: { label: 'Unconfigured', cls: 'badge-gray' },
  }
  const b = badges[status] || badges.unconfigured
  return `<span class="badge ${b.cls}">${b.label}</span>`
}

/**
 * Render parameter rows for a table
 */
function renderParameterRows(parameters: ConfigParameter[], indent = ''): string {
  return parameters
    .filter(p => !p.hidden)
    .map(p => {
      const depInfo = p.dependencies?.length
        ? `<span class="dep-badge">depends: ${p.dependencies.map(d => `${d.parameter} ${d.operator} ${d.value}`).join(', ')}</span>`
        : ''
      return `<tr>
        <td class="param-name">${indent}${p.displayName || p.name}</td>
        <td>${p.type}</td>
        <td>${formatParamValue(p.value)}</td>
        <td>${p.defaultValue !== undefined ? formatParamValue(p.defaultValue) : '—'}</td>
        <td>${p.unit || '—'}</td>
        <td>${depInfo}</td>
      </tr>`
    })
    .join('\n')
}

/**
 * Render a container and its sub-containers recursively
 */
function renderContainer(container: ConfigContainer, depth = 1): string {
  const indent = '  '.repeat(depth)
  const hasSubs = container.subContainers && container.subContainers.length > 0
  const hasParams = container.parameters && container.parameters.length > 0

  let html = ''
  if (hasParams) {
    html += `<h${Math.min(depth + 2, 4)} style="margin:${depth > 1 ? '12px 0 6px' : '16px 0 8px'};color:#374151;">${container.displayName || container.name}</h${Math.min(depth + 2, 4)}>\n`
    if (container.description) {
      html += `<p style="font-size:0.875rem;color:#6b7280;margin-bottom:8px;">${container.description}</p>\n`
    }
    html += `<table class="params-table">\n`
    html += `<thead><tr><th>Parameter</th><th>Type</th><th>Value</th><th>Default</th><th>Unit</th><th>Dependencies</th></tr></thead>\n`
    html += `<tbody>\n`
    html += renderParameterRows(container.parameters, '')
    html += `</tbody>\n</table>\n`
  }

  if (hasSubs) {
    html += `<div class="sub-container">\n`
    for (const sub of container.subContainers!) {
      html += renderContainer(sub, depth + 1)
    }
    html += `</div>\n`
  }

  return html
}

/**
 * Render a complete module section
 */
function renderModule(module: ConfigModule): string {
  const hasContainerParams = module.containers.some(c =>
    c.parameters.length > 0 || (c.subContainers && c.subContainers.some(sc => sc.parameters.length > 0))
  )
  const hasModuleParams = module.parameters.length > 0

  let html = `<div class="module-card">\n`
  html += `<div class="module-header">\n`
  html += `<div class="module-info">\n`
  html += `<h3>${module.displayName || module.name}</h3>\n`
  html += `<span class="module-meta">${module.vendor ? `${module.vendor} | ` : ''}v${module.version} | ${module.layer}</span>\n`
  html += `</div>\n`
  html += `<div class="module-status">\n`
  html += moduleStatusBadge(module.configStatus)
  html += `<span class="status-indicator ${module.enabled ? 'enabled' : 'disabled'}">${module.enabled ? 'Enabled' : 'Disabled'}</span>\n`
  html += `</div>\n`
  html += `</div>\n`

  if (module.description) {
    html += `<p class="module-desc">${module.description}</p>\n`
  }

  // Module-level parameters
  if (hasModuleParams) {
    html += `<h4 style="margin:12px 0 6px;color:#374151;font-size:0.9rem;">Module Parameters</h4>\n`
    html += `<table class="params-table">\n`
    html += `<thead><tr><th>Parameter</th><th>Type</th><th>Value</th><th>Default</th><th>Unit</th><th>Dependencies</th></tr></thead>\n`
    html += `<tbody>\n`
    html += renderParameterRows(module.parameters)
    html += `</tbody>\n</table>\n`
  }

  // Containers
  if (hasContainerParams) {
    for (const container of module.containers) {
      html += renderContainer(container)
    }
  } else if (!hasModuleParams) {
    html += `<p style="color:#9ca3af;font-size:0.875rem;padding:8px 0;">No parameters configured.</p>\n`
  }

  // Dependencies
  if (module.dependencies.length > 0) {
    html += `<div class="deps-section">\n`
    html += `<h4 style="margin:12px 0 4px;color:#6b7280;font-size:0.8rem;text-transform:uppercase;">Dependencies</h4>\n`
    html += `<div class="deps-list">\n`
    for (const dep of module.dependencies) {
      html += `<span class="dep-tag ${dep.required ? 'required' : 'optional'}">${dep.module}${dep.required ? ' (required)' : ''}</span>\n`
    }
    html += `</div>\n`
    html += `</div>\n`
  }

  // Validation errors
  if (module.validationErrors && module.validationErrors.length > 0) {
    html += `<div class="validation-errors">\n`
    html += `<h4 style="margin:12px 0 4px;color:#dc2626;font-size:0.8rem;text-transform:uppercase;">Validation Issues</h4>\n`
    html += `<ul>\n`
    for (const err of module.validationErrors) {
      html += `<li>${err}</li>\n`
    }
    html += `</ul>\n`
    html += `</div>\n`
  }

  html += `</div>\n`
  return html
}

/**
 * Generate a complete HTML audit report from a configuration
 */
export function generateAuditReport(config: ConfigFile): string {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
  const enabledModules = config.modules.filter(m => m.enabled)
  const disabledModules = config.modules.filter(m => !m.enabled)
  const configuredCount = config.modules.filter(m => m.configStatus === 'configured').length
  const totalModules = config.modules.length
  const progressPct = totalModules > 0 ? Math.round((configuredCount / totalModules) * 100) : 0

  // Layer summary
  const layerSummary: Record<string, { total: number; configured: number }> = {}
  for (const m of config.modules) {
    if (!layerSummary[m.layer]) layerSummary[m.layer] = { total: 0, configured: 0 }
    layerSummary[m.layer].total++
    if (m.configStatus === 'configured') layerSummary[m.layer].configured++
  }

  // Module sections
  const layers = ['MCAL', 'ECUAL', 'Service', 'OS', 'RTE', 'ASW']
  let moduleHtml = ''
  for (const layer of layers) {
    const layerModules = config.modules.filter(m => m.layer === layer && m.enabled)
    if (layerModules.length === 0) continue
    moduleHtml += `<h2 class="layer-header">${layer} (${layerModules.length})</h2>\n`
    for (const mod of layerModules) {
      moduleHtml += renderModule(mod)
    }
  }

  // Disabled modules
  if (disabledModules.length > 0) {
    moduleHtml += `<h2 class="layer-header" style="color:#9ca3af;">Disabled Modules (${disabledModules.length})</h2>\n`
    for (const mod of disabledModules) {
      moduleHtml += `<div class="module-card disabled">\n`
      moduleHtml += `<div class="module-header">\n`
      moduleHtml += `<div class="module-info">\n`
      moduleHtml += `<h3 style="color:#9ca3af;">${mod.displayName || mod.name}</h3>\n`
      moduleHtml += `<span class="module-meta">v${mod.version} | ${mod.layer}</span>\n`
      moduleHtml += `</div>\n`
      moduleHtml += `<span class="status-indicator disabled">Disabled</span>\n`
      moduleHtml += `</div>\n`
      moduleHtml += `</div>\n`
    }
  }

  // Build the complete HTML
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Configuration Audit Report - ${config.name}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; color: #1f2937; background: #f3f4f6; padding: 2rem; line-height: 1.6; }
.container { max-width: 1100px; margin: 0 auto; }

/* Report header */
.report-header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 2rem 2.5rem; border-radius: 0.75rem; margin-bottom: 1.5rem; }
.report-header h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
.report-header .meta { font-size: 0.875rem; opacity: 0.85; }
.report-header .meta span { margin-right: 1.5rem; }

/* Summary cards */
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.summary-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem 1.25rem; text-align: center; }
.summary-card .count { font-size: 1.75rem; font-weight: 700; }
.summary-card .label { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.card-total { border-top: 3px solid #6366f1; } .card-total .count { color: #6366f1; }
.card-enabled { border-top: 3px solid #22c55e; } .card-enabled .count { color: #22c55e; }
.card-configured { border-top: 3px solid #3b82f6; } .card-configured .count { color: #3b82f6; }
.card-progress { border-top: 3px solid #f59e0b; } .card-progress .count { color: #f59e0b; }
.card-validation { border-top: 3px solid #ef4444; } .card-validation .count { color: #ef4444; }

/* Progress bar */
.progress-bar-wrap { background: #e5e7eb; border-radius: 9999px; height: 8px; overflow: hidden; margin-top: 0.5rem; }
.progress-bar-fill { height: 100%; border-radius: 9999px; transition: width 0.5s; }
.progress-bar-fill.good { background: #22c55e; }
.progress-bar-fill.ok { background: #f59e0b; }
.progress-bar-fill.low { background: #ef4444; }

/* Layer headers */
.layer-header { font-size: 1.1rem; font-weight: 600; color: #1f2937; margin: 1.5rem 0 0.75rem; padding: 0.5rem 0; border-bottom: 2px solid #e5e7eb; }

/* Module card */
.module-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 0.75rem; }
.module-card.disabled { background: #f9fafb; }
.module-header { display: flex; justify-content: space-between; align-items: flex-start; }
.module-info h3 { font-size: 1rem; font-weight: 600; color: #111827; }
.module-meta { font-size: 0.75rem; color: #9ca3af; }
.module-status { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.module-desc { font-size: 0.875rem; color: #6b7280; margin-top: 0.375rem; }

/* Status indicators */
.status-indicator { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500; }
.status-indicator.enabled { background: #dcfce7; color: #16a34a; }
.status-indicator.disabled { background: #f3f4f6; color: #9ca3af; }

/* Badges */
.badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-blue { background: #dbeafe; color: #2563eb; }
.badge-yellow { background: #fef9c3; color: #ca8a04; }
.badge-gray { background: #f3f4f6; color: #6b7280; }

/* Parameter tables */
.params-table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.8125rem; }
.params-table th { text-align: left; padding: 0.5rem 0.75rem; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.params-table td { padding: 0.375rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
.params-table tr:hover td { background: #fafafa; }
.param-name { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 0.8125rem; color: #374151; white-space: nowrap; }
.val-null { color: #d1d5db; font-style: italic; }

/* Dependencies */
.deps-section { margin-top: 0.5rem; }
.deps-list { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.dep-tag { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; }
.dep-tag.required { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.dep-tag.optional { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.dep-badge { font-size: 0.6875rem; color: #6b7280; background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; white-space: nowrap; }

/* Validation errors */
.validation-errors { margin-top: 0.75rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; }
.validation-errors ul { margin: 0.25rem 0 0 1.25rem; font-size: 0.8125rem; color: #dc2626; }
.validation-errors li { margin-bottom: 0.125rem; }

/* Sub-container indent */
.sub-container { }

/* Footer */
.report-footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; font-size: 0.75rem; color: #9ca3af; }

/* Print */
@media print {
  body { background: white; padding: 0; }
  .report-header { border-radius: 0; }
  .module-card { break-inside: avoid; }
}
</style>
</head>
<body>
<div class="container">

<!-- Report Header -->
<div class="report-header">
<h1>Configuration Audit Report</h1>
<div class="meta">
<span>📋 ${config.name}</span>
<span>🎯 ${config.targetChip || 'N/A'}</span>
<span>🧩 ${config.compiler || 'N/A'}</span>
<span>📅 ${now}</span>
</div>
</div>

<!-- Summary -->
<div class="summary-grid">
<div class="summary-card card-total">
<div class="count">${totalModules}</div>
<div class="label">Total Modules</div>
</div>
<div class="summary-card card-enabled">
<div class="count">${enabledModules.length}</div>
<div class="label">Enabled Modules</div>
</div>
<div class="summary-card card-configured">
<div class="count">${configuredCount}</div>
<div class="label">Configured</div>
</div>
<div class="summary-card card-progress">
<div class="count">${progressPct}%</div>
<div class="label">Completion</div>
<div class="progress-bar-wrap">
<div class="progress-bar-fill ${progressPct >= 80 ? 'good' : progressPct >= 40 ? 'ok' : 'low'}" style="width:${progressPct}%"></div>
</div>
</div>
</div>

<!-- Layer Summary -->
<div class="summary-grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
${Object.entries(layerSummary).map(([layer, st]) => {
  const pct = st.total > 0 ? Math.round((st.configured / st.total) * 100) : 0
  const color = pct >= 80 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return `<div class="summary-card" style="border-top:3px solid ${color};">
    <div class="count" style="color:${color};">${st.configured}/${st.total}</div>
    <div class="label">${layer}</div>
  </div>`
}).join('\n')}
</div>

<!-- Config Info -->
<div style="background:white;border:1px solid #e5e7eb;border-radius:0.5rem;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;flex-wrap:wrap;gap:1.5rem;font-size:0.875rem;">
<div><strong>Name:</strong> ${config.name}</div>
<div><strong>ID:</strong> <code style="font-size:0.75rem;color:#6b7280;">${config.id}</code></div>
<div><strong>Version:</strong> ${config.version || '—'}</div>
<div><strong>Target:</strong> ${config.targetPlatform || '—'} / ${config.targetChip || '—'}</div>
<div><strong>Compiler:</strong> ${config.compiler || '—'}</div>
<div><strong>Created:</strong> ${config.createdAt ? formatDate(config.createdAt) : '—'}</div>
<div><strong>Updated:</strong> ${config.updatedAt ? formatDate(config.updatedAt) : '—'}</div>
</div>

<!-- Validation Status -->
${config.lastValidation ? `
<div style="background:white;border:1px solid #e5e7eb;border-radius:0.5rem;padding:1rem 1.25rem;margin-bottom:1.5rem;">
<h3 style="font-size:0.95rem;margin-bottom:0.5rem;">Validation Status</h3>
<div class="summary-grid" style="grid-template-columns:repeat(4,1fr);">
  <div class="summary-card" style="border-top:3px solid ${config.lastValidation.valid ? '#22c55e' : '#ef4444'};">
    <div class="count" style="color:${config.lastValidation.valid ? '#22c55e' : '#ef4444'};">${config.lastValidation.valid ? 'PASS' : 'FAIL'}</div>
    <div class="label">Status</div>
  </div>
  <div class="summary-card" style="border-top:3px solid #ef4444;">
    <div class="count" style="color:#ef4444;">${config.lastValidation.errorCount}</div>
    <div class="label">Errors</div>
  </div>
  <div class="summary-card" style="border-top:3px solid #f59e0b;">
    <div class="count" style="color:#f59e0b;">${config.lastValidation.warningCount}</div>
    <div class="label">Warnings</div>
  </div>
  <div class="summary-card" style="border-top:3px solid #6b7280;">
    <div class="count" style="color:#6b7280;">${formatDate(config.lastValidation.timestamp)}</div>
    <div class="label">Last Checked</div>
  </div>
</div>
</div>
` : ''}

<!-- OS Configuration -->
${config.os ? `
<div style="background:white;border:1px solid #e5e7eb;border-radius:0.5rem;padding:1rem 1.25rem;margin-bottom:1.5rem;">
<h3 style="font-size:0.95rem;margin-bottom:0.5rem;">OS Configuration</h3>
<div style="display:flex;flex-wrap:wrap;gap:1rem;font-size:0.875rem;">
  <div><strong>Version:</strong> ${config.os.version}</div>
  <div><strong>Scalability:</strong> ${config.os.scalabilityClass || '—'}</div>
  <div><strong>Tasks:</strong> ${config.os.tasks?.length || 0}</div>
  <div><strong>Events:</strong> ${config.os.events?.length || 0}</div>
  <div><strong>Alarms:</strong> ${config.os.alarms?.length || 0}</div>
  <div><strong>Resources:</strong> ${config.os.resources?.length || 0}</div>
  <div><strong>Counters:</strong> ${config.os.counters?.length || 0}</div>
  <div><strong>ISRs:</strong> ${config.os.isrs?.length || 0}</div>
  <div><strong>Schedule Tables:</strong> ${config.os.scheduleTables?.length || 0}</div>
</div>
</div>
` : ''}

<!-- Modules Detail -->
<h2 style="font-size:1.25rem;font-weight:700;margin:1.5rem 0 0.75rem;">Module Configuration Detail</h2>
${moduleHtml}

<!-- Footer -->
<div class="report-footer">
<p>Generated by yuleASR Configurator on ${now}</p>
<p style="margin-top:0.25rem;">This is an auto-generated audit report. All values are as of the generation timestamp.</p>
</div>

</div>
</body>
</html>`
}

/**
 * Trigger download of the HTML audit report
 */
export function downloadAuditReport(config: ConfigFile): void {
  const html = generateAuditReport(config)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-report-${config.name.replace(/[^a-zA-Z0-9_-]/g, '_')}-${new Date().toISOString().split('T')[0]}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
