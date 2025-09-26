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
    const initializer = this.methods.get("init");
    if (initializer) {
      return initializer.arity();
    }
    return 0;
  }

  call(interpreter: Interpreter, args: unknown[]): unknown {
    // create instance first, then call initializer if any
    const instance = new LoxInstance(this);
    const initializer = this.methods.get("init");
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }
}
