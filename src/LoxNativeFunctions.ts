import { LoxCallable } from "./LoxCallable";

export class LoxNativeFunction extends LoxCallable {
  constructor(
    readonly name: string,
    private readonly arityGet: () => number,
    private readonly func: () => unknown,
  ) {
    super();
  }

  call(): unknown {
    return this.func();
  }

  arity(): number {
    return this.arityGet();
  }

  toString(): string {
    return "<native fn>";
  }
}

const clockFunc = new LoxNativeFunction(
  "clock",
  () => 0,
  () => Date.now() / 1000,
);

export const LoxNativeFunctions: LoxNativeFunction[] = [clockFunc];