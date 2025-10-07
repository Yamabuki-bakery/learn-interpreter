import { LoxClass } from "./LoxClass";
import { Token } from "./Token";
import { RuntimeError } from "./RuntimeError";


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

    const method = this.klass.methods.get(name.lexeme);
    if (method) {
      return method.bind(this);
    }

    if (this.klass.superclass !== null) {
      const superMethod = this.klass.superclass.methods.get(name.lexeme);
      if (superMethod) {
        return superMethod.bind(this);
      }
    }

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }
  
  set(name: Token, value: unknown): void {
    this.field.set(name.lexeme, value);
  }
}
