/**
 * @yuletech/core - Constraint Propagation Types
 * Types for the constraint propagation system that propagates value
 * changes across module parameters.
 */

/** Constraint propagation rule */
export interface PropagationRule {
  /** Source module */
  module: string;
  /** Source parameter (when this changes...) */
  param: string;
  /** Optional container path for source (e.g. 'AdcConfigSet[0].AdcHwUnit_0') */
  container?: string;
  /** Target specification */
  targets: PropagationTarget[];
}

export interface PropagationTarget {
  /** Target module */
  module: string;
  /** Target parameter (this gets updated) */
  param: string;
  /** What field on ModuleParameter to update */
  field: 'min' | 'max' | 'default' | 'options';
  /** Expression to compute the new value using the source value.
   *  Use '{source}' as placeholder for the source param value.
   *  e.g. '{source} * 2', '{source}', '{source} > 100 ? 500 : 1000' */
  expression: string;
  /** Description for logging */
  description?: string;
}

/** Result of applying propagation for a single change */
export interface PropagationResult {
  source: string; // module.param
  target: string; // module.param
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
