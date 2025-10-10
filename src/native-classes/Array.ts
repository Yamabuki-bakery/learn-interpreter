import { RuntimeError } from "../RuntimeError";
import { Interpreter } from "../Interpreter";
import { Token } from "../Token";
import { LoxNativeClass } from "../LoxNativeClass";
import { LoxNativeFunction } from "../LoxNativeFunctions";
import { LoxInstance } from "../LoxInstance";

export class ArrayClass extends LoxNativeClass {
  constructor() {
    const name = "Array";
    const methods = new Map<string, LoxNativeFunction>();
    const staticMethods = new Map<string, LoxNativeFunction>();
    const field = new Map<string, unknown>();

    const lengthFunc = new LoxNativeFunction(
      "length",
      () => 0,
      (_this, _args, token) => {
        const instance = check_this(_this, token);
        return instance.value.length;
      }
    );
    const pushFunc = new LoxNativeFunction(
      "push",
      () => 1,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        const value = args[0];
        instance.value.push(value);
        return instance.value.length;
      }
    );
    const popFunc = new LoxNativeFunction(
      "pop",
      () => 0,
      (_this, _args, token) => {
        const instance = check_this(_this, token);
        if (instance.value.length === 0) {
          throw new RuntimeError(token, "Cannot pop from empty array.");
        }
        return instance.value.pop();
      }
    );
    const getAtFunc = new LoxNativeFunction(
      "getAt",
      () => 1,
      (_this, args, token) => {
        const instance = check_this(_this, token);
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
        return instance.value[index];
      }
    );

    methods.set("length", lengthFunc);
    methods.set("push", pushFunc);
    methods.set("pop", popFunc);
    methods.set("getAt", getAtFunc);

    super(name, methods, staticMethods, field);
  }
  arity(): number {
    return 0;
  }
  call(): unknown {
    return new ArrayInstance(this);
  }
}

class ArrayInstance extends LoxInstance {
  value: unknown[];
  constructor(klass: LoxNativeClass, value: unknown[] = []) {
    super(klass);
    this.value = value;
  }
  toString(): string {
    return `[${this.value.map(v => v?.toString() ?? "nil").join(", ")}]`;
  }
}

function check_this(_this: unknown, token: Token): ArrayInstance {
  if (!(_this instanceof ArrayInstance)) {
    throw new RuntimeError(
      token,
      `Method called on non-Array instance.`
    );
  }
  return _this;
}

export const arrayClass = new ArrayClass();