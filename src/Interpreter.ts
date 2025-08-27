/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Ternary,
  Unary,
  Visitor,
} from "./generated/Expr";
import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { RuntimeError } from "./RuntimeError";
import { runtimeError } from "./Lox";

export class Interpreter implements Visitor<unknown> {
  interpret(expr: Expr): void {
    try {
      const value = this.evaluate(expr);
      console.log(this.stringify(value));
    } catch (error) {
      if (error instanceof RuntimeError) {
        runtimeError(error);
      } else {
        throw error;
      }
    }
  }

  stringify(object: unknown): string {
    if (object === null) return "nil";
    if (typeof object === "number") {
      return object.toString();
    }
    if (typeof object === 'boolean' || typeof object === 'string') 
      return object.toString();

    throw new TypeError(`What is this? ${object}`);
  }

  visitBinaryExpr(expr: Binary): unknown {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    let l: number;
    let r: number;

    switch (expr.operator.type) {
      case TokenType.BANG_EQUAL:
        return !isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return isEqual(left, right);
      case TokenType.GREATER:
        [l, r] = checkNumberOperands(expr.operator, left, right);
        return l > r;
      case TokenType.GREATER_EQUAL:
        [l, r] = checkNumberOperands(expr.operator, left, right);
        return l >= r;
      case TokenType.LESS:
        [l, r] = checkNumberOperands(expr.operator, left, right);
        return l < r;
      case TokenType.LESS_EQUAL:
        [l, r] = checkNumberOperands(expr.operator, left, right);
        return l <= r;
      case TokenType.MINUS:
        [l, r] = checkNumberOperands(expr.operator, left, right);
        return l - r;
      case TokenType.SLASH:
        [l, r] = checkNumberOperands(expr.operator, left, right);
        if (r === 0) {
          throw new RuntimeError(expr.operator, "Division by zero.");
        }
        return l / r;
      case TokenType.STAR:
        [l, r] = checkNumberOperands(expr.operator, left, right);
        return l * r;
      case TokenType.PLUS:
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string") {
          return left + this.stringify(right);
        }
        if (typeof right === "string") {
          return this.stringify(left) + right;
        }
        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings.",
        );
      case TokenType.COMMA:
        return right;
    }
    return null;
  }
  visitGroupingExpr(expr: Grouping): unknown {
    return this.evaluate(expr.expression);
  }
  visitLiteralExpr(expr: Literal): unknown {
    return expr.value;
  }
  visitTernaryExpr(expr: Ternary): unknown {
    const condition = this.evaluate(expr.condition);
    if (isTruthy(condition)) {
      return this.evaluate(expr.thenBranch);
    } else {
      return this.evaluate(expr.elseBranch);
    }
  }
  visitUnaryExpr(expr: Unary): unknown {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -checkNumberOperand(expr.operator, right);
      case TokenType.BANG:
        return !isTruthy(right);
    }
    return null;
  }

  private evaluate(expr: Expr): unknown {
    return expr.accept(this) as unknown;
  }
}
function isEqual(a: unknown, b: unknown) {
  if (a === null && b === null) return true;
  if (a === null) return false;
  return a === b;
}

function isTruthy(object: unknown): boolean {
  if (object === null) return false;
  if (typeof object === "boolean") return object;
  return true;
}

function checkNumberOperand(operator: Token, operand: unknown): number {
  if (typeof operand === "number") return operand;
  throw new RuntimeError(operator, "Operand must be a number.");
}

function checkNumberOperands(
  operator: Token,
  left: unknown,
  right: unknown,
): [number, number] {
  if (typeof left === "number" && typeof right === "number")
    return [left, right];
  throw new RuntimeError(operator, "Operands must be numbers.");
}
