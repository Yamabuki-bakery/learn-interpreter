import { Interpreter } from "./Interpreter";
import { LoxInstance } from "./LoxInstance";
import { Token } from "./Token";
import { LoxClass } from "./LoxClass";
import { LoxNativeFunction } from "./LoxNativeFunctions";


export class LoxNativeClass extends LoxClass {  
  constructor(
    readonly name: string,
    readonly methods: Map<string, LoxNativeFunction> = new Map(),
    readonly staticMethods: Map<string, LoxNativeFunction> = new Map(),  // for static method support
    readonly field: Map<string, unknown> = new Map(),  // for static field support
    // todo: initialization support?
  ) {
    super(
      name, 
      null, 
      methods, 
      staticMethods, 
      field
    );
  }

  toString(): string {
    return `<native class ${this.name}>`;
  }

  arity(): number {
    // todo: support initializer?
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  call(interpreter: Interpreter, args: unknown[], token: Token): unknown {
    const instance = new LoxInstance(this);
    return instance;
  }
}
