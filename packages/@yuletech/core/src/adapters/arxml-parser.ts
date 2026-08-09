/**
 * ARXML Parser for AUTOSAR ECUC configuration files
 *
 * Uses fast-xml-parser (Node.js & browser compatible) instead of DOMParser.
 * Parses .arxml files and extracts module/container/parameter definitions.
 * Compatible with AUTOSAR 4.0 - 4.4 schema.
 *
 * Key features:
 * - Handles default namespace (xmlns="http://autosar.org/schema/r4.0")
 * - Supports CONTAINERS / SUB-CONTAINERS / PARAMETER-VALUES hierarchy
 * - Restores parameter types from DEST attributes (BOOLEAN, INTEGER, FLOAT, ENUM, STRING)
 * - Recovers AUTOSAR 4.4 ContainerType hierarchy
 * - Round-trip safe: export → import → verify
 *
 * NOTE (Fix 18): 本文件由 apps/yuleasr-web/src/services/arxml-parser.ts (fast-xml-parser 版) 整体迁移而来，
 * core 为唯一领域出口。迁移时保持向后兼容导出名（parseArxml / validateArxml / convertArxmlToYuleasr），
 * 统一出口契约 ArxmlParseResult = { modules, errors, warnings }（warnings 可为空数组）。
 */

import { XMLParser } from 'fast-xml-parser';

import { ParseError } from '../arxml-errors';

export interface ParsedModuleDef {
  shortName: string;
  definitionRef: string;
  definitionDest?: string;
  implementationConfigVariant?: string;
  /** Module-level parameters (from module PARAMETER-VALUES) */
  parameters: ParsedParamValue[];
  containers: ParsedContainerValue[];
}

export interface ParsedContainerValue {
  shortName: string;
  definitionRef: string;
  definitionDest?: string;
  parameters: ParsedParamValue[];
  subContainers: ParsedContainerValue[];
}

export interface ParsedParamValue {
  shortName: string;
  definitionRef: string;
  definitionDest: string;
  value: string;
  type: 'numerical' | 'textual' | 'boolean' | 'integer' | 'float' | 'enum' | 'string';
}

export interface ArxmlParseResult {
  modules: ParsedModuleDef[];
  errors: string[];
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Parser factory
// ---------------------------------------------------------------------------

function createXmlParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    // Force these tags to always produce arrays, even when only one child exists
    isArray: (name: string) =>
      [
        'AR-PACKAGE',
        'ECUC-MODULE-CONFIGURATION-VALUES',
        'ECUC-CONTAINER-VALUE',
        'ECUC-NUMERICAL-PARAM-VALUE',
        'ECUC-TEXTUAL-PARAM-VALUE',
        'ECUC-BOOLEAN-PARAM-VALUE',
        'ECUC-INTEGER-PARAM-VALUE',
        'ECUC-FLOAT-PARAM-VALUE',
        'ECUC-ENUMERATION-PARAM-VALUE',
        'ECUC-STRING-PARAM-VALUE',
        // ARXML element wrappers that may have >1 child
        'ECUC-CHOICE-CONTAINER-VALUE',
      ].includes(name),
  });
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Parse ARXML content string and extract ECUC module configurations
 */
export function parseArxmlContent(xmlContent: string): ArxmlParseResult {
  const result: ArxmlParseResult = { modules: [], errors: [], warnings: [] };

  try {
    const parser = createXmlParser();
    const parsed = parser.parse(xmlContent);

    // Extract AUTOSAR root
    const autosar = parsed.AUTOSAR;
    if (!autosar) {
      result.errors.push('Missing AUTOSAR root element');
      return result;
    }

    // Navigate: AUTOSAR → AR-PACKAGES → AR-PACKAGE[]
    const arPackages = ensureArray(autosar['AR-PACKAGES']?.['AR-PACKAGE']);

    for (const pkg of arPackages) {
      const elements = pkg.ELEMENTS;
      if (!elements) continue;

      const moduleNodes = ensureArray(elements['ECUC-MODULE-CONFIGURATION-VALUES']);

      for (const modNode of moduleNodes) {
        const modDef = parseModuleConfig(modNode);
        if (modDef) {
          result.modules.push(modDef);
        }
      }
    }

    if (result.modules.length === 0) {
      result.warnings.push('No ECUC module configurations found in the ARXML');
    }
  } catch (err) {
    result.errors.push(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Backward-compatible aliases (pre-Fix 18 DOMParser API names)
// ---------------------------------------------------------------------------

/**
 * Legacy alias of {@link parseArxmlContent}.
 *
 * Fix 18 迁移前 core 的 DOMParser 版导出名为 `parseArxml`，此处保持同名向后兼容，
 * 行为与 parseArxmlContent 完全一致（契约统一为 { modules, errors, warnings }）。
 */
export function parseArxml(content: string): ArxmlParseResult {
  return parseArxmlContent(content);
}

/**
 * Validate ARXML format (reimplemented on fast-xml-parser, Fix 18).
 * 向后兼容导出：yuleasr-adapter.validateArxmlConfig 依赖此函数。
 */
export function validateArxml(content: string): { valid: boolean; errors: string[] } {
  const result = parseArxmlContent(content);

  // fast-xml-parser 对畸形 XML 会抛错并进入 result.errors
  const errors: string[] = [...result.errors];

  // Check for AUTOSAR root
  let hasAutosarRoot = false;
  try {
    const parser = createXmlParser();
    const parsed = parser.parse(content);
    hasAutosarRoot = Boolean(parsed.AUTOSAR);
  } catch {
    hasAutosarRoot = false;
  }
  if (!hasAutosarRoot) {
    errors.push('Missing AUTOSAR root element');
  }

  // Check for ECUC modules
  if (result.modules.length === 0) {
    errors.push('No ECUC module configurations found');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Convert ARXML to yuleASR bsw config format (backward-compat, Fix 18).
 */
export function convertArxmlToYuleasr(content: string): Record<string, unknown> {
  const result = parseArxml(content);

  if (result.errors.length > 0) {
    throw new ParseError(`ARXML parse failed: ${result.errors.join(', ')}`);
  }

  const bswConfig: Record<string, unknown> = {
    schema_version: '1.0',
    target_platform: 'imx8mm',
    modules: {} as Record<string, unknown>,
  };

  result.modules.forEach(module => {
    (bswConfig.modules as Record<string, unknown>)[module.shortName] = {
      version: extractVersion(module.definitionRef) || '4.4.0',
      parameters: flattenParamsToRecord(module),
    };
  });

  return bswConfig;
}

/**
 * Extract version from module definition reference (e.g. "/Ep/4.4.0/Mcu" → "4.4.0").
 */
function extractVersion(defRef: string): string | null {
  const match = defRef.match(/\/Ep\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Flatten module-level + container-level (递归) parameters into a plain Record,
 * coercing values to JS types (true/false/number/string) — 保持旧 DOMParser 版语义。
 */
function flattenParamsToRecord(mod: ParsedModuleDef): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  const collect = (params: ParsedParamValue[]): void => {
    for (const p of params) {
      const key = p.shortName || p.definitionRef.split('/').pop() || p.definitionRef;
      let value: unknown = p.value;
      if (p.value === 'true') value = true;
      else if (p.value === 'false') value = false;
      else if (p.value !== '' && !isNaN(Number(p.value))) value = Number(p.value);
      record[key] = value;
    }
  };
  collect(mod.parameters);
  const walk = (containers: ParsedContainerValue[]): void => {
    for (const c of containers) {
      collect(c.parameters);
      walk(c.subContainers);
    }
  };
  walk(mod.containers);
  return record;
}

// ---------------------------------------------------------------------------
// Module parser
// ---------------------------------------------------------------------------

function parseModuleConfig(node: any): ParsedModuleDef | null {
  const shortName = getTextContent(node, 'SHORT-NAME');
  if (!shortName) return null;

  const defRefNode = getChild(node, 'DEFINITION-REF');
  const definitionRef = defRefNode ? getNodeText(defRefNode) || '' : '';
  const definitionDest = defRefNode ? getAttribute(defRefNode, 'DEST') : undefined;
  const implVar = getTextContent(node, 'IMPLEMENTATION-CONFIG-VARIANT');

  // Extract module-level parameters and containers
  const parameters = parseParameterValues(node);
  const containers = parseContainersFromWrapper(node, 'CONTAINERS');

  return {
    shortName,
    definitionRef,
    definitionDest,
    implementationConfigVariant: implVar || undefined,
    parameters,
    containers,
  };
}

// ---------------------------------------------------------------------------
// Container parser
// ---------------------------------------------------------------------------

/**
 * Parse ECUC-CONTAINER-VALUE elements from a wrapper node like CONTAINERS or SUB-CONTAINERS.
 */
function parseContainersFromWrapper(parent: any, wrapperKey: string): ParsedContainerValue[] {
  const wrapper = getChild(parent, wrapperKey);
  if (!wrapper) return [];

  const containerNodes = ensureArray(getChild(wrapper, 'ECUC-CONTAINER-VALUE'));

  const results: ParsedContainerValue[] = [];
  for (const node of containerNodes) {
    const parsed = parseSingleContainer(node);
    if (parsed) results.push(parsed);
  }
  return results;
}

/**
 * Parse one ECUC-CONTAINER-VALUE element.
 */
function parseSingleContainer(node: any): ParsedContainerValue | null {
  const shortName = getTextContent(node, 'SHORT-NAME');
  if (!shortName) return null;

  const defRefNode = getChild(node, 'DEFINITION-REF');
  const definitionRef = defRefNode ? getNodeText(defRefNode) || '' : '';
  const definitionDest = defRefNode ? getAttribute(defRefNode, 'DEST') : undefined;

  const parameters = parseParameterValues(node);
  const subContainers = parseContainersFromWrapper(node, 'SUB-CONTAINERS');

  return {
    shortName,
    definitionRef,
    definitionDest,
    parameters,
    subContainers,
  };
}

// ---------------------------------------------------------------------------
// Parameter parser
// ---------------------------------------------------------------------------

/**
 * Extract parameter values from PARAMETER-VALUES section of a parent element.
 */
function parseParameterValues(parent: any): ParsedParamValue[] {
  const wrapper = getChild(parent, 'PARAMETER-VALUES');
  if (!wrapper) return [];

  const results: ParsedParamValue[] = [];

  // Collect all parameter value child tags
  const paramTagNames = [
    'ECUC-NUMERICAL-PARAM-VALUE',
    'ECUC-TEXTUAL-PARAM-VALUE',
    'ECUC-BOOLEAN-PARAM-VALUE',
    'ECUC-INTEGER-PARAM-VALUE',
    'ECUC-FLOAT-PARAM-VALUE',
    'ECUC-ENUMERATION-PARAM-VALUE',
    'ECUC-STRING-PARAM-VALUE',
  ];

  for (const tagName of paramTagNames) {
    const nodes = ensureArray(getChild(wrapper, tagName));
    for (const node of nodes) {
      const parsed = parseParamValue(node, inferDefaultType(tagName));
      if (parsed) results.push(parsed);
    }
  }

  return results;
}

/**
 * Map ARXML element tag to a default type classification.
 */
function inferDefaultType(tagName: string): ParsedParamValue['type'] {
  switch (tagName) {
    case 'ECUC-NUMERICAL-PARAM-VALUE':
      return 'numerical';
    case 'ECUC-TEXTUAL-PARAM-VALUE':
      return 'textual';
    case 'ECUC-BOOLEAN-PARAM-VALUE':
      return 'boolean';
    case 'ECUC-INTEGER-PARAM-VALUE':
      return 'integer';
    case 'ECUC-FLOAT-PARAM-VALUE':
      return 'float';
    case 'ECUC-ENUMERATION-PARAM-VALUE':
      return 'enum';
    case 'ECUC-STRING-PARAM-VALUE':
      return 'string';
    default:
      return 'textual';
  }
}

/**
 * Parse a single parameter value element with its DEFINITION-REF and VALUE.
 */
function parseParamValue(
  node: any,
  defaultType: ParsedParamValue['type']
): ParsedParamValue | null {
  const defRefNode = getChild(node, 'DEFINITION-REF');
  if (!defRefNode) return null;

  const definitionRef = getNodeText(defRefNode) || '';
  const definitionDest = getAttribute(defRefNode, 'DEST') || '';

  const rawValue = getChild(node, 'VALUE');
  const value = rawValue !== undefined ? String(rawValue) : '';

  // Extract parameter name from the last path segment of DEFINITION-REF
  const shortName = definitionRef.split('/').pop() || definitionRef;

  // Refine type based on DEST attribute
  let type = defaultType;
  if (definitionDest.includes('BOOLEAN')) type = 'boolean';
  else if (definitionDest.includes('INTEGER')) type = 'integer';
  else if (definitionDest.includes('REAL') || definitionDest.includes('FLOAT')) type = 'float';
  else if (definitionDest.includes('ENUMERATION')) type = 'enum';
  else if (definitionDest.includes('STRING')) type = 'string';

  return { shortName, definitionRef, definitionDest, value, type };
}

// ---------------------------------------------------------------------------
// XML Helper functions (for fast-xml-parser output)
// ---------------------------------------------------------------------------

/**
 * Get a child element from a parsed fast-xml-parser object.
 *
 * fast-xml-parser produces:
 * - `{ tagName: { ... } }` for single children
 * - `{ tagName: [ { ... }, ... ] }` for multiple children (when isArray matches)
 * - `{ tagName: { '#text': 'value', '@_attr': 'v' } }` for elements with attributes
 * - `{ tagName: 'value' }` for simple text elements
 * - `undefined` when missing
 */
function getChild(parent: any, name: string): unknown {
  if (!parent || typeof parent !== 'object') return undefined;
  return parent[name];
}

/**
 * Get the text content of an element, handling both simple and attribute-bearing nodes.
 *
 * Returns undefined if the element is missing or has no text content.
 */
function getTextContent(parent: any, tagName: string): string | undefined {
  const child = getChild(parent, tagName);
  return getNodeText(child);
}

/**
 * Extract text value from a parsed node that may be:
 * - A string: `"value"`
 * - An object with #text: `{ "#text": "value", ... }`
 * - A number/boolean: `123` or `true`
 * - undefined: missing
 */
function getNodeText(node: unknown): string | undefined {
  if (node === undefined || node === null) return undefined;

  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return node ? 'true' : 'false';

  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if ('#text' in obj) {
      const text = obj['#text'];
      if (text === undefined || text === null) return undefined;
      return String(text);
    }
  }

  return undefined;
}

/**
 * Get an attribute value from a parsed node that has attributes.
 * fast-xml-parser stores attributes as `@_ATTRNAME`.
 */
function getAttribute(node: unknown, attrName: string): string | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const obj = node as Record<string, unknown>;
  const val = obj[`@_${attrName}`];
  if (val === undefined || val === null) return undefined;
  return String(val);
}

/**
 * Ensure a value is always an array, wrapping singletons.
 */
function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
