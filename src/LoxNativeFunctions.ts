import { LoxCallable } from "./LoxCallable";
import { LoxInstance } from "./LoxInstance";
import { LoxClass } from "./LoxClass";
import { Interpreter } from "./Interpreter";
import { Token } from "./Token";


export class LoxNativeFunction extends LoxCallable {
  private instance: LoxInstance | LoxClass | null = null;
  constructor(
    readonly name: string,
    private readonly arityGet: () => number,
    private readonly func: (_this: LoxInstance | LoxClass | null, args : unknown[], token: Token) => unknown,
  ) {
    super();
  }

  call(interpreter: Interpreter, args: unknown[], token: Token): unknown {
    return this.func(this.instance, args, token);
  }

  arity(): number {
    return this.arityGet();
  }

  toString(): string {
    return "<native fn>";
  }

  bind(instance: LoxInstance | LoxClass): this {
    this.instance = instance;
    return this;
  }
}

const clockFunc = new LoxNativeFunction(
  "clock",
  () => 0,
  () => Date.now() / 1000,
);

export const LoxNativeFunctions: LoxNativeFunction[] = [clockFunc];