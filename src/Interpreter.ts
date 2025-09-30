import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Ternary,
  Unary,
  Visitor as ExprVisitor,
  Variable,
  Assign,
  Logical,
  Call,
  Function as FuncExpr,
  Get,
  Set,
  This,
} from "./generated/Expr";
import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { RuntimeError } from "./RuntimeError";
import { runtimeError } from "./Lox";
import { LoxNativeFunctions } from "./LoxNativeFunctions";

import {
  Print,
  Expression,
  Visitor as StmtVisitor,
  Stmt,
  Var,
  Block,
  If,
  While,
  Break,
  Continue,
  Function,
  Return,
  Class,
} from "./generated/Stmt";
import { Environment } from "./Environment";
import { castToLoxCallable } from "./LoxCallable";
import { LoxCallable } from "./LoxCallable";
import { LoxFunction } from "./LoxFunction";
import { LoxClass } from "./LoxClass";
import { LoxInstance } from "./LoxInstance";

export class Interpreter implements ExprVisitor<unknown>, StmtVisitor<void> {
  globals = new Environment();
  private environment: Environment = this.globals;
  private readonly locals: Map<Expr, number> = new Map<Expr, number>();

  constructor() {
    // Define native functions here if needed
    LoxNativeFunctions.forEach((fn) => {
      this.globals.define(fn.name, fn);
    });
  }

  interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        runtimeError(error);
      } else {
        throw error;
      }
    }
  }

  interpretSingle(expr: Expr): unknown {
    try {
      return this.evaluate(expr);
    } catch (error) {
      if (error instanceof RuntimeError) {
        runtimeError(error);
      } else {
        throw error;
      }
    }
    return null;
  }

  stringify(object: unknown): string {
    if (object === null) return "nil";
    if (typeof object === "number") {
      // check -0
      if (Object.is(object, -0)) return "-0";
      return object.toString();
    }
    if (typeof object === "boolean" || typeof object === "string")
      return object.toString();

    if (object instanceof LoxCallable || object instanceof LoxInstance) {
      return object.toString();
    }

    throw new TypeError(`What is this? ${object as unknown}`);
  }

  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return;
  }

  executeBlock(statements: Stmt[], environment: Environment): void {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitIfStmt(stmt: If): void {
    const condition = this.evaluate(stmt.condition);
    if (isTruthy(condition)) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
    return;
  }
  visitWhileStmt(stmt: While): void {
    while (isTruthy(this.evaluate(stmt.condition))) {
      try {
        this.execute(stmt.body);
      } catch (error) {
        if (error instanceof BreakException) {
          break;
        } else if (error instanceof ContinueException) {
          continue;
        } else {
          throw error;
        }
      }
    }
    return;
  }

  visitExpressionStmt(stmt: Expression): null {
    this.evaluate(stmt.expression);
    return null;
  }

  visitBreakStmt(stmt: Break): void {
    throw new BreakException(stmt.keyword, "Break statement");
  }

  visitContinueStmt(stmt: Continue): void {
    throw new ContinueException(stmt.keyword, "Continue statement");
  }

  visitClassStmt(stmt: Class): void {
    this.environment.define(stmt.name.lexeme, null);

    const methods = new Map<string, LoxFunction>();
    for (const method of stmt.methods) {
      const func = new LoxFunction(method, this.environment, method.name.lexeme === "init");
      methods.set(method.name.lexeme, func);
    }

    const staticMethods = new Map<string, LoxFunction>();
    for (const staticMethod of stmt.staticMethods) {
      const func = new LoxFunction(staticMethod, this.environment, false);
      staticMethods.set(staticMethod.name.lexeme, func);
    }

    const klass = new LoxClass(stmt.name.lexeme, methods, staticMethods);
    this.environment.assign(stmt.name, klass);
    return;
  }

  visitVarStmt(stmt: Var): void {
    let value: unknown = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitFunctionStmt(stmt: Function): void {
    const func = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, func);
    return;
  }

  visitPrintStmt(stmt: Print): null {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  visitReturnStmt(stmt: Return): void {
    let value: unknown = null;
    if (stmt.value !== null) {
      value = this.evaluate(stmt.value);
    }
    throw new ReturnException(value, stmt.keyword);
  }

  visitAssignExpr(expr: Assign): unknown {
    const value = this.evaluate(expr.value);
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }
    return value;
  }

  visitLogicalExpr(expr: Logical): unknown {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (isTruthy(left)) return left;
    } else {
      if (!isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
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

  visitCallExpr(expr: Call): unknown {
    const callee = this.evaluate(expr.callee);

    const args = expr.args.map((arg) => this.evaluate(arg));

    if (!(callee instanceof LoxCallable)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes.",
      );
    }

    const func = castToLoxCallable(callee);

    // arity check could be here if needed
    if (args.length !== func.arity()) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${func.arity()} arguments but got ${args.length}.`,
      );
    }

    return func.call(this, args);
  }

  visitGetExpr(expr: Get): unknown {
    const object = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    } else if (object instanceof LoxClass) {
      return object.get(expr.name);
    }
    throw new RuntimeError(expr.name, "Only instances have properties.");
  }

  visitSetExpr(expr: Set): unknown {
    const object = this.evaluate(expr.object);
    if (!(object instanceof LoxInstance || object instanceof LoxClass)) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }
    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  visitThisExpr(expr: This): unknown {
    return this.lookUpVariable(expr.keyword, expr);
  }

  visitVariableExpr(expr: Variable): unknown {
    return this.lookUpVariable(expr.name, expr);
  }

  private lookUpVariable(name: Token, expr: Expr): unknown {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

  visitFunctionExpr(expr: FuncExpr): unknown {
    return new LoxFunction(expr, this.environment);
  }

  private evaluate(expr: Expr): unknown {
    return expr.accept(this) as unknown;
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  resolve(expr: Expr, depth: number): void {
    this.locals.set(expr, depth);
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

class BreakException extends RuntimeError {}
class ContinueException extends RuntimeError {}
export class ReturnException extends RuntimeError {
  value: unknown;
  constructor(value: unknown, token: Token) {
    super(token, "");
    this.value = value;
  }
}
