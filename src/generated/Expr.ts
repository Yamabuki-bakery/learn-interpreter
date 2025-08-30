/* eslint-disable @typescript-eslint/no-explicit-any */
import { LiteralTypes } from "../LiteralTypes";
import { Token } from "../Token";

export interface Expr {
  accept(visitor: Visitor<any>): any;  
}

export interface Visitor<T> {
  visitBinaryExpr(expr: Binary): T;
  visitTernaryExpr(expr: Ternary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
}


export class Binary implements Expr {
  constructor (readonly left: Expr, readonly operator: Token, readonly right: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitBinaryExpr(this);
  }
}

export class Ternary implements Expr {
  constructor (readonly condition: Expr, readonly thenBranch: Expr, readonly elseBranch: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitTernaryExpr(this);
  }
}

export class Grouping implements Expr {
  constructor (readonly expression: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Expr {
  constructor (readonly value: LiteralTypes) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary implements Expr {
  constructor (readonly operator: Token, readonly right: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable implements Expr {
  constructor (readonly name: Token) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitVariableExpr(this);
  }
}
