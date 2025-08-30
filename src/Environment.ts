import { RuntimeError } from "./RuntimeError";
import { Token } from "./Token";

export class Environment {
  private values: Map<string, unknown>;

  constructor() {
    this.values = new Map();
  }

  define(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  get(name: Token): unknown {
    if (this.values.has(name.lexeme)) {
      // check at runtime to allow recursion
      return this.values.get(name.lexeme);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}