/* eslint-disable @typescript-eslint/no-explicit-any */
import { LiteralTypes } from "../LiteralTypes";
import { Token } from "../Token";
import { Stmt } from "./Stmt";

export interface Expr {
  accept(visitor: Visitor<any>): any;  
}

export interface Visitor<T> {
  visitAssignExpr(expr: Assign): T;
  visitBinaryExpr(expr: Binary): T;
  visitTernaryExpr(expr: Ternary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitLogicalExpr(expr: Logical): T;
  visitThisExpr(expr: This): T;
  visitSuperExpr(expr: Super): T;
  visitUnaryExpr(expr: Unary): T;
  visitCallExpr(expr: Call): T;
  visitGetExpr(expr: Get): T;
  visitSetExpr(expr: Set): T;
  visitGetIndexExpr(expr: GetIndex): T;
  visitSetIndexExpr(expr: SetIndex): T;
  visitVariableExpr(expr: Variable): T;
  visitFunctionExpr(expr: Function): T;
}


export class Assign implements Expr {
  constructor (readonly name: Token, readonly value: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitAssignExpr(this);
  }
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

export class Logical implements Expr {
  constructor (readonly left: Expr, readonly operator: Token, readonly right: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitLogicalExpr(this);
  }
}

export class This implements Expr {
  constructor (readonly keyword: Token) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitThisExpr(this);
  }
}

export class Super implements Expr {
  constructor (readonly keyword: Token, readonly method: Token) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitSuperExpr(this);
  }
}

export class Unary implements Expr {
  constructor (readonly operator: Token, readonly right: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitUnaryExpr(this);
  }
}

export class Call implements Expr {
  constructor (readonly callee: Expr, readonly paren: Token, readonly args: Expr[]) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitCallExpr(this);
  }
}

export class Get implements Expr {
  constructor (readonly object: Expr, readonly name: Token) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitGetExpr(this);
  }
}

export class Set implements Expr {
  constructor (readonly object: Expr, readonly name: Token, readonly value: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitSetExpr(this);
  }
}

export class GetIndex implements Expr {
  constructor (readonly object: Expr, readonly bracket: Token, readonly index: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitGetIndexExpr(this);
  }
}

export class SetIndex implements Expr {
  constructor (readonly object: Expr, readonly bracket: Token, readonly index: Expr, readonly value: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitSetIndexExpr(this);
  }
}

export class Variable implements Expr {
  constructor (readonly name: Token) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitVariableExpr(this);
  }
}

export class Function implements Expr {
  constructor (readonly params: Token[], readonly body: Stmt[]) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitFunctionExpr(this);
  }
}
