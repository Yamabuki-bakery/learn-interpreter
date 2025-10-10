import { RuntimeError } from "../RuntimeError";
import { Interpreter } from "../Interpreter";
import { Token } from "../Token";
import { LoxNativeClass } from "../LoxNativeClass";
import { LoxNativeFunction } from "../LoxNativeFunctions";

export class MathClass extends LoxNativeClass {
  constructor() {
    const name = "Math";
    const staticMethods = new Map<string, LoxNativeFunction>();
    const field = new Map<string, unknown>();

    field.set("PI", Math.PI);
    field.set("E", Math.E);

    const absFunc = new LoxNativeFunction(
      "abs",
      () => 1,
      (_this, args, token) => {
        const value = args[0];
        if (typeof value !== "number") {
          throw new RuntimeError(
            token,
            `Argument to 'abs' must be a number, got ${typeof value}.`
          );
        }
        return Math.abs(value);
      }
    );

    staticMethods.set("abs", absFunc);

    super(name, undefined, staticMethods, field);
  }
  toString(): string {
    return `<native class ${this.name}>`;
  }
  call(interpreter: Interpreter, args: unknown[], token: Token): unknown {
    throw new RuntimeError(token, "Cannot instantiate Math class.");
  }
}


export const mathClass = new MathClass();