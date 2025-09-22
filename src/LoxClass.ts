import { Interpreter } from "./Interpreter";
import { LoxCallable } from "./LoxCallable";
import { LoxInstance } from "./LoxInstance";
import { LoxFunction } from "./LoxFunction";

export class LoxClass extends LoxCallable {
  constructor(
    readonly name: string,
    readonly methods: Map<string, LoxFunction>,
  ) {
    super();
  }

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
