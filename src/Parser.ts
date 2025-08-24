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
} from "./generated/Expr";

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Expr | null | undefined {
    try {
      return this.expression();
    } catch (e: unknown) {
      if (e instanceof ParseError) {
        return null;
      }
    }
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
