import { LoxClass } from "./LoxClass";
import { Token } from "./Token";
import { RuntimeError } from "./RuntimeError";
import { LoxNativeClass } from "./LoxNativeClass";


export class LoxInstance {
  constructor(
    private readonly klass: LoxClass | LoxNativeClass,
    private readonly field: Map<string, unknown> = new Map(),
  ) {}

  toString(): string {
    return `${this.klass.name} instance`;
  }

  get(name: Token): unknown {
    if (this.field.has(name.lexeme)) {
      return this.field.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) {
      return method.bind(this);
    }

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }
  
  set(name: Token, value: unknown): void {
    this.field.set(name.lexeme, value);
  }

  nativeGet(name: string): unknown {
    if (this.field.has(name)) {
      return this.field.get(name);
    }
    
    const method = this.klass.findMethod(name);
    if (method) {
      return method.bind(this);
    }

    throw new ReferenceError(`Undefined property '${name}'.`);
  }

  nativeSet(name: string, value: unknown): void {
    this.field.set(name, value);
  }
}
