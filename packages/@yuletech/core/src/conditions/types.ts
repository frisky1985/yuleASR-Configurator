/**
 * @yuletech/core - Condition Expression AST Types
 * AST node types for the visibleWhen / enabledWhen expression DSL.
 *
 * Expression grammar:
 *   expr      → or_expr
 *   or_expr   → and_expr ( '||' and_expr )*
 *   and_expr  → not_expr ( '&&' not_expr )*
 *   not_expr  → '!' not_expr | compare_expr
 *   compare   → unary ( '==' | '!=' | '<' | '>' | '<=' | '>=' ) unary
 *   unary     → '-' unary | primary
 *   primary   → NUMBER | STRING | BOOLEAN | 'null' | path | '(' expr ')'
 *   path      → IDENT ( '.' IDENT )* ( '[' NUMBER ']' )?
 */

/** A parsed condition expression tree */
export type ConditionExpr =
  | BinaryOpExpr
  | UnaryOpExpr
  | CompareOpExpr
  | PathExpr
  | LiteralExpr
  | GroupExpr;

export interface BinaryOpExpr {
  type: 'binary_op';
  operator: '&&' | '||';
  left: ConditionExpr;
  right: ConditionExpr;
}

export interface UnaryOpExpr {
  type: 'unary_op';
  operator: '!' | '-';
  operand: ConditionExpr;
}

export interface CompareOpExpr {
  type: 'compare';
  operator: '==' | '!=' | '<' | '>' | '<=' | '>=';
  left: ConditionExpr;
  right: ConditionExpr;
}

export interface PathExpr {
  type: 'path';
  /** e.g. ['Can', 'baudrate'] */
  segments: string[];
  /** Optional array index, e.g. containers[0] → index=0 */
  index?: number;
}

export interface LiteralExpr {
  type: 'literal';
  value: string | number | boolean | null;
}

export interface GroupExpr {
  type: 'group';
  expression: ConditionExpr;
}

/** Result of evaluating a condition against a set of module configs */
export interface ConditionEvalContext {
  /** module name → { param name → value } */
  getParam(module: string, param: string): unknown;
  /** module name → container name → instance[] → instance param value */
  getContainerParam(module: string, container: string, index: number, param: string): unknown;
}
