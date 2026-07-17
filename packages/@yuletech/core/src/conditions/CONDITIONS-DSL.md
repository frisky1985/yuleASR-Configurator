# Condition DSL — BNF Grammar

> **@yuletech/core** — `visibleWhen` / `enabledWhen` expression language.
>
> Based on source files: `types.ts`, `parser.ts`, `evaluator.ts`.

---

## Overview

The Condition DSL is a small, embeddable expression language used to describe
when a module configuration parameter should be **visible** or **editable**. It
supports:

- **Boolean logic** — `&&` (and), `||` (or), `!` (not)
- **Comparisons** — `==`, `!=`, `<`, `>`, `<=`, `>=`
- **Path references** — `module.param`, `module.container[idx].param`
- **Literals** — numbers, strings (single/double quoted), booleans (`true`,
  `false`), `null`
- **Unary minus** — `-expr` for numeric negation
- **Grouping** — parentheses for explicit precedence

Fails closed: unresolvable paths evaluate to `false`, making the field
invisible/disabled.

---

## BNF Grammar

```bnf
(* Top-level expression *)
expr                ::= or_expr

(* Logical OR — left-associative *)
or_expr             ::= and_expr ('||' and_expr)*

(* Logical AND — left-associative *)
and_expr            ::= not_expr ('&&' not_expr)*

(* Logical NOT / unary negation *)
not_expr            ::= '!' not_expr
                      | compare_expr

(* Comparison operators *)
compare_expr        ::= unary_expr (compare_op unary_expr)?
compare_op          ::= '==' | '!=' | '<' | '>' | '<=' | '>='

(* Unary minus *)
unary_expr          ::= '-' unary_expr
                      | primary_expr

(* Atomic expressions *)
primary_expr        ::= NUMBER
                      | STRING
                      | BOOLEAN
                      | 'null'
                      | path
                      | '(' expr ')'

(* Path reference *)
path                ::= IDENT ('.' IDENT ('[' NUMBER ']')?)*
```

---

## Lexical Tokens

| Token      | Pattern / Value          | Example           |
| ---------- | ------------------------ | ----------------- |
| `NUMBER`   | `[0-9]+(\.[0-9]+)?`      | `42`, `3.14`      |
| `STRING`   | `'[^']*'` or `"[^"]*"`   | `'hello'`, `"a"`  |
| `BOOLEAN`  | `true` \| `false`        | `true`            |
| `NULL`     | `null`                   | `null`            |
| `IDENT`    | `[a-zA-Z_][a-zA-Z0-9_]*` | `Can`, `baudrate` |
| `DOT`      | `.`                      | `.`               |
| `LBRACKET` | `[`                      | `[`               |
| `RBRACKET` | `]`                      | `]`               |
| `LPAREN`   | `(`                      | `(`               |
| `RPAREN`   | `)`                      | `)`               |
| `EQ`       | `==`                     | `==`              |
| `NEQ`      | `!=`                     | `!=`              |
| `LT`       | `<`                      | `<`               |
| `GT`       | `>`                      | `>`               |
| `LTE`      | `<=`                     | `<=`              |
| `GTE`      | `>=`                     | `>=`              |
| `AND`      | `&&`                     | `&&`              |
| `OR`       | `\|\|`                   | `\|\|`            |
| `NOT`      | `!`                      | `!`               |
| `MINUS`    | `-`                      | `-`               |

Whitespace is ignored between tokens.

---

## Precedence (highest → lowest)

| Level | Operators                   | Associativity | Notes                          |
| ----- | --------------------------- | ------------- | ------------------------------ | ---- | ---------- |
| 1     | `primary` / `path`          | —             | literals, paths, parenthesised |
| 2     | `!` `-` (unary)             | right         |                                |
| 3     | `==` `!=` `<` `>` `<=` `>=` | left          | comparisons                    |
| 4     | `&&`                        | left          | logical AND                    |
| 5     | `                           |               | `                              | left | logical OR |

---

## AST Node Types (from `types.ts`)

```typescript
type ConditionExpr =
  | BinaryOpExpr // { type: 'binary_op', operator: '&&'|'||', left, right }
  | UnaryOpExpr // { type: 'unary_op', operator: '!'|'-', operand }
  | CompareOpExpr // { type: 'compare', operator: '==',|'!='|'<'..., left, right }
  | PathExpr // { type: 'path', segments: string[], index?: number }
  | LiteralExpr // { type: 'literal', value: string|number|boolean|null }
  | GroupExpr; // { type: 'group', expression: ConditionExpr }
```

---

## Examples

```text
Can.baudrate == 500
Can.enabled && Can.baudrate >= 250
!Can.enabled || Can.type == 'CAN FD'
Motor.containers[0].enabled && Motor.containers[0].current_limit <= 50
(Can.baudrate >= 100 && Can.baudrate <= 1000) || Can.type == 'auto'
-null
```
