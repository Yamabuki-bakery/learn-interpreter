import { RuntimeError } from "../RuntimeError";
import { Interpreter } from "../Interpreter";
import { Token } from "../Token";
import { LoxNativeClass } from "../LoxNativeClass";
import { LoxNativeFunction } from "../LoxNativeFunctions";
import { LoxInstance } from "../LoxInstance";

export class StringClass extends LoxNativeClass {
  constructor() {
    const name = "String";
    const methods = new Map<string, LoxNativeFunction>();
    const staticMethods = new Map<string, LoxNativeFunction>();
    const field = new Map<string, unknown>();

    const lengthFunc = new LoxNativeFunction(
      "length",
      () => 0,
      (_this, args, token) => {
        const instance = this.check_this(_this, token);
        return instance.value.length;
      }
    );
    const charAtFunc = new LoxNativeFunction(
      "charAt",
      () => 1,
      (_this, args, token) => {
        const instance = this.check_this(_this, token);
        const index = args[0];
        if (typeof index !== "number" || !Number.isInteger(index)) {
          throw new RuntimeError(
            token,
            `Argument to 'getAt' must be an integer, got ${typeof index}.`
          );
        }
        if (index < 0 || index >= instance.value.length) {
          throw new RuntimeError(
            token,
            `Index out of bounds: ${index}.`
          );
        }
        return instance.value.charAt(index);
      }
    );

    methods.set("charAt", charAtFunc);
    methods.set("length", lengthFunc);

    super(name, methods, staticMethods, field);
  }
  private check_this(_this: unknown, token: Token): StringInstance {
    if (!(_this instanceof StringInstance)) {
      throw new RuntimeError(
        token,
        `Method called on non-String instance.`
      );
    }
    return _this;
  }
  toString(): string {
    return `<native class ${this.name}>`;
  }
  arity(): number {
    return 1;
  }
  call(interpreter: Interpreter, args: unknown[], token: Token): unknown {
    // ctor
    const value = args[0];
    if (typeof value !== "string") {
      throw new RuntimeError(
        token,
        `Argument to String constructor must be a string, got ${typeof value}.`
      );
    }
    const instance = new StringInstance(this, value);
    return instance;
  }
}

class StringInstance extends LoxInstance {
  value: string;
  constructor(klass: StringClass, value: string) {
    super(klass, new Map());
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
}

export const stringClass = new StringClass();