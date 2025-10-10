import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { error } from "./Lox";
import { LiteralTypes } from "./LiteralTypes";

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;
  private keywords = new Map<string, TokenType>([
    ["and", TokenType.AND],
    ["class", TokenType.CLASS],
    ["else", TokenType.ELSE],
    ["false", TokenType.FALSE],
    ["for", TokenType.FOR],
    ["fun", TokenType.FUN],
    ["if", TokenType.IF],
    ["nil", TokenType.NIL],
    ["or", TokenType.OR],
    ["print", TokenType.PRINT],
    ["return", TokenType.RETURN],
    ["super", TokenType.SUPER],
    ["this", TokenType.THIS],
    ["true", TokenType.TRUE],
    ["var", TokenType.VAR],
    ["while", TokenType.WHILE],
    ["break", TokenType.BREAK],
    ["continue", TokenType.CONTINUE],
    ["static", TokenType.STATIC],
  ]);

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case "[":
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case "]":
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "?":
        this.addToken(TokenType.QUESTION);
        break;
      case ":":
        this.addToken(TokenType.COLON);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL,
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER,
        );
        break;
      case "/":
        if (this.match("/")) {
          // Single-line comment
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            // we do not use match here because we want to consume newline in the next iteration
            this.advance();
          }
        } else if (this.match("*")) {
          // Block comment
          this.blockComment();
        } else {
          // Regular division
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace
        break;
      case "\n":
        this.line++;
        break;

      case '"':
        this.string();
        break;


      case "0":
        if (this.peek() === "x" || this.peek() === "x") {
          this.hexNumber();
        } else {
          this.number();
        }
        break;

      default:
        // Handle unexpected characters
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          error(this.line, `Unexpected character: ${c}`);
        }
        break;
    }
  }

  private advance(): string {
    const c = this.source[this.current];
    this.current++;
    return c;
  }
  private addToken(type: TokenType, literal: LiteralTypes = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.current] !== expected) return false;
    this.current++;
    return true;
  }
  private peek(): string {
    // Return the next character without consuming it
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }
  private peekNext(): string {
    // Return the character after the next one without consuming it
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }
  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      error(this.line, "Unterminated string.");
      return;
    }

    // The closing quote
    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    // TODO: Handle escape sequences in strings
    this.addToken(TokenType.STRING, value);
  }
  private blockComment(): void {
    let commentStart = 1;
    while (
      !this.isAtEnd() // &&
      // !(this.peek() === "*" && this.peekNext() === "/")
    ) {
      if (this.peek() === "\n") this.line++;

      if (this.peek() === "/" && this.peekNext() === "*") {
        commentStart += 1;
        this.advance();
        this.advance();
      }

      if (this.peek() === "*" && this.peekNext() === "/") {
        commentStart -= 1;
        this.advance();
        this.advance();
      }

      if (commentStart === 0) return;

      this.advance();
    }
  }
  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }
  private isHexDigit(c: string): boolean {
    return (
      (c >= "0" && c <= "9") || (c >= "a" && c <= "f") || (c >= "A" && c <= "F")
    );
  }
  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }
  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
  private hexNumber(): void {
    // deal with 0x
    // Consume the "x"
    this.advance();
    while (this.isHexDigit(this.peek())) {
      this.advance();
    }
    const value = parseInt(
      this.source.substring(this.start + 2, this.current),
      16,
    );
    if (isNaN(value)) {
      error(this.line, "Invalid hexadecimal number.");
      return;
    }
    this.addToken(TokenType.NUMBER, value);
    return;
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    // Look for a fractional part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    const value = parseFloat(this.source.substring(this.start, this.current));
    if (isNaN(value)) {
      error(this.line, "Invalid number.");
      return;
    }
    this.addToken(TokenType.NUMBER, value);
  }
  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const text = this.source.substring(this.start, this.current);
    const type = this.keywords.get(text) ?? TokenType.IDENTIFIER;
    this.addToken(type);
  }
}
