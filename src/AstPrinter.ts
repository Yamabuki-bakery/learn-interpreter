import {
  Visitor,
  Expr,
  Binary,
  Grouping,
  Literal,
  Unary,
} from "./generated/Expr";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this) as string;
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
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

  parenthesize(name: string, ...exprs: Expr[]): string {
    const result = `(${name} ${exprs.map((expr) => expr.accept(this) as string).join(" ")})`;
    return result;
  }
}

function main() {
  const expr: Expr = new Binary(
    new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)),
    new Token(TokenType.STAR, "*", null, 1),
    new Grouping(new Literal(45.67)),
  );
  console.log(new AstPrinter().print(expr));
}

main();

class AstPrinter2 implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this) as string;
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
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

main2();

// pnpx tsx AstPrinter.ts