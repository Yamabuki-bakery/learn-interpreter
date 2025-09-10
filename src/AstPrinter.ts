import {
  Visitor,
  Expr,
  Binary,
  Grouping,
  Literal,
  Unary,
  Ternary,
  Assign,
  Call,
  Logical,
  Variable,
} from "./generated/Expr";
import { Token } from "./Token";
import { TokenType } from "./TokenType";


// main();

class AstPrinter2 implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this) as string;
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }
  
  visitTernaryExpr(expr: Ternary): string {
    return this.parenthesize(
      "if-then-else",
      expr.condition,
      expr.thenBranch,
      expr.elseBranch,
    );
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return "nil";
    return `${expr.value}`;
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  visitAssignExpr(expr: Assign): string {
    return this.parenthesize(`= ${expr.name.lexeme}`, expr.value);
  }

  visitCallExpr(expr: Call): string {
    return this.parenthesize("call", expr.callee, ...expr.args);
  }

  visitLogicalExpr(expr: Logical): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme;
  }

  parenthesize(name: string, ...exprs: Expr[]): string {
    const result = `${exprs.map((expr) => expr.accept(this) as string).join(" ")} ${name}`;
    return result;
  }
}

function main2() {
  const expr: Expr = new Binary(
    new Binary(
      new Literal(1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Literal(2),
    ),
    new Token(TokenType.STAR, "*", null, 1),
    new Binary(
      new Literal(4),
      new Token(TokenType.MINUS, "-", null, 1),
      new Literal(3),
    ),
  );
  console.log(new AstPrinter2().print(expr));
}

// main2();

// pnpx tsx AstPrinter.ts
