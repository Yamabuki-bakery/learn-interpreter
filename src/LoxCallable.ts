import { Interpreter } from "./Interpreter";

export abstract class LoxCallable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: unknown[]): unknown;
}

export function castToLoxCallable(object: unknown): LoxCallable {
  return object as LoxCallable;
}