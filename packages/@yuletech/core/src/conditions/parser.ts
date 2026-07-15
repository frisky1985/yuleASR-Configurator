/**
 * @yuletech/core - Condition Expression Parser
 * Recursive descent parser for visibleWhen / enabledWhen expressions.
 *
 * Grammar:
 *   expr      → or_expr
 *   or_expr   → and_expr ( '||' and_expr )*
 *   and_expr  → not_expr ( '&&' not_expr )*
 *   not_expr  → '!' not_expr | compare_expr
 *   compare   → unary ( '==' | '!=' | '<' | '>' | '<=' | '>=' ) unary
 *   unary     → '-' unary | primary
 *   primary   → NUMBER | STRING | BOOLEAN | 'null' | path | '(' expr ')'
 *   path      → IDENT ( '.' IDENT )* ( '[' NUMBER ']' )?
 */

import type {
  ConditionExpr,
  BinaryOpExpr,
  UnaryOpExpr,
  CompareOpExpr,
  PathExpr,
  LiteralExpr,
  GroupExpr,
} from './types';

/** Token types for the lexer */
type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'NULL'
  | 'IDENT'
  | 'DOT'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'LPAREN'
  | 'RPAREN'
  | 'EQ'
  | 'NEQ'
  | 'LT'
  | 'GT'
  | 'LTE'
  | 'GTE'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'MINUS'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

/**
 * Parse a condition expression string into an AST.
 * Throws on syntax errors with position info.
 */
export function parseCondition(input: string): ConditionExpr {
  const tokens = lex(input);
  const parser = new Parser(tokens);
  const result = parser.parseExpr();
  if (parser.current().type !== 'EOF') {
    throw new SyntaxError(
      `Unexpected token '${parser.current().value}' at position ${parser.current().pos}`
    );
  }
  return result;
}

/**
 * Tokenize the input string into an array of tokens.
 */
function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const skipWhitespace = () => {
    while (i < input.length && /\s/.test(input[i])) i++;
  };

  while (i < input.length) {
    skipWhitespace();
    if (i >= input.length) break;

    const start = i;

    // Strings (single or double quotes)
    if (input[i] === "'" || input[i] === '"') {
      const quote = input[i];
      i++;
      while (i < input.length && input[i] !== quote) {
        // Handle escape sequences
        if (input[i] === '\\') i++;
        i++;
      }
      if (i >= input.length) {
        throw new SyntaxError(`Unterminated string at position ${start}`);
      }
      i++; // closing quote
      tokens.push({
        type: 'STRING',
        value: input.slice(start + 1, i - 1).replace(/\\(.)/g, '$1'),
        pos: start,
      });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(input[i])) {
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) i++;
      const word = input.slice(start, i);
      if (word === 'true' || word === 'false') {
        tokens.push({ type: 'BOOLEAN', value: word, pos: start });
      } else if (word === 'null') {
        tokens.push({ type: 'NULL', value: word, pos: start });
      } else {
        tokens.push({ type: 'IDENT', value: word, pos: start });
      }
      continue;
    }

    // Numbers
    if (/[0-9]/.test(input[i])) {
      while (i < input.length && /[0-9.]/.test(input[i])) i++;
      tokens.push({ type: 'NUMBER', value: input.slice(start, i), pos: start });
      continue;
    }

    // Multi-character operators
    const twoChar = input.slice(i, i + 2);
    if (twoChar === '==') { tokens.push({ type: 'EQ', value: '==', pos: start }); i += 2; continue; }
    if (twoChar === '!=') { tokens.push({ type: 'NEQ', value: '!=', pos: start }); i += 2; continue; }
    if (twoChar === '<=') { tokens.push({ type: 'LTE', value: '<=', pos: start }); i += 2; continue; }
    if (twoChar === '>=') { tokens.push({ type: 'GTE', value: '>=', pos: start }); i += 2; continue; }
    if (twoChar === '&&') { tokens.push({ type: 'AND', value: '&&', pos: start }); i += 2; continue; }
    if (twoChar === '||') { tokens.push({ type: 'OR', value: '||', pos: start }); i += 2; continue; }

    // Single-character operators
    if (input[i] === '!') { tokens.push({ type: 'NOT', value: '!', pos: start }); i++; continue; }
    if (input[i] === '<') { tokens.push({ type: 'LT', value: '<', pos: start }); i++; continue; }
    if (input[i] === '>') { tokens.push({ type: 'GT', value: '>', pos: start }); i++; continue; }
    if (input[i] === '-') { tokens.push({ type: 'MINUS', value: '-', pos: start }); i++; continue; }
    if (input[i] === '.') { tokens.push({ type: 'DOT', value: '.', pos: start }); i++; continue; }
    if (input[i] === '[') { tokens.push({ type: 'LBRACKET', value: '[', pos: start }); i++; continue; }
    if (input[i] === ']') { tokens.push({ type: 'RBRACKET', value: ']', pos: start }); i++; continue; }
    if (input[i] === '(') { tokens.push({ type: 'LPAREN', value: '(', pos: start }); i++; continue; }
    if (input[i] === ')') { tokens.push({ type: 'RPAREN', value: ')', pos: start }); i++; continue; }

    throw new SyntaxError(`Unexpected character '${input[i]}' at position ${start}`);
  }

  tokens.push({ type: 'EOF', value: '', pos: input.length });
  return tokens;
}

class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  current(): Token {
    return this.tokens[this.pos];
  }

  advance(): Token {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  expect(type: TokenType): Token {
    const token = this.current();
    if (token.type !== type) {
      throw new SyntaxError(
        `Expected ${type} but got '${token.value}' at position ${token.pos}`
      );
    }
    return this.advance();
  }

  /** expr → or_expr */
  parseExpr(): ConditionExpr {
    return this.parseOr();
  }

  /** or_expr → and_expr ( '||' and_expr )* */
  private parseOr(): ConditionExpr {
    let left = this.parseAnd();
    while (this.current().type === 'OR') {
      this.advance();
      const right = this.parseAnd();
      const node: BinaryOpExpr = { type: 'binary_op', operator: '||', left, right };
      left = node;
    }
    return left;
  }

  /** and_expr → not_expr ( '&&' not_expr )* */
  private parseAnd(): ConditionExpr {
    let left = this.parseNot();
    while (this.current().type === 'AND') {
      this.advance();
      const right = this.parseNot();
      const node: BinaryOpExpr = { type: 'binary_op', operator: '&&', left, right };
      left = node;
    }
    return left;
  }

  /** not_expr → '!' not_expr | compare_expr */
  private parseNot(): ConditionExpr {
    if (this.current().type === 'NOT') {
      this.advance();
      const operand = this.parseNot();
      const node: UnaryOpExpr = { type: 'unary_op', operator: '!', operand };
      return node;
    }
    return this.parseCompare();
  }

  /** compare → unary ( '==' | '!=' | '<' | '>' | '<=' | '>=' ) unary */
  private parseCompare(): ConditionExpr {
    let left = this.parseUnary();

    const cmpOps: TokenType[] = ['EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE'];
    if (cmpOps.includes(this.current().type)) {
      const opToken = this.advance();
      const opMap: Record<string, CompareOpExpr['operator']> = {
        '==': '==', '!=': '!=', '<': '<', '>': '>', '<=': '<=', '>=': '>=',
      };
      const right = this.parseUnary();
      const node: CompareOpExpr = {
        type: 'compare',
        operator: opMap[opToken.value],
        left,
        right,
      };
      return node;
    }

    return left;
  }

  /** unary → '-' unary | primary */
  private parseUnary(): ConditionExpr {
    if (this.current().type === 'MINUS') {
      this.advance();
      const operand = this.parseUnary();
      const node: UnaryOpExpr = { type: 'unary_op', operator: '-', operand };
      return node;
    }
    return this.parsePrimary();
  }

  /** primary → NUMBER | STRING | BOOLEAN | 'null' | path | '(' expr ')' */
  private parsePrimary(): ConditionExpr {
    const token = this.current();

    if (token.type === 'NUMBER') {
      this.advance();
      const node: LiteralExpr = {
        type: 'literal',
        value: token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value, 10),
      };
      return node;
    }

    if (token.type === 'STRING') {
      this.advance();
      const node: LiteralExpr = { type: 'literal', value: token.value };
      return node;
    }

    if (token.type === 'BOOLEAN') {
      this.advance();
      const node: LiteralExpr = { type: 'literal', value: token.value === 'true' };
      return node;
    }

    if (token.type === 'NULL') {
      this.advance();
      const node: LiteralExpr = { type: 'literal', value: null };
      return node;
    }

    if (token.type === 'IDENT') {
      return this.parsePath();
    }

    if (token.type === 'LPAREN') {
      this.advance();
      const expr = this.parseExpr();
      this.expect('RPAREN');
      const node: GroupExpr = { type: 'group', expression: expr };
      return node;
    }

    throw new SyntaxError(
      `Unexpected token '${token.value}' at position ${token.pos}`
    );
  }

  /** path → IDENT ( '.' IDENT ( '[' NUMBER ']' )? )* */
  private parsePath(): PathExpr {
    const segments: string[] = [];
    segments.push(this.advance().value);

    let index: number | undefined;

    while (this.current().type === 'DOT') {
      this.advance(); // consume '.'
      const ident = this.expect('IDENT');
      segments.push(ident.value);

      // Optional bracket index after a segment: .container[0]
      if (this.current().type === 'LBRACKET') {
        this.advance(); // consume '['
        const numToken = this.expect('NUMBER');
        index = parseInt(numToken.value, 10);
        this.expect('RBRACKET');
      }
    }

    return { type: 'path', segments, index };
  }
}

export class SyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConditionSyntaxError';
  }
}
