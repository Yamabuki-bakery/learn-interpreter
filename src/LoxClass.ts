import { Interpreter } from "./Interpreter";
import { LoxCallable } from "./LoxCallable";
import { LoxInstance } from "./LoxInstance";

export class LoxClass implements LoxCallable {
  constructor(readonly name: string) {}

  toString(): string {
    return this.name;
  }

  arity(): number {
    return 0;
  }

  call(interpreter: Interpreter, args: unknown[]): unknown {
    return new LoxInstance(this);
  }
}
