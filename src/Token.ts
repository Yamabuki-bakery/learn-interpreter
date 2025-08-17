import { TokenType } from "./TokenType";

export class Token {

  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: any,
    public line: number
  ) {}

  toString(): string {
    return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
  }
}