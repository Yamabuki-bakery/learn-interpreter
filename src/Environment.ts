import { RuntimeError } from "./RuntimeError";
import { Token } from "./Token";

export class Environment {
  private values: Map<string, unknown>;
  readonly enclosing?: Environment;

  constructor(enclosing?: Environment) {
    this.values = new Map();
    this.enclosing = enclosing;
  }

  define(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  getAt(distance: number, name: string): unknown {
    return this.ancestor(distance).values.get(name);
  }

  assignAt(distance: number, name: Token, value: unknown): void {
    const environment = this.ancestor(distance);
    if (environment.values.has(name.lexeme)) {
      environment.values.set(name.lexeme, value);
      return;
    }
    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  private ancestor(distance: number): Environment {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      if (!environment.enclosing) {
        throw new Error("No enclosing environment");
      }
      environment = environment.enclosing;
    }
    return environment;
  }

  get(name: Token): unknown {
    if (this.values.has(name.lexeme)) {
      // Check at runtime to allow recursion
      return this.values.get(name.lexeme);
    }

    if (this.enclosing) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: unknown): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
