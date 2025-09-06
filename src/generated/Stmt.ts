/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expr } from "./Expr";
import { Token } from "../Token";

export interface Stmt {
  accept(visitor: Visitor<any>): any;  
}

export interface Visitor<T> {
  visitBlockStmt(stmt: Block): T;
  visitExpressionStmt(stmt: Expression): T;
  visitIfStmt(stmt: If): T;
  visitPrintStmt(stmt: Print): T;
  visitVarStmt(stmt: Var): T;
  visitWhileStmt(stmt: While): T;
  visitBreakStmt(stmt: Break): T;
  visitContinueStmt(stmt: Continue): T;
}


export class Block implements Stmt {
  constructor (readonly statements: Stmt[]) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitBlockStmt(this);
  }
}

export class Expression implements Stmt {
  constructor (readonly expression: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitExpressionStmt(this);
  }
}

export class If implements Stmt {
  constructor (readonly condition: Expr, readonly thenBranch: Stmt, readonly elseBranch: Stmt | null) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitIfStmt(this);
  }
}

export class Print implements Stmt {
  constructor (readonly expression: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitPrintStmt(this);
  }
}

export class Var implements Stmt {
  constructor (readonly name: Token, readonly initializer: Expr | null) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitVarStmt(this);
  }
}

export class While implements Stmt {
  constructor (readonly condition: Expr, readonly body: Stmt) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitWhileStmt(this);
  }
}

export class Break implements Stmt {
  constructor (readonly keyword: Token) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitBreakStmt(this);
  }
}

export class Continue implements Stmt {
  constructor (readonly keyword: Token) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitContinueStmt(this);
  }
}
