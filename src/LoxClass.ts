import { Interpreter } from "./Interpreter";
import { LoxCallable } from "./LoxCallable";
import { LoxInstance } from "./LoxInstance";
import { LoxFunction } from "./LoxFunction";
import { Token } from "./Token";
import { RuntimeError } from "./RuntimeError";



export class LoxClass extends LoxCallable {  
  // For static method support, we also should extends LoxInstance... but JS doesn't support multiple inheritance.
  // So we just duplicate the field and get() method here.

  constructor(
    readonly name: string,
    readonly superclass: LoxClass | null,
    readonly methods: Map<string, LoxFunction>,
    readonly staticMethods: Map<string, LoxFunction>,
    readonly field: Map<string, unknown> = new Map(),
  ) {
    super();
  }

  get(name: Token): unknown {
    if (this.field.has(name.lexeme)) {
      return this.field.get(name.lexeme);
    } 
    // I think it is ok to pass anything into a static field 

    const staticMethod = this.staticMethods.get(name.lexeme);
    if (staticMethod) {
      return staticMethod.bind(this);  // bind the class itself as "this" 😱
    }

    throw new RuntimeError(name, `Undefined static field '${name.lexeme}'.`);
  }

  set(name: Token, value: unknown): void {
    this.field.set(name.lexeme, value);
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
