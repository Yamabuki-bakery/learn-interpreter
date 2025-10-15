import { RuntimeError } from "../RuntimeError";
import { Token } from "../Token";
import { LoxNativeClass } from "../LoxNativeClass";
import { LoxNativeFunction } from "../LoxNativeFunctions";
import { LoxInstance } from "../LoxInstance";
import { LoxFunction } from "../LoxFunction";

function isTruthy(object: unknown): boolean {
  if (object === null) return false;
  if (typeof object === "boolean") return object;
  return true;
}

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
          throw new RuntimeError(token, "Can't pop from empty array.");
        }
        return instance.value.pop();
      }
    );
    const getAtFunc = new LoxNativeFunction(
      "getAt",
      () => 1,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        const index = this.indexCheck(args[0], instance.value.length, token);
        return instance.value[index];
      }
    );
    const setAtFunc = new LoxNativeFunction(
      "setAt",
      () => 2,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        const value = args[1];
        const index = this.indexCheck(args[0], instance.value.length, token);
        instance.value[index] = value;
        return value;
      }
    );
    const forEachFunc = new LoxNativeFunction(
      "forEach",
      () => 1,
      (_this, args, token, interpreter) => {
        const instance = check_this(_this, token);
        const callback = args[0];
        if (!(callback instanceof LoxFunction)) {
          throw new RuntimeError(token, "Callback must be a function.");
        }
        instance.value.forEach((v, i) => {
          const params = [v, i, instance];
          return callback.call(interpreter, params.slice(0, callback.arity()));
        });
        return null;
      }
    );
    const mapFunc = new LoxNativeFunction(
      "map",
      () => 1,
      (_this, args, token, interpreter) => {
        const instance = check_this(_this, token);
        const callback = args[0];
        if (!(callback instanceof LoxFunction)) {
          throw new RuntimeError(token, "Callback must be a function.");
        }
        const result = instance.value.map((v, i) => {
          const params = [v, i, instance];
          return callback.call(interpreter, params.slice(0, callback.arity()));
        });
        return new ArrayInstance(this, result);
      }
    );

    const filterFunc = new LoxNativeFunction(
      "filter",
      () => 1,
      (_this, args, token, interpreter) => {
        const instance = check_this(_this, token);
        const callback = args[0];
        if (!(callback instanceof LoxFunction)) {
          throw new RuntimeError(token, "Callback must be a function.");
        }
        const result = instance.value.filter((v, i) => {
          const params = [v, i, instance];
          const callResult = callback.call(interpreter, params.slice(0, callback.arity()));
          return isTruthy(callResult);
        });
        return new ArrayInstance(this, result);
      }
    );

    const reduceFunc = new LoxNativeFunction(
      "reduce",
      () => 2,
      (_this, args, token, interpreter) => {
        const instance = check_this(_this, token);
        const callback = args[0];
        if (!(callback instanceof LoxFunction)) {
          throw new RuntimeError(token, "Callback must be a function.");
        }
        if (instance.value.length === 0) {
          throw new RuntimeError(token, "Reduce of empty array with no initial value.");
        }
        let accumulator = args[1];
        let startIndex = 0;
        
        // If no initial value provided, use first element
        if (args.length < 2) {
          accumulator = instance.value[0];
          startIndex = 1;
        }
        
        for (let i = startIndex; i < instance.value.length; i++) {
          const params = [accumulator, instance.value[i], i, instance];
          accumulator = callback.call(interpreter, params.slice(0, callback.arity()));
        }
        return accumulator;
      }
    );

    const findFunc = new LoxNativeFunction(
      "find",
      () => 1,
      (_this, args, token, interpreter) => {
        const instance = check_this(_this, token);
        const callback = args[0];
        if (!(callback instanceof LoxFunction)) {
          throw new RuntimeError(token, "Callback must be a function.");
        }
        for (let i = 0; i < instance.value.length; i++) {
          const params = [instance.value[i], i, instance];
          const result = callback.call(interpreter, params.slice(0, callback.arity()));
          if (isTruthy(result)) {
            return instance.value[i];
          }
        }
        return null;
      }
    );

    const findIndexFunc = new LoxNativeFunction(
      "findIndex",
      () => 1,
      (_this, args, token, interpreter) => {
        const instance = check_this(_this, token);
        const callback = args[0];
        if (!(callback instanceof LoxFunction)) {
          throw new RuntimeError(token, "Callback must be a function.");
        }
        for (let i = 0; i < instance.value.length; i++) {
          const params = [instance.value[i], i, instance];
          const result = callback.call(interpreter, params.slice(0, callback.arity()));
          if (isTruthy(result)) {
            return i;
          }
        }
        return -1;
      }
    );

    const includesFunc = new LoxNativeFunction(
      "includes",
      () => 1,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        const searchElement = args[0];
        return instance.value.includes(searchElement);
      }
    );

    const indexOfFunc = new LoxNativeFunction(
      "indexOf",
      () => 1,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        const searchElement = args[0];
        const index = instance.value.indexOf(searchElement);
        return index;
      }
    );

    const sliceFunc = new LoxNativeFunction(
      "slice",
      () => 2,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        let start = 0;
        let end = instance.value.length;
        
        if (args.length >= 1 && typeof args[0] === "number") {
          start = Math.floor(args[0]);
          if (start < 0) start = Math.max(0, instance.value.length + start);
        }
        
        if (args.length >= 2 && typeof args[1] === "number") {
          end = Math.floor(args[1]);
          if (end < 0) end = Math.max(0, instance.value.length + end);
        }
        
        const result = instance.value.slice(start, end);
        return new ArrayInstance(this, result);
      }
    );

    const joinFunc = new LoxNativeFunction(
      "join",
      () => 1,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        const separator = args.length > 0 ? args[0]?.toString() ?? "nil" : ",";
        return instance.value.map(v => v?.toString() ?? "nil").join(separator);
      }
    );

    const reverseFunc = new LoxNativeFunction(
      "reverse",
      () => 0,
      (_this, _args, token) => {
        const instance = check_this(_this, token);
        instance.value.reverse();
        return instance;
      }
    );

    const sortFunc = new LoxNativeFunction(
      "sort",
      () => 1,
      (_this, args, token, interpreter) => {
        const instance = check_this(_this, token);
        if (args[0] === null) {
          // Default sort (convert to strings and sort lexicographically)
          instance.value.sort((a, b) => {
            const aStr = a?.toString() ?? "nil";
            const bStr = b?.toString() ?? "nil";
            return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
          });
        } else {
          const compareFunc = args[0];
          if (!(compareFunc instanceof LoxFunction)) {
            throw new RuntimeError(token, "Compare function must be a function.");
          }
          instance.value.sort((a, b) => {
            const result = compareFunc.call(interpreter, [a, b]);
            return typeof result === "number" ? result : 0;
          });
        }
        return instance;
      }
    );

    const unshiftFunc = new LoxNativeFunction(
      "unshift",
      () => 1,
      (_this, args, token) => {
        const instance = check_this(_this, token);
        const value = args[0];
        instance.value.unshift(value);
        return instance.value.length;
      }
    );

    const shiftFunc = new LoxNativeFunction(
      "shift",
      () => 0,
      (_this, _args, token) => {
        const instance = check_this(_this, token);
        if (instance.value.length === 0) {
          throw new RuntimeError(token, "Can't shift from empty array.");
        }
        return instance.value.shift();
      }
    );

    methods.set("map", mapFunc);
    methods.set("filter", filterFunc);
    methods.set("reduce", reduceFunc);
    methods.set("find", findFunc);
    methods.set("findIndex", findIndexFunc);
    methods.set("includes", includesFunc);
    methods.set("indexOf", indexOfFunc);
    methods.set("slice", sliceFunc);
    methods.set("join", joinFunc);
    methods.set("reverse", reverseFunc);
    methods.set("sort", sortFunc);
    methods.set("unshift", unshiftFunc);
    methods.set("shift", shiftFunc);

    methods.set("forEach", forEachFunc);
    methods.set("setAt", setAtFunc);
    methods.set("length", lengthFunc);
    methods.set("push", pushFunc);
    methods.set("pop", popFunc);
    methods.set("getAt", getAtFunc);

    super(name, methods, staticMethods, field);
  }
  private indexCheck(index: unknown, length: number, token: Token): number {
    if (typeof index !== "number" || !Number.isInteger(index)) {
      throw new RuntimeError(
        token,
        `Index must be an integer, got ${typeof index}.`
      );
    }
    if (index < 0 || index >= length) {
      throw new RuntimeError(
        token,
        `Index out of bounds: ${index}.`
      );
    }
    return index;
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