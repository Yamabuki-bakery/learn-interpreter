import { LoxClass } from "./LoxClass";
import { Token } from "./Token";

export class LoxInstance {
  constructor(
    private readonly klass: LoxClass,
    private readonly field: Map<string, unknown> = new Map(),
  ) {}

  toString(): string {
    return `${this.klass.name} instance`;
  }

  get(name: Token): unknown {
    if (this.field.has(name.lexeme)) {
      return this.field.get(name.lexeme);
    }

    throw new Error(`Undefined property '${name.lexeme}'.`);
  }
  
  set(name: Token, value: unknown): void {
    this.field.set(name.lexeme, value);
  }
}
