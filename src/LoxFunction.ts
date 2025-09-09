import { LoxCallable } from "./LoxCallable";
import { Function } from "./generated/Stmt";
import { Interpreter, ReturnException } from "./Interpreter";
import { Environment } from "./Environment";

export class LoxFunction extends LoxCallable {
  constructor(
    private readonly declaration: Function,
    private readonly closure: Environment,
  ) {
    super();
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: unknown[]): unknown {
    const environment = new Environment(this.closure);
    args.forEach((arg, i) => {
      environment.define(this.declaration.params[i].lexeme, arg);
    });

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (error) {
      if (error instanceof ReturnException) {
        return error.value;
      }
      throw error;
    }
    return null;
  }

  toString(): string {
    return `function ${this.declaration.name.lexeme}(${this.declaration.params
      .map((param) => param.lexeme)
      .join(", ")}) { ${this.declaration.body.length} statements }`;
  }
}
