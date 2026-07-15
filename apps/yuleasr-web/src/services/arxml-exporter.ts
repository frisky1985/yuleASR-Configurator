/**
 * ARXML Exporter - Generate AUTOSAR ARXML from configuration data
 * Enables round-trip: Import → Edit → Export
 * Compatible with AUTOSAR 4.0 - 4.4 schema
 */

import type { ConfigModule, ConfigContainer, ConfigParameter, ConfigFile } from '@/types/config'

const ARXML_NS = 'http://autosar.org/schema/r4.0'
const ARXML_SCHEMA = 'http://autosar.org/schema/r4.0 AUTOSAR_00044.xsd'

/** Generate a UUID v4 string */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

/** XML encode a string value */
function xmlEncode(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Build ARXML definition ref path from module/container names */
function defRef(...segments: string[]): string {
  return '/TS_T40D44M10I7R0/' + segments.join('/')
}

/** Determine the ARXML parameter type DEST based on ConfigParameter type */
function paramDest(param: ConfigParameter): string {
  switch (param.type) {
    case 'boolean': return 'ECUC-BOOLEAN-PARAM-DEF'
    case 'integer': return 'ECUC-INTEGER-PARAM-DEF'
    case 'float': return 'ECUC-FLOAT-PARAM-DEF'
    case 'enum': return 'ECUC-ENUMERATION-PARAM-DEF'
    case 'string': return 'ECUC-STRING-PARAM-DEF'
    default: return 'ECUC-INTEGER-PARAM-DEF'
  }
}

/** Determine the ARXML value element name */
function paramValueTag(param: ConfigParameter): string {
  if (param.type === 'boolean' || param.type === 'integer' || param.type === 'float') {
    return 'ECUC-NUMERICAL-PARAM-VALUE'
  }
  return 'ECUC-TEXTUAL-PARAM-VALUE'
}

/** Format a parameter value for ARXML output */
function formatArxmlValue(param: ConfigParameter): string {
  const val = param.value ?? param.defaultValue
  if (val === undefined || val === null) return ''
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return String(val)
  return xmlEncode(String(val))
}

/**
 * Generate ARXML for a single parameter value
 */
function generateParamXml(param: ConfigParameter, indent: string): string {
  const dest = paramDest(param)
  const tag = paramValueTag(param)
  const value = formatArxmlValue(param)
  const ref = defRef(param.name)
  const lines: string[] = [
    `${indent}<${tag}>`,
    `${indent}  <DEFINITION-REF DEST="${dest}">${xmlEncode(ref)}</DEFINITION-REF>`,
    `${indent}  <VALUE>${value}</VALUE>`,
    `${indent}</${tag}>`,
  ]
  return lines.join('\n')
}

/**
 * Generate ARXML for a container and its sub-containers recursively
 */
function generateContainerXml(container: ConfigContainer, baseRef: string, indent: string): string {
  const contRef = `${baseRef}/${container.name}`
  const lines: string[] = [
    `${indent}<ECUC-CONTAINER-VALUE UUID="${uuid()}">`,
    `${indent}  <SHORT-NAME>${xmlEncode(container.name)}</SHORT-NAME>`,
    `${indent}  <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">${xmlEncode(defRef(contRef))}</DEFINITION-REF>`,
  ]

  // Parameters
  if (container.parameters.length > 0) {
    lines.push(`${indent}  <PARAMETER-VALUES>`)
    for (const param of container.parameters) {
      lines.push(generateParamXml(param, `${indent}    `))
    }
    lines.push(`${indent}  </PARAMETER-VALUES>`)
  }

  // Sub-containers (static)
  if (container.subContainers && container.subContainers.length > 0 && !container.multiple) {
    lines.push(`${indent}  <SUB-CONTAINERS>`)
    for (const sub of container.subContainers) {
      lines.push(generateContainerXml(sub, contRef, `${indent}    `))
    }
    lines.push(`${indent}  </SUB-CONTAINERS>`)
  }

  // Dynamic instances - generate one per instance using the template
  // For the basic export without instance tracking, generate from subContainers
  if (container.multiple && container.subContainers && container.subContainers.length > 0) {
    // The template is subContainers[0]; instances are tracked separately
    // For now, export the template containers as they are in the data
    lines.push(`${indent}  <SUB-CONTAINERS>`)
    for (const sub of container.subContainers) {
      lines.push(generateContainerXml(sub, contRef, `${indent}    `))
    }
    lines.push(`${indent}  </SUB-CONTAINERS>`)
  }

  lines.push(`${indent}</ECUC-CONTAINER-VALUE>`)
  return lines.join('\n')
}

/**
 * Generate ARXML for a single module
 */
function generateModuleXml(module: ConfigModule): string {
  const lines: string[] = []
  const modRef = defRef(module.name)

  lines.push(`    <AR-PACKAGE>`)
  lines.push(`      <SHORT-NAME>${xmlEncode(module.name)}</SHORT-NAME>`)
  lines.push(`      <ELEMENTS>`)
  lines.push(`        <ECUC-MODULE-CONFIGURATION-VALUES>`)
  lines.push(`          <SHORT-NAME>${xmlEncode(module.name)}</SHORT-NAME>`)
  lines.push(`          <DEFINITION-REF DEST="ECUC-MODULE-DEF">${xmlEncode(modRef)}</DEFINITION-REF>`)
  lines.push(`          <IMPLEMENTATION-CONFIG-VARIANT>VARIANT-POST-BUILD</IMPLEMENTATION-CONFIG-VARIANT>`)

  // Module-level parameters
  if (module.parameters.length > 0) {
    lines.push(`          <PARAMETER-VALUES>`)
    for (const param of module.parameters) {
      lines.push(generateParamXml(param, `            `))
    }
    lines.push(`          </PARAMETER-VALUES>`)
  }

  // Containers
  if (module.containers.length > 0) {
    lines.push(`          <CONTAINERS>`)
    for (const container of module.containers) {
      const contXml = generateContainerXml(container, module.name, `            `)
      lines.push(contXml)
    }
    lines.push(`          </CONTAINERS>`)
  }

  lines.push(`        </ECUC-MODULE-CONFIGURATION-VALUES>`)
  lines.push(`      </ELEMENTS>`)
  lines.push(`    </AR-PACKAGE>`)
  
  return lines.join('\n')
}

/**
 * Main export function: generate complete ARXML document from config
 */
export function generateArxml(config: ConfigFile, selectedModules?: string[]): string {
  const modules = selectedModules
    ? config.modules.filter(m => m.enabled && selectedModules.includes(m.id))
    : config.modules.filter(m => m.enabled)

  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<AUTOSAR xmlns="${ARXML_NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${ARXML_SCHEMA}">`,
    `  <AR-PACKAGES>`,
  ]

  for (const module of modules) {
    lines.push(generateModuleXml(module))
  }

  lines.push(`  </AR-PACKAGES>`)
  lines.push(`</AUTOSAR>`)
  lines.push('')

  return lines.join('\n')
}

/**
 * Format XML with proper indentation (XML declaration and root element are already formatted)
 */
export function formatArxml(xml: string): string {
  return xml // Already formatted by the generator
}
