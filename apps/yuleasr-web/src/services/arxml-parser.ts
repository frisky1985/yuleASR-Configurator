/**
 * ARXML Parser for AUTOSAR ECUC configuration files
 * 
 * Parses .arxml files and extracts module/container/parameter definitions
 * Compatible with AUTOSAR 4.0 - 4.4 schema
 */

const ARXML_NS = 'http://autosar.org/schema/r4.0'

export interface ParsedModuleDef {
  shortName: string
  definitionRef: string
  containers: ParsedContainerValue[]
}

export interface ParsedContainerValue {
  shortName: string
  definitionRef: string
  definitionDest?: string
  parameters: ParsedParamValue[]
  subContainers: ParsedContainerValue[]
}

export interface ParsedParamValue {
  shortName: string
  definitionRef: string
  definitionDest?: string
  value: string
  type: 'numerical' | 'textual' | 'boolean' | 'integer' | 'float' | 'enum' | 'string'
}

export interface ArxmlParseResult {
  modules: ParsedModuleDef[]
  errors: string[]
  warnings: string[]
}

/**
 * Parse ARXML content string and extract ECUC module configurations
 */
export function parseArxmlContent(xmlContent: string): ArxmlParseResult {
  const result: ArxmlParseResult = { modules: [], errors: [], warnings: [] }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlContent, 'application/xml')
    
    // Check for parse errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      result.errors.push(`XML parse error: ${parseError.textContent}`)
      return result
    }

    // Query all ECUC-MODULE-CONFIGURATION-VALUES elements
    const ns = `[namespace-uri()='${ARXML_NS}']`
    const xpath = `.//*[local-name()='ECUC-MODULE-CONFIGURATION-VALUES'${ns}]`
    const moduleNodes = evaluateXPath(doc, xpath) as Element[]

    for (const moduleNode of moduleNodes) {
      const modDef = parseModuleConfig(moduleNode)
      if (modDef) {
        result.modules.push(modDef)
      }
    }

    if (result.modules.length === 0) {
      result.warnings.push('No ECUC module configurations found in the ARXML')
    }

  } catch (err) {
    result.errors.push(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
  }

  return result
}

/**
 * Parse a single ECUC-MODULE-CONFIGURATION-VALUES element
 */
function parseModuleConfig(moduleEl: Element): ParsedModuleDef | null {
  const shortName = getChildText(moduleEl, 'SHORT-NAME')
  if (!shortName) return null

  const definitionRef = getChildDefRef(moduleEl) || ''
  const containers = parseContainerList(moduleEl)

  return { shortName, definitionRef, containers }
}

/**
 * Parse ECUC-CONTAINER-VALUE list from parent element's CONTAINERS or SUB-CONTAINERS
 */
function parseContainerList(parentEl: Element): ParsedContainerValue[] {
  // Try CONTAINERS first, then SUB-CONTAINERS
  const containersSection = 
    findChild(parentEl, 'CONTAINERS') || 
    findChild(parentEl, 'SUB-CONTAINERS')
  
  if (!containersSection) return []

  const results: ParsedContainerValue[] = []
  const containerNodes = findChildren(containersSection, 'ECUC-CONTAINER-VALUE')

  for (const node of containerNodes) {
    const parsed = parseSingleContainer(node)
    if (parsed) results.push(parsed)
  }

  return results
}

/**
 * Parse one ECUC-CONTAINER-VALUE element
 */
function parseSingleContainer(containerEl: Element): ParsedContainerValue | null {
  const shortName = getChildText(containerEl, 'SHORT-NAME')
  if (!shortName) return null

  const defRefEl = findChild(containerEl, 'DEFINITION-REF')
  const definitionRef = defRefEl ? defRefEl.textContent?.trim() || '' : ''
  const definitionDest = defRefEl?.getAttribute('DEST') || undefined

  const parameters = parseParameterValues(containerEl)
  const subContainers = parseContainerList(containerEl)

  return {
    shortName,
    definitionRef,
    definitionDest,
    parameters,
    subContainers,
  }
}

/**
 * Extract parameter values from PARAMETER-VALUES section
 */
function parseParameterValues(containerEl: Element): ParsedParamValue[] {
  const paramsSection = findChild(containerEl, 'PARAMETER-VALUES')
  if (!paramsSection) return []

  const results: ParsedParamValue[] = []

  // Numerical params (covers boolean, integer, float)
  const numericalNodes = findChildren(paramsSection, 'ECUC-NUMERICAL-PARAM-VALUE')
  for (const node of numericalNodes) {
    const parsed = parseParamValue(node, 'numerical')
    if (parsed) results.push(parsed)
  }

  // Textual params (covers string, enumeration)
  const textualNodes = findChildren(paramsSection, 'ECUC-TEXTUAL-PARAM-VALUE')
  for (const node of textualNodes) {
    const parsed = parseParamValue(node, 'textual')
    if (parsed) results.push(parsed)
  }

  return results
}

/**
 * Parse a single parameter value, extracting name from DEFINITION-REF
 */
function parseParamValue(paramEl: Element, defaultType: ParsedParamValue['type']): ParsedParamValue | null {
  const defRefEl = findChild(paramEl, 'DEFINITION-REF')
  if (!defRefEl) return null

  const definitionRef = defRefEl.textContent?.trim() || ''
  const definitionDest = defRefEl.getAttribute('DEST') || ''
  const value = getChildText(paramEl, 'VALUE') || ''

  // Extract short name from definition ref path (last segment)
  const shortName = definitionRef.split('/').pop() || definitionRef

  // Determine refined type from DEST attribute
  let type = defaultType
  if (definitionDest.includes('BOOLEAN')) type = 'boolean'
  else if (definitionDest.includes('INTEGER')) type = 'integer'
  else if (definitionDest.includes('REAL') || definitionDest.includes('FLOAT')) type = 'float'
  else if (definitionDest.includes('ENUMERATION')) type = 'enum'
  else if (definitionDest.includes('STRING')) type = 'string'

  return { shortName, definitionRef, definitionDest, value, type }
}

// ---------- XML Helper Functions ----------

function evaluateXPath(doc: Document, xpath: string): Node[] {
  const results: Node[] = []
  try {
    const xpathResult = doc.evaluate(
      xpath, doc, null as any,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    )
    let node = xpathResult.iterateNext()
    while (node) {
      results.push(node)
      node = xpathResult.iterateNext()
    }
  } catch {
    // Fallback: use querySelectorAll with namespace workaround
    const all = doc.querySelectorAll('*')
    for (const el of all) {
      if (el.localName === 'ECUC-MODULE-CONFIGURATION-VALUES' && 
          el.namespaceURI === ARXML_NS) {
        results.push(el)
      }
    }
  }
  return results
}

function findChild(parent: Element, localName: string): Element | null {
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i] as Element
    if (child.localName === localName || child.tagName === localName) {
      return child
    }
  }
  return null
}

function findChildren(parent: Element, localName: string): Element[] {
  const results: Element[] = []
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i] as Element
    if (child.localName === localName || child.tagName === localName) {
      results.push(child)
    }
  }
  return results
}

function getChildText(parent: Element, localName: string): string | null {
  const child = findChild(parent, localName)
  return child?.textContent?.trim() || null
}

function getChildDefRef(parent: Element): string | null {
  const child = findChild(parent, 'DEFINITION-REF')
  return child?.textContent?.trim() || null
}

// ---------- Export to ConfigModule format (Subtask 3) ----------

import type { ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config'

const PARAM_LAYER_MAP: Record<string, string> = {
  'Adc': 'MCAL', 'Port': 'MCAL', 'Mcu': 'MCAL', 'Dio': 'MCAL',
  'Icu': 'MCAL', 'Gpt': 'MCAL', 'Spi': 'MCAL', 'Mcl': 'MCAL',
  'Can': 'ECUAL', 'CanTrcv': 'ECUAL', 'Ble': 'ECUAL',
  'Dcm': 'Service', 'Com': 'Service', 'NvM': 'Service',
  'EcuM': 'Service', 'Os': 'OS',
}

export function arxmlToConfigModules(parsed: ParsedModuleDef[]): ConfigModule[] {
  return parsed.map(mod => {
    const layer = guessLayer(mod.shortName)
    const containers = parsedContainersToConfig(mod.containers)
    
    return {
      id: mod.shortName.toLowerCase(),
      name: mod.shortName,
      displayName: mod.shortName,
      description: `Imported from ARXML: ${mod.definitionRef}`,
      vendor: 'NXP',
      version: '4.4.0',
      autosarVersion: '4.4.0',
      layer,
      enabled: false,
      parameters: [],
      containers,
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configStatus: 'unconfigured',
    }
  })
}

function guessLayer(shortName: string): 'MCAL' | 'ECUAL' | 'Service' | 'OS' {
  return (PARAM_LAYER_MAP[shortName] as any) || 'Service'
}

function parsedContainersToConfig(
  containers: ParsedContainerValue[], 
  multiple = false
): ConfigContainer[] {
  return containers.map(c => {
    const params: ConfigParameter[] = c.parameters.map(p => {
      let paramType: ConfigParameter['type'] = 'string'
      if (p.type === 'boolean' || p.type === 'numerical') paramType = 'boolean' as const
      else if (p.type === 'integer') paramType = 'integer' as const
      else if (p.type === 'float') paramType = 'float' as const
      else if (p.type === 'enum') paramType = 'enum' as const

      let value: any = p.value
      if (paramType === 'boolean') value = p.value === 'true'
      else if (paramType === 'integer') value = parseInt(p.value) || 0
      else if (paramType === 'float') value = parseFloat(p.value) || 0

      return {
        id: p.shortName.toLowerCase(),
        name: p.shortName,
        displayName: p.shortName,
        type: paramType,
        value,
        defaultValue: value,
      }
    })

    // Determine if this container is a dynamic instance template
    const isMulti = c.definitionRef.endsWith('/' + c.shortName) === false
    const subs = parsedContainersToConfig(c.subContainers)

    const container: ConfigContainer = {
      id: c.shortName.toLowerCase(),
      name: c.shortName,
      displayName: c.shortName,
      description: `DEF: ${c.definitionRef}`,
      parameters: params,
    }

    if (isMulti && subs.length > 0) {
      container.multiple = true
      container.minInstances = 0
      container.subContainers = subs
    } else if (subs.length > 0) {
      container.subContainers = subs
    }

    return container
  })
}
