import { error } from "./Lox";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Ternary,
  Unary,
  Variable,
} from "./generated/Expr";

import { Stmt, Print, Expression, Var } from "./generated/Stmt";

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt [] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      const result = this.declaration(); 
      if (result !== null) {  // in case of parsing error, skipping
        statements.push(result);
      } 
    }

    return statements;
  }

  private declaration(): Stmt | null {
    try {
      if (this.match(TokenType.VAR)) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      if (error instanceof ParseError) {
        this.synchronize();
        return null;
      } else {
        throw error;
      }
    }
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer: Expr | null = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Var(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    return this.expressionStatement();
    // If the next token doesn’t look like any known kind of statement, we assume it must be an expression statement. That’s the typical final fallthrough case when parsing a statement, since it’s hard to proactively recognize an expression from its first token.
  }

  private printStatement(): Stmt {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Print(value);
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Expression(expr);
  }

  // In a top-down parser, you reach the lowest-precedence
  //  expressions first because they may in turn contain
  //   subexpressions of higher precedence.
  expression(): Expr {
    return this.comma();
  }

  comma(): Expr {
    let expr = this.conditional();

    while (this.match(TokenType.COMMA)) {
      const operator = this.previous();
      const right = this.conditional();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  conditional(): Expr {
    let expr = this.equality();

    if (this.match(TokenType.QUESTION)) {
      const thenBranch = this.expression();
      // if i set conditional here,
      // false ? 1 ,2 ,3 : "test"
      // will give this error: Error at ',': (Conditional) Expect ':' after then branch
      this.consume(
        TokenType.COLON,
        "(Conditional) Expect ':' after then branch",
      );
      const elseBranch = this.conditional();
      expr = new Ternary(expr, thenBranch, elseBranch);
    }

    return expr;
  }

  equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  comparison(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.STRING, TokenType.NUMBER)) {
      return new Literal(this.previous().literal);
    }

    // Parsing a variable expression is even easier. In primary(), we look for an identifier token.
    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  // peek() returns the current token we have yet to consume, and previous() returns the most recently consumed token. The latter makes it easier to use match() and then access the just-matched token.
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  private previous(): Token {
    return this.tokens[this.current - 1];
  }
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }
  private peek(): Token {
    return this.tokens[this.current];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }
  private error(token: Token, message: string): ParseError {
    error(token, message);
    return new ParseError(message);
  }
  private synchronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }
      this.advance();
    }
  }
}

class ParseError extends SyntaxError {}
