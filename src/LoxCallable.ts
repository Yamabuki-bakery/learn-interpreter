import { Interpreter } from "./Interpreter";
import { Token } from "./Token";

export abstract class LoxCallable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: unknown[], token: Token): unknown;
  abstract toString(): string;
}

export function castToLoxCallable(object: unknown): LoxCallable {
  return object as LoxCallable;
}