import { LoxCallable } from "./LoxCallable";
import { Function } from "./generated/Stmt";
import { Interpreter, ReturnException } from "./Interpreter";
import { Environment } from "./Environment";
import { Function as FuncExpr } from "./generated/Expr";

export class LoxFunction extends LoxCallable {
  constructor(
    private readonly declaration: Function | FuncExpr,
    private readonly closure: Environment,
    private readonly isInitializer = false,
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
        if (this.isInitializer) {
          return this.closure.getAt(0, "this");
        }
        return error.value;
      }
      throw error;
    }
    if (this.isInitializer) {
      return this.closure.getAt(0, "this");
    }
    return null;
  }

  toString(): string {
    if (this.declaration instanceof FuncExpr) {
      return `<fn anonymous>`;
    }
    return `function ${this.declaration.name.lexeme}(${this.declaration.params
      .map((param) => param.lexeme)
      .join(", ")}) { ${this.declaration.body.length} statements }`;
  }

  bind(instance: unknown): LoxFunction {
    // An implicit "this" argument is added to the environment
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
  }


}
