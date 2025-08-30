/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expr } from "./Expr";
import { Token } from "../Token";

export interface Stmt {
  accept(visitor: Visitor<any>): any;  
}

export interface Visitor<T> {
  visitExpressionStmt(stmt: Expression): T;
  visitPrintStmt(stmt: Print): T;
  visitVarStmt(stmt: Var): T;
}


export class Expression implements Stmt {
  constructor (readonly expression: Expr) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visitExpressionStmt(this);
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
