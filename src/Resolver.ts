import {
  Block,
  Class,
  Expression,
  Function,
  If,
  Print,
  Return,
  Stmt,
  Visitor as StmtVisitor,
  Var,
  While,
} from "./generated/Stmt";
import {
  Assign,
  Expr,
  Visitor as ExprVisitor,
  Variable,
  Function as FuncExpr,
  Binary,
  Call,
  Grouping,
  Logical,
  Unary,
  Ternary,
  Get,
  Set,
} from "./generated/Expr";
import { Interpreter } from "./Interpreter";
import { Token } from "./Token";
import { error } from "./Lox";

enum FunctionType {
  NONE,
  FUNCTION,
}

interface VarStatus {
  defined: boolean;
  used: boolean;
  line: number;
}

export class Resolver implements StmtVisitor<unknown>, ExprVisitor<unknown> {
  private readonly scopes: Map<string, VarStatus>[] = [];
  private currentFunction = FunctionType.NONE;

  constructor(private readonly interpreter: Interpreter) {}

  visitBlockStmt(stmt: Block): unknown {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
    return null;
  }

  visitExpressionStmt(stmt: Expression): unknown {
    this.resolve(stmt.expression);
    return null;
  }

  visitIfStmt(stmt: If): unknown {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) {
      this.resolve(stmt.elseBranch);
    }
    return null;
  }

  visitPrintStmt(stmt: Print): unknown {
    this.resolve(stmt.expression);
    return null;
  }

  visitReturnStmt(stmt: Return): unknown {
    if (this.currentFunction === FunctionType.NONE) {
      error(stmt.keyword, "Cannot return from top-level code.");
    }

    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }
    return null;
  }

  visitWhileStmt(stmt: While): unknown {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
    return null;
  }

  visitContinueStmt(): unknown {
    return null;
  }
  visitBreakStmt(): unknown {
    return null;
  }

  visitClassStmt(stmt: Class): unknown {
    this.declare(stmt.name);
    this.define(stmt.name);

    return null;
  }

  visitFunctionStmt(stmt: Function): unknown {
    this.declare(stmt.name);
    // We define the name eagerly, before resolving the function’s body. This lets a function recursively refer to itself inside its own body.
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
    return null;
  }

  visitVarStmt(stmt: Var): unknown {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
    return;
  }

  visitBinaryExpr(expr: Binary): unknown {
    this.resolve(expr.left);
    this.resolve(expr.right);
    return null;
  }

  visitCallExpr(expr: Call): unknown {
    this.resolve(expr.callee);
    for (const arg of expr.args) {
      this.resolve(arg);
    }
    return null;
  }

  visitGetExpr(expr: Get): unknown {
    this.resolve(expr.object);
    return null;
  }

  visitSetExpr(expr: Set): unknown {
    this.resolve(expr.value);
    this.resolve(expr.object);
    return null;
  }

  visitGroupingExpr(expr: Grouping): unknown {
    this.resolve(expr.expression);
    return null;
  }

  visitLiteralExpr(): unknown {
    return null;
  }

  visitLogicalExpr(expr: Logical): unknown {
    this.resolve(expr.left);
    this.resolve(expr.right);
    return null;
  }

  visitUnaryExpr(expr: Unary): unknown {
    this.resolve(expr.right);
    return null;
  }

  visitTernaryExpr(expr: Ternary): unknown {
    this.resolve(expr.condition);
    this.resolve(expr.thenBranch);
    this.resolve(expr.elseBranch);
    return null;
  }

  visitVariableExpr(expr: Variable): unknown {
    if (
      this.scopes.length !== 0 &&
      this.scopes[this.scopes.length - 1].get(expr.name.lexeme)?.defined ===
        false
    ) {
      // Preventing local var re-define and shadowing itself
      error(expr.name, "Cannot read local variable in its own initializer.");
    }

    this.resolveLocal(expr, expr.name);
    return null;
  }

  visitFunctionExpr(expr: FuncExpr): unknown {
    this.resolveFunction(expr, FunctionType.FUNCTION);
    return null;
  }

  resolve(statements: Stmt[] | Stmt | Expr): void {
    if (statements instanceof Array) {
      for (const statement of statements) {
        statement.accept(this);
      }
    } else {
      statements.accept(this);
    }
  }

  private resolveFunction(func: Function | FuncExpr, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(func.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, VarStatus>());
  }
  private endScope(): void {
    // Check for unused variables
    const scope = this.scopes[this.scopes.length - 1];
    for (const [name, varStatus] of scope.entries()) {
      if (!varStatus.used) {
        console.warn(`Line ${varStatus.line}: Variable "${name}" declared but never used.`);
      }
    }
    this.scopes.pop();
  }

  private declare(name: Token): void {
    if (this.scopes.length === 0) return;
    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      error(name, `Variable with this name already declared in this scope.`);
    }

    scope.set(name.lexeme, { defined: false, used: false, line: name.line });
  }

  private define(name: Token): void {
    if (this.scopes.length === 0) return;
    const scope = this.scopes[this.scopes.length - 1];
    scope.set(name.lexeme, { defined: true, used: false, line: name.line });
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const varStatus = this.scopes[i].get(name.lexeme);
      if (varStatus !== undefined) {
        varStatus.used = true;
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
    // Not found. Assume it is global.
  }
}
