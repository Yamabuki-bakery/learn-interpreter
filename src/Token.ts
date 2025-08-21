import { TokenType } from "./TokenType";
import { LiteralTypes } from "./LiteralTypes";

export class Token {

  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: LiteralTypes,
    public line: number
  ) {}

  toString(): string {
    return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
  }
}